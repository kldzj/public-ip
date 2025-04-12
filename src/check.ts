import { Mutex } from "async-mutex";
import { config } from "./config";

export type AddressFamily = "v4" | "v6";

async function fetchAddress(family: AddressFamily): Promise<string | null> {
  const host = family === "v4" ? config.ipv4Host : config.ipv6Host;
  const url = `${config.protocol}://${host}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeout);

    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.text();

    if (!response.ok) {
      throw new Error(`Failed to fetch address: ${data}`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.cause && error.cause instanceof Error) {
        if (
          error.cause.message.includes("ECONNREFUSED") ||
          error.cause.message.includes("EHOSTUNREACH") ||
          error.cause.message.includes("ENETUNREACH") ||
          error.cause.message.includes("ENOTFOUND") ||
          error.cause.message.includes("EAI_AGAIN")
        ) {
          return null;
        }
      }
    }

    throw error;
  }
}

export class Checker {
  private _ipv4Address: string | null;
  private _ipv6Address: string | null;
  private _interval: NodeJS.Timeout | null;
  private _mutex = new Mutex();

  public get ipv4Address() {
    return this._ipv4Address;
  }

  public get ipv6Address() {
    return this._ipv6Address;
  }

  constructor() {
    this._ipv4Address = null;
    this._ipv6Address = null;
    this._interval = null;
  }

  private async check() {
    const release = await this._mutex.acquire();

    try {
      const [ipv4Address, ipv6Address] = await Promise.all([
        fetchAddress("v4"),
        fetchAddress("v6"),
      ]);

      if (ipv4Address !== this._ipv4Address) {
        console.log("Changed IPv4 Address:", ipv4Address);
      }

      if (ipv6Address !== this._ipv6Address) {
        console.log("Changed IPv6 Address:", ipv6Address);
      }

      this._ipv4Address = ipv4Address;
      this._ipv6Address = ipv6Address;
    } catch (error) {
      console.error("Error fetching address:", error);
    } finally {
      release();
    }
  }

  public async start() {
    if (this._interval) {
      clearInterval(this._interval);
    }

    await this.check();
    this._interval = setInterval(async () => {
      if (this._mutex.isLocked()) {
        return;
      }

      await this.check();
    }, config.interval);
  }

  public stop() {
    if (this._interval) {
      clearInterval(this._interval);
    }
  }
}

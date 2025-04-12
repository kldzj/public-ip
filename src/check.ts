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
      if (error.name === "AbortError") {
        console.log(`${family === "v4" ? "IPv4" : "IPv6"} request timed out`);
        return null;
      }

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
  private _ipv4FailCount: number = 0;
  private _ipv6FailCount: number = 0;
  private _maxConsecutiveFailures: number = 3;
  private _ipv4Status: "ok" | "warning" | "error" = "warning";
  private _ipv6Status: "ok" | "warning" | "error" = "warning";

  public get ipv4Address() {
    return this._ipv4Address;
  }

  public get ipv6Address() {
    return this._ipv6Address;
  }

  public get ipv4Status() {
    return this._ipv4Status;
  }

  public get ipv6Status() {
    return this._ipv6Status;
  }

  constructor() {
    this._ipv4Address = null;
    this._ipv6Address = null;
    this._interval = null;
  }

  private async check() {
    const release = await this._mutex.acquire();

    try {
      const ipv4Promise = fetchAddress("v4");
      const ipv6Promise = fetchAddress("v6");

      const ipv4Address = await ipv4Promise;
      if (ipv4Address === null) {
        this._ipv4FailCount++;
        console.log(`IPv4 fetch failed (attempt ${this._ipv4FailCount})`);

        if (this._ipv4FailCount >= this._maxConsecutiveFailures) {
          this._ipv4Status = "error";
          console.warn(
            `IPv4 connectivity appears to be down after ${this._ipv4FailCount} consecutive failures`
          );
        } else if (this._ipv4FailCount > 0) {
          this._ipv4Status = "warning";
        }
      } else {
        this._ipv4FailCount = 0;
        this._ipv4Status = "ok";
        if (ipv4Address !== this._ipv4Address) {
          console.log("Changed IPv4 Address:", ipv4Address);
          this._ipv4Address = ipv4Address;
        }
      }

      const ipv6Address = await ipv6Promise;
      if (ipv6Address === null) {
        this._ipv6FailCount++;
        console.log(`IPv6 fetch failed (attempt ${this._ipv6FailCount})`);

        if (this._ipv6FailCount >= this._maxConsecutiveFailures) {
          this._ipv6Status = "error";
          console.warn(
            `IPv6 connectivity appears to be down after ${this._ipv6FailCount} consecutive failures`
          );
        } else if (this._ipv6FailCount > 0) {
          this._ipv6Status = "warning";
        }
      } else {
        this._ipv6FailCount = 0;
        this._ipv6Status = "ok";
        if (ipv6Address !== this._ipv6Address) {
          console.log("Changed IPv6 Address:", ipv6Address);
          this._ipv6Address = ipv6Address;
        }
      }
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

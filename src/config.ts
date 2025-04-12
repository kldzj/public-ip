export const config = {
  port: parseInt(process.env.PORT || "3000"),
  ipv4Host: process.env.IPV4_HOST || "v4.ip.kldzj.dev",
  ipv6Host: process.env.IPV6_HOST || "v6.ip.kldzj.dev",
  protocol: process.env.PROTOCOL || "https",
  interval: parseInt(process.env.INTERVAL || "15000"),
  timeout: parseInt(process.env.TIMEOUT || "5000"),
};

if (isNaN(config.port)) {
  throw new Error("PORT is not a number");
}

if (config.port < 1 || config.port > 65535) {
  throw new Error("PORT must be between 1 and 65535");
}

if (isNaN(config.interval)) {
  throw new Error("INTERVAL is not a number");
}

if (config.interval < 1000) {
  throw new Error("INTERVAL must be greater than 1000");
}

if (config.protocol !== "http" && config.protocol !== "https") {
  throw new Error("PROTOCOL must be http or https");
}

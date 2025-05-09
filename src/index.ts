import express from "express";
import path from "node:path";
import { Checker } from "./check";
import { config } from "./config";

async function main() {
  const app = express();
  const checker = new Checker();

  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "views"));

  app.get("/", (_, res) => {
    res.render("index", {
      ipv4Address: checker.ipv4Address ?? "IPv4 Address Not Found",
      ipv6Address: checker.ipv6Address ?? "IPv6 Address Not Found",
      ipv4Status: checker.ipv4Status,
      ipv6Status: checker.ipv6Status,
      refreshInterval: Math.floor(config.interval / 1000),
    });
  });

  app.get("/json", (_, res) => {
    res.json({
      ipv4Address: checker.ipv4Address,
      ipv6Address: checker.ipv6Address,
      ipv4Status: checker.ipv4Status,
      ipv6Status: checker.ipv6Status,
    });
  });

  app.get("/json/v4", (_, res) => {
    res.json({
      ipv4Address: checker.ipv4Address,
      ipv4Status: checker.ipv4Status,
    });
  });

  app.get("/json/v6", (_, res) => {
    res.json({
      ipv6Address: checker.ipv6Address,
      ipv6Status: checker.ipv6Status,
    });
  });

  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
    checker
      .start()
      .then(() => {
        console.log("Checker started");
      })
      .catch((error) => {
        console.error("Error starting checker:", error);
        process.exit(1);
      });
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

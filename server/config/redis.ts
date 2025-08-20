// src/config/redis.ts
import { createClient } from "redis";
import { config } from "./config";

const redisClient = createClient({
  url: config.redisURL,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.on("connect", () => console.log("Connecting to Redis..."));
redisClient.on("ready", () => console.log("Redis client connected successfully."));

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    process.exit(1); // Exit if connection fails
  }
})();

export default redisClient;
// src/config/redis.ts
import { createClient } from "redis";
import { config } from "./config";

const redisClient = createClient({
  url: config.redisURL,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.on("connect", () =>
  console.log("Connected to Redis successfully!")
);

export async function connectRedis() {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
    process.exit(1); // Exit app if Redis is critical
  }
}

export default redisClient;

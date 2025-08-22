// src/config/redis.ts
import { createClient } from "redis";
import { config } from "./config";

const redisClient = createClient({
  url: config.redisURL,
  socket: {
    reconnectStrategy: (retries) => {
      // retry with capped backoff
      return Math.min(retries * 100, 2000);
    },
  },
});

redisClient.on("ready", () => {
  console.log("Redis client connected successfully.");
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("end", () => {
  console.warn("Redis connection closed.");
});

// keep connection alive with PING
const PING_INTERVAL = 30 * 1000; // 30s
setInterval(async () => {
  if (redisClient.isOpen) {
    try {
      await redisClient.ping();
    } catch (err) {
      console.error("Failed Redis PING:", err);
    }
  }
}, PING_INTERVAL);

// connect once
(async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
})();

export default redisClient;

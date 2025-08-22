// src/config/redis.ts
import { createClient } from "redis";
import { config } from "./config";

const redisClient = createClient({
  url: config.redisURL,
  socket: {
    reconnectStrategy: (retries) => {
      return Math.min(retries * 50, 2000); // backoff
    },
    keepAlive: true,
  },
});

redisClient.on("ready", () => {
  console.log("Redis client connected successfully.");

  if (process.env.NODE_ENV === "production") {
    const PING_INTERVAL = 4 * 60 * 1000; // 4 min
    setInterval(async () => {
      try {
        await redisClient.ping();
        console.log("Redis PING successful");
      } catch (err) {
        console.error("Failed Redis PING:", err);
      }
    }, PING_INTERVAL);
  }
});

(async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
})();

export default redisClient;


import { createClient } from "redis";
import { config } from "./config";

const redisClient = createClient({
  url: config.redisURL,
  socket: {
    connectTimeout: 20000, // wait up to 20s before failing
    reconnectStrategy: (retries: number) => {
      if (retries > 10) {
        // Stop retrying after 10 attempts
        return new Error("Redis reconnect failed after 10 attempts");
      }
      return Math.min(retries * 100, 2000); // retry delay
    },
  },
});

redisClient.on("ready", () => console.log("✅ Redis connected"));
redisClient.on("error", (err) => console.error("❌ Redis Error:", err));
redisClient.on("end", () => console.warn("⚠️ Redis disconnected"));

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
})();

export default redisClient;

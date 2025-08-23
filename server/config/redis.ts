import { createClient } from "redis";
import { config } from "./config";

const redisClient = createClient({
  url: config.redisURL,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 100, 2000),
  },
});

redisClient.on("ready", () => console.log("Redis connected"));
redisClient.on("error", (err) => console.error("Redis Error:", err));
redisClient.on("end", () => console.warn("Redis disconnected"));

(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("Failed to connect to Redis:", err);
  }
})();

export default redisClient;

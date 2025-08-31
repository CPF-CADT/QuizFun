"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const config_1 = require("./config");
const redisClient = (0, redis_1.createClient)({
    url: config_1.config.redisURL,
    socket: {
        connectTimeout: 20000, // wait up to 20s before failing
        reconnectStrategy: (retries) => {
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
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redisClient.connect();
    }
    catch (err) {
        console.error("Failed to connect to Redis:", err);
    }
}))();
exports.default = redisClient;

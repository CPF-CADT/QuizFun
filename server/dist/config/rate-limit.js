"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratelimitConfig = void 0;
exports.ratelimitConfig = {
    global: { windowMs: 15 * 60 * 1000, max: 100, message: "Too many requests, please try again later." },
    quiz: { windowMs: 15 * 60 * 1000, max: 15, message: "Too many requests, please try again later." },
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalRateLimit = exports.quizRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_1 = require("../config/rate-limit");
exports.quizRateLimit = (0, express_rate_limit_1.default)(rate_limit_1.ratelimitConfig.quiz);
exports.globalRateLimit = (0, express_rate_limit_1.default)(rate_limit_1.ratelimitConfig.global);

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT = void 0;
// service/JWT.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config/config");
class JWT {
    static createTokens(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign(payload, this.JWT_REFRESH_SECRET, { expiresIn: '7d' });
        return { accessToken, refreshToken };
    }
    static verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, this.JWT_SECRET);
    }
    static verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, this.JWT_REFRESH_SECRET);
    }
}
exports.JWT = JWT;
JWT.JWT_SECRET = config_1.config.jwtSecret;
JWT.JWT_REFRESH_SECRET = config_1.config.jwtRefreshSecret;

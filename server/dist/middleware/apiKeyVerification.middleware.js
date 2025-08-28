"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyApiKey = verifyApiKey;
const config_1 = require("../config/config");
function verifyApiKey(req, res, next) {
    const clientKey = req.headers['x-api-key'];
    const serverKey = config_1.config.frontApiKey;
    if (!serverKey) {
        console.error('FRONTEND_API_KEY not set in environment variables.');
        return res.status(500).json({ message: 'Internal Server Error' });
    }
    if (typeof clientKey !== 'string' || clientKey !== serverKey) {
        return res.status(403).json({ message: 'Forbidden: Invalid API Key' });
    }
    next();
}

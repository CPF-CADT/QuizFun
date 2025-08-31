"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsAuthMiddleware = wsAuthMiddleware;
const jsonwebtoken_1 = require("jsonwebtoken");
function wsAuthMiddleware(io) {
    io.use((socket, next) => {
        var _a, _b;
        try {
            const token = ((_a = socket.handshake.auth) === null || _a === void 0 ? void 0 : _a.token) || ((_b = socket.handshake.headers.authorization) === null || _b === void 0 ? void 0 : _b.split(" ")[1]);
            if (!token)
                throw new Error("Unauthorized");
            const payload = (0, jsonwebtoken_1.verify)(token, process.env.JWT_SECRET);
            socket.data.userId = payload.sub;
            socket.data.name = payload.name;
            next();
        }
        catch (_c) {
            next(new Error("Unauthorized"));
        }
    });
}

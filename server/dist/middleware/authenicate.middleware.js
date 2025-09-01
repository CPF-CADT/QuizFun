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
exports.optionalAuthMiddleware = void 0;
exports.authenticateToken = authenticateToken;
exports.authorize = authorize;
const JWT_1 = require("../service/JWT");
const User_1 = require("../model/User");
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = JWT_1.JWT.verifyAccessToken(token);
        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: err.message || 'Unauthorized: Invalid token' });
    }
}
const optionalAuthMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = JWT_1.JWT.verifyAccessToken(token);
            const userDoc = yield User_1.UserModel.findById(decoded.id).select('id role email name');
            if (userDoc) {
                const { id, role, email, name } = userDoc;
                req.user = { id, role, email, name };
            }
        }
        catch (error) {
            console.log("Invalid token found, proceeding as guest.");
        }
    }
    next();
});
exports.optionalAuthMiddleware = optionalAuthMiddleware;
// --- Role authorization ---
function authorize(...allowedRoles) {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
        }
        if (user.role && !allowedRoles.includes(user.role)) {
            return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
}

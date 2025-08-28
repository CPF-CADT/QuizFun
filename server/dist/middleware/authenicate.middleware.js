"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = authenticateToken;
exports.authorize = authorize;
const JWT_1 = require("../service/JWT");
// --- Auth middleware ---
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

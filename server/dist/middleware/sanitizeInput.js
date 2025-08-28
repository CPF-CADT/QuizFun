"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInput = void 0;
const xss_1 = __importDefault(require("xss"));
const sanitizeValue = (value) => {
    if (typeof value === 'string') {
        return (0, xss_1.default)(value.trim());
    }
    if (Array.isArray(value)) {
        return value.map(item => sanitizeValue(item));
    }
    if (typeof value === 'object' && value !== null) {
        const sanitizedObject = {};
        for (const key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
                sanitizedObject[key] = sanitizeValue(value[key]);
            }
        }
        return sanitizedObject;
    }
    return value;
};
const sanitizeInput = (req, res, next) => {
    if (req.body)
        req.body = sanitizeValue(req.body);
    if (req.query)
        req.query = sanitizeValue(req.query);
    if (req.params)
        req.params = sanitizeValue(req.params);
    if (req.user)
        req.user = sanitizeValue(req.user);
    next();
};
exports.sanitizeInput = sanitizeInput;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchemas = void 0;
const joi_1 = __importDefault(require("joi"));
// Reusable schema parts
const mongoId = joi_1.default.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Invalid ID format'
});
const email = joi_1.default.string().email({ tlds: { allow: false } }).lowercase().trim().required();
const password = joi_1.default.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.pattern.base': 'Password must include uppercase, lowercase, and a number'
});
const name = joi_1.default.string().min(2).max(50).trim();
const role = joi_1.default.string().valid('player', 'admin', 'moderator');
const code = joi_1.default.string().length(6).pattern(/^\d{6}$/).required().messages({
    'string.length': 'Code must be 6 digits',
    'string.pattern.base': 'Code must only contain numbers'
});
// Schemas for each route
exports.userSchemas = {
    register: {
        body: joi_1.default.object({
            name: name.required(),
            email,
            password: password.required(),
        }),
    },
    login: {
        body: joi_1.default.object({
            email,
            password: joi_1.default.string().required(),
        }),
    },
    updateUserInfo: {
        params: joi_1.default.object({ id: mongoId.required() }),
        body: joi_1.default.object({
            name: name.optional(),
            password: password.optional(),
            profileUrl: joi_1.default.string().uri().allow('').optional(),
        }).min(1).messages({ 'object.min': 'At least one field must be provided for update' }),
    },
    sendVerificationCode: {
        body: joi_1.default.object({ email }),
    },
    verifyCode: {
        body: joi_1.default.object({ email, code }),
    },
    resetPassword: {
        body: joi_1.default.object({
            resetToken: joi_1.default.string().required(),
            newPassword: password.required(),
            confirmPassword: joi_1.default.string().required().valid(joi_1.default.ref('newPassword')).messages({ 'any.only': 'Passwords do not match' }),
        }),
    },
    googleAuth: {
        body: joi_1.default.object({
            token: joi_1.default.string().required(),
        }),
    },
    getUserById: {
        params: joi_1.default.object({ id: mongoId.required() }),
    },
    getUsersByRole: {
        params: joi_1.default.object({ role: role.required() }),
    },
};

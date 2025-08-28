"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizCreationLimiter = exports.sanitizeInput = exports.createValidationMiddleware = exports.customValidators = void 0;
const joi_1 = __importDefault(require("joi"));
// Custom Joi validators
exports.customValidators = {
    // MongoDB ObjectId validator
    mongoId: () => {
        return joi_1.default.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid MongoDB ObjectId format');
    },
    // Password strength validator
    password: () => {
        return joi_1.default.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .message('Password must contain at least 8 characters with uppercase, lowercase, number, and special character');
    },
    // Email validator with additional checks
    email: () => {
        return joi_1.default.string()
            .email({ tlds: { allow: false } })
            .lowercase()
            .trim();
    },
    // URL validator with protocol requirement
    url: () => {
        return joi_1.default.string().uri({
            scheme: ['http', 'https']
        });
    },
    // Image URL validator
    imageUrl: () => {
        return joi_1.default.string()
            .uri()
            .pattern(/\.(jpg|jpeg|png|gif|webp)$/i)
            .message('Image URL must end with a valid image extension (.jpg, .jpeg, .png, .gif, .webp)');
    }
};
// Validation middleware factory with custom options
const createValidationMiddleware = (schema, options = {}) => {
    const { target = 'body', abortEarly = false, stripUnknown = true, allowUnknown = false } = options;
    return (req, res, next) => {
        const { error, value } = schema.validate(req[target], {
            abortEarly,
            stripUnknown,
            allowUnknown,
            convert: true
        });
        if (error) {
            const validationErrors = error.details.map(detail => {
                var _a;
                return ({
                    field: detail.path.join('.'),
                    message: detail.message.replace(/"/g, ''),
                    value: (_a = detail.context) === null || _a === void 0 ? void 0 : _a.value,
                    type: detail.type
                });
            });
            return res.status(400).json({
                status: 'fail',
                message: 'Validation failed',
                errors: validationErrors,
                code: 'VALIDATION_ERROR'
            });
        }
        req[target] = value;
        next();
    };
};
exports.createValidationMiddleware = createValidationMiddleware;
// Sanitization middleware
const sanitizeInput = (req, res, next) => {
    // Remove null bytes
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            return obj.replace(/\0/g, '');
        }
        if (typeof obj === 'object' && obj !== null) {
            if (Array.isArray(obj)) {
                return obj.map(sanitize);
            }
            const sanitized = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    sanitized[key] = sanitize(obj[key]);
                }
            }
            return sanitized;
        }
        return obj;
    };
    req.body = sanitize(req.body);
    req.query = sanitize(req.query);
    req.params = sanitize(req.params);
    next();
};
exports.sanitizeInput = sanitizeInput;
// Rate limiting for quiz creation
const quizCreationLimiter = (maxQuizzes = 10, windowMs = 24 * 60 * 60 * 1000) => {
    const userQuizCounts = new Map();
    return (req, res, next) => {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            return res.status(401).json({
                status: 'fail',
                message: 'Authentication required',
                code: 'AUTH_REQUIRED'
            });
        }
        const now = Date.now();
        const userRecord = userQuizCounts.get(userId);
        if (!userRecord || now > userRecord.resetTime) {
            // Reset or create new record
            userQuizCounts.set(userId, {
                count: 1,
                resetTime: now + windowMs
            });
            return next();
        }
        if (userRecord.count >= maxQuizzes) {
            return res.status(429).json({
                status: 'fail',
                message: `Quiz creation limit exceeded. Maximum ${maxQuizzes} quizzes per day.`,
                code: 'RATE_LIMIT_EXCEEDED',
                resetTime: new Date(userRecord.resetTime).toISOString()
            });
        }
        // Increment count
        userRecord.count++;
        userQuizCounts.set(userId, userRecord);
        next();
    };
};
exports.quizCreationLimiter = quizCreationLimiter;

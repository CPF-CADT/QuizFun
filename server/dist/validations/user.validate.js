"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRateLimit = exports.sanitizeInput = exports.validateOptionalAuth = exports.validateGetUserById = exports.validateGoogleAuthenticate = exports.validateResetPassword = exports.validateVerifyPasswordResetCode = exports.validateVerifyCode = exports.validateSendVerificationCode = exports.validateUpdateUserInfo = exports.validateLogin = exports.validateRegister = exports.validateGetUsersByRole = exports.validateGetAllUsers = exports.validateRequest = void 0;
const joi_1 = __importDefault(require("joi"));
// Base validation middleware function
const validateRequest = (schema) => {
    return (req, res, next) => {
        const errors = [];
        // Validate request body
        if (schema.body) {
            const { error } = schema.body.validate(req.body, { abortEarly: false });
            if (error) {
                errors.push(...error.details.map(detail => detail.message));
            }
        }
        // Validate request parameters
        if (schema.params) {
            const { error } = schema.params.validate(req.params, { abortEarly: false });
            if (error) {
                errors.push(...error.details.map(detail => detail.message));
            }
        }
        // Validate query parameters
        if (schema.query) {
            const { error } = schema.query.validate(req.query, { abortEarly: false });
            if (error) {
                errors.push(...error.details.map(detail => detail.message));
            }
        }
        if (errors.length > 0) {
            res.status(400).json({
                message: 'Validation failed',
                errors: errors
            });
            return;
        }
        next();
    };
};
exports.validateRequest = validateRequest;
// Common validation patterns
const emailSchema = joi_1.default.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
});
const passwordSchema = joi_1.default.string()
    .min(8)
    .max(128)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .required()
    .messages({
    'string.min': 'Password must be at least 8 characters long',
    'string.max': 'Password cannot exceed 128 characters',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    'any.required': 'Password is required'
});
const nameSchema = joi_1.default.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name cannot exceed 50 characters',
    'string.pattern.base': 'Name can only contain letters and spaces',
    'any.required': 'Name is required'
});
const roleSchema = joi_1.default.string()
    .valid('player', 'admin', 'moderator')
    .default('player')
    .messages({
    'any.only': 'Role must be one of: player, admin, moderator'
});
const profileUrlSchema = joi_1.default.string()
    .uri()
    .allow('')
    .messages({
    'string.uri': 'Profile URL must be a valid URL'
});
const objectIdSchema = joi_1.default.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
    'string.pattern.base': 'Invalid ID format',
    'any.required': 'ID is required'
});
const paginationQuerySchema = joi_1.default.object({
    page: joi_1.default.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1'
    }),
    limit: joi_1.default.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
    }),
    search: joi_1.default.string()
        .allow('')
        .max(100)
        .messages({
        'string.max': 'Search term cannot exceed 100 characters'
    })
});
// Validation schemas for each endpoint
// GET /api/user - Get all users with pagination
exports.validateGetAllUsers = (0, exports.validateRequest)({
    query: paginationQuerySchema
});
// GET /api/user/by-role/:role - Get users by role
exports.validateGetUsersByRole = (0, exports.validateRequest)({
    params: joi_1.default.object({
        role: roleSchema.required().messages({
            'any.required': 'Role parameter is required'
        })
    }),
    query: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1),
        limit: joi_1.default.number().integer().min(1).max(100).default(10)
    })
});
// POST /api/user/register - User registration
exports.validateRegister = (0, exports.validateRequest)({
    body: joi_1.default.object({
        name: nameSchema,
        email: emailSchema,
        password: passwordSchema,
        role: roleSchema.optional(),
        profile_url: profileUrlSchema.optional()
    })
});
// POST /api/user/login - User login
exports.validateLogin = (0, exports.validateRequest)({
    body: joi_1.default.object({
        email: emailSchema,
        password: joi_1.default.string().required().messages({
            'any.required': 'Password is required'
        })
    })
});
// PUT /api/user/:id - Update user info
exports.validateUpdateUserInfo = (0, exports.validateRequest)({
    params: joi_1.default.object({
        id: objectIdSchema
    }),
    body: joi_1.default.object({
        name: joi_1.default.string()
            .min(2)
            .max(50)
            .pattern(/^[a-zA-Z\s]+$/)
            .messages({
            'string.min': 'Name must be at least 2 characters long',
            'string.max': 'Name cannot exceed 50 characters',
            'string.pattern.base': 'Name can only contain letters and spaces'
        }),
        password: joi_1.default.string()
            .min(8)
            .max(128)
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
            .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password cannot exceed 128 characters',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        }),
        profileUrl: profileUrlSchema
    }).min(1).messages({
        'object.min': 'At least one field must be provided for update'
    })
});
// POST /api/user/request-code - Send verification code
exports.validateSendVerificationCode = (0, exports.validateRequest)({
    body: joi_1.default.object({
        email: emailSchema
    })
});
// POST /api/user/verify-otp - Verify email with code
exports.validateVerifyCode = (0, exports.validateRequest)({
    body: joi_1.default.object({
        email: emailSchema,
        code: joi_1.default.string()
            .length(6)
            .pattern(/^\d{6}$/)
            .required()
            .messages({
            'string.length': 'Verification code must be exactly 6 digits',
            'string.pattern.base': 'Verification code must contain only numbers',
            'any.required': 'Verification code is required'
        })
    })
});
// POST /api/user/verify-password-reset-code - Verify password reset code
exports.validateVerifyPasswordResetCode = (0, exports.validateRequest)({
    body: joi_1.default.object({
        email: emailSchema,
        code: joi_1.default.string()
            .length(6)
            .pattern(/^\d{6}$/)
            .required()
            .messages({
            'string.length': 'Verification code must be exactly 6 digits',
            'string.pattern.base': 'Verification code must contain only numbers',
            'any.required': 'Verification code is required'
        })
    })
});
// POST /api/user/reset-password - Reset password
exports.validateResetPassword = (0, exports.validateRequest)({
    body: joi_1.default.object({
        resetToken: joi_1.default.string()
            .required()
            .messages({
            'any.required': 'Reset token is required'
        }),
        newPassword: passwordSchema,
        confirmPassword: joi_1.default.string()
            .required()
            .valid(joi_1.default.ref('newPassword'))
            .messages({
            'any.required': 'Confirm password is required',
            'any.only': 'Confirm password must match the new password'
        })
    })
});
// POST /api/user/google - Google authentication
exports.validateGoogleAuthenticate = (0, exports.validateRequest)({
    body: joi_1.default.object({
        token: joi_1.default.string()
            .required()
            .messages({
            'any.required': 'Google token is required'
        })
    })
});
// GET /api/user/:id - Get user by ID
exports.validateGetUserById = (0, exports.validateRequest)({
    params: joi_1.default.object({
        id: objectIdSchema
    })
});
// Custom validation middleware for specific use cases
const validateOptionalAuth = (req, res, next) => {
    // This middleware can be used for endpoints that optionally require authentication
    // Add any specific logic here if needed
    next();
};
exports.validateOptionalAuth = validateOptionalAuth;
// Sanitize input middleware to remove potentially harmful characters
const sanitizeInput = (req, res, next) => {
    const sanitize = (obj) => {
        if (typeof obj === 'string') {
            // Remove HTML tags and trim whitespace
            return obj.replace(/<[^>]*>/g, '').trim();
        }
        if (typeof obj === 'object' && obj !== null) {
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
    if (req.body) {
        req.body = sanitize(req.body);
    }
    if (req.query) {
        req.query = sanitize(req.query);
    }
    if (req.params) {
        req.params = sanitize(req.params);
    }
    next();
};
exports.sanitizeInput = sanitizeInput;
// Rate limiting validation (can be used with express-rate-limit)
const validateRateLimit = (windowMs, max) => {
    return (req, res, next) => {
        // This is a placeholder for rate limiting logic
        // You would typically use express-rate-limit or similar middleware
        next();
    };
};
exports.validateRateLimit = validateRateLimit;
exports.default = {
    validateRequest: exports.validateRequest,
    validateGetAllUsers: exports.validateGetAllUsers,
    validateGetUsersByRole: exports.validateGetUsersByRole,
    validateRegister: exports.validateRegister,
    validateLogin: exports.validateLogin,
    validateUpdateUserInfo: exports.validateUpdateUserInfo,
    validateSendVerificationCode: exports.validateSendVerificationCode,
    validateVerifyCode: exports.validateVerifyCode,
    validateVerifyPasswordResetCode: exports.validateVerifyPasswordResetCode,
    validateResetPassword: exports.validateResetPassword,
    validateGoogleAuthenticate: exports.validateGoogleAuthenticate,
    validateGetUserById: exports.validateGetUserById,
    sanitizeInput: exports.sanitizeInput,
    validateOptionalAuth: exports.validateOptionalAuth,
    validateRateLimit: exports.validateRateLimit
};

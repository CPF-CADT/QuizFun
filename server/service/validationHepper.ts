import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Custom Joi validators
export const customValidators = {
    // MongoDB ObjectId validator
    mongoId: () => {
        return Joi.string().regex(/^[0-9a-fA-F]{24}$/).message('Invalid MongoDB ObjectId format');
    },

    // Password strength validator
    password: () => {
        return Joi.string()
            .min(8)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
            .message('Password must contain at least 8 characters with uppercase, lowercase, number, and special character');
    },

    // Email validator with additional checks
    email: () => {
        return Joi.string()
            .email({ tlds: { allow: false } })
            .lowercase()
            .trim();
    },

    // URL validator with protocol requirement
    url: () => {
        return Joi.string().uri({
            scheme: ['http', 'https']
        });
    },

    // Image URL validator
    imageUrl: () => {
        return Joi.string()
            .uri()
            .pattern(/\.(jpg|jpeg|png|gif|webp)$/i)
            .message('Image URL must end with a valid image extension (.jpg, .jpeg, .png, .gif, .webp)');
    }
};

// Validation middleware factory with custom options
export const createValidationMiddleware = (
    schema: Joi.ObjectSchema,
    options: {
        target?: 'body' | 'params' | 'query';
        abortEarly?: boolean;
        stripUnknown?: boolean;
        allowUnknown?: boolean;
    } = {}
) => {
    const {
        target = 'body',
        abortEarly = false,
        stripUnknown = true,
        allowUnknown = false
    } = options;

    return (req: Request, res: Response, next: NextFunction) => {
        const { error, value } = schema.validate(req[target], {
            abortEarly,
            stripUnknown,
            allowUnknown,
            convert: true
        });

        if (error) {
            const validationErrors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message.replace(/"/g, ''),
                value: detail.context?.value,
                type: detail.type
            }));

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

// Sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    // Remove null bytes
    const sanitize = (obj: any): any => {
        if (typeof obj === 'string') {
            return obj.replace(/\0/g, '');
        }
        if (typeof obj === 'object' && obj !== null) {
            if (Array.isArray(obj)) {
                return obj.map(sanitize);
            }
            const sanitized: any = {};
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

// Rate limiting for quiz creation
export const quizCreationLimiter = (maxQuizzes: number = 10, windowMs: number = 24 * 60 * 60 * 1000) => {
    const userQuizCounts = new Map<string, { count: number; resetTime: number }>();

    return (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?.id;
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
    }
}
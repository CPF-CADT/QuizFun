import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Base validation middleware function
export const validateRequest = (schema: {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

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

// Common validation patterns
const emailSchema = Joi.string()
  .email({ tlds: { allow: false } })
  .required()
  .messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  });

const passwordSchema = Joi.string()
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

const nameSchema = Joi.string()
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

const roleSchema = Joi.string()
  .valid('player', 'admin', 'moderator')
  .default('player')
  .messages({
    'any.only': 'Role must be one of: player, admin, moderator'
  });

const profileUrlSchema = Joi.string()
  .uri()
  .allow('')
  .messages({
    'string.uri': 'Profile URL must be a valid URL'
  });

const objectIdSchema = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .required()
  .messages({
    'string.pattern.base': 'Invalid ID format',
    'any.required': 'ID is required'
  });

const paginationQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
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
  search: Joi.string()
    .allow('')
    .max(100)
    .messages({
      'string.max': 'Search term cannot exceed 100 characters'
    })
});

// Validation schemas for each endpoint

// GET /api/user - Get all users with pagination
export const validateGetAllUsers = validateRequest({
  query: paginationQuerySchema
});

// GET /api/user/by-role/:role - Get users by role
export const validateGetUsersByRole = validateRequest({
  params: Joi.object({
    role: roleSchema.required().messages({
      'any.required': 'Role parameter is required'
    })
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
});

// POST /api/user/register - User registration
export const validateRegister = validateRequest({
  body: Joi.object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    role: roleSchema.optional(),
    profile_url: profileUrlSchema.optional()
  })
});

// POST /api/user/login - User login
export const validateLogin = validateRequest({
  body: Joi.object({
    email: emailSchema,
    password: Joi.string().required().messages({
      'any.required': 'Password is required'
    })
  })
});

// PUT /api/user/:id - Update user info
export const validateUpdateUserInfo = validateRequest({
  params: Joi.object({
    id: objectIdSchema
  }),
  body: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters',
        'string.pattern.base': 'Name can only contain letters and spaces'
      }),
    password: Joi.string()
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
export const validateSendVerificationCode = validateRequest({
  body: Joi.object({
    email: emailSchema
  })
});

// POST /api/user/verify-otp - Verify email with code
export const validateVerifyCode = validateRequest({
  body: Joi.object({
    email: emailSchema,
    code: Joi.string()
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
export const validateVerifyPasswordResetCode = validateRequest({
  body: Joi.object({
    email: emailSchema,
    code: Joi.string()
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
export const validateResetPassword = validateRequest({
  body: Joi.object({
    resetToken: Joi.string()
      .required()
      .messages({
        'any.required': 'Reset token is required'
      }),
    newPassword: passwordSchema,
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref('newPassword'))
      .messages({
        'any.required': 'Confirm password is required',
        'any.only': 'Confirm password must match the new password'
      })
  })
});

// POST /api/user/google - Google authentication
export const validateGoogleAuthenticate = validateRequest({
  body: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'Google token is required'
      })
  })
});

// GET /api/user/:id - Get user by ID
export const validateGetUserById = validateRequest({
  params: Joi.object({
    id: objectIdSchema
  })
});

// Custom validation middleware for specific use cases
export const validateOptionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  // This middleware can be used for endpoints that optionally require authentication
  // Add any specific logic here if needed
  next();
};

// Sanitize input middleware to remove potentially harmful characters
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove HTML tags and trim whitespace
      return obj.replace(/<[^>]*>/g, '').trim();
    }
    if (typeof obj === 'object' && obj !== null) {
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

// Rate limiting validation (can be used with express-rate-limit)
export const validateRateLimit = (windowMs: number, max: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // This is a placeholder for rate limiting logic
    // You would typically use express-rate-limit or similar middleware
    next();
  };
};

export default {
  validateRequest,
  validateGetAllUsers,
  validateGetUsersByRole,
  validateRegister,
  validateLogin,
  validateUpdateUserInfo,
  validateSendVerificationCode,
  validateVerifyCode,
  validateVerifyPasswordResetCode,
  validateResetPassword,
  validateGoogleAuthenticate,
  validateGetUserById,
  sanitizeInput,
  validateOptionalAuth,
  validateRateLimit
};
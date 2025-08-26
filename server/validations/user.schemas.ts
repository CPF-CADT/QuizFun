import Joi from 'joi';

// Reusable schema parts
const mongoId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Invalid ID format'
});

const email = Joi.string().email({ tlds: { allow: false } }).lowercase().trim().required();
const password = Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
    .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.pattern.base': 'Password must include uppercase, lowercase, and a number'
    });

const name = Joi.string().min(2).max(50).trim();
const role = Joi.string().valid('player', 'admin', 'moderator');
const code = Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
    'string.length': 'Code must be 6 digits',
    'string.pattern.base': 'Code must only contain numbers'
});

// Schemas for each route
export const userSchemas = {
    register: {
        body: Joi.object({
            name: name.required(),
            email,
            password: password.required(),
        }),
    },
    login: {
        body: Joi.object({
            email,
            password: Joi.string().required(),
        }),
    },
    updateUserInfo: {
        params: Joi.object({ id: mongoId.required() }),
        body: Joi.object({
            name: name.optional(),
            password: password.optional(),
            profileUrl: Joi.string().uri().allow('').optional(),
        }).min(1).messages({ 'object.min': 'At least one field must be provided for update' }),
    },
    sendVerificationCode: {
        body: Joi.object({ email }),
    },
    verifyCode: {
        body: Joi.object({ email, code }),
    },
    resetPassword: {
        body: Joi.object({
            resetToken: Joi.string().required(),
            newPassword: password.required(),
            confirmPassword: Joi.string().required().valid(Joi.ref('newPassword')).messages({ 'any.only': 'Passwords do not match' }),
        }),
    },
    googleAuth: {
        body: Joi.object({
            token: Joi.string().required(),
        }),
    },
    getUserById: {
        params: Joi.object({ id: mongoId.required() }),
    },
    getUsersByRole: {
        params: Joi.object({ role: role.required() }),
    },
};
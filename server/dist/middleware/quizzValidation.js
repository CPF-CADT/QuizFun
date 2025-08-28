"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePDFUpload = exports.validateFileUpload = exports.validateGetUserQuizzes = exports.validateGetAllQuizzes = exports.validateDeleteOption = exports.validateDeleteQuestion = exports.validateUpdateOption = exports.validateUpdateQuestion = exports.validateAddQuestion = exports.validateQuizIdParams = exports.validateQuizParams = exports.validateQuizUpdate = exports.validateQuizFromImport = exports.validateQuizCreation = exports.validateRequest = exports.queryValidationSchemas = exports.paramValidationSchemas = exports.quizValidationSchemas = void 0;
const joi_1 = __importDefault(require("joi"));
// Base schemas
const mongoIdSchema = joi_1.default.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'Invalid MongoDB ObjectId format'
});
const optionalMongoIdSchema = joi_1.default.string().regex(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Invalid MongoDB ObjectId format'
});
// Option schema
const optionSchema = joi_1.default.object({
    text: joi_1.default.string().trim().min(1).max(500).required().messages({
        'string.empty': 'Option text cannot be empty',
        'string.min': 'Option text must be at least 1 character long',
        'string.max': 'Option text cannot exceed 500 characters'
    }),
    isCorrect: joi_1.default.boolean().required().messages({
        'boolean.base': 'isCorrect must be a boolean value'
    })
});
// Question schema
const questionSchema = joi_1.default.object({
    questionText: joi_1.default.string().trim().min(1).max(1000).required().messages({
        'string.empty': 'Question text cannot be empty',
        'string.min': 'Question text must be at least 1 character long',
        'string.max': 'Question text cannot exceed 1000 characters'
    }),
    point: joi_1.default.number().integer().min(1).max(100).default(5).messages({
        'number.base': 'Points must be a number',
        'number.integer': 'Points must be an integer',
        'number.min': 'Points must be at least 1',
        'number.max': 'Points cannot exceed 100'
    }),
    timeLimit: joi_1.default.number().integer().min(5).max(300).default(30).messages({
        'number.base': 'Time limit must be a number',
        'number.integer': 'Time limit must be an integer',
        'number.min': 'Time limit must be at least 5 seconds',
        'number.max': 'Time limit cannot exceed 300 seconds'
    }),
    options: joi_1.default.array().items(optionSchema).min(2).max(6).required().messages({
        'array.min': 'Question must have at least 2 options',
        'array.max': 'Question cannot have more than 6 options'
    }),
    imageUrl: joi_1.default.string().uri().allow(null, '').messages({
        'string.uri': 'Image URL must be a valid URL'
    }),
    tags: joi_1.default.array().items(joi_1.default.string().trim().min(1).max(50)).max(10).messages({
        'array.max': 'Cannot have more than 10 tags',
        'string.min': 'Tag must be at least 1 character long',
        'string.max': 'Tag cannot exceed 50 characters'
    })
}).custom((value, helpers) => {
    // Ensure at least one correct answer exists
    const correctAnswers = value.options.filter((option) => option.isCorrect);
    if (correctAnswers.length === 0) {
        return helpers.error('custom.noCorrectAnswer');
    }
    return value;
}).messages({
    'custom.noCorrectAnswer': 'At least one option must be marked as correct'
});
// Quiz validation schemas
exports.quizValidationSchemas = {
    // Create quiz validation
    createQuiz: joi_1.default.object({
        title: joi_1.default.string().trim().min(1).max(200).required().messages({
            'string.empty': 'Quiz title cannot be empty',
            'string.min': 'Quiz title must be at least 1 character long',
            'string.max': 'Quiz title cannot exceed 200 characters'
        }),
        description: joi_1.default.string().trim().max(1000).allow('').messages({
            'string.max': 'Description cannot exceed 1000 characters'
        }),
        visibility: joi_1.default.string().valid('public', 'private').required().messages({
            'any.only': 'Visibility must be either "public" or "private"'
        }),
        dificulty: joi_1.default.string().valid('Easy', 'Medium', 'Hard').default('Medium').messages({
            'any.only': 'Difficulty must be "Easy", "Medium", or "Hard"'
        }),
        templateImgUrl: joi_1.default.string().uri().allow('').messages({
            'string.uri': 'Template image URL must be a valid URL'
        }),
        tags: joi_1.default.array().items(joi_1.default.string().trim().min(1).max(50)).max(10).messages({
            'array.max': 'Cannot have more than 10 tags'
        })
    }),
    // Create quiz from import validation
    createQuizFromImport: joi_1.default.object({
        title: joi_1.default.string().trim().min(1).max(200).required().messages({
            'string.empty': 'Quiz title cannot be empty',
            'string.min': 'Quiz title must be at least 1 character long',
            'string.max': 'Quiz title cannot exceed 200 characters'
        }),
        description: joi_1.default.string().trim().max(1000).allow('').messages({
            'string.max': 'Description cannot exceed 1000 characters'
        }),
        visibility: joi_1.default.string().valid('public', 'private').default('private').messages({
            'any.only': 'Visibility must be either "public" or "private"'
        }),
        dificulty: joi_1.default.string().valid('Easy', 'Medium', 'Hard').default('Medium').messages({
            'any.only': 'Difficulty must be "Easy", "Medium", or "Hard"'
        }),
        templateImgUrl: joi_1.default.string().uri().allow('').messages({
            'string.uri': 'Template image URL must be a valid URL'
        }),
        questions: joi_1.default.array().items(questionSchema).min(1).max(50).required().messages({
            'array.min': 'Quiz must have at least 1 question',
            'array.max': 'Quiz cannot have more than 50 questions'
        })
    }),
    // Update quiz validation
    updateQuiz: joi_1.default.object({
        title: joi_1.default.string().trim().min(1).max(200).messages({
            'string.empty': 'Quiz title cannot be empty',
            'string.min': 'Quiz title must be at least 1 character long',
            'string.max': 'Quiz title cannot exceed 200 characters'
        }),
        description: joi_1.default.string().trim().max(1000).allow('').messages({
            'string.max': 'Description cannot exceed 1000 characters'
        }),
        visibility: joi_1.default.string().valid('public', 'private').messages({
            'any.only': 'Visibility must be either "public" or "private"'
        }),
        dificulty: joi_1.default.string().valid('Easy', 'Medium', 'Hard').messages({
            'any.only': 'Difficulty must be "Easy", "Medium", or "Hard"'
        }),
        tags: joi_1.default.array().items(joi_1.default.string().trim().min(1).max(50)).max(10).messages({
            'array.max': 'Cannot have more than 10 tags'
        })
    }).min(1).messages({
        'object.min': 'At least one field must be provided for update'
    }),
    // Add question validation
    addQuestion: joi_1.default.object({
        quizzId: mongoIdSchema,
        question: questionSchema
    }),
    // Update question validation
    updateQuestion: questionSchema,
    // Update option validation
    updateOption: optionSchema
};
// Parameter validation schemas
exports.paramValidationSchemas = {
    quizzId: joi_1.default.object({
        quizzId: mongoIdSchema
    }),
    quizId: joi_1.default.object({
        quizId: mongoIdSchema
    }),
    questionParams: joi_1.default.object({
        quizzId: mongoIdSchema,
        questionId: mongoIdSchema
    }),
    optionParams: joi_1.default.object({
        quizzId: mongoIdSchema,
        questionId: mongoIdSchema,
        optionId: mongoIdSchema
    })
};
// Query validation schemas
exports.queryValidationSchemas = {
    getAllQuizzes: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1),
        limit: joi_1.default.number().integer().min(1).max(100).default(10),
        search: joi_1.default.string().trim().max(100),
        tags: joi_1.default.string().trim().max(500),
        notOwn: optionalMongoIdSchema,
        sortBy: joi_1.default.string().valid('createdAt', 'title', 'updatedAt').default('createdAt'),
        sortOrder: joi_1.default.string().valid('asc', 'desc').default('desc')
    }),
    getUserQuizzes: joi_1.default.object({
        page: joi_1.default.number().integer().min(1).default(1),
        limit: joi_1.default.number().integer().min(1).max(100).default(10),
        visibility: joi_1.default.string().valid('public', 'private')
    })
};
// Validation middleware factory
const validateRequest = (schema, target = 'body') => {
    return (req, res, next) => {
        const dataToValidate = req[target];
        const { error, value } = schema.validate(dataToValidate, {
            abortEarly: false,
            stripUnknown: true,
            convert: true
        });
        if (error) {
            const validationErrors = error.details.map(detail => {
                var _a;
                return ({
                    field: detail.path.join('.'),
                    message: detail.message,
                    value: (_a = detail.context) === null || _a === void 0 ? void 0 : _a.value
                });
            });
            return res.status(400).json({
                message: 'Validation failed',
                errors: validationErrors
            });
        }
        // Replace the original data with validated and sanitized data
        req[target] = value;
        next();
    };
};
exports.validateRequest = validateRequest;
// Combined validation middleware for complex validations
exports.validateQuizCreation = [
    (0, exports.validateRequest)(exports.quizValidationSchemas.createQuiz, 'body')
];
exports.validateQuizFromImport = [
    (0, exports.validateRequest)(exports.quizValidationSchemas.createQuizFromImport, 'body')
];
exports.validateQuizUpdate = [
    (0, exports.validateRequest)(exports.paramValidationSchemas.quizId, 'params'),
    (0, exports.validateRequest)(exports.quizValidationSchemas.updateQuiz, 'body')
];
exports.validateQuizParams = [
    (0, exports.validateRequest)(exports.paramValidationSchemas.quizzId, 'params')
];
exports.validateQuizIdParams = [
    (0, exports.validateRequest)(exports.paramValidationSchemas.quizId, 'params')
];
exports.validateAddQuestion = [
    (0, exports.validateRequest)(exports.quizValidationSchemas.addQuestion, 'body')
];
exports.validateUpdateQuestion = [
    (0, exports.validateRequest)(exports.paramValidationSchemas.questionParams, 'params'),
    (0, exports.validateRequest)(exports.quizValidationSchemas.updateQuestion, 'body')
];
exports.validateUpdateOption = [
    (0, exports.validateRequest)(exports.paramValidationSchemas.optionParams, 'params'),
    (0, exports.validateRequest)(exports.quizValidationSchemas.updateOption, 'body')
];
exports.validateDeleteQuestion = [
    (0, exports.validateRequest)(exports.paramValidationSchemas.questionParams, 'params')
];
exports.validateDeleteOption = [
    (0, exports.validateRequest)(exports.paramValidationSchemas.optionParams, 'params')
];
exports.validateGetAllQuizzes = [
    (0, exports.validateRequest)(exports.queryValidationSchemas.getAllQuizzes, 'query')
];
exports.validateGetUserQuizzes = [
    (0, exports.validateRequest)(exports.queryValidationSchemas.getUserQuizzes, 'query')
];
// File upload validation middleware
const validateFileUpload = (allowedTypes, maxSize = 5 * 1024 * 1024) => {
    return (req, res, next) => {
        if (!req.file) {
            return res.status(400).json({
                message: 'No file uploaded'
            });
        }
        // Check file type
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
            });
        }
        // Check file size
        if (req.file.size > maxSize) {
            return res.status(400).json({
                message: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
            });
        }
        next();
    };
};
exports.validateFileUpload = validateFileUpload;
exports.validatePDFUpload = (0, exports.validateFileUpload)(['application/pdf'], 10 * 1024 * 1024); // 10MB for PDF

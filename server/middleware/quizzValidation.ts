import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Base schemas
const mongoIdSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
  'string.pattern.base': 'Invalid MongoDB ObjectId format'
});

const optionalMongoIdSchema = Joi.string().regex(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid MongoDB ObjectId format'
});

// Option schema
const optionSchema = Joi.object({
  text: Joi.string().trim().min(1).max(500).required().messages({
    'string.empty': 'Option text cannot be empty',
    'string.min': 'Option text must be at least 1 character long',
    'string.max': 'Option text cannot exceed 500 characters'
  }),
  isCorrect: Joi.boolean().required().messages({
    'boolean.base': 'isCorrect must be a boolean value'
  })
});

// Question schema
const questionSchema = Joi.object({
  questionText: Joi.string().trim().min(1).max(1000).required().messages({
    'string.empty': 'Question text cannot be empty',
    'string.min': 'Question text must be at least 1 character long',
    'string.max': 'Question text cannot exceed 1000 characters'
  }),
  point: Joi.number().integer().min(1).max(100).default(5).messages({
    'number.base': 'Points must be a number',
    'number.integer': 'Points must be an integer',
    'number.min': 'Points must be at least 1',
    'number.max': 'Points cannot exceed 100'
  }),
  timeLimit: Joi.number().integer().min(5).max(300).default(30).messages({
    'number.base': 'Time limit must be a number',
    'number.integer': 'Time limit must be an integer',
    'number.min': 'Time limit must be at least 5 seconds',
    'number.max': 'Time limit cannot exceed 300 seconds'
  }),
  options: Joi.array().items(optionSchema).min(2).max(6).required().messages({
    'array.min': 'Question must have at least 2 options',
    'array.max': 'Question cannot have more than 6 options'
  }),
  imageUrl: Joi.string().uri().allow(null, '').messages({
    'string.uri': 'Image URL must be a valid URL'
  }),
  tags: Joi.array().items(Joi.string().trim().min(1).max(50)).max(10).messages({
    'array.max': 'Cannot have more than 10 tags',
    'string.min': 'Tag must be at least 1 character long',
    'string.max': 'Tag cannot exceed 50 characters'
  })
}).custom((value, helpers) => {
  // Ensure at least one correct answer exists
  const correctAnswers = value.options.filter((option: any) => option.isCorrect);
  if (correctAnswers.length === 0) {
    return helpers.error('custom.noCorrectAnswer');
  }
  return value;
}).messages({
  'custom.noCorrectAnswer': 'At least one option must be marked as correct'
});

// Quiz validation schemas
export const quizValidationSchemas = {
  // Create quiz validation
  createQuiz: Joi.object({
    title: Joi.string().trim().min(1).max(200).required().messages({
      'string.empty': 'Quiz title cannot be empty',
      'string.min': 'Quiz title must be at least 1 character long',
      'string.max': 'Quiz title cannot exceed 200 characters'
    }),
    description: Joi.string().trim().max(1000).allow('').messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
    visibility: Joi.string().valid('public', 'private').required().messages({
      'any.only': 'Visibility must be either "public" or "private"'
    }),
    dificulty: Joi.string().valid('Easy', 'Medium', 'Hard').default('Medium').messages({
      'any.only': 'Difficulty must be "Easy", "Medium", or "Hard"'
    }),
    templateImgUrl: Joi.string().uri().allow('').messages({
      'string.uri': 'Template image URL must be a valid URL'
    }),
    tags: Joi.array().items(Joi.string().trim().min(1).max(50)).max(10).messages({
      'array.max': 'Cannot have more than 10 tags'
    })
  }),

  // Create quiz from import validation
  createQuizFromImport: Joi.object({
    title: Joi.string().trim().min(1).max(200).required().messages({
      'string.empty': 'Quiz title cannot be empty',
      'string.min': 'Quiz title must be at least 1 character long',
      'string.max': 'Quiz title cannot exceed 200 characters'
    }),
    description: Joi.string().trim().max(1000).allow('').messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
    visibility: Joi.string().valid('public', 'private').default('private').messages({
      'any.only': 'Visibility must be either "public" or "private"'
    }),
    dificulty: Joi.string().valid('Easy', 'Medium', 'Hard').default('Medium').messages({
      'any.only': 'Difficulty must be "Easy", "Medium", or "Hard"'
    }),
    templateImgUrl: Joi.string().uri().allow('').messages({
      'string.uri': 'Template image URL must be a valid URL'
    }),
    questions: Joi.array().items(questionSchema).min(1).max(50).required().messages({
      'array.min': 'Quiz must have at least 1 question',
      'array.max': 'Quiz cannot have more than 50 questions'
    })
  }),

  // Update quiz validation
  updateQuiz: Joi.object({
    title: Joi.string().trim().min(1).max(200).messages({
      'string.empty': 'Quiz title cannot be empty',
      'string.min': 'Quiz title must be at least 1 character long',
      'string.max': 'Quiz title cannot exceed 200 characters'
    }),
    description: Joi.string().trim().max(1000).allow('').messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
    visibility: Joi.string().valid('public', 'private').messages({
      'any.only': 'Visibility must be either "public" or "private"'
    }),
    dificulty: Joi.string().valid('Easy', 'Medium', 'Hard').messages({
      'any.only': 'Difficulty must be "Easy", "Medium", or "Hard"'
    }),
    tags: Joi.array().items(Joi.string().trim().min(1).max(50)).max(10).messages({
      'array.max': 'Cannot have more than 10 tags'
    })
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  }),

  // Add question validation
  addQuestion: Joi.object({
    quizzId: mongoIdSchema,
    question: questionSchema
  }),

  // Update question validation
  updateQuestion: questionSchema,

  // Update option validation
  updateOption: optionSchema
};

// Parameter validation schemas
export const paramValidationSchemas = {
  quizzId: Joi.object({
    quizzId: mongoIdSchema
  }),
  
  quizId: Joi.object({
    quizId: mongoIdSchema
  }),

  questionParams: Joi.object({
    quizzId: mongoIdSchema,
    questionId: mongoIdSchema
  }),

  optionParams: Joi.object({
    quizzId: mongoIdSchema,
    questionId: mongoIdSchema,
    optionId: mongoIdSchema
  })
};

// Query validation schemas
export const queryValidationSchemas = {
  getAllQuizzes: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().trim().max(100),
    tags: Joi.string().trim().max(500),
    notOwn: optionalMongoIdSchema,
    sortBy: Joi.string().valid('createdAt', 'title', 'updatedAt').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  getUserQuizzes: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    visibility: Joi.string().valid('public', 'private')
  })
};

// Validation middleware factory
export const validateRequest = (schema: Joi.ObjectSchema, target: 'body' | 'params' | 'query' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const dataToValidate = req[target];
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

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

// Combined validation middleware for complex validations
export const validateQuizCreation = [
  validateRequest(quizValidationSchemas.createQuiz, 'body')
];

export const validateQuizFromImport = [
  validateRequest(quizValidationSchemas.createQuizFromImport, 'body')
];

export const validateQuizUpdate = [
  validateRequest(paramValidationSchemas.quizId, 'params'),
  validateRequest(quizValidationSchemas.updateQuiz, 'body')
];

export const validateQuizParams = [
  validateRequest(paramValidationSchemas.quizzId, 'params')
];

export const validateQuizIdParams = [
  validateRequest(paramValidationSchemas.quizId, 'params')
];

export const validateAddQuestion = [
  validateRequest(quizValidationSchemas.addQuestion, 'body')
];

export const validateUpdateQuestion = [
  validateRequest(paramValidationSchemas.questionParams, 'params'),
  validateRequest(quizValidationSchemas.updateQuestion, 'body')
];

export const validateUpdateOption = [
  validateRequest(paramValidationSchemas.optionParams, 'params'),
  validateRequest(quizValidationSchemas.updateOption, 'body')
];

export const validateDeleteQuestion = [
  validateRequest(paramValidationSchemas.questionParams, 'params')
];

export const validateDeleteOption = [
  validateRequest(paramValidationSchemas.optionParams, 'params')
];

export const validateGetAllQuizzes = [
  validateRequest(queryValidationSchemas.getAllQuizzes, 'query')
];

export const validateGetUserQuizzes = [
  validateRequest(queryValidationSchemas.getUserQuizzes, 'query')
];

// File upload validation middleware
export const validateFileUpload = (allowedTypes: string[], maxSize: number = 5 * 1024 * 1024) => {
  return (req: Request, res: Response, next: NextFunction) => {
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

export const validatePDFUpload = validateFileUpload(['application/pdf'], 10 * 1024 * 1024); // 10MB for PDF
import Joi from 'joi';

// --- Reusable Base Schemas ---
const mongoId = Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
  'string.pattern.base': 'Invalid ID format'
});

const optionSchema = Joi.object({
  text: Joi.string().trim().min(1).max(500).required(),
  isCorrect: Joi.boolean().required()
});

const questionSchema = Joi.object({
  questionText: Joi.string().trim().min(1).max(1000).required(),
  point: Joi.number().integer().min(1).max(100).default(5),
  timeLimit: Joi.number().integer().min(5).max(300).default(30),
  options: Joi.array()
    .items(optionSchema)
    .min(2)
    .max(6)
    .required()
    .custom((options, helpers) => {
      const correctCount = options.filter(
        (opt: { isCorrect: boolean }) => opt.isCorrect
      ).length;
      if (correctCount === 0) {
        return helpers.message({
          custom: "Each question must have at least one correct option.",
        });
      }
      return options;
    }),
  imageUrl: Joi.string().uri().allow(null, ""),
  tags: Joi.string()
    .trim()
    .allow("")
    .pattern(/^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*$/) // comma separated words
    .max(500),
});


// --- Exported Schemas for Routes ---
export const quizSchemas = {
  // PARAMS Schemas
  quizIdParam: {
    params: Joi.object({ quizId: mongoId.required() }),
  },
  quizzIdParam: {
    // Handles the 'quizzId' typo if needed for compatibility
    params: Joi.object({ quizzId: mongoId.required() }),
  },
  questionParams: {
    params: Joi.object({
      quizzId: mongoId.required(),
      questionId: mongoId.required(),
    }),
  },
  optionParams: {
    params: Joi.object({
      quizzId: mongoId.required(),
      questionId: mongoId.required(),
      optionId: mongoId.required(),
    }),
  },

  // QUERY Schemas
  getAllQuizzes: {
    query: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      search: Joi.string().trim().max(100).allow(""),
      tags: Joi.string().trim().allow(""),
      owner: Joi.string().valid("me", "other", "all"),
      sortBy: Joi.string()
        .valid("createdAt", "title", "updatedAt")
        .default("createdAt"),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
    }),
  },

  // BODY Schemas
  createQuiz: {
    body: Joi.object({
      title: Joi.string().trim().min(1).max(200).required(),
      description: Joi.string().trim().max(1000).allow(""),
      visibility: Joi.string().valid("public", "private").required(),
      dificulty: Joi.string().valid("Easy", "Medium", "Hard").default("Medium"),
      templateImgUrl: Joi.string().allow(""),
      tags: Joi.string()
        .trim()
        .pattern(/^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*$/) // comma separated words
        .max(500)
        .allow(""),
    }),
  },
  createQuizFromImport: {
    body: Joi.object({
      title: Joi.string().trim().min(1).max(200).required(),
      description: Joi.string().trim().max(1000).allow(""),
      visibility: Joi.string().valid("public", "private").default("private"),
      dificulty: Joi.string().valid("Easy", "Medium", "Hard").default("Medium"),
      templateImgUrl: Joi.string().allow(""),
      questions: Joi.array().items(questionSchema).min(1).max(50).required(),
    }),
  },
  updateQuiz: {
    body: Joi.object({
      title: Joi.string().trim().min(1).max(200).optional(),
      description: Joi.string().trim().max(1000).allow("").optional(),
      visibility: Joi.string().valid("public", "private").optional(),
      dificulty: Joi.string().valid("Easy", "Medium", "Hard").optional(),
      tags: Joi.string()
        .trim()
        .pattern(/^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*$/)
        .max(500)
        .allow("")
        .optional(),
    })
      .min(1)
      .messages({ "object.min": "At least one field is required to update." }),
  }
  ,
  addQuestion: {
    body: Joi.object({
      quizzId: mongoId.required(),
      question: questionSchema.required(),
    }),
  },
  updateQuestion: {
    body: questionSchema,
  },
  updateOption: {
    body: optionSchema,
  },
};
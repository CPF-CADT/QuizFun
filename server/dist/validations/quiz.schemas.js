"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.quizSchemas = void 0;
const joi_1 = __importDefault(require("joi"));
// --- Reusable Base Schemas ---
const mongoId = joi_1.default.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
    'string.pattern.base': 'Invalid ID format'
});
const optionSchema = joi_1.default.object({
    text: joi_1.default.string().trim().min(1).max(500).required(),
    isCorrect: joi_1.default.boolean().required()
});
const questionSchema = joi_1.default.object({
    questionText: joi_1.default.string().trim().min(1).max(1000).required(),
    point: joi_1.default.number().integer().min(1).max(100).default(5),
    timeLimit: joi_1.default.number().integer().min(5).max(300).default(30),
    options: joi_1.default.array()
        .items(optionSchema)
        .min(2)
        .max(6)
        .required()
        .custom((options, helpers) => {
        const correctCount = options.filter((opt) => opt.isCorrect).length;
        if (correctCount === 0) {
            return helpers.message({
                custom: "Each question must have at least one correct option.",
            });
        }
        return options;
    }),
    imageUrl: joi_1.default.string().uri().allow(null, ""),
    tags: joi_1.default.string()
        .trim()
        .allow("")
        .pattern(/^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*$/) // comma separated words
        .max(500),
});
// --- Exported Schemas for Routes ---
exports.quizSchemas = {
    // PARAMS Schemas
    quizIdParam: {
        params: joi_1.default.object({ quizId: mongoId.required() }),
    },
    quizzIdParam: {
        // Handles the 'quizzId' typo if needed for compatibility
        params: joi_1.default.object({ quizzId: mongoId.required() }),
    },
    questionParams: {
        params: joi_1.default.object({
            quizzId: mongoId.required(),
            questionId: mongoId.required(),
        }),
    },
    optionParams: {
        params: joi_1.default.object({
            quizzId: mongoId.required(),
            questionId: mongoId.required(),
            optionId: mongoId.required(),
        }),
    },
    // QUERY Schemas
    getAllQuizzes: {
        query: joi_1.default.object({
            page: joi_1.default.number().integer().min(1).default(1),
            limit: joi_1.default.number().integer().min(1).max(100).default(10),
            search: joi_1.default.string().trim().max(100).allow(""),
            tags: joi_1.default.string().trim().allow(""),
            owner: joi_1.default.string().valid("me", "other", "all"),
            sortBy: joi_1.default.string()
                .valid("createdAt", "title", "updatedAt")
                .default("createdAt"),
            sortOrder: joi_1.default.string().valid("asc", "desc").default("desc"),
        }),
    },
    // BODY Schemas
    createQuiz: {
        body: joi_1.default.object({
            title: joi_1.default.string().trim().min(1).max(200).required(),
            description: joi_1.default.string().trim().max(1000).allow(""),
            visibility: joi_1.default.string().valid("public", "private").required(),
            dificulty: joi_1.default.string().valid("Easy", "Medium", "Hard").default("Medium"),
            templateImgUrl: joi_1.default.string().allow(""),
            tags: joi_1.default.string()
                .trim()
                .pattern(/^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*$/) // comma separated words
                .max(500)
                .allow(""),
        }),
    },
    createQuizFromImport: {
        body: joi_1.default.object({
            title: joi_1.default.string().trim().min(1).max(200).required(),
            description: joi_1.default.string().trim().max(1000).allow(""),
            visibility: joi_1.default.string().valid("public", "private").default("private"),
            dificulty: joi_1.default.string().valid("Easy", "Medium", "Hard").default("Medium"),
            templateImgUrl: joi_1.default.string().allow(""),
            questions: joi_1.default.array().items(questionSchema).min(1).max(50).required(),
        }),
    },
    updateQuiz: {
        body: joi_1.default.object({
            title: joi_1.default.string().trim().min(1).max(200).optional(),
            description: joi_1.default.string().trim().max(1000).allow("").optional(),
            visibility: joi_1.default.string().valid("public", "private").optional(),
            dificulty: joi_1.default.string().valid("Easy", "Medium", "Hard").optional(),
            tags: joi_1.default.string()
                .trim()
                .pattern(/^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*$/)
                .max(500)
                .allow("")
                .optional(),
        })
            .min(1)
            .messages({ "object.min": "At least one field is required to update." }),
    },
    addQuestion: {
        body: joi_1.default.object({
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

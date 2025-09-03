"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizModel = exports.QuestionSchema = exports.OptionSchema = void 0;
const mongoose_1 = require("mongoose");
exports.OptionSchema = new mongoose_1.Schema({
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
});
exports.QuestionSchema = new mongoose_1.Schema({
    questionText: { type: String, required: true },
    imageUrl: { type: String, required: false },
    point: { type: Number, required: true, min: 1, max: 10 },
    timeLimit: { type: Number, required: true, min: 5 },
    options: {
        type: [exports.OptionSchema],
        required: true,
        validate: [
            {
                validator: (options) => options.length >= 2,
                message: 'A question must have at least two options.'
            },
            {
                validator: (options) => options.some(option => option.isCorrect),
                message: 'A question must have at least one correct option.'
            }
        ]
    },
    tags: { type: [String], index: true },
    status: {
        type: String,
        enum: ['active', 'under_review', 'disabled'],
        default: 'active'
    }
});
const QuizSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    creatorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    visibility: { type: String, enum: ['public', 'private'], default: 'private' },
    questions: { type: [exports.QuestionSchema] },
    templateImgUrl: { type: String },
    tags: { type: [String], index: true },
    forkBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        validate: {
            validator: function (value) {
                if (!value)
                    return true;
                return !this.creatorId.equals(value);
            },
            message: "forkBy cannot be the same as creatorId"
        }
    },
    dificulty: { type: String, enum: ['Hard', 'Medium', 'Easy'], default: 'Medium' }
}, {
    timestamps: true,
    collection: 'quizzes'
});
exports.QuizModel = (0, mongoose_1.model)('Quiz', QuizSchema);

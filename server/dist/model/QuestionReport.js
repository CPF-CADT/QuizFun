"use strict";
// src/model/QuestionReport.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionReportModel = void 0;
const mongoose_1 = require("mongoose");
const QuestionReportSchema = new mongoose_1.Schema({
    quizId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Quiz",
        required: true,
        index: true,
    },
    questionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        index: true,
    },
    reporterId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: false,
        index: true,
    },
    reason: {
        type: String,
        enum: [
            "incorrect_answer",
            "unclear_wording",
            "typo",
            "inappropriate_content",
            "other",
        ],
        required: true,
    },
    comment: { type: String, trim: true, maxlength: 500 },
    status: {
        type: String,
        enum: ["pending", "resolved", "dismissed"],
        default: "pending",
        index: true,
    },
}, {
    timestamps: true,
    collection: "questionreports",
});
QuestionReportSchema.index({ questionId: 1, reporterId: 1 }, { unique: true });
exports.QuestionReportModel = (0, mongoose_1.model)('QuestionReport', QuestionReportSchema);

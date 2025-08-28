"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestionReportModel = void 0;
// new file: QuestionReport.model.ts
const mongoose_1 = require("mongoose");
const QuestionReportSchema = new mongoose_1.Schema({
    quizId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    questionId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    reporterUserId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
        type: String,
        enum: ['incorrect_answer', 'unclear_wording', 'inappropriate_content', 'other'],
        required: true
    },
    comment: { type: String, trim: true, maxLength: 500 },
    status: { type: String, enum: ['open', 'resolved', 'dismissed'], default: 'open', index: true },
}, { timestamps: true, collection: 'questionreports' });
exports.QuestionReportModel = (0, mongoose_1.model)('QuestionReport', QuestionReportSchema);

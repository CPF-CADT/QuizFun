"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameHistoryModel = void 0;
const mongoose_1 = require("mongoose");
const AnswerAttemptSchema = new mongoose_1.Schema({
    selectedOptionId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    isCorrect: { type: Boolean, required: true },
    answerTimeMs: { type: Number, required: true },
}, { _id: false });
const GameHistorySchema = new mongoose_1.Schema({
    gameSessionId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'GameSession', required: false, index: true },
    quizId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    questionId: { type: mongoose_1.Schema.Types.ObjectId, required: true, index: true },
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', index: true }, // required: false is implied
    guestNickname: { type: String },
    username: { type: String },
    attempts: { type: [AnswerAttemptSchema], required: true },
    isUltimatelyCorrect: { type: Boolean, required: true },
    finalScoreGained: { type: Number, required: true, default: 0 },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'gamehistories'
});
exports.GameHistoryModel = (0, mongoose_1.model)('GameHistory', GameHistorySchema);

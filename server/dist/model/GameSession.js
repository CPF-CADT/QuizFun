"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameSessionModel = void 0;
const mongoose_1 = require("mongoose");
const GameSessionFeedbackSchema = new mongoose_1.Schema({
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxLength: 500 }
}, { _id: false });
const GameSessionParticipantSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    nickname: { type: String, required: true },
    finalScore: { type: Number, required: true, default: 0 },
    finalRank: { type: Number },
}, { _id: false });
const GameSessionSchema = new mongoose_1.Schema({
    quizId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    teamId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Team', index: true },
    hostId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', index: true },
    guestNickname: { type: String, trim: true },
    joinCode: {
        type: Number,
        sparse: true // Allows multiple nulls, but unique if a value exists
    },
    status: {
        type: String,
        enum: ['waiting', 'in_progress', 'completed'],
        default: 'waiting',
    },
    mode: { type: String, enum: ['multiplayer', 'solo'], default: 'multiplayer', required: true, index: true },
    feedback: { type: [GameSessionFeedbackSchema], default: [] },
    results: { type: [GameSessionParticipantSchema], default: [] },
    startedAt: { type: Date },
    endedAt: { type: Date },
}, {
    timestamps: true,
    collection: 'gamesessions'
});
exports.GameSessionModel = (0, mongoose_1.model)('GameSession', GameSessionSchema);

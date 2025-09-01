"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamQuizModel = void 0;
const mongoose_1 = require("mongoose");
const TeamQuizSchema = new mongoose_1.Schema({
    teamId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Team', required: true },
    quizId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    addedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    addedAt: { type: Date, default: Date.now },
    sessions: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'GameSession' }],
    mode: {
        type: String,
        enum: ['solo', 'multiplayer'], // CORRECTED: Enum values now match the interface.
        default: 'multiplayer', // CORRECTED: Default value is now valid.
        required: true
    }
}, {
    timestamps: true,
    collection: 'teamquizzes',
});
TeamQuizSchema.index({ teamId: 1, quizId: 1 }, { unique: true });
exports.TeamQuizModel = (0, mongoose_1.model)('TeamQuiz', TeamQuizSchema);

import { Schema, model, Document, Types } from 'mongoose';

export interface IGameHistory extends Document {
    gameSessionId: Types.ObjectId;
    quizId: Types.ObjectId;
    questionId: Types.ObjectId;
    userId?: Types.ObjectId;      // Optional for guests
    guestNickname?: string;   // For guest identification
    selectedOptionId: Types.ObjectId;
    isCorrect: boolean;
    scoreGained: number;
    answerTimeMs: number;
    createdAt: Date;
}

const GameHistorySchema = new Schema<IGameHistory>({
    gameSessionId: { type: Schema.Types.ObjectId, ref: 'GameSession', required: true, index: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    questionId: { type: Schema.Types.ObjectId, required: true },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false, // The key change to allow guests
        index: true
    },
    guestNickname: {
        type: String,
        required: false
    },
    selectedOptionId: { type: Schema.Types.ObjectId, required: true },
    isCorrect: { type: Boolean, required: true },
    scoreGained: { type: Number, required: true, default: 0 },
    answerTimeMs: { type: Number, required: true },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'gamehistories'
});

export const GameHistoryModel = model<IGameHistory>('GameHistory', GameHistorySchema);
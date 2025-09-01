import { Schema, model, Document, Types } from 'mongoose';

// Interface for a single answer attempt (no need to extend Document)
export interface IAnswerAttempt {
    selectedOptionId: Types.ObjectId;
    isCorrect: boolean;
    answerTimeMs: number;
}

const AnswerAttemptSchema = new Schema<IAnswerAttempt>({
    selectedOptionId: { type: Schema.Types.ObjectId, required: true },
    isCorrect: { type: Boolean, required: true },
    answerTimeMs: { type: Number, required: true },
}, { _id: false });

// Main interface for the Game History document
export interface IGameHistory extends Document {
    gameSessionId: Types.ObjectId;
    quizId: Types.ObjectId;
    questionId: Types.ObjectId; // This ID refers to a sub-document in the Quiz model
    userId?: Types.ObjectId;
    guestNickname?: string;
    username?: string;
    attempts: IAnswerAttempt[];
    isUltimatelyCorrect: boolean;
    finalScoreGained: number;
    createdAt: Date;
}

const GameHistorySchema = new Schema<IGameHistory>({
    gameSessionId: { type: Schema.Types.ObjectId, ref: 'GameSession', required: false, index: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    questionId: { type: Schema.Types.ObjectId, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true }, // required: false is implied
    guestNickname: { type: String },
    username: { type: String },
    attempts: { type: [AnswerAttemptSchema], required: true },
    isUltimatelyCorrect: { type: Boolean, required: true },
    finalScoreGained: { type: Number, required: true, default: 0 },
}, {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'gamehistories'
});

export const GameHistoryModel = model<IGameHistory>('GameHistory', GameHistorySchema);
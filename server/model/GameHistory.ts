import { Schema, model, Document, Types } from 'mongoose';

// NEW: Define a sub-document for each individual answer attempt.
export interface IAnswerAttempt extends Document {
    selectedOptionId: Types.ObjectId;
    isCorrect: boolean;
    answerTimeMs: number;
}

const AnswerAttemptSchema = new Schema<IAnswerAttempt>({
    selectedOptionId: { type: Schema.Types.ObjectId, required: true },
    isCorrect: { type: Boolean, required: true },
    answerTimeMs: { type: Number, required: true },
}, { _id: false }); // _id is not needed for sub-documents in this case

// UPDATED: The main history interface now contains an array of attempts.
export interface IGameHistory extends Document {
    gameSessionId: Types.ObjectId;
    quizId: Types.ObjectId;
    questionId: Types.ObjectId;
    userId?: Types.ObjectId;
    guestNickname?: string;
    attempts: IAnswerAttempt[];
    isUltimatelyCorrect: boolean; // Was the *final* answer correct?
    finalScoreGained: number;
    createdAt: Date;
}

const GameHistorySchema = new Schema<IGameHistory>({
    gameSessionId: { type: Schema.Types.ObjectId, ref: 'GameSession', required: true, index: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    questionId: { type: Schema.Types.ObjectId, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    guestNickname: { type: String, required: false },
    
    // UPDATED: Store the full history of attempts.
    attempts: { type: [AnswerAttemptSchema], required: true },
    
    // UPDATED: Store summary data for easy access.
    isUltimatelyCorrect: { type: Boolean, required: true },
    finalScoreGained: { type: Number, required: true, default: 0 },

}, {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'gamehistories'
});

export const GameHistoryModel = model<IGameHistory>('GameHistory', GameHistorySchema);
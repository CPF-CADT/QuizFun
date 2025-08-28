// No longer need 'joi' if it's not being used in this file
import { Schema, model, Document, Types } from 'mongoose';

// Interface for a single feedback entry (no changes needed)
export interface IFeedback extends Document {
    rating: number;
    comment?: string;
}
export interface IGameSessionParticipant {
    userId?: Types.ObjectId;
    nickname: string;
    finalScore: number;
    finalRank?: number;
}
export interface IGameSession extends Document {
    _id: Types.ObjectId;
    quizId: Types.ObjectId;
    hostId?: Types.ObjectId;
    guestNickname?: string;
    joinCode?: number;
    status: 'waiting' | 'in_progress' | 'completed';
    mode: 'multiplayer' | 'solo';
    results: IGameSessionParticipant[];
    feedback?: IFeedback[];
    startedAt?: Date;
    endedAt?: Date;
}


const GameSessionFeedbackSchema = new Schema<IFeedback>({
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxLength: 500 }
}, { _id: false });

const GameSessionParticipantSchema = new Schema<IGameSessionParticipant>({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    nickname: { type: String, required: true },
    finalScore: { type: Number, required: true, default: 0 },
    finalRank: { type: Number },
}, { _id: false });

const GameSessionSchema = new Schema<IGameSession>({
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },

    hostId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    guestNickname: { type: String, trim: true }, 
    joinCode: {
        type: Number,
        unique: false, 
        sparse: true  
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


export const GameSessionModel = model<IGameSession>('GameSession', GameSessionSchema);
import { Schema, model, Document, Types } from 'mongoose';

// Interface for a single feedback entry
export interface IFeedback {
  rating: number;
  comment?: string;
}

// Interface for a participant in a game session
export interface IGameSessionParticipant {
  userId: Types.ObjectId;
  nickname: string;
  finalScore: number; 
  finalRank?: number;
  feedback?: IFeedback; 
}

// Main interface for the Game Session document
export interface IGameSession extends Document {
  _id: Types.ObjectId;
  quizId: Types.ObjectId;
  hostId: Types.ObjectId;
  joinCode: number;
  status: 'waiting' | 'in_progress' | 'completed';
  results: IGameSessionParticipant[];
  startedAt?: Date;
  endedAt?: Date;
}

const GameSessionFeedbackSchema = new Schema<IFeedback>({
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, maxLength: 500 } // Added maxLength
}, { _id: false });

const GameSessionParticipantSchema = new Schema<IGameSessionParticipant>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  nickname: { type: String, required: true },
  finalScore: { type: Number, required: true, default: 0 }, // Made required
  finalRank: { type: Number },
  feedback: { type: GameSessionFeedbackSchema, required: false }
}, { _id: false });

const GameSessionSchema = new Schema<IGameSession>({
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
  hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  joinCode: { type: Number, required: true, unique: true },
  status: {
    type: String,
    enum: ['waiting', 'in_progress', 'completed'],
    default: 'waiting',
  },
  results: { type: [GameSessionParticipantSchema], default: [] }, // Added default
  startedAt: { type: Date },
  endedAt: { type: Date },
}, { timestamps: true, collection: 'gamesessions' });

export const GameSessionModel = model<IGameSession>('GameSession', GameSessionSchema);
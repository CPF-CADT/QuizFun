import { Schema, model, Document, Types } from 'mongoose';

export interface IFeedback {
  rating: number;
  comment?: string;
}

export interface IGameSessionParticipant {
  userId: Types.ObjectId;
  nickname: string;
  finalScore?: number;
  finalRank?: number;
  feedback?: IFeedback;
}

export interface IGameSession extends Document {
  _id: Types.ObjectId;
  quizId: Types.ObjectId;
  hostId: Types.ObjectId;
  joinCode: number;
  status: 'waiting' | 'in_progress' | 'completed';
  results?: IGameSessionParticipant[];
  startedAt?: Date;
  endedAt?: Date;
}

const GameSessionFeedbackSchema = new Schema<IFeedback>({
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true }
}, { _id: false });

const GameSessionParticipantSchema = new Schema<IGameSessionParticipant>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  nickname: { type: String, required: true },
  finalScore: { type: Number, default: 0 },
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
  results: [GameSessionParticipantSchema],
  startedAt: { type: Date },
  endedAt: { type: Date },
}, { timestamps: true, collection: 'gamesessions' });

export const GameSessionModel = model<IGameSession>('GameSession', GameSessionSchema);
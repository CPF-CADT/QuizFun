import { Schema, model, Document, Types } from 'mongoose';

export interface IGameSessionParticipant {
  userId: Types.ObjectId;
  nickname: string;
  finalScore: number;
  finalRank: number;
}

export interface IGameSession extends Document {
  quizId: Types.ObjectId;
  hostId: Types.ObjectId;
  joinCode: string;
  status: 'waiting' | 'in_progress' | 'completed';
  results: IGameSessionParticipant[];
  startedAt?: Date;
  endedAt?: Date;
}

const GameSessionParticipantSchema = new Schema<IGameSessionParticipant>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  nickname: { type: String, required: true },
  finalScore: { type: Number, required: true },
  finalRank: { type: Number, required: true },
}, { _id: false });

const GameSessionSchema = new Schema<IGameSession>({
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  joinCode: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ['waiting', 'in_progress', 'completed'],
    default: 'waiting',
  },
  results: [GameSessionParticipantSchema],
  startedAt: { type: Date },
  endedAt: { type: Date },
}, { timestamps: true ,collection:'gamesessions'});

export const GameSessionModel = model<IGameSession>('GameSession', GameSessionSchema);
import { Schema, model, Document, Types } from 'mongoose';

export interface IFeedback{
  rating:Types.Decimal128,
  comment: string
}
export interface IGameSessionParticipant {
  userId: Types.ObjectId;
  nickname: string;
  finalScore?: number;
  finalRank?: number;
  feedback?: IFeedback[]
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
const  GameSessionFeedback = new Schema<IFeedback>({
  rating:{type:Schema.Types.Decimal128},
  comment:{type:String}
})
const GameSessionParticipantSchema = new Schema<IGameSessionParticipant>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  nickname: { type: String, required: true },
  finalScore: { type: Number, required: true },
  finalRank: { type: Number, required: true },
  feedback:[GameSessionFeedback]
}, { _id: false });

const GameSessionSchema = new Schema<IGameSession>({
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  joinCode: { type: Number, required: true },
  status: {
    type: String,
    enum: ['waiting', 'in_progress', 'completed'],
    default: 'waiting',
  },
  results: [GameSessionParticipantSchema],
  startedAt: { type: Date },
  endedAt: { type: Date },
}, { timestamps: true ,collection:'gamesessions'});

//index for quizId
GameSessionSchema.index({quizId: 1});

//index for hostId
GameSessionSchema.index({hostId: 1});

export const GameSessionModel = model<IGameSession>('GameSession', GameSessionSchema);
import { Schema, model, Document, Types } from 'mongoose';

export interface IGameHistory extends Document {
  gameSessionId: Types.ObjectId; 
  quizId: Types.ObjectId;        
  userId: Types.ObjectId;        
  questionId: Types.ObjectId;   
  selectedOptionId: Types.ObjectId; 
  isCorrect: boolean;
  pointsAwarded: number;
  timeTakenMs: number; 
}

const GameHistorySchema = new Schema<IGameHistory>({
  gameSessionId: { type: Schema.Types.ObjectId, ref: 'GameSession', required: true, index: true },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  questionId: { type: Schema.Types.ObjectId, required: true }, 
  selectedOptionId: { type: Schema.Types.ObjectId, required: true }, 
  isCorrect: { type: Boolean, required: true },
  pointsAwarded: { type: Number, required: true, default: 0 },
  timeTakenMs: { type: Number, required: true },
}, {
  timestamps: { createdAt: 'answeredAt', updatedAt: false }, 
});

export const GameHistoryModel = model<IGameHistory>('GameHistory', GameHistorySchema);
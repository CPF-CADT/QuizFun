import { Schema, model, Document, Types,  } from 'mongoose';
import { QuestionSchema } from './Quiz';
import { OptionSchema } from './Quiz';
import { IQuestion } from './Quiz';
import { IQuiz } from './Quiz';
export interface IResponse {
  selectedOptionId: Types.ObjectId;
  timeStamp: Date;
}

export interface historyResponse  {
  _id: Types.ObjectId;
  responses: IResponse[];
}
export interface IGameHistory extends Document {
  gameSessionId: Types.ObjectId; 
  quizId: Types.ObjectId;        
  userId: Types.ObjectId;        
  questionId: Types.ObjectId;   
  selectedOptionId: Types.ObjectId; 
  isCorrect: boolean;
  pointsAwarded: number;
  timeTakenMs: number; 
  questions: historyResponse[];
}

const ResponseSchema = new Schema({
  selectedOptionId: { type: Schema.Types.ObjectId, required: true },
  timeStamp: { type: Date, required: true },
});
const QuestionWithResponsesSchema = new Schema<historyResponse>({
  responses: { type: [ResponseSchema], required: true, default: [] },
});



const GameHistorySchema = new Schema<IGameHistory>({
  gameSessionId: { type: Schema.Types.ObjectId, ref: 'GameSession', required: true, index: true },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  selectedOptionId: { type: Schema.Types.ObjectId, required: true }, 
  isCorrect: { type: Boolean, required: true },
  pointsAwarded: { type: Number, required: true, default: 0 },
  questions: { 
    type: [QuestionWithResponsesSchema] , // cast so TS doesn't complain
    required: true,
    validate: [
      (questions: IQuestion[]) => questions.length > 0, 
      'A quiz must have at least one question.'
    ]
  },
  timeTakenMs: { type: Number, required: true },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: false }, 
  collection: 'gamehistories'
});

export const GameHistoryModel = model<IGameHistory>('GameHistory', GameHistorySchema);
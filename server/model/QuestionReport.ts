// new file: QuestionReport.model.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IQuestionReport extends Document {
  quizId: Types.ObjectId;
  questionId: Types.ObjectId; 
  reporterUserId: Types.ObjectId;
  reason: 'incorrect_answer' | 'unclear_wording' | 'inappropriate_content' | 'other';
  comment?: string;
  status: 'open' | 'resolved' | 'dismissed';
}

const QuestionReportSchema = new Schema<IQuestionReport>({
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  questionId: { type: Schema.Types.ObjectId, required: true },
  reporterUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { 
    type: String, 
    enum: ['incorrect_answer', 'unclear_wording', 'inappropriate_content', 'other'],
    required: true
  },
  comment: { type: String, trim: true, maxLength: 500 },
  status: { type: String, enum: ['open', 'resolved', 'dismissed'], default: 'open', index: true },
}, { timestamps: true, collection: 'questionreports' });

export const QuestionReportModel = model<IQuestionReport>('QuestionReport', QuestionReportSchema);
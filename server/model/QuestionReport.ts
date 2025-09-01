// src/model/QuestionReport.ts

import { Schema, model, Document, Types } from 'mongoose';

export type ReportReason = 'incorrect_answer' | 'unclear_wording' | 'typo' | 'inappropriate_content' | 'other';

export type ReportStatus = 'pending' | 'resolved' | 'dismissed';

export interface IQuestionReport extends Document {
    quizId: Types.ObjectId;
    questionId: Types.ObjectId;
    reporterId?: Types.ObjectId;
    reason: ReportReason;
    comment?: string;
    status: ReportStatus;
}
const QuestionReportSchema = new Schema<IQuestionReport>(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true, 
    },
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, 
      index: true,
    },
    reason: {
      type: String,
      enum: [
        "incorrect_answer",
        "unclear_wording",
        "typo",
        "inappropriate_content",
        "other",
      ],
      required: true,
    },
    comment: { type: String, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "questionreports",
  }
);


QuestionReportSchema.index({ questionId: 1, reporterId: 1 }, { unique: true });

export const QuestionReportModel = model<IQuestionReport>('QuestionReport', QuestionReportSchema);
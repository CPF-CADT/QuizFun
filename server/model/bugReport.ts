import { Schema, model, Document } from 'mongoose';

export interface IBugReport extends Document {
  title: string;
  description: string;
  rating: number;
  createdAt: Date;
}

const bugReportSchema = new Schema<IBugReport>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true }, // 1-5 rating
  createdAt: { type: Date, default: Date.now },
});

export const BugReport = model<IBugReport>('BugReport', bugReportSchema);
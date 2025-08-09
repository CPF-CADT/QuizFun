import { Schema, model, Document, Types } from 'mongoose';

export interface IVerificationCode extends Document {
  userId: Types.ObjectId;
  Code: string;
  expiresAt: Date;
}

const VerificationCodeSchema = new Schema<IVerificationCode>({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  Code: { type: String, required: true },
  expiresAt: { type: Date, required: true, expires: 0 }, 
},{collection:'verificationcodes'});

export const VerificationCodeModel = model<IVerificationCode>('VerificationCode', VerificationCodeSchema);
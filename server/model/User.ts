import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: 'player' | 'admin';
  profileUrl?: string;
  googleId?: string;
  isVerified: boolean; 
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: false, select: false },
  role: { type: String, enum: ['player', 'admin'], default: 'player' },
  profileUrl: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  isVerified: { 
    type: Boolean,
    required: true,
    default: false,
  },
}, { timestamps: true });

export const UserModel = model<IUser>('User', UserSchema);
import { Schema, model, Document, Types } from 'mongoose';

export interface IUserData extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'player' | 'admin';
  profileUrl?: string;
  googleId?: string;
  isVerified: boolean;
}

const UserSchema = new Schema<IUserData>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: false, select: false },
  role: { type: String, enum: ['player', 'admin'], default: 'player' },
  profileUrl: { type: String,required: false },
  googleId: { type: String, unique: true, sparse: true },
  isVerified: { 
    type: Boolean,
    required: true,
    default: false,
  },
}, { timestamps: true,
  collection: 'users' 
 });

//index for role
UserSchema.index({role: 1});

//index for name
UserSchema.index({name: 1});




export const UserModel = model<IUserData>('User', UserSchema);
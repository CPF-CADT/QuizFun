import { Schema, model, Document, Types } from 'mongoose';

export interface ITeamMember {
  userId: Types.ObjectId;
  role: 'owner' | 'member';
  joinedAt: Date;
}

export interface ITeam extends Document {
  name: string;
  description?: string;
  inviteCode: string;
  members: ITeamMember[];
  createdBy: Types.ObjectId;
}

const TeamMemberSchema = new Schema<ITeamMember>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const TeamSchema = new Schema<ITeam>({
  name: { type: String, required: true },
  description: { type: String },
  inviteCode: { type: String, required: true, unique: true, index: true },
  members: { type: [TeamMemberSchema], default: [] },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true, collection: 'teams' });

export const TeamModel = model<ITeam>('Team', TeamSchema);

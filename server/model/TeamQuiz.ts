import { Schema, model, Document, Types } from 'mongoose';

export interface ITeamQuiz extends Document {
  teamId: Types.ObjectId;
  quizId: Types.ObjectId;
  addedBy: Types.ObjectId;
  addedAt: Date;
  sessions: Types.ObjectId[]; 
  mode: 'solo' | 'multiplayer'; 
}

const TeamQuizSchema = new Schema<ITeamQuiz>({
  teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  addedAt: { type: Date, default: Date.now },
  sessions: [{ type: Schema.Types.ObjectId, ref: 'GameSession' }],
  mode: { 
    type: String,
    enum: ['solo', 'multiplayer'], // CORRECTED: Enum values now match the interface.
    default: 'multiplayer',       // CORRECTED: Default value is now valid.
    required: true
  }
}, {
  timestamps: true,
  collection: 'teamquizzes',
});

TeamQuizSchema.index({ teamId: 1, quizId: 1 }, { unique: true });

export const TeamQuizModel = model<ITeamQuiz>('TeamQuiz', TeamQuizSchema);

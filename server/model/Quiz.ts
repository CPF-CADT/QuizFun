import { Schema, model, Document, Types } from 'mongoose';

export interface IOption {
    _id: Types.ObjectId;
    text: string;
    isCorrect: boolean;
}

export interface IQuestion {
    _id: Types.ObjectId;
    questionText: string;
    point: number;
    timeLimit: number;
    options: IOption[];
    imageUrl?: string;
    tags?: string[];
}

export interface IQuiz extends Document {
    title: string;
    description?: string;
    creatorId: Types.ObjectId;
    visibility: 'public' | 'private';
    questions: IQuestion[];
    templateImgUrl?: string;
}

const OptionSchema = new Schema<IOption>({
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
});

const QuestionSchema = new Schema<IQuestion>({
    questionText: { type: String, required: true },
    imageUrl: {type:String,required:false},
    point: { type: Number, required: true, min: 0 },
    timeLimit: { type: Number, required: true, min: 5 },
    options: {
        type: [OptionSchema],
        required: true,
        validate: [(val: IOption[]) => val.length >= 2, 'A question must have at least two options.']
    },
    tags: { type: [String], index: true },
});

const QuizSchema = new Schema<IQuiz>({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    visibility: { type: String, enum: ['public', 'private'], default: 'private' },
    questions: { type: [QuestionSchema], required: true },
    templateImgUrl: { type: String },
}, { timestamps: true });

export const QuizModel = model<IQuiz>('Quiz', QuizSchema);
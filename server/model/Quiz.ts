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
        // Suggestion 2: Add validation to ensure at least one option is marked as correct.
        validate: [
            {
                validator: (options: IOption[]) => options.length >= 2,
                message: 'A question must have at least two options.'
            },
            {
                validator: (options: IOption[]) => options.some(option => option.isCorrect),
                message: 'A question must have at least one correct option.'
            }
        ]
    },
    tags: { type: [String], index: true },
});

const QuizSchema = new Schema<IQuiz>({
    title: { type: String, required: true, trim: true, index: true }, 
    description: { type: String, trim: true },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    visibility: { type: String, enum: ['public', 'private'], default: 'private' },
    questions: { 
        type: [QuestionSchema], 
        required: true,

        validate: [(questions: IQuestion[]) => questions.length > 0, 'A quiz must have at least one question.']
    },
    templateImgUrl: { type: String },
}, { 
    timestamps: true,

    collection: 'quizzes' 
});

export const QuizModel = model<IQuiz>('Quiz', QuizSchema);
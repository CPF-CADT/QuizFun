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
     status?: 'active' | 'under_review' | 'disabled';
}

export interface IQuiz extends Document {
    title: string;
    description?: string;
    creatorId: Types.ObjectId;
    visibility: 'public' | 'private';
    questions: IQuestion[];
    templateImgUrl?: string;
    tags?:string[],
    forkBy?: Types.ObjectId,
    dificulty:'Hard' | 'Medium' | 'Easy';
    createdAt: Date;
    updatedAt: Date;
}


export const OptionSchema = new Schema<IOption>({
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },

});

export const QuestionSchema = new Schema<IQuestion>({
    questionText: { type: String, required: true },
    imageUrl: {type:String,required:false},
    point: { type: Number, required: true, min: 1,max:10 },
    timeLimit: { type: Number, required: true, min: 5 },
    options: {
        type: [OptionSchema],
        required: true,
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
    status: { 
        type: String,
        enum: ['active', 'under_review', 'disabled'],
        default: 'active'
    }
});

const QuizSchema = new Schema<IQuiz>({
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, trim: true },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    visibility: { type: String, enum: ['public', 'private'], default: 'private' },
    questions: { type: [QuestionSchema] },
    templateImgUrl: { type: String },
    tags: { type: [String], index: true },
    forkBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        index: true,
        validate: {
            validator: function (value: Types.ObjectId) {
                if (!value) return true; 
                return !this.creatorId.equals(value); 
            },
            message: "forkBy cannot be the same as creatorId"
        }
    },
    dificulty:{type: String,enum:['Hard','Medium','Easy'],default:'Medium'}
}, {
    timestamps: true,
    collection: 'quizzes'
});


export const QuizModel = model<IQuiz>('Quiz', QuizSchema);
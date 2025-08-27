export interface IOption {
  _id?: string;
  text: string;
  isCorrect: boolean;
}

export interface IQuestion {
  _id?: string;
  questionText: string;
  point: number;
  timeLimit: number;
  options: IOption[];
  imageUrl?: string; // <-- ADD THIS LINE
  tags?: string[];
}

export interface IQuiz {
  _id: string;
  title: string;
  description?: string;
  creatorId: string;
  visibility: 'public' | 'private';
  dificulty: 'Easy' | 'Medium' | 'Hard';
  templateImgUrl?: string;
  questions?: IQuestion[];
  tags?: string | string[];
  createdAt: string;
  updatedAt: string;
}

// Type for creating a new quiz
export interface IQuizCreate {
  title: string;
  description?: string;
  dificulty: 'Easy' | 'Medium' | 'Hard';
  visibility: 'public' | 'private';
}

export interface IQuizTemplate {
    id: number;
    name: string;
    preview: string;
    background: string;
    gradient: string;
    sidebarGradient: string;
}

export type Dificulty = 'Hard' | 'Medium' | 'Easy';
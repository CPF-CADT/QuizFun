// src/types/quiz.ts

export interface IOption {
  _id?: string;
  text: string;
  isCorrect: boolean;
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
  tags?: string[];
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
// src/types/quiz.ts

export interface IQuizTemplate {
    id: number;
    name: string;
    preview: string;
    background: string;
    gradient: string;
    sidebarGradient: string;
}
// src/types/quiz.ts

export interface IOption {
  _id?: string;
  text: string;
  isCorrect: boolean;
}

export interface IQuestion {
  _id?: string;
  questionText: string;
  point: number; // Must be required
  timeLimit: number; // Must be required
  options: IOption[];
  imageUrl?: string;
  tags?: string[];
}

export type Dificulty = 'Hard' | 'Medium' | 'Easy';

export interface IQuiz {
  _id: string;
  title: string;
  description?: string;
  creatorId: string;
  visibility: 'public' | 'private';
  dificulty: Dificulty;
  templateImgUrl?: string;
  questions?: IQuestion[]; // Optional, as it might not be present in all API calls
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Add any other shared types here
export interface IQuizTemplate {
  id: number;
  name: string;
  preview: string;
  background: string;
  sidebarGradient: string;
}
// src/types/index.ts

export interface QuizStats {
  totalQuizzes: number;
  totalStudents: number;
  completedQuizzes: number;
  averageScore: number;
}

export interface RecentQuiz {
  id: string;
  title: string;
  students: number;
  lastActivity: string;
  status: 'active' | 'draft' | 'completed';
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  progress: number;
  color: string;
}

export interface RecentActivity {
  id: string;
  type: 'quiz_completed' | 'quiz_created' | 'student_joined';
  message: string;
  timestamp: string;
  score?: number;
  user: string;
}

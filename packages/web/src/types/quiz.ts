export interface QuizQuestion {
  id: string;
  type: 'description' | 'image' | 'ost' | 'genre';
  question: string;
  correctAnswer: number; // anime ID
  options: {
    id: number;
    name: string;
    russian: string;
    image?: {
      preview: string;
    };
  }[];
}

export interface QuizState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  score: number;
  totalQuestions: number;
  isFinished: boolean;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
} 
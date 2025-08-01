import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Типы для валидации аргументов и возвращаемых значений

// Аргументы для генерации OST квиза
export const generateOstQuizArgs = {
    questionCount: v.number(),
    difficulty: v.optional(v.union(
        v.literal("easy"),
        v.literal("medium"),
        v.literal("hard")
    )),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
};

// Возвращаемое значение для генерации OST квиза
export const generateOstQuizReturns = v.object({
  quizId: v.id("ostQuizzes"),
  title: v.string(),
  questionCount: v.number(),
  questions: v.array(v.object({
    id: v.id("ostQuestions"),
    ostUrl: v.string(),
    ostType: v.union(
      v.literal("OP"),
      v.literal("ED"),
      v.literal("TRAILER"),
      v.literal("UNRECOGNIZED")
    ),
    correctAnswer: v.number(),
    options: v.array(v.object({
      id: v.number(),
      name: v.string(),
      russian: v.string(),
    })),
    order: v.number(),
    animeId: v.number(),
    usageCount: v.number(),
  })),
});

// Аргументы для получения OST квиза
export const getOstQuizArgs = {
    quizId: v.id("ostQuizzes"),
};

// Возвращаемое значение для получения OST квиза
export const getOstQuizReturns = v.union(
  v.object({
    quiz: v.object({
      _id: v.id("ostQuizzes"),
      _creationTime: v.number(),
      title: v.string(),
      description: v.optional(v.string()),
      questionCount: v.number(),
      difficulty: v.optional(v.string()),
      isPublic: v.boolean(),
      createdBy: v.optional(v.string()),
      tags: v.array(v.string()),
      metadata: v.optional(v.any()),
    }),
    questions: v.array(v.object({
      _id: v.id("ostQuestions"),
      _creationTime: v.number(),
      ostUrl: v.string(),
      ostType: v.union(
        v.literal("OP"),
        v.literal("ED"),
        v.literal("TRAILER"),
        v.literal("UNRECOGNIZED")
      ),
      correctAnswer: v.number(),
      options: v.array(v.object({
        id: v.number(),
        name: v.string(),
        russian: v.string(),
      })),
      metadata: v.optional(v.any()),
      order: v.number(),
      animeId: v.number(),
      usageCount: v.number(),
    })),
  }),
  v.null()
);

// Аргументы для получения случайного OST квиза
export const getRandomOstQuizArgs = {
  difficulty: v.optional(v.union(
    v.literal("easy"),
    v.literal("medium"),
    v.literal("hard")
  )),
};

// Аргументы для создания отдельного вопроса
export const createOstQuestionArgs = {
  ostUrl: v.string(),
  ostType: v.union(
    v.literal("OP"),
    v.literal("ED"),
    v.literal("TRAILER"),
    v.literal("UNRECOGNIZED")
  ),
  correctAnswer: v.number(),
  options: v.array(v.object({
    id: v.number(),
    name: v.string(),
    russian: v.string(),
  })),
  animeId: v.number(),
  worldArtId: v.optional(v.number()),
  metadata: v.optional(v.any()),
};

// Аргументы для поиска существующих вопросов
export const findExistingQuestionsArgs = {
  animeId: v.optional(v.number()),
  ostType: v.optional(v.union(
    v.literal("OP"),
    v.literal("ED"),
    v.literal("TRAILER"),
    v.literal("UNRECOGNIZED")
  )),
  limit: v.optional(v.number()),
};

// Типы для TypeScript (не для валидации)

export interface OstQuizQuestion {
  id: string;
  ostUrl: string;
  ostType: 'OP' | 'ED' | 'TRAILER' | 'UNRECOGNIZED';
  options: Array<{
    id: number;
    name: string;
    russian: string;
  }>;
  correctAnswer: number;
  animeId: number;
  usageCount?: number;
}

export interface OstQuiz {
    id: Id<"ostQuizzes">;
    title: string;
    description?: string;
    questionCount: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    isPublic: boolean;
    createdBy?: string;
    tags: string[];
    metadata?: any;
    questions: OstQuizQuestion[];
}

export interface GenerateOstQuizOptions {
    questionCount: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    title?: string;
    description?: string;
    tags?: string[];
}

export interface OstQuizResults {
    score: number;
    totalQuestions: number;
    questions: OstQuizQuestion[];
    guessTimes: Array<{
        questionIndex: number;
        timeLeft: number | null;
        isCorrect: boolean;
    }>;
} 
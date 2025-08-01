import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Типы для валидации аргументов и возвращаемых значений

// Аргументы для генерации квиза
export const generateQuizArgs = {
    questionCount: v.number(),
    difficulty: v.optional(v.union(
        v.literal("easy"),
        v.literal("medium"),
        v.literal("hard")
    )),
    category: v.optional(v.union(
        v.literal("anime"),
        v.literal("ost"),
        v.literal("mixed")
    )),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
};

// Возвращаемое значение для генерации квиза
export const generateQuizReturns = v.object({
    quizId: v.id("quizzes"),
    title: v.string(),
    questionCount: v.number(),
    questions: v.array(v.object({
        id: v.id("questions"),
        questionText: v.string(),
        questionType: v.union(
            v.literal("description"),
            v.literal("image"),
            v.literal("genre"),
            v.literal("ost")
        ),
        correctAnswer: v.number(),
        options: v.array(v.object({
            id: v.number(),
            name: v.string(),
            russian: v.string(),
            image: v.optional(v.object({
                preview: v.string(),
                original: v.string(),
            })),
        })),
        order: v.number(),
    })),
});

// Аргументы для получения квиза
export const getQuizArgs = {
    quizId: v.id("quizzes"),
};

// Возвращаемое значение для получения квиза
export const getQuizReturns = v.union(
    v.object({
        quiz: v.object({
            _id: v.id("quizzes"),
            _creationTime: v.number(),
            title: v.string(),
            description: v.optional(v.string()),
            questionCount: v.number(),
            difficulty: v.optional(v.string()),
            category: v.optional(v.string()),
            isPublic: v.boolean(),
            createdBy: v.optional(v.string()),
            tags: v.array(v.string()),
            metadata: v.optional(v.any()),
        }),
        questions: v.array(v.object({
            _id: v.id("questions"),
            _creationTime: v.number(),
            quizId: v.id("quizzes"),
            questionText: v.string(),
            questionType: v.union(
                v.literal("description"),
                v.literal("image"),
                v.literal("genre"),
                v.literal("ost")
            ),
            correctAnswer: v.number(),
            options: v.array(v.object({
                id: v.number(),
                name: v.string(),
                russian: v.string(),
                image: v.optional(v.object({
                    preview: v.string(),
                    original: v.string(),
                })),
            })),
            metadata: v.optional(v.any()),
            order: v.number(),
        })),
    }),
    v.null()
);

// Аргументы для получения случайного квиза
export const getRandomQuizArgs = {
    category: v.optional(v.union(
        v.literal("anime"),
        v.literal("ost"),
        v.literal("mixed")
    )),
    difficulty: v.optional(v.union(
        v.literal("easy"),
        v.literal("medium"),
        v.literal("hard")
    )),
};

// Типы для TypeScript (не для валидации)

export interface QuizQuestion {
    id: string;
    type: 'description' | 'image' | 'ost' | 'genre';
    question: string;
    correctAnswer: number;
    options: {
        id: number;
        name: string;
        russian: string;
        image?: {
            preview: string;
            original: string;
        };
    }[];
}

export interface Quiz {
    id: Id<"ostQuizzes">;
    title: string;
    description?: string;
    questionCount: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    category?: 'anime' | 'ost' | 'mixed';
    isPublic: boolean;
    createdBy?: string;
    tags: string[];
    metadata?: any;
    questions: QuizQuestion[];
}

export interface GenerateQuizOptions {
    questionCount: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    category?: 'anime' | 'ost' | 'mixed';
    title?: string;
    description?: string;
    tags?: string[];
} 
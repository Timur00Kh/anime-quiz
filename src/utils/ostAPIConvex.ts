import { getConvexApi } from "./convex";
import { OstType } from "@/lib/world-art-parser/types";
import { api } from "../../convex/_generated/api";

export interface OstQuizQuestion {
    id: string;
    ostUrl: string;
    ostType: OstType;
    options: Array<{
        id: number;
        name: string;
        russian: string;
    }>;
    correctAnswer: number;
    animeId: number;
    usageCount?: number;
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

export interface GenerateOstQuizOptions {
    questionCount: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    title?: string;
    description?: string;
    tags?: string[];
}

// Генерация OST квиза через Convex
export async function generateOstQuizConvex(
    options: GenerateOstQuizOptions,
    onProgress?: (progress: number) => void
): Promise<OstQuizQuestion[]> {
    try {
        onProgress?.(10);

        onProgress?.(30);

        // Вызываем Convex action для генерации квиза
        const { convex } = await import("./convex");
        const result = await convex.action(api.ostQuiz.generateOstQuiz, {
            questionCount: options.questionCount,
            difficulty: options.difficulty,
            title: options.title,
            description: options.description,
            tags: options.tags || [],
        });

        onProgress?.(90);

        // Преобразуем результат в нужный формат
        const questions: OstQuizQuestion[] = result.questions.map((q: any) => ({
            id: q.id,
            ostUrl: q.ostUrl,
            ostType: q.ostType,
            options: q.options,
            correctAnswer: q.correctAnswer,
            animeId: q.animeId,
            usageCount: q.usageCount,
        }));

        onProgress?.(100);
        return questions;

    } catch (error) {
        console.error("Error generating OST quiz via Convex:", error);
        throw error;
    }
}

// Получение существующего квиза по ID
export async function getOstQuizConvex(quizId: string): Promise<OstQuizQuestion[]> {
    try {
        const { convex } = await import("./convex");
        const result = await convex.query(api.ostQuiz.getOstQuiz, {
            quizId: quizId as any // TODO: fix type
        });

        if (!result) {
            throw new Error("Quiz not found");
        }

        return result.questions.map((q: any) => ({
            id: q._id,
            ostUrl: q.ostUrl,
            ostType: q.ostType,
            options: q.options,
            correctAnswer: q.correctAnswer,
            animeId: q.animeId,
            usageCount: q.usageCount,
        }));

    } catch (error) {
        console.error("Error getting OST quiz via Convex:", error);
        throw error;
    }
}

// Получение случайного квиза
export async function getRandomOstQuizConvex(
    difficulty?: 'easy' | 'medium' | 'hard'
): Promise<OstQuizQuestion[]> {
    try {
        const { convex } = await import("./convex");
        const result = await convex.query(api.ostQuiz.getRandomOstQuiz, { difficulty });

        if (!result) {
            throw new Error("No quizzes available");
        }

        return result.questions.map((q: any) => ({
            id: q._id,
            ostUrl: q.ostUrl,
            ostType: q.ostType,
            options: q.options,
            correctAnswer: q.correctAnswer,
            animeId: q.animeId,
            usageCount: q.usageCount,
        }));

    } catch (error) {
        console.error("Error getting random OST quiz via Convex:", error);
        throw error;
    }
}

// Поиск существующих вопросов
export async function findExistingQuestionsConvex(
    animeId?: number,
    ostType?: OstType,
    limit?: number
): Promise<OstQuizQuestion[]> {
    try {
        const { convex } = await import("./convex");
        const questions = await convex.query(api.ostQuiz.findExistingQuestions, {
            animeId,
            ostType,
            limit,
        });

        return questions.map((q: any) => ({
            id: q._id,
            ostUrl: q.ostUrl,
            ostType: q.ostType,
            options: q.options,
            correctAnswer: q.correctAnswer,
            animeId: q.animeId,
            usageCount: q.usageCount,
        }));

    } catch (error) {
        console.error("Error finding existing questions via Convex:", error);
        throw error;
    }
}

// Сохранение результатов квиза
export async function saveOstQuizResults(
    quizId: string,
    results: OstQuizResults,
    userId?: string,
    telegramData?: {
        chatId: number;
        messageId: number;
    }
): Promise<void> {
    try {
        const { convex } = await import("./convex");
        await convex.mutation(api.ostQuiz.saveQuizResults, {
            quizId: quizId as any,
            userId,
            score: results.score,
            totalQuestions: results.totalQuestions,
            completedAt: Date.now(),
            guessTimes: results.guessTimes.map(gt => ({
                ...gt,
                timeLeft: gt.timeLeft === null ? undefined : gt.timeLeft,
            })),
            telegramData,
        });

    } catch (error) {
        console.error("Error saving quiz results via Convex:", error);
        throw error;
    }
} 
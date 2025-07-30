import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Кеш результатов парсинга World-Art
  waOstParseLog: defineTable({
    worldartAnimeId: v.number(),
    shikimoriId: v.optional(v.number()),
    parserVersion: v.string(),
    parsedAt: v.number(),
    osts: v.array(v.object({
      id: v.number(),
      unparsed_type: v.string(),
      type: v.union(
        v.literal("OP"),
        v.literal("ED"),
        v.literal("TRAILER"),
        v.literal("UNRECOGNIZED")
      ),
      href: v.string(),
      video: v.string(),
      title: v.string(),
      authors: v.array(v.object({
        id: v.number(),
        name: v.string(),
        href: v.string(),
        role: v.string(),
      })),
      ost_order: v.number(),
      waOstParseLogVideoId: v.id("waOstParseLogVideo"),
    })),
    raw: v.optional(v.any()),
  })
    .index("by_worldart_id", ["worldartAnimeId"])
    .index("by_parsed_at", ["parsedAt"]),

  waOstParseLogVideo: defineTable({
    ostId: v.number(),
    storageId: v.optional(v.id("_storage")),
    videoSourceUrl: v.string(),
    downloadStatus: v.optional(v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed")
    )),
    downloadError: v.optional(v.string()),
  })
    .index("by_ost_id", ["ostId"])
    .index("by_video_source_url", ["videoSourceUrl"])
    .index("by_download_status", ["downloadStatus"]),

  // OST Квизы
  ostQuizzes: defineTable({
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    questionCount: v.number(),
    isPublic: v.boolean(),
    createdBy: v.optional(v.string()), // userId
    tags: v.array(v.string()),
    status: v.optional(v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"))),
    metadata: v.optional(v.any()),
    createdAt: v.optional(v.number()),
  })
    .index("by_public", ["isPublic"]),

  // Вопросы OST квиза (отдельные сущности)
  ostQuestions: defineTable({
    ostUrl: v.string(), // URL к OST файлу
    ostType: v.union(
      v.literal("OP"),
      v.literal("ED"),
      v.literal("TRAILER"),
      v.literal("UNRECOGNIZED")
    ),
    correctAnswer: v.number(), // anime ID
    options: v.array(v.object({
      id: v.number(), // anime ID
      name: v.string(),
      russian: v.string(),
    })),
    metadata: v.optional(v.any()), // Дополнительные данные вопроса
    animeId: v.number(), // ID аниме, к которому относится вопрос
    worldArtId: v.optional(v.number()), // ID в World-Art
    isPublic: v.boolean(), // Публичный ли вопрос
    usageCount: v.number(), // Сколько раз использовался в квизах
  })
    .index("by_anime_id", ["animeId"])
    .index("by_ost_type", ["ostType"])
    .index("by_public", ["isPublic"])
    .index("by_usage_count", ["usageCount"]),

  // Связь между квизами и вопросами
  ostQuizQuestions: defineTable({
    quizId: v.id("ostQuizzes"),
    questionId: v.id("ostQuestions"),
    order: v.number(), // Порядок вопроса в квизе
  })
    .index("by_quiz_id", ["quizId"])
    .index("by_quiz_and_order", ["quizId", "order"])
    .index("by_question_id", ["questionId"]),

  // Результаты OST квизов (опционально, для статистики)
  ostQuizResults: defineTable({
    quizId: v.id("ostQuizzes"),
    userId: v.optional(v.string()),
    score: v.number(),
    totalQuestions: v.number(),
    completedAt: v.number(),
    guessTimes: v.array(v.object({
      questionIndex: v.number(),
      timeLeft: v.optional(v.number()),
      isCorrect: v.boolean(),
    })),
    telegramData: v.optional(v.object({
      chatId: v.number(),
      messageId: v.number(),
    })),
  })
    .index("by_user", ["userId"])
    .index("by_quiz", ["quizId"])
    .index("by_completed_at", ["completedAt"]),
});

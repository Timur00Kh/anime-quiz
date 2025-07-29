import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Кеш результатов парсинга World-Art
  waParseLog: defineTable({
    worldartAnimeId: v.number(),
    shikimoriId: v.optional(v.number()),
    parserVersion: v.string(),
    parsedAt: v.number(),
    osts: v.array(v.object({
      id: v.number(),
      unparsed_type: v.string(),
      type: v.string(), // "OP" | "ED" | "TRAILER" | "UNRECOGNIZED"
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
      storagePath: v.optional(v.string()),
      downloadError: v.optional(v.string()),
    })),
    raw: v.optional(v.any()),
  })
  .index("by_worldart_id", ["worldartAnimeId"])
  .index("by_parsed_at", ["parsedAt"]),

  // Результаты квизов (опционально, для статистики)
  quizResults: defineTable({
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
  .index("by_completed_at", ["completedAt"]),
});

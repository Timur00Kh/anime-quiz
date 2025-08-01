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

  animeIds: defineTable({
    publicId: v.string(),
    worldArtId: v.optional(v.number()),
    shikimoriId: v.optional(v.number()),
    malId: v.optional(v.number()),
  })
    .index("by_worldart_id", ["worldArtId"])
    .index("by_shikimori_id", ["shikimoriId"])
    .index("by_mal_id", ["malId"])
    .index("by_public_id", ["publicId"]),

  shikimoriAnimeParseStatus: defineTable({
    shikimoriId: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("not_found")
    ),
    error: v.optional(v.string()),
    retryCount: v.number(),
    lastRetryAt: v.optional(v.number()),
    parsedAt: v.optional(v.number()),
  })
    .index("by_shikimoriId", ["shikimoriId"]),

  shikimoriAnimeParsedData: defineTable({
    id: v.number(),
    // Основная информация
    name: v.string(), // Название аниме
    russian: v.optional(v.string()), // Русское название
    english: v.optional(v.array(v.string())), // Английские названия
    japanese: v.optional(v.array(v.string())), // Японские названия
    synonyms: v.optional(v.array(v.string())), // Синонимы

    // Изображения
    image: v.optional(v.object({
      original: v.string(),
      preview: v.string(),
      x96: v.string(),
      x48: v.string(),
    })),

    // Метаданные
    kind: v.optional(v.string()), // Тип аниме (TV, Movie, OVA, etc.)
    score: v.optional(v.string()), // Оценка
    status: v.optional(v.string()), // Статус (released, ongoing, etc.)
    rating: v.optional(v.string()), // Рейтинг
    episodes: v.optional(v.number()), // Количество эпизодов
    episodesAired: v.optional(v.number()), // Количество вышедших эпизодов
    duration: v.optional(v.number()), // Длительность эпизода в минутах

    // Даты
    airedOn: v.optional(v.string()), // Дата начала показа
    releasedOn: v.optional(v.string()), // Дата окончания показа

    // Описание
    description: v.optional(v.string()), // Описание аниме
    descriptionHtml: v.optional(v.string()), // HTML описание
    descriptionSource: v.optional(v.string()), // Источник описания

    // Жанры
    genres: v.optional(v.array(v.object({
      id: v.number(),
      name: v.optional(v.string()),
      russian: v.optional(v.string()),
    }))),

    // Студии
    studios: v.optional(v.array(v.record(v.string(), v.any()))),

    // Внешние ссылки
    url: v.optional(v.string()), // URL на Shikimori
    franchise: v.optional(v.string()), // Франшиза

    // Дополнительные данные
    licenseNameRu: v.optional(v.string()), // Лицензиар в России
    favoured: v.optional(v.boolean()), // В избранном
    anons: v.optional(v.boolean()), // Анонс
    ongoing: v.optional(v.boolean()), // Онгойнг

    // Временные метки
    createdAt: v.number(), // Время создания записи
    updatedAt: v.number(), // Время последнего обновления
    parsedAt: v.optional(v.number()), // Время парсинга с Shikimori

    // Сырые данные
    rawData: v.optional(v.any()), // Сырые данные с API
  })
    .index("by_shikimoriId", ["id"])
    .index("by_name", ["name"])
    .index("by_russian", ["russian"])
    .index("by_kind", ["kind"])
    .index("by_status", ["status"])
    .index("by_score", ["score"])
    .index("by_created_at", ["createdAt"])
    .index("by_updated_at", ["updatedAt"])
    .index("by_parsed_at", ["parsedAt"]),
});

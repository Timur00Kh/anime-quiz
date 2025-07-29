import { action, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

// Convex actions для работы с парсером
export const parseWorldArt = action({
  args: { waId: v.number() },
  handler: async (ctx, { waId }): Promise<any[]> => {
    // Проверяем кеш в базе данных
    const existing: Doc<"waParseLog"> | null = await ctx.runQuery(api.worldArt.getExistingParseResults, { waId });
    if (existing) {
      // Возвращаем кешированные результаты
      return existing.osts.map((ost: any) => ({
        ...ost,
        videoUrl: ost.video.startsWith('http') ? ost.video : `http://www.world-art.ru${ost.video}`
      }));
    }

    // TODO: Интегрировать парсер после решения проблем с зависимостями
    throw new Error("Parser integration not yet complete. Use API endpoint for now.");
  },
});

export const getExistingParseResults = query({
  args: { waId: v.number() },
  handler: async (ctx, { waId }): Promise<Doc<"waParseLog"> | null> => {
    const result = await ctx.db
      .query("waParseLog")
      .withIndex("by_worldart_id", (q) => q.eq("worldartAnimeId", waId))
      .order("desc")
      .first();

    return result;
  },
});

export const saveParseResults = mutation({
  args: {
    waId: v.number(),
    shikimoriId: v.optional(v.number()),
    osts: v.array(v.any()),
    parserVersion: v.string(),
    parsedAt: v.number(),
    raw: v.optional(v.any()),
  },
  handler: async (ctx, { waId, shikimoriId, osts, parserVersion, parsedAt, raw }) => {
    const parseLog = {
      worldartAnimeId: waId,
      shikimoriId,
      parserVersion,
      parsedAt,
      osts,
      raw,
    };

    return await ctx.db.insert("waParseLog", parseLog);
  },
});

// Utility action для тестирования
export const healthCheck = action({
  args: {},
  handler: async (ctx) => {
    return {
      status: "ok",
      timestamp: Date.now(),
      message: "Convex is working"
    };
  },
});

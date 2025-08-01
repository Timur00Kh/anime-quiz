import { action, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";
import { WithoutSystemFields } from "convex/server";

export const getShikimoriAnimeData = query({
    args: {
        shikimoriId: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        if (!args.shikimoriId) {
            return null;
        }

        const status = await ctx.db
            .query("shikimoriAnimeParseStatus")
            .withIndex("by_shikimoriId", (q) => q.eq("shikimoriId", args.shikimoriId!))
            .unique();

        if (!status) {
            return null;
        }

        const anime = await ctx.db
            .query("shikimoriAnimeParsedData")
            .withIndex("by_shikimoriId", (q) => q.eq("id", args.shikimoriId!))
            .unique();

        return {
            status,
            anime,
        };
    },
});

export const parseShikimoriAnimeData = action({
    args: {
        shikimoriId: v.number(),
    },
    handler: async (ctx, args) => {
        // Проверяем есть ли уже данные
        const existingData = await ctx.runQuery(api.shikiApi.getShikimoriAnimeData, {
            shikimoriId: args.shikimoriId,
        });


        if (["completed", "not_found", "pending"].includes(existingData?.status.status)) {
            return existingData;
        }


        if (existingData && existingData?.status.status === "failed") {
            return existingData;
        }

        // Сохраняем статус
        await ctx.runMutation(api.shikiApi.updateParseStatus, {
            shikimoriId: args.shikimoriId,
            status: "pending",
        });

        // Парсим с Shikimori
        const response = await fetch(`http://localhost:3100/anime/${args.shikimoriId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                await ctx.runMutation(api.shikiApi.updateParseStatus, {
                    shikimoriId: args.shikimoriId,
                    status: "not_found",
                });
            } else {
                const a = await ctx.runMutation(api.shikiApi.updateParseStatus, {
                    shikimoriId: args.shikimoriId,
                    status: "failed",
                });
            }
            throw new Error(`Failed to fetch anime data: ${response.status}`);
        }

        const animeData = await response.json();

        // Сохраняем статус
        await ctx.runMutation(api.shikiApi.updateParseStatus, {
            shikimoriId: args.shikimoriId,
            status: "completed",
        });

        // Сохраняем данные аниме
        await ctx.runMutation(api.shikiApi.saveAnimeData, {
            shikimoriId: args.shikimoriId,
            animeData,
        });

        return {
            status: { shikimoriId: args.shikimoriId, status: "completed" },
            anime: animeData,
        };
    },
});

export const updateParseStatus = mutation({
    args: {
        shikimoriId: v.number(),
        status: v.union(
            v.literal("pending"),
            v.literal("completed"),
            v.literal("failed"),
            v.literal("not_found")
        ),
    },
    handler: async (ctx, args) => {
        const existingStatus = await ctx.db
            .query("shikimoriAnimeParseStatus")
            .withIndex("by_shikimoriId", (q) => q.eq("shikimoriId", args.shikimoriId))
            .unique();

        if (existingStatus) {
            await ctx.db.patch(existingStatus._id, {
                status: args.status,
                parsedAt: Date.now(),
            });
        } else {
            await ctx.db.insert("shikimoriAnimeParseStatus", {
                shikimoriId: args.shikimoriId,
                status: args.status,
                retryCount: 0,
                parsedAt: Date.now(),
            });
        }
    },
});

export const saveAnimeData = mutation({
    args: {
        shikimoriId: v.number(),
        animeData: v.any(),
    },
    handler: async (ctx, args) => {
        const data = args.animeData;
        const mappedData = {
            id: args.shikimoriId,
            name: data.name || "",
            russian: data.russian || undefined,
            english: data.english || undefined,
            japanese: data.japanese || undefined,
            synonyms: data.synonyms || undefined,
            image: data.image || undefined,
            kind: data.kind || undefined,
            score: data.score || undefined,
            status: data.status || undefined,
            rating: data.rating || undefined,
            episodes: data.episodes || undefined,
            episodesAired: data.episodes_aired || undefined,
            duration: data.duration || undefined,
            airedOn: data.aired_on || undefined,
            releasedOn: data.released_on || undefined,
            description: data.description || undefined,
            descriptionHtml: data.description_html || undefined,
            descriptionSource: data.description_source || undefined,
            genres: data.genres || undefined,
            studios: data.studios || undefined,
            url: data.url || undefined,
            franchise: data.franchise || undefined,
            licenseNameRu: data.license_name_ru || undefined,
            favoured: data.favoured || undefined,
            anons: data.anons || undefined,
            ongoing: data.ongoing || undefined,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            parsedAt: Date.now(),
            rawData: data,
        } satisfies WithoutSystemFields<Doc<"shikimoriAnimeParsedData">>;
        await ctx.db.insert("shikimoriAnimeParsedData", mappedData);
    },
});
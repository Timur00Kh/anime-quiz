import {
  action,
  query,
  mutation,
  internalAction,
  internalMutation,
} from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

import { WorldArtParser } from "world-art-parser";


export const getAnimeOst = query({
  args: { waId: v.optional(v.number()) },
  handler: async (ctx, { waId }) => {
    if (!waId) {
      return null;
    }

    const existing = await ctx.db
      .query("waOstParseLog")
      .withIndex("by_worldart_id", (q) => q.eq("worldartAnimeId", waId))
      .order("desc")
      .first();

    return existing?.osts || [];
  },
});

// Convex actions для работы с парсером
export const parseOstsFromWorldArt = action({
  args: { waId: v.number(), shikimoriId: v.optional(v.number()) },
  handler: async (ctx, { waId, shikimoriId }) => {
    try {
      const existing = await ctx.runQuery(api.worldArt.getAnimeOst, { waId });
      if (existing?.length) {
        return;
      }

      // Создаем экземпляр парсера
      const parser = new WorldArtParser({
        enableCache: true,
        requestTimeout: 10000,
      });

      // Парсим аниме
      const result = await parser.parseAnime(waId);

      // save videos to convex storage
      await ctx.runMutation(api.worldArt.saveParseResults, {
        waId,
        shikimoriId,
        osts: result.osts,
        parserVersion: result.parserVersion,
        parsedAt: result.parsedAt,
        raw: result.rawData,
      });

    } catch (error: any) {
      console.error("Error parsing World-Art:", error);
      throw new Error(`Failed to parse anime ${waId}: ${error.message}`);
    }
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

    for (const ost of osts) {
      const videoSourceUrl = ost.video.startsWith('http') ?
        ost.video : `http://www.world-art.ru${ost.video}`;

      // check if video already exists and is not failed
      const existingVideo = await ctx.db
        .query("waOstParseLogVideo")
        .withIndex("by_video_source_url", (q) => q.eq("videoSourceUrl", videoSourceUrl))
        .order("desc")
        .first();
      if (
        existingVideo
        && existingVideo.downloadStatus !== "failed"
      ) {
        ost.waOstParseLogVideoId = existingVideo._id;
        continue;
      }

      const videoId = await ctx.db.insert("waOstParseLogVideo", {
        ostId: ost.id,
        videoSourceUrl,
        downloadStatus: "pending",
      });
      ost.waOstParseLogVideoId = videoId;
      await ctx.scheduler.runAfter(0, internal.worldArt.handleWaOstParseLogVideo, {
        videoSourceUrl,
        videoId,
      });
    }

    return await ctx.db.insert("waOstParseLog", parseLog);
  },
});

// function that download video to convex storage via uploadUrl
export const handleWaOstParseLogVideo = internalAction({
  args: {
    videoSourceUrl: v.string(),
    videoId: v.id("waOstParseLogVideo"),
  },
  handler: async (ctx, { videoSourceUrl, videoId }) => {
    try {
      // Download the video from the external URL
      const response = await fetch(videoSourceUrl);
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.status} ${response.statusText} \n videoId: ${videoId} \n videoSourceUrl: ${videoSourceUrl}`);
      }
      // Get the video content as blob
      const videoBlob = await response.blob();

      const storageId: Id<"_storage"> = await ctx.storage.store(videoBlob);

      await ctx.runMutation(internal.worldArt.updateVideoStorage, {
        videoId,
        storageId,
      });
    } catch (error) {
      await ctx.runMutation(internal.worldArt.updateVideoStorageWithError, {
        videoId,
        downloadError: error instanceof Error ? error.message : 'Unknown error',
      });

      console.error("Error downloading video to storage:", error);
      throw new Error(`Failed to download and store video: ${error instanceof Error ? error.message : 'Unknown error'
        }`);
    }
  },
});

export const updateVideoStorage = internalMutation({
  args: {
    videoId: v.id("waOstParseLogVideo"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { videoId, storageId }) => {
    await ctx.db.patch(videoId, {
      storageId,
      downloadStatus: "completed",
    });
  },
});

export const updateVideoStorageWithError = internalMutation({
  args: {
    videoId: v.id("waOstParseLogVideo"),
    downloadError: v.optional(v.string()),
  },
  handler: async (ctx, { videoId, downloadError }) => {
    await ctx.db.patch(videoId, {
      downloadStatus: "failed",
      downloadError,
    });
  },
});

export const getWaOstParseLogVideo = query({
  args: { videoId: v.id("waOstParseLogVideo") },
  handler: async (ctx, { videoId }) => {
    const video = await ctx.db.get(videoId);
    return {
      ...video,
      videoUrl: video?.storageId ? await ctx.storage.getUrl(video.storageId) : null,
    };
  },
});
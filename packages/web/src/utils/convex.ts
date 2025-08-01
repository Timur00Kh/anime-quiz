import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "https://placeholder.convex.cloud");

export { convex };

// Функция для получения API (будет создана после успешной настройки Convex)
export const getConvexApi = async () => {
  try {
    const { api } = await import("@@convex/_generated/api");
    return api;
  } catch (error) {
    console.warn("Convex API not yet available:", error);
    return null;
  }
};

// Re-export types из независимого парсера
export type { OST, Author } from "world-art-parser";
export { OstType } from "world-art-parser";

// Утилиты для работы с парсером на клиенте
export const ParserUtils = {
  validateOst: (ost: any): boolean => {
    return !!(ost?.id && ost?.title && ost?.type);
  },

  filterOstsByType: (osts: any[], types: string[]) => {
    return osts.filter(ost => types.includes(ost.type));
  },

  getOstVideoUrl: (ost: any): string | null => {
    return ost.videoUrl || (ost.video ? `http://www.world-art.ru${ost.video}` : null);
  }
};

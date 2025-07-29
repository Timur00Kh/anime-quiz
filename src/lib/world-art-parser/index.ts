// Главный экспорт модуля
export { WorldArtParser, WorldArtUtils } from './parser';
export { ParseCache } from './cache';
export { getConfig, DEFAULT_CONFIG, DEVELOPMENT_CONFIG, PRODUCTION_CONFIG } from './config';
export type {
  OST,
  Author,
  ParsedResult,
  ParserConfig,
  ParserError,
  ParseProgress,
} from './types';
export { OstType } from './types';

// Удобные алиасы - импортируем утилиты напрямую
import { WorldArtUtils } from './parser';
export const parseAnime = WorldArtUtils.parseAnime;
export const clearCache = WorldArtUtils.clearCache;
export const getCacheStats = WorldArtUtils.getCacheStats;

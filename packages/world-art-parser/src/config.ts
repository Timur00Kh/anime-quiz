import { ParserConfig } from './types';

export const DEFAULT_CONFIG: ParserConfig = {
  enableCache: true,
  cacheTtl: 1000 * 60 * 60, // 1 час
  domain: "http://www.world-art.ru",
  encoding: "windows-1251",
  requestTimeout: 10000, // 10 секунд
  userAgent: "Mozilla/5.0 (compatible; AnimeQuizBot/1.0)",
};

export const DEVELOPMENT_CONFIG: ParserConfig = {
  ...DEFAULT_CONFIG,
  cacheTtl: 1000 * 60 * 5, // 5 минут в dev режиме
};

export const PRODUCTION_CONFIG: ParserConfig = {
  ...DEFAULT_CONFIG,
  cacheTtl: 1000 * 60 * 60 * 24, // 24 часа в продакшене
};

export function getConfig(env?: string): ParserConfig {
  const environment = env || process.env.NODE_ENV;
  
  switch (environment) {
    case 'development':
      return DEVELOPMENT_CONFIG;
    case 'production':
      return PRODUCTION_CONFIG;
    default:
      return DEFAULT_CONFIG;
  }
}

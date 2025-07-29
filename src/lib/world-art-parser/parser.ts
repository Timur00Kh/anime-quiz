import * as cheerio from "cheerio";
import { ChildNode } from "domhandler/lib/node";
import {
  OST,
  OstType,
  Author,
  ParsedResult,
  ParserConfig,
  ParserError,
  ParseProgress
} from './types';
import { getConfig } from './config';
import { ParseCache } from './cache';

export class WorldArtParser {
  private static readonly PARSER_VERSION = "2.0.0";
  private config: ParserConfig;

  constructor(config?: Partial<ParserConfig>) {
    this.config = { ...getConfig(), ...config };
  }

  /**
   * Парсит OST для указанного World-Art ID
   */
  async parseAnime(
    waId: number,
    onProgress?: (progress: ParseProgress) => void
  ): Promise<ParsedResult> {
    if (!waId || waId <= 0) {
      throw this.createError('VALIDATION_ERROR', 'Invalid World-Art ID', waId);
    }

    // Проверяем кеш
    const cacheKey = `anime-${waId}-${WorldArtParser.PARSER_VERSION}`;
    if (this.config.enableCache) {
      const cached = ParseCache.get<ParsedResult>(cacheKey);
      if (cached) {
        onProgress?.({
          phase: 'complete',
          current: 1,
          total: 1,
          message: 'Loaded from cache'
        });
        return cached;
      }
    }

    try {
      onProgress?.({
        phase: 'fetching_links',
        current: 0,
        total: 2,
        message: 'Fetching OST links...'
      });

      const ostLinks = await this.getLinkList(waId);

      onProgress?.({
        phase: 'parsing_ost',
        current: 1,
        total: 2,
        message: `Parsing ${ostLinks.length} OSTs...`
      });

      const fullOSTs: OST[] = [];
      for (let i = 0; i < ostLinks.length; i++) {
        const fullOst = await this.getFullOST(ostLinks[i]);
        fullOSTs.push(fullOst);

        onProgress?.({
          phase: 'parsing_ost',
          current: i + 1,
          total: ostLinks.length,
          message: `Parsed: ${fullOst.title}`
        });
      }

      const result: ParsedResult = {
        osts: fullOSTs,
        parserVersion: WorldArtParser.PARSER_VERSION,
        parsedAt: Date.now(),
      };

      // Сохраняем в кеш
      if (this.config.enableCache) {
        ParseCache.set(cacheKey, result, this.config.cacheTtl);
      }

      onProgress?.({
        phase: 'complete',
        current: 2,
        total: 2,
        message: `Completed: ${fullOSTs.length} OSTs parsed`
      });

      return result;
    } catch (error) {
      if (error instanceof Error) {
        throw this.createError('PARSE_ERROR', `Failed to parse anime ${waId}: ${error.message}`, waId);
      }
      throw error;
    }
  }

  /**
   * Получает список ссылок на OST
   */
  private async getLinkList(waId: number): Promise<Partial<OST>[]> {
    const url = `${this.config.domain}/animation/animation_trailers.php?id=${waId}`;
    const html = await this.fetchPage(url);

    const $ = cheerio.load(html);
    const $links = $('font[size="2"] ~ table').find("a");

    if ($links.length === 0) {
      throw this.createError('PARSE_ERROR', 'No OST links found', waId);
    }

    const ostLinks: Partial<OST>[] = [];

    $links.each((i, el) => {
      const href = $(el).attr("href");
      if (href) {
        ostLinks.push({
          unparsed_type: $(el).text().trim(),
          href: href,
          ost_order: i
        });
      }
    });

    return ostLinks.map((link) => this.classifyOstType(link));
  }

  /**
   * Получает полную информацию об OST
   */
  private async getFullOST(ost: Partial<OST>): Promise<OST> {
    if (!ost.href) {
      throw this.createError('VALIDATION_ERROR', 'OST href is required');
    }

    const url = `${this.config.domain}/animation/${ost.href}`;
    const html = await this.fetchPage(url);

    const $ = cheerio.load(html);

    // Парсим заголовок
    const $title = $('td[width="20"] ~ td[valign="top"] font[size="3"]');
    const title = $title
      .text()
      .replace(/композиция:?/i, "")
      .trim() || 'Unknown OST';

    // Парсим видео
    const $videoSource = $("video source");
    const video = ($videoSource.attr("src") || "").replace(/^\.\./, "");

    // Парсим авторов
    const authors = this.parseAuthors($ as cheerio.CheerioAPI);

    return {
      id: ost.id || 0,
      authors,
      href: ost.href,
      ost_order: ost.ost_order || 0,
      title,
      type: ost.type || OstType.UNRECOGNIZED,
      unparsed_type: ost.unparsed_type || '',
      video: video || '',
    };
  }

  /**
   * Классифицирует тип OST
   */
  private classifyOstType(link: Partial<OST>): Partial<OST> {
    let type: OstType;
    let id: number | undefined;

    const unparsed_type = link.unparsed_type?.toLowerCase();

    if (!unparsed_type) {
      type = OstType.UNRECOGNIZED;
    } else if (unparsed_type.includes("заставка")) {
      type = OstType.OP;
    } else if (unparsed_type.includes("концовка")) {
      type = OstType.ED;
    } else if (unparsed_type.includes("трейлер")) {
      type = OstType.TRAILER;
    } else {
      type = OstType.UNRECOGNIZED;
    }

    if (link.href) {
      const match = link.href.match(/trailer_id=(\d+)/);
      if (match) {
        id = Number(match[1]);
      }
    }

    return { ...link, type, id };
  }

  /**
   * Парсит авторов OST
   */
  private parseAuthors($: cheerio.CheerioAPI): Author[] {
    try {
      const $authorSection = $('td[width="20"] ~ td[valign="top"] p.review');
      const authors: Author[] = [];

      if ($authorSection.length === 0) return authors;

      const siblings = this.getSiblings(($authorSection[0] as any).childNodes[0]);
      let currentRole = "";

      for (const node of siblings) {
        if (node.type === "text") {
          const text = $(node).text().trim();
          if (text.length > 3) {
            currentRole = text.replace(":", "").trim();
          }
        }

        if (node.type === "tag" && node.tagName === "a") {
          const href = node.attributes.find((e) => e.name === "href");
          const match = href?.value.match(/id=(\d+)/);
          const id = match ? Number(match[1]) : 0;

          authors.push({
            id,
            role: currentRole || 'Unknown',
            href: href?.value || '',
            name: $(node).text().trim(),
          });
        }
      }

      return authors;
    } catch (error) {
      console.warn("Error parsing authors:", error);
      return [];
    }
  }

  /**
   * Получает соседние DOM узлы
   */
  private getSiblings(sibling: ChildNode): ChildNode[] {
    const siblings: ChildNode[] = [];
    let current: ChildNode | null | undefined = sibling;

    while (current) {
      siblings.push(current);
      current = current.nextSibling;
    }

    return siblings.filter(Boolean);
  }

  /**
   * Загружает страницу с обработкой ошибок
   */
  private async fetchPage(url: string): Promise<string> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.requestTimeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': this.config.userAgent || 'Mozilla/5.0',
        },
        cache: "force-cache",
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw this.createError(
          'NETWORK_ERROR',
          `HTTP ${response.status}: ${response.statusText}`,
          undefined,
          url
        );
      }

      const buffer = await response.arrayBuffer();
      return new TextDecoder(this.config.encoding).decode(buffer);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw this.createError('TIMEOUT_ERROR', 'Request timeout', undefined, url);
      }
      throw error;
    }
  }

  /**
   * Создает типизированную ошибку
   */
  private createError(
    code: ParserError['code'],
    message: string,
    waId?: number,
    url?: string
  ): ParserError {
    const error = new Error(message) as ParserError;
    error.code = code;
    error.waId = waId;
    error.url = url;
    return error;
  }

  /**
   * Обрабатывает видео URL
   */
  processVideoUrl(ost: OST): OST {
    if (!ost.video) {
      return ost;
    }

    try {
      const videoUrl = ost.video.startsWith('http')
        ? ost.video
        : `${this.config.domain}${ost.video}`;

      return {
        ...ost,
        videoUrl,
      };
    } catch (error) {
      return {
        ...ost,
        downloadError: error instanceof Error ? error.message : 'Unknown error processing video'
      };
    }
  }

  /**
   * Валидирует результат парсинга
   */
  static validateResult(result: ParsedResult): boolean {
    if (!result.osts || !Array.isArray(result.osts)) {
      return false;
    }

    return result.osts.every(ost =>
      typeof ost.id === 'number' &&
      typeof ost.title === 'string' &&
      typeof ost.href === 'string' &&
      Object.values(OstType).includes(ost.type)
    );
  }
}

// Статические утилиты для удобства
export const WorldArtUtils = {
  createParser: (config?: Partial<ParserConfig>) => new WorldArtParser(config),

  parseAnime: async (waId: number, config?: Partial<ParserConfig>) => {
    const parser = new WorldArtParser(config);
    return parser.parseAnime(waId);
  },

  clearCache: () => ParseCache.clear(),

  getCacheStats: () => ({
    size: ParseCache.size(),
    keys: ParseCache.keys(),
  }),
};

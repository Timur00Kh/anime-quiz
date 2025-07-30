import { getAnime, getAnimeExternals, getAnimes, ShikiAPIAnimeSearch } from "./shikiAPI";
import { OstType, OST } from "../lib/world-art-parser/types";
import { getConvexApi } from "./convex";

interface OstSource {
  id: number;
  title: string;
  url: string;
  animeId: number;
  type: OstType;
}

async function getWorldArtId(animeId: number): Promise<number | null> {
  try {
    const externalLinks = await getAnimeExternals(animeId);
    const waExternal = externalLinks.find((e) => e.kind === "world_art");

    if (waExternal) {
      const match = waExternal.url.match(/id=(\d+)/);
      if (match) {
        return Number(match[1]);
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting World-Art ID:", error);
    return null;
  }
}

// Функция для работы с Convex (основная)
export async function getAnimeOst(animeId: number): Promise<OstSource[]> {
  try {
    const waId = await getWorldArtId(animeId);
    if (!waId) return [];

    // Используем Convex action напрямую
    const api = await getConvexApi();
    if (!api) {
      throw new Error("Convex API not available");
    }

    // Используем Convex action
    const { convex } = await import("./convex");
    const osts = await convex.action(api.worldArt.parseWorldArt, { waId });

    // Фильтруем только OP и ED
    const filteredOsts = osts.filter((ost: OST) =>
      ost.type === OstType.OP || ost.type === OstType.ED
    );

    return filteredOsts.map((ost: OST) => ({
      id: ost.id,
      title: ost.title,
      url: ost.videoUrl || `http://www.world-art.ru${ost.video}`,
      animeId,
      type: ost.type
    }));
  } catch (error) {
    console.error("Error fetching anime OST:", error);
    return [];
  }
}

// Функция для работы с Convex (будет использоваться после миграции)
export async function getAnimeOstConvex(animeId: number, convexClient: any): Promise<OstSource[]> {
  try {
    const waId = await getWorldArtId(animeId);
    if (!waId) return [];

    // Используем Convex action через динамический импорт
    const api = await getConvexApi();
    if (!api) throw new Error("Convex API not available");
    const osts = await convexClient.action(api.worldArt.parseOstsFromWorldArt, { waId });

    // Фильтруем только OP и ED
    const filteredOsts = osts.filter((ost: OST) =>
      ost.type === OstType.OP || ost.type === OstType.ED
    );

    return filteredOsts.map((ost: OST) => ({
      id: ost.id,
      title: ost.title,
      url: ost.videoUrl || `http://www.world-art.ru${ost.video}`,
      animeId,
      type: ost.type
    }));
  } catch (error) {
    console.error("Error fetching anime OST via Convex:", error);
    return [];
  }
}

// Cache for anime search results to avoid repeated API calls
const animeSearchCache = new Map<string, ShikiAPIAnimeSearch[]>();

// Helper function to get random items from array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Helper function to get random anime with filters
async function getRandomAnime(count: number): Promise<ShikiAPIAnimeSearch[]> {
  // Use different orders and statuses for variety
  const orders = ['ranked', 'popularity', 'random'] as const;
  const statuses = ['released', 'ongoing'] as const;
  const order = orders[Math.floor(Math.random() * orders.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  // Get significantly more anime than needed to ensure we have enough valid ones
  const limit = Math.min(500, count * 20);

  // Use cache key that includes filters
  const cacheKey = `${order}-${status}-${limit}`;

  if (animeSearchCache.has(cacheKey)) {
    const cached = animeSearchCache.get(cacheKey)!;
    return getRandomItems(cached, Math.min(cached.length, count * 2));
  }

  try {
    // Fetch anime with filters
    const animes = await getAnimes({
      order: order,
      status: status,
      limit: limit,
      score: 7
    });

    // Cache the results
    animeSearchCache.set(cacheKey, animes);

    // Return random selection
    return getRandomItems(animes, Math.min(animes.length, count * 2));
  } catch (error) {
    console.error('Error fetching random anime:', error);
    return [];
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

interface QuizQuestion {
  id: string;
  ostUrl: string;
  ostType: OstType;
  options: Array<{
    id: number;
    name: string;
    russian: string;
  }>;
  correctAnswer: number;
}

// Helper function to validate anime data
function isValidAnime(anime: ShikiAPIAnimeSearch): boolean {
  return Boolean(
    anime &&
    anime.id &&
    anime.name &&
    anime.name.trim() !== '' &&
    anime.russian &&
    anime.russian.trim() !== ''
  );
}

/**
 * @deprecated Use generateOstQuizConvex instead. This function will be removed in future versions.
 * Старая функция генерации OST квиза. Использует клиентскую логику.
 * Заменена на Convex-based генерацию для лучшей производительности.
 */
export async function generateOstQuiz(
  numQuestions: number = 10,
  onProgress?: (progress: number) => void
): Promise<QuizQuestion[]> {
  const questions: QuizQuestion[] = [];
  const usedAnimeIds = new Set<number>();
  let attempts = 0;
  const maxAttempts = 5; // Maximum number of attempts to get all questions

  while (questions.length < numQuestions && attempts < maxAttempts) {
    attempts++;

    // Pre-fetch some anime lists to minimize API calls
    onProgress?.(5 + (attempts - 1) * 20);
    const searchResults = await Promise.all([
      getRandomAnime(numQuestions),
      getRandomAnime(numQuestions),
      getRandomAnime(numQuestions)
    ]);
    onProgress?.(20 + (attempts - 1) * 20);

    // Combine and shuffle all anime, filtering out invalid entries
    const allAnime = shuffleArray(
      searchResults.flat()
        .filter(isValidAnime)
        .filter((anime, index, self) =>
          self.findIndex(a => a.id === anime.id) === index
        )
    );

    // Process anime until we have enough questions or run out of anime
    for (const anime of allAnime) {
      if (questions.length >= numQuestions) break;
      if (usedAnimeIds.has(anime.id)) continue;

      try {
        const ostSources = await getAnimeOst(anime.id);

        if (ostSources.length > 0) {
          // Get valid wrong options (ensuring they have proper names)
          const availableWrongOptions = allAnime
            .filter(a =>
              a.id !== anime.id &&
              !usedAnimeIds.has(a.id) &&
              isValidAnime(a)
            );

          if (availableWrongOptions.length >= 3) {
            const wrongOptions = shuffleArray(availableWrongOptions)
              .slice(0, 3)
              .map(a => ({
                id: a.id,
                name: a.name.trim(),
                russian: a.russian.trim()
              }));

            const correctOption = {
              id: anime.id,
              name: anime.name.trim(),
              russian: anime.russian.trim()
            };

            // Try to maintain a balance between OP and ED
            const unusedOsts = ostSources.filter(ost =>
              !questions.some(q => q.id.includes(`${anime.id}-${ost.id}`))
            );

            const lastQuestionType = questions.length > 0 ? questions[questions.length - 1].ostType : null;
            const preferredType = lastQuestionType === OstType.OP ? OstType.ED : OstType.OP;

            const randomOst = unusedOsts.find(ost => ost.type === preferredType) ||
              unusedOsts[Math.floor(Math.random() * unusedOsts.length)];

            if (randomOst) {
              const allOptions = shuffleArray([correctOption, ...wrongOptions]);
              const correctAnswerIndex = allOptions.findIndex(opt => opt.id === anime.id);

              questions.push({
                id: `${anime.id}-${randomOst.id}`,
                ostUrl: randomOst.url,
                ostType: randomOst.type,
                options: allOptions,
                correctAnswer: correctAnswerIndex
              });

              usedAnimeIds.add(anime.id);
              wrongOptions.forEach(opt => usedAnimeIds.add(opt.id));
            }
          }
        }

        // Update progress based on how many questions we have
        const progress = Math.min(90, 20 + (70 * questions.length / numQuestions));
        onProgress?.(progress);

      } catch (error) {
        console.error("Error generating quiz question:", error);
      }
    }
  }

  // If we still don't have enough questions after all attempts, throw an error
  if (questions.length < numQuestions) {
    throw new Error(`Could not generate ${numQuestions} questions. Only got ${questions.length} valid questions.`);
  }

  onProgress?.(100);
  return questions.slice(0, numQuestions); // Ensure we return exactly numQuestions
}

// Hook для использования в React компонентах (для будущего использования с Convex)
export function useWorldArtParser() {
  // Этот hook будет реализован после полной миграции на Convex
  return {
    parseAnime: async (waId: number) => {
      console.log("Direct parser not yet implemented in client");
      throw new Error("Use API endpoint for now");
    }
  };
}

// ============================================================================
// НОВЫЕ CONVEX ФУНКЦИИ (РЕКОМЕНДУЕТСЯ К ИСПОЛЬЗОВАНИЮ)
// ============================================================================

import { api } from "../../convex/_generated/api";

// Типы для новых Convex функций
export interface OstQuizQuestion {
  id: string;
  ostUrl: string;
  ostType: OstType;
  correctAnswer: number;
  options: Array<{
    id: number;
    name: string;
    russian: string;
  }>;
  order: number;
  animeId: number;
  usageCount: number;
}

export interface OstQuiz {
  quizId: string;
  title: string;
  questionCount: number;
  questions: OstQuizQuestion[];
}

export interface GenerateOstQuizOptions {
  questionCount?: number;
  title?: string;
  description?: string;
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
}

export interface OstQuizResults {
  quizId: string;
  userId?: string;
  score: number;
  totalQuestions: number;
  completedAt: number;
  guessTimes: Array<{
    questionIndex: number;
    timeLeft?: number;
    isCorrect: boolean;
  }>;
  telegramData?: {
    chatId: number;
    messageId: number;
  };
}

/**
 * Генерация OST квиза через Convex (рекомендуется)
 * Использует 80% существующих вопросов + 20% новых для оптимизации
 */
export async function generateOstQuizConvex(
  options: GenerateOstQuizOptions = {}
): Promise<OstQuiz> {
  try {
    const { convex } = await import("./convex");

    const result = await convex.action(api.ostQuiz.generateOstQuiz, {
      questionCount: options.questionCount || 10,
      title: options.title,
      description: options.description,
      difficulty: options.difficulty,
      tags: options.tags || [],
    });

    return result;
  } catch (error) {
    console.error("Error generating OST quiz via Convex:", error);
    throw error;
  }
}

/**
 * Получение OST квиза по ID через Convex
 */
export async function getOstQuizConvex(quizId: string): Promise<OstQuiz | null> {
  try {
    const { convex } = await import("./convex");

    const result = await convex.query(api.ostQuizMutations.getOstQuiz, {
      quizId: quizId as any, // TODO: fix type
    });

    if (!result) return null;

    // Преобразуем результат в нужный формат
    return {
      quizId: result.quiz._id,
      title: result.quiz.title,
      questionCount: result.quiz.questionCount,
      questions: result.questions.map(q => ({
        id: q._id,
        ostUrl: q.ostUrl,
        ostType: q.ostType as OstType,
        correctAnswer: q.correctAnswer,
        options: q.options,
        order: (q as any).order || 0,
        animeId: q.animeId,
        usageCount: q.usageCount,
      })),
    };
  } catch (error) {
    console.error("Error getting OST quiz via Convex:", error);
    return null;
  }
}

/**
 * Получение случайного OST квиза через Convex
 */
export async function getRandomOstQuizConvex(
  difficulty?: "easy" | "medium" | "hard"
): Promise<OstQuiz | null> {
  try {
    const { convex } = await import("./convex");

    const result = await convex.query(api.ostQuizMutations.getRandomOstQuiz, {
      difficulty,
    });

    if (!result) return null;

    // Преобразуем результат в нужный формат
    return {
      quizId: result.quiz._id,
      title: result.quiz.title,
      questionCount: result.quiz.questionCount,
      questions: result.questions.map(q => ({
        id: q._id,
        ostUrl: q.ostUrl,
        ostType: q.ostType as OstType,
        correctAnswer: q.correctAnswer,
        options: q.options,
        order: (q as any).order || 0,
        animeId: q.animeId,
        usageCount: q.usageCount,
      })),
    };
  } catch (error) {
    console.error("Error getting random OST quiz via Convex:", error);
    return null;
  }
}

/**
 * Поиск существующих вопросов через Convex
 */
export async function findExistingQuestionsConvex(
  animeId?: number,
  ostType?: "OP" | "ED" | "TRAILER" | "UNRECOGNIZED",
  limit: number = 10
): Promise<OstQuizQuestion[]> {
  try {
    const { convex } = await import("./convex");

    const result = await convex.query(api.ostQuizMutations.findExistingQuestions, {
      animeId,
      ostType,
      limit,
    });

    // Преобразуем результат в нужный формат
    return result.map(q => ({
      id: q._id,
      ostUrl: q.ostUrl,
      ostType: q.ostType as OstType, // Преобразуем строку в OstType
      correctAnswer: q.correctAnswer,
      options: q.options,
      order: 0, // Вопросы из поиска не имеют порядка
      animeId: q.animeId,
      usageCount: q.usageCount,
    }));
  } catch (error) {
    console.error("Error finding existing questions via Convex:", error);
    return [];
  }
}

/**
 * Сохранение результатов OST квиза через Convex
 */
export async function saveOstQuizResults(results: OstQuizResults): Promise<string> {
  try {
    const { convex } = await import("./convex");

    const result = await convex.mutation(api.ostQuizMutations.saveQuizResults, {
      quizId: results.quizId as any, // TODO: fix type
      userId: results.userId,
      score: results.score,
      totalQuestions: results.totalQuestions,
      completedAt: results.completedAt,
      guessTimes: results.guessTimes,
      telegramData: results.telegramData,
    });

    return result;
  } catch (error) {
    console.error("Error saving OST quiz results via Convex:", error);
    throw error;
  }
}

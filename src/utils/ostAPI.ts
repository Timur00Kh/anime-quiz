import { getAnime, getAnimeExternals, getAnimes, ShikiAPIAnimeSearch } from "./shikiAPI";
import { OstType } from "../lib/world-art-parser/types";
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

    // Используем Convex action
    const api = await getConvexApi();
    if (!api) {
      // Fallback к старому API если Convex недоступен
      const response = await fetch(`/api/getOst?waId=${waId}`);
      const osts = await response.json();

      const filteredOsts = osts.filter((ost: any) => ost.type === OstType.OP || ost.type === OstType.ED);

      return filteredOsts.map((ost: any) => ({
        id: ost.id,
        title: ost.title,
        url: ost.videoUrl || `http://www.world-art.ru${ost.video}`,
        animeId,
        type: ost.type
      }));
    }

    // Используем Convex action
    const { convex } = await import("./convex");
    const osts = await convex.action(api.worldArt.parseWorldArt, { waId });

    // Фильтруем только OP и ED
    const filteredOsts = osts.filter((ost: any) =>
      ost.type === OstType.OP || ost.type === OstType.ED
    );

    return filteredOsts.map((ost: any) => ({
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
    const osts = await convexClient.action(api.worldArt.parseWorldArt, { waId });

    // Фильтруем только OP и ED
    const filteredOsts = osts.filter((ost: any) =>
      ost.type === OstType.OP || ost.type === OstType.ED
    );

    return filteredOsts.map((ost: any) => ({
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

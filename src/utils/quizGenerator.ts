import { getAnime, getAnimes, IAnime, ShikiAPIAnimeSearch } from "./shikiAPI";
import { QuizQuestion } from "@/types/quiz";

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Common Japanese syllables to generate random searches
const japaneseSyllables = [
  "ka", "ki", "ku", "ke", "ko",
  "sa", "shi", "su", "se", "so",
  "ta", "chi", "tsu", "te", "to",
  "na", "ni", "nu", "ne", "no",
  "ha", "hi", "fu", "he", "ho",
  "ma", "mi", "mu", "me", "mo",
  "ya", "yu", "yo",
  "ra", "ri", "ru", "re", "ro",
  "wa", "wo", "n"
];

// Get random anime using different methods
async function getRandomAnimePool(): Promise<ShikiAPIAnimeSearch[]> {
  // Get 3 random syllables
  const randomSyllables = shuffleArray(japaneseSyllables).slice(0, 3);
  
  // Make 3 parallel requests with different search terms
  const searchPromises = randomSyllables.map(syllable => 
    getAnimes(syllable).catch(() => [])
  );
  
  // Also get some popular anime to ensure we have well-known titles
  const popularPromise = getAnimes("").catch(() => []);
  
  const results = await Promise.all([...searchPromises, popularPromise]);
  
  // Combine and shuffle all results
  const allAnime = shuffleArray(results.flat());
  
  // Remove duplicates by ID
  const uniqueAnime = Array.from(
    new Map(allAnime.map(item => [item.id, item])).values()
  );
  
  return uniqueAnime;
}

async function generateDescriptionQuestion(animePool: ShikiAPIAnimeSearch[]): Promise<QuizQuestion> {
  const correctAnime = animePool[Math.floor(Math.random() * animePool.length)];
  const fullAnimeData = await getAnime(correctAnime.id);
  
  // Skip if description is missing or too short
  if (!fullAnimeData.description || fullAnimeData.description.length < 50) {
    throw new Error("Invalid or missing description");
  }
  
  // Get 3 random incorrect options
  const incorrectOptions = shuffleArray(animePool.filter(a => a.id !== correctAnime.id)).slice(0, 3);
  
  const options = shuffleArray([
    {
      id: correctAnime.id,
      name: correctAnime.name,
      russian: correctAnime.russian,
      image: correctAnime.image
    },
    ...incorrectOptions.map(a => ({
      id: a.id,
      name: a.name,
      russian: a.russian,
      image: a.image
    }))
  ]);

  return {
    id: `desc-${correctAnime.id}`,
    type: 'description',
    question: `Which anime has this description?\n\n${fullAnimeData.description}`,
    correctAnswer: correctAnime.id,
    options
  };
}

async function generateImageQuestion(animePool: ShikiAPIAnimeSearch[]): Promise<QuizQuestion> {
  const correctAnime = animePool[Math.floor(Math.random() * animePool.length)];
  
  // Get 3 random incorrect options
  const incorrectOptions = shuffleArray(animePool.filter(a => a.id !== correctAnime.id)).slice(0, 3);
  
  const options = shuffleArray([
    {
      id: correctAnime.id,
      name: correctAnime.name,
      russian: correctAnime.russian
    },
    ...incorrectOptions.map(a => ({
      id: a.id,
      name: a.name,
      russian: a.russian
    }))
  ]);

  return {
    id: `img-${correctAnime.id}`,
    type: 'image',
    question: correctAnime.image.preview,
    correctAnswer: correctAnime.id,
    options
  };
}

async function generateGenreQuestion(animePool: ShikiAPIAnimeSearch[]): Promise<QuizQuestion> {
  const correctAnime = animePool[Math.floor(Math.random() * animePool.length)];
  const fullAnimeData = await getAnime(correctAnime.id);
  
  // Skip if genres are missing or too few
  if (!fullAnimeData.genres || fullAnimeData.genres.length < 2) {
    throw new Error("Invalid or missing genres");
  }
  
  // Get 3 random incorrect options with different genres
  const incorrectOptions = shuffleArray(
    animePool.filter(a => a.id !== correctAnime.id)
  ).slice(0, 3);
  
  const options = shuffleArray([
    {
      id: correctAnime.id,
      name: correctAnime.name,
      russian: correctAnime.russian,
      image: correctAnime.image
    },
    ...incorrectOptions.map(a => ({
      id: a.id,
      name: a.name,
      russian: a.russian,
      image: a.image
    }))
  ]);

  const genresList = fullAnimeData.genres.map(g => g.russian).join(", ");

  return {
    id: `genre-${correctAnime.id}`,
    type: 'genre',
    question: `Which anime has these genres?\n\n${genresList}`,
    correctAnswer: correctAnime.id,
    options
  };
}

export async function generateQuiz(numQuestions: number = 10): Promise<QuizQuestion[]> {
  // Get a diverse pool of anime
  const animePool = await getRandomAnimePool();
  const questions: QuizQuestion[] = [];
  
  // Keep track of attempts to avoid infinite loops
  let attempts = 0;
  const maxAttempts = numQuestions * 3;
  
  // Generate different types of questions
  while (questions.length < numQuestions && attempts < maxAttempts) {
    attempts++;
    const questionType = Math.floor(Math.random() * 3); // 0, 1, or 2
    
    try {
      let question: QuizQuestion;
      switch (questionType) {
        case 0:
          question = await generateDescriptionQuestion(animePool);
          break;
        case 1:
          question = await generateImageQuestion(animePool);
          break;
        case 2:
          question = await generateGenreQuestion(animePool);
          break;
        default:
          question = await generateImageQuestion(animePool);
      }
      
      // Check if we already have a similar question to avoid duplicates
      const isDuplicate = questions.some(q => 
        q.type === question.type && 
        q.correctAnswer === question.correctAnswer
      );
      
      if (!isDuplicate) {
        questions.push(question);
      }
    } catch (error) {
      console.error("Failed to generate question:", error);
      // Continue to next attempt
      continue;
    }
  }
  
  // If we couldn't generate enough questions, fill with image questions
  while (questions.length < numQuestions) {
    try {
      const question = await generateImageQuestion(animePool);
      const isDuplicate = questions.some(q => q.correctAnswer === question.correctAnswer);
      if (!isDuplicate) {
        questions.push(question);
      }
    } catch (error) {
      console.error("Failed to generate fallback image question:", error);
    }
  }
  
  return shuffleArray(questions);
} 
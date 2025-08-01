"use client";
import { OstType } from "world-art-parser";
import { Container } from "@chakra-ui/react";
import { useLanguage } from "@/utils/useLanguage";
import { OstQuiz } from "@/components/OstQuiz";
import { generateOstQuizConvex } from "@/utils/ostAPI";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";

// Используем типы из ostAPI.ts
import type { OstQuizQuestion, OstQuizResults } from "@/utils/ostAPI";

const translations = {
  en: {
    title: "Anime OST Quiz",
    loading: "Loading quiz...",
    question: "Question",
    of: "of",
    correct: "Correct!",
    incorrect: "Incorrect",
    correctAnswer: "The correct answer was:",
    complete: "Quiz Complete!",
    score: "Your score:",
    tryAgain: "Try Again",
    playOst: "Play OST",
    pauseOst: "Pause OST",
    whichAnime: "Which anime is this OST from?",
    opening: "Opening",
    ending: "Ending",
    trailer: "Trailer",
    other: "Other",
    timeBonus: "Time bonus: +",
    maxScore: "Maximum possible:",
    shareScore: "Share Score"
  },
  ru: {
    title: "Аниме OST Викторина",
    loading: "Загрузка викторины...",
    question: "Вопрос",
    of: "из",
    correct: "Правильно!",
    incorrect: "Неправильно",
    correctAnswer: "Правильный ответ:",
    complete: "Викторина завершена!",
    score: "Ваш результат",
    tryAgain: "Попробовать снова",
    playOst: "Включить OST",
    pauseOst: "Остановить OST",
    whichAnime: "Из какого аниме этот OST?",
    opening: "Заставка",
    ending: "Концовка",
    trailer: "Трейлер",
    other: "Другое",
    timeBonus: "Бонус времени: +",
    maxScore: "Максимально возможно:",
    shareScore: "Поделиться результатом"
  },
};

export default function OstQuizPage() {
  const { language } = useLanguage();
  const [questions, setQuestions] = useState<OstQuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const toast = useToast();

  const handleLoadQuiz = async () => {
    try {
      setIsLoading(true);
      setLoadingProgress(0);

      // Используем новую Convex функцию
      const quiz = await generateOstQuizConvex({
        questionCount: 10,
        title: translations[language].title,
      });

      setQuestions(quiz.questions);
      setLoadingProgress(100);
    } catch (error) {
      toast({
        title: translations[language].loading,
        description: "Failed to load quiz questions. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setQuestions([]);
    handleLoadQuiz();
  };

  const handleComplete = (results: OstQuizResults) => {
    // Here you can handle the quiz results
    // For example, you could:
    // - Save them to a database
    // - Show additional statistics
    // - Update user profile
    // - etc.
    console.log('Quiz completed with results:', results);
  };

  return (
    <Container maxW="container.md" py={8}>
      <OstQuiz
        translations={translations[language]}
        language={language}
        questions={questions}
        isLoading={isLoading}
        loadingProgress={loadingProgress}
        onStart={handleLoadQuiz}
        onRestart={handleRestart}
      // onComplete={handleComplete}
      />
    </Container>
  );
} 
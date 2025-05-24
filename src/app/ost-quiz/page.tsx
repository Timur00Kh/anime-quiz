"use client";

import { Container } from "@chakra-ui/react";
import { useLanguage } from "@/utils/useLanguage";
import { OstQuiz } from "@/components/OstQuiz";
import { generateOstQuiz } from "@/utils/ostAPI";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { OstType } from "@/app/api/getOst/route";

interface OstQuizQuestion {
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
    score: "Ваш результат:",
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
      const newQuestions = await generateOstQuiz(10, (progress) => {
        setLoadingProgress(progress);
      });
      setQuestions(newQuestions);
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
      />
    </Container>
  );
} 
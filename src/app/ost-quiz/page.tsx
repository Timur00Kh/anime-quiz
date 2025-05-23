"use client";

import { Container } from "@chakra-ui/react";
import { useLanguage } from "@/utils/useLanguage";
import OstQuiz from "@/components/OstQuiz";

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
  },
};

export default function OstQuizPage() {
  const { language } = useLanguage();

  return (
    <Container maxW="container.md" py={8}>
      <OstQuiz translations={translations[language]} language={language} />
    </Container>
  );
} 
import { useEffect, useState, useRef, useCallback } from "react";
import { Heading, VStack, useToast } from "@chakra-ui/react";
import { OstType } from "@/lib/world-art-parser/types";
import { Question } from "./Question";
import { StartScreen } from "./StartScreen";
import { Results } from "./Results";
import { LoadingScreen } from "./LoadingScreen";

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

interface OstQuizState {
  currentQuestionIndex: number;
  score: number;
  totalQuestions: number;
  isFinished: boolean;
  guessTimes: Array<{
    questionIndex: number;
    timeLeft: number | null;
    isCorrect: boolean;
  }>;
}

interface OstQuizResults {
  score: number;
  totalQuestions: number;
  questions: OstQuizQuestion[];
  guessTimes: Array<{
    questionIndex: number;
    timeLeft: number | null;
    isCorrect: boolean;
  }>;
}

interface OstQuizProps {
  translations: {
    title: string;
    loading: string;
    question: string;
    of: string;
    correct: string;
    incorrect: string;
    correctAnswer: string;
    complete: string;
    score: string;
    tryAgain: string;
    playOst: string;
    pauseOst: string;
    whichAnime: string;
    opening: string;
    ending: string;
    trailer: string;
    other: string;
    timeBonus: string;
    maxScore: string;
    shareScore: string;
  };
  language: string;
  questions: OstQuizQuestion[];
  isLoading: boolean;
  loadingProgress: number;
  onStart: () => void;
  onRestart: () => void;
  onComplete?: (results: OstQuizResults) => void;
  onShare?: () => void;
}

export default function OstQuiz({
  translations: t,
  language,
  questions,
  isLoading,
  loadingProgress,
  onStart,
  onRestart,
  onComplete,
  onShare
}: OstQuizProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const answerTimeout = useRef<NodeJS.Timeout>();
  const timerInterval = useRef<NodeJS.Timeout>();
  const [quizState, setQuizState] = useState<OstQuizState>({
    currentQuestionIndex: 0,
    score: 0,
    totalQuestions: 10,
    isFinished: false,
    guessTimes: [],
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleAnswer = useCallback((selectedId: number) => {
    if (showingAnswer) return;

    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }

    const currentQuestion = questions[quizState.currentQuestionIndex];
    const selectedIndex = selectedId === -1 ? -1 : currentQuestion.options.findIndex(opt => opt.id === selectedId);
    const isCorrect = selectedIndex === currentQuestion.correctAnswer;

    if (videoRef.current) {
      videoRef.current.style.display = 'block';
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(console.error);
    }

    setSelectedAnswer(selectedIndex);
    setShowingAnswer(true);
    setTimeLeft(null);

    setQuizState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + (timeLeft || 0) : prev.score,
      guessTimes: [...prev.guessTimes, {
        questionIndex: prev.currentQuestionIndex,
        timeLeft: timeLeft,
        isCorrect
      }]
    }));

    answerTimeout.current = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.style.display = 'none';
      }
      setShowingAnswer(false);
      setSelectedAnswer(null);

      if (quizState.currentQuestionIndex < questions.length - 1) {
        setQuizState(prev => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
        }));
        setTimeLeft(20);
      } else {
        const results: OstQuizResults = {
          score: quizState.score,
          totalQuestions: questions.length,
          questions,
          guessTimes: [...quizState.guessTimes]
        };
        onComplete?.(results);
        setQuizState(prev => ({
          ...prev,
          isFinished: true,
        }));
      }
    }, 8000);
  }, [showingAnswer, questions, quizState.currentQuestionIndex, timeLeft, onComplete]);

  useEffect(() => {
    const currentVideo = videoRef.current;
    return () => {
      if (answerTimeout.current) {
        clearTimeout(answerTimeout.current);
      }
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      if (currentVideo) {
        currentVideo.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && !quizState.isFinished && isStarted && questions.length > 0) {
      const currentVideo = videoRef.current;
      const playTimer = setTimeout(() => {
        currentVideo?.play().catch(error => {
          console.error('Autoplay failed:', error);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }, 100);

      return () => clearTimeout(playTimer);
    }
  }, [quizState.currentQuestionIndex, isStarted, questions, quizState.isFinished]);

  useEffect(() => {
    if (questions.length > 0 && !isLoading) {
      setTimeLeft(20);
    }
  }, [questions.length, isLoading]);

  useEffect(() => {
    if (!showingAnswer && isStarted && !quizState.isFinished && questions.length > 0 && timeLeft !== null) {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }

      timerInterval.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            if (timerInterval.current) {
              clearInterval(timerInterval.current);
            }
            if (prev !== null && prev <= 1) {
              handleAnswer(-1);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerInterval.current) {
          clearInterval(timerInterval.current);
        }
      };
    }
  }, [quizState.currentQuestionIndex, isStarted, showingAnswer, quizState.isFinished, timeLeft, questions.length, handleAnswer]);

  const handleStart = () => {
    setIsStarted(true);
    onStart();
  };

  const handleRestartClick = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    if (answerTimeout.current) {
      clearTimeout(answerTimeout.current);
    }
    setIsStarted(false);
    setTimeLeft(null);
    setQuizState({
      currentQuestionIndex: 0,
      score: 0,
      totalQuestions: 10,
      isFinished: false,
      guessTimes: [],
    });
    onRestart();
  };

  const getOstTypeText = (type: OstType) => {
    switch (type) {
      case OstType.OP:
        return t.opening;
      case OstType.ED:
        return t.ending;
      case OstType.TRAILER:
        return t.trailer;
      default:
        return t.other;
    }
  };

  if (!isStarted) {
    return (
      <VStack spacing={8}>
        <StartScreen
          translations={t}
          language={language}
          onStart={handleStart}
        />
      </VStack>
    );
  }

  if (isLoading) {
    return (
      <LoadingScreen
        loadingProgress={loadingProgress}
        translations={t}
        language={language}
      />
    );
  }

  return (
    <VStack spacing={8}>
      <Heading>{t.title}</Heading>
      {quizState.isFinished ? (
        <Results
          score={quizState.score}
          totalQuestions={questions.length}
          questions={questions}
          guessTimes={quizState.guessTimes}
          translations={t}
          language={language}
          onRestart={handleRestartClick}
          onShare={onShare}
        />
      ) : (
        questions.length > 0 && (
          <Question
            question={questions[quizState.currentQuestionIndex]}
            currentQuestionIndex={quizState.currentQuestionIndex}
            totalQuestions={questions.length}
            score={quizState.score}
            showingAnswer={showingAnswer}
            selectedAnswer={selectedAnswer}
            timeLeft={timeLeft}
            videoRef={videoRef}
            translations={t}
            language={language}
            onAnswer={handleAnswer}
            getOstTypeText={getOstTypeText}
          />
        )
      )}
    </VStack>
  );
} 
import { useEffect, useState, useRef } from "react";
import { Heading, VStack, useToast } from "@chakra-ui/react";
import { generateOstQuiz } from "@/utils/ostAPI";
import { OstType } from "@/app/api/getOst/route";
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
  questions: OstQuizQuestion[];
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
  };
  language: string;
}

export default function OstQuiz({ translations: t, language }: OstQuizProps) {
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const answerTimeout = useRef<NodeJS.Timeout>();
  const timerInterval = useRef<NodeJS.Timeout>();
  const [quizState, setQuizState] = useState<OstQuizState>({
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    totalQuestions: 10,
    isFinished: false,
    guessTimes: [],
  });
  const videoRef = useRef<HTMLVideoElement>(null);
  const toast = useToast();

  useEffect(() => {
    return () => {
      if (answerTimeout.current) {
        clearTimeout(answerTimeout.current);
      }
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && !quizState.isFinished && isStarted && quizState.questions.length > 0) {
      const playTimer = setTimeout(() => {
        videoRef.current?.play().catch(error => {
          console.error('Autoplay failed:', error);
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }, 100);

      return () => clearTimeout(playTimer);
    }
  }, [quizState.currentQuestionIndex, isStarted, quizState.questions]);

  useEffect(() => {
    if (quizState.questions.length > 0 && !loading) {
      setTimeLeft(20);
    }
  }, [quizState.questions.length, loading]);

  useEffect(() => {
    if (!showingAnswer && isStarted && !quizState.isFinished && quizState.questions.length > 0 && timeLeft !== null) {
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
  }, [quizState.currentQuestionIndex, isStarted, showingAnswer, quizState.isFinished, timeLeft, quizState.questions.length]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      setTimeLeft(null);
      const questions = await generateOstQuiz(10, (progress) => {
        setLoadingProgress(progress);
      });
      setQuizState(prev => ({
        ...prev,
        questions,
        currentQuestionIndex: 0,
        score: 0,
        isFinished: false,
      }));
      setIsPlaying(true);
    } catch (error) {
      toast({
        title: t.loading,
        description: "Failed to load quiz questions. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    setIsStarted(true);
    loadQuiz();
  };

  const handleRestart = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    if (answerTimeout.current) {
      clearTimeout(answerTimeout.current);
    }
    setIsStarted(false);
    setTimeLeft(null);
    setQuizState({
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      totalQuestions: 10,
      isFinished: false,
      guessTimes: [],
    });
  };

  const handleAnswer = (selectedId: number) => {
    if (showingAnswer) return;
    
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
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
      
      if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
        setQuizState(prev => ({
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
        }));
        setTimeLeft(20);
      } else {
        setQuizState(prev => ({
          ...prev,
          isFinished: true,
        }));
      }
    }, 8000);
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

  if (loading) {
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
          totalQuestions={quizState.questions.length}
          questions={quizState.questions}
          guessTimes={quizState.guessTimes}
          translations={t}
          language={language}
          onRestart={handleRestart}
        />
      ) : (
        quizState.questions.length > 0 && (
          <Question
            question={quizState.questions[quizState.currentQuestionIndex]}
            currentQuestionIndex={quizState.currentQuestionIndex}
            totalQuestions={quizState.questions.length}
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
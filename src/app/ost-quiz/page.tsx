"use client";

import { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Container,
  Flex,
  Heading,
  Progress,
  Stack,
  Text,
  useToast,
  VStack,
  Badge,
  IconButton,
  Switch,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react";
import { useLanguage } from "@/utils/useLanguage";
import { motion } from "framer-motion";
import { FaPlay, FaPause } from "react-icons/fa";
import { generateOstQuiz } from "@/utils/ostAPI";
import { OstType } from "@/app/api/getOst/route";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Link } from "@chakra-ui/react";
import { SHIKIMORI_URL } from "@/utils/shikiAPI";

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
}

const MotionBox = motion(Box);

export default function OstQuizPage() {
  const { language } = useLanguage();
  const t = translations[language];
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
      // Small delay to ensure video element is properly loaded
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

  // Reset timer when starting a new quiz
  useEffect(() => {
    if (quizState.questions.length > 0 && !loading) {
      setTimeLeft(20);
    }
  }, [quizState.questions.length, loading]);

  // Timer effect
  useEffect(() => {
    if (!showingAnswer && isStarted && !quizState.isFinished && quizState.questions.length > 0 && timeLeft !== null) {
      // Clear any existing timer
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
              handleAnswer(-1); // Time's up - handle as wrong answer
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
      setTimeLeft(null); // Reset timer before loading
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
    setTimeLeft(null); // Reset timer when showing answer

    if (isCorrect) {
      setQuizState(prev => ({
        ...prev,
        score: prev.score + 1,
      }));
    }

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
        setTimeLeft(20); // Reset timer for next question
      } else {
        setQuizState(prev => ({
          ...prev,
          isFinished: true,
        }));
      }
    }, 8000);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
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

  const getButtonStyle = (index: number) => {
    if (!showingAnswer) return {};
    
    const isCorrect = index === quizState.questions[quizState.currentQuestionIndex].correctAnswer;
    const isSelected = index === selectedAnswer;
    
    if (isCorrect) {
      return {
        bg: 'green.500',
        color: 'white',
        _hover: { bg: 'green.600' },
        borderColor: 'green.500'
      };
    }
    if (isSelected && !isCorrect) {
      return {
        bg: 'red.500',
        color: 'white',
        _hover: { bg: 'red.600' },
        borderColor: 'red.500'
      };
    }
    return {};
  };

  const renderAnswerInfo = (question: OstQuizQuestion) => {
    const correctOption = question.options[question.correctAnswer];
    const isCorrect = selectedAnswer === question.correctAnswer;

    return (
      <Box mt={4} p={4} bg={isCorrect ? "green.50" : "red.50"} borderRadius="md">
        <VStack spacing={3} align="stretch">
          <Flex justify="space-between" align="center">
            <Badge colorScheme={isCorrect ? "green" : "red"} fontSize="md" p={2}>
              {isCorrect ? t.correct : t.incorrect}
            </Badge>
            <Link href={`${SHIKIMORI_URL}/animes/${correctOption.id}`} isExternal>
              <Button
                size="sm"
                rightIcon={<ExternalLinkIcon />}
                variant="outline"
                colorScheme="blue"
              >
                {language === "en" ? "View on Shikimori" : "Смотреть на Shikimori"}
              </Button>
            </Link>
          </Flex>
          
          <Text fontWeight="bold">
            {language === "en" ? "Anime:" : "Аниме:"}{" "}
            {language === "en" ? correctOption.name : correctOption.russian}
          </Text>
          
          <Text>
            {language === "en" ? "Track type:" : "Тип трека:"}{" "}
            {getOstTypeText(question.ostType)}
          </Text>
        </VStack>
      </Box>
    );
  };

  const renderQuestion = (question: OstQuizQuestion) => {
    // Only check timeLeft when showing the timer
    const shouldShowTimer = !showingAnswer && timeLeft !== null;

    return (
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        w="100%"
      >
        <Card
          overflow="hidden"
          variant="outline"
          boxShadow="lg"
          borderRadius="xl"
          bg="white"
        >
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Flex justify="space-between" align="center">
                <Badge
                  colorScheme="blue"
                  fontSize="md"
                  p={2}
                  borderRadius="md"
                >
                  {t.question} {quizState.currentQuestionIndex + 1} {t.of} {quizState.questions.length}
                </Badge>
                <Badge
                  colorScheme="green"
                  fontSize="md"
                  p={2}
                  borderRadius="md"
                >
                  {t.score}: {quizState.score}
                </Badge>
              </Flex>

              <Box>
                <video
                  ref={videoRef}
                  src={question.ostUrl}
                  style={{ 
                    width: '100%', 
                    borderRadius: '8px', 
                    display: 'none',
                    maxHeight: '300px',
                    objectFit: 'contain',
                    backgroundColor: 'black'
                  }}
                  onEnded={() => setIsPlaying(false)}
                  autoPlay
                  controls={showingAnswer}
                />
                <Center py={4}>
                  {!showingAnswer ? (
                    <CircularProgress
                      value={shouldShowTimer ? (timeLeft / 20) * 100 : 0}
                      color={shouldShowTimer && timeLeft <= 5 ? "red.400" : "blue.400"}
                      size="60px"
                      thickness="8px"
                    >
                      <CircularProgressLabel fontWeight="bold">
                        {shouldShowTimer ? timeLeft : 0}
                      </CircularProgressLabel>
                    </CircularProgress>
                  ) : (
                    <Text fontSize="sm" color="gray.600">
                      {language === "en" 
                        ? "Next question in 8 seconds..." 
                        : "Следующий вопрос через 8 секунд..."}
                    </Text>
                  )}
                </Center>
                {!showingAnswer && (
                  <Badge
                    colorScheme="purple"
                    fontSize="sm"
                    p={2}
                    borderRadius="md"
                    display="block"
                    textAlign="center"
                    mx="auto"
                    mb={4}
                  >
                    {getOstTypeText(question.ostType)}
                  </Badge>
                )}
              </Box>

              {showingAnswer ? (
                renderAnswerInfo(question)
              ) : (
                <>
                  <Text fontSize="xl" textAlign="center" fontWeight="bold">
                    {t.whichAnime}
                  </Text>

                  <Stack spacing={4}>
                    {question.options.map((option, index) => (
                      <Button
                        key={option.id}
                        size="lg"
                        variant="outline"
                        onClick={() => handleAnswer(option.id)}
                        disabled={showingAnswer}
                        {...getButtonStyle(index)}
                        transition="all 0.2s"
                        width="100%"
                        height="auto"
                        whiteSpace="normal"
                        py={4}
                      >
                        <Text
                          noOfLines={2}
                          textAlign="center"
                          width="100%"
                        >
                          {language === "en" ? option.name : option.russian}
                        </Text>
                      </Button>
                    ))}
                  </Stack>
                </>
              )}
            </VStack>
          </CardBody>
        </Card>
      </MotionBox>
    );
  };

  const renderStartScreen = () => {
    return (
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardBody>
            <VStack spacing={6}>
              <Heading size="lg">{t.title}</Heading>
              <Text textAlign="center" fontSize="lg">
                {language === "en" 
                  ? "Test your knowledge of anime openings and endings!"
                  : "Проверьте свои знания опенингов и эндингов аниме!"}
              </Text>
              <Button
                colorScheme="blue"
                size="lg"
                leftIcon={<FaPlay />}
                onClick={handleStart}
              >
                {language === "en" ? "Start Quiz" : "Начать викторину"}
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </MotionBox>
    );
  };

  const renderResults = () => {
    return (
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardBody>
            <VStack spacing={6}>
              <Heading size="lg">{t.complete}</Heading>
              <Text fontSize="xl">
                {t.score} {quizState.score} / {quizState.questions.length}
              </Text>
              <Button colorScheme="blue" onClick={handleRestart}>
                {t.tryAgain}
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </MotionBox>
    );
  };

  if (!isStarted) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={8}>
          {renderStartScreen()}
        </VStack>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={8}>
          <Heading>{t.loading}</Heading>
          <Box w="100%">
            <Progress 
              value={loadingProgress} 
              size="lg" 
              colorScheme="blue" 
              borderRadius="md"
              hasStripe
              isAnimated
            />
            <Text textAlign="center" mt={2} color="gray.600">
              {loadingProgress > 100 ? 100 : loadingProgress}%
            </Text>
            <Text textAlign="center" fontSize="sm" color="gray.500" mt={1}>
              {loadingProgress < 5 && (language === "en" 
                ? "Initializing..." 
                : "Инициализация...")}
              {loadingProgress >= 5 && loadingProgress < 20 && (language === "en"
                ? "Fetching anime list..." 
                : "Получение списка аниме...")}
              {loadingProgress >= 20 && loadingProgress < 90 && (language === "en"
                ? "Generating questions..." 
                : "Генерация вопросов...")}
              {loadingProgress >= 90 && (language === "en"
                ? "Finalizing..." 
                : "Завершение...")}
            </Text>
          </Box>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8}>
        <Heading>{t.title}</Heading>
        {quizState.isFinished
          ? renderResults()
          : quizState.questions.length > 0 &&
            renderQuestion(quizState.questions[quizState.currentQuestionIndex])}
      </VStack>
    </Container>
  );
} 
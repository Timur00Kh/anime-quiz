"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Container,
  Flex,
  Grid,
  Heading,
  Image,
  Progress,
  Stack,
  Text,
  useToast,
  VStack,
  IconButton,
  Badge,
} from "@chakra-ui/react";
import { QuizQuestion, QuizState } from "@/types/quiz";
import { generateQuiz } from "@/utils/quizGenerator";
import { Language, useLanguage } from "@/utils/useLanguage";
import { motion } from "framer-motion";

const translations = {
  en: {
    title: "Anime Quiz",
    loading: "Loading quiz...",
    question: "Question",
    of: "of",
    correct: "Correct!",
    incorrect: "Incorrect",
    correctAnswer: "The correct answer was:",
    complete: "Quiz Complete!",
    score: "Your score:",
    tryAgain: "Try Again",
    description: "Which anime has this description?",
    genres: "Which anime has these genres?",
  },
  ru: {
    title: "Аниме Викторина",
    loading: "Загрузка викторины...",
    question: "Вопрос",
    of: "из",
    correct: "Правильно!",
    incorrect: "Неправильно",
    correctAnswer: "Правильный ответ:",
    complete: "Викторина завершена!",
    score: "Ваш результат:",
    tryAgain: "Попробовать снова",
    description: "К какому аниме относится это описание?",
    genres: "К какому аниме относятся эти жанры?",
  },
};

const MotionBox = motion(Box);

export default function QuizPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    totalQuestions: 10,
    isFinished: false,
  });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const questions = await generateQuiz(10);
      setQuizState(prev => ({
        ...prev,
        questions,
        currentQuestionIndex: 0,
        score: 0,
        isFinished: false,
      }));
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

  const handleAnswer = (selectedId: number) => {
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const isCorrect = selectedId === currentQuestion.correctAnswer;

    if (isCorrect) {
      toast({
        title: t.correct,
        status: "success",
        duration: 2000,
      });
      setQuizState(prev => ({
        ...prev,
        score: prev.score + 1,
      }));
    } else {
      toast({
        title: t.incorrect,
        description: `${t.correctAnswer} ${currentQuestion.options.find(
          opt => opt.id === currentQuestion.correctAnswer
        )?.name}`,
        status: "error",
        duration: 2000,
      });
    }

    if (quizState.currentQuestionIndex < quizState.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    } else {
      setQuizState(prev => ({
        ...prev,
        isFinished: true,
      }));
    }
  };

  const renderQuestion = (question: QuizQuestion) => {
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

              {question.type === "image" ? (
                <Center mb={4}>
                  <Image
                    src={question.question}
                    alt="Anime image"
                    maxH="400px"
                    objectFit="contain"
                    borderRadius="lg"
                    boxShadow="md"
                  />
                </Center>
              ) : (
                <Box
                  p={4}
                  bg="gray.50"
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <Text fontSize="lg" lineHeight="tall">
                    {question.type === 'description' ? t.description : t.genres}
                    {'\n\n'}
                    {question.question}
                  </Text>
                </Box>
              )}

              <Grid
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                gap={4}
                mt={4}
              >
                {question.options.map((option) => (
                  <Button
                    key={option.id}
                    size="lg"
                    variant="outline"
                    onClick={() => handleAnswer(option.id)}
                    h="auto"
                    py={4}
                    px={6}
                    whiteSpace="normal"
                    textAlign="left"
                    borderWidth="2px"
                    borderRadius="lg"
                    _hover={{
                      transform: "translateY(-2px)",
                      boxShadow: "md",
                    }}
                    transition="all 0.2s"
                  >
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="bold">{option.name}</Text>
                      <Text fontSize="sm" color="gray.500">
                        {option.russian}
                      </Text>
                    </VStack>
                  </Button>
                ))}
              </Grid>
            </VStack>
          </CardBody>
        </Card>
      </MotionBox>
    );
  };

  const renderResults = () => {
    const percentage = (quizState.score / quizState.questions.length) * 100;
    return (
      <MotionBox
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          p={8}
          boxShadow="xl"
          borderRadius="xl"
          bg="white"
          borderWidth="2px"
          borderColor={percentage >= 70 ? "green.200" : percentage >= 40 ? "yellow.200" : "red.200"}
        >
          <CardBody>
            <VStack spacing={8}>
              <Heading size="lg">{t.complete}</Heading>
              <Box textAlign="center">
                <Text fontSize="2xl" mb={2}>
                  {t.score} {quizState.score} {t.of} {quizState.questions.length}
                </Text>
                <Progress
                  value={percentage}
                  size="lg"
                  width="100%"
                  borderRadius="full"
                  colorScheme={percentage >= 70 ? "green" : percentage >= 40 ? "yellow" : "red"}
                  bg="gray.100"
                  hasStripe
                  isAnimated
                />
              </Box>
              <Button
                colorScheme="blue"
                size="lg"
                onClick={loadQuiz}
                leftIcon={<span>🔄</span>}
              >
                {t.tryAgain}
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </MotionBox>
    );
  };

  if (loading) {
    return (
      <Center minH="80vh">
        <Text fontSize="xl">{t.loading}</Text>
      </Center>
    );
  }

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      py={8}
      px={4}
    >
      <Container maxW="container.md">
        <VStack spacing={8}>
          <Heading size="2xl" color="blue.600">
            {t.title}
          </Heading>
          {quizState.isFinished
            ? renderResults()
            : renderQuestion(quizState.questions[quizState.currentQuestionIndex])}
        </VStack>
      </Container>
    </Box>
  );
} 
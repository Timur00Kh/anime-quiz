import {
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Flex,
  Stack,
  Text,
  VStack,
  Badge,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { OstType } from "@/lib/world-art-parser/types";
import { RefObject } from "react";
import { AnswerInfo } from "./AnswerInfo";

const MotionBox = motion(Box);

interface QuestionProps {
  question: {
    id: string;
    ostUrl: string;
    ostType: OstType;
    options: Array<{
      id: number;
      name: string;
      russian: string;
    }>;
    correctAnswer: number;
  };
  currentQuestionIndex: number;
  totalQuestions: number;
  score: number;
  showingAnswer: boolean;
  selectedAnswer: number | null;
  timeLeft: number | null;
  videoRef: RefObject<HTMLVideoElement>;
  translations: {
    question: string;
    of: string;
    score: string;
    whichAnime: string;
    opening: string;
    ending: string;
    trailer: string;
    other: string;
    correct: string;
    incorrect: string;
  };
  language: string;
  onAnswer: (selectedId: number) => void;
  getOstTypeText: (type: OstType) => string;
}

export function Question({
  question,
  currentQuestionIndex,
  totalQuestions,
  score,
  showingAnswer,
  selectedAnswer,
  timeLeft,
  videoRef,
  translations: t,
  language,
  onAnswer,
  getOstTypeText,
}: QuestionProps) {
  const shouldShowTimer = !showingAnswer && timeLeft !== null;

  const getButtonStyle = (index: number) => {
    if (!showingAnswer) return {};

    const isCorrect = index === question.correctAnswer;
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
                {t.question} {currentQuestionIndex + 1} {t.of} {totalQuestions}
              </Badge>
              <Badge
                colorScheme="green"
                fontSize="md"
                p={2}
                borderRadius="md"
              >
                {t.score}: {score}
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
              <AnswerInfo
                question={question}
                selectedAnswer={selectedAnswer}
                translations={t}
                language={language}
              />
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
                      onClick={() => onAnswer(option.id)}
                      disabled={showingAnswer}
                      transition="all 0.2s"
                      width="100%"
                      height="auto"
                      whiteSpace="normal"
                      py={4}
                      {...getButtonStyle(index)}
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
} 
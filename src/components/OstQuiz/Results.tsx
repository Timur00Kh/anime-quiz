import {
  Card,
  CardBody,
  VStack,
  Heading,
  Text,
  Button,
  Grid,
  Badge,
  Box,
  Progress,
  SimpleGrid,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { OstType } from "@/app/api/getOst/route";

const MotionBox = motion.div;

interface ResultsProps {
  score: number;
  totalQuestions: number;
  questions: Array<{
    id: string;
    ostUrl: string;
    ostType: OstType;
    options: Array<{
      id: number;
      name: string;
      russian: string;
    }>;
    correctAnswer: number;
  }>;
  guessTimes: Array<{
    questionIndex: number;
    timeLeft: number | null;
    isCorrect: boolean;
  }>;
  translations: {
    complete: string;
    score: string;
    tryAgain: string;
    opening: string;
    ending: string;
    trailer: string;
    other: string;
    shareScore: string;
  };
  language: string;
  onRestart: () => void;
  onShare?: () => void;
}

export function Results({ 
  score, 
  totalQuestions, 
  questions,
  guessTimes,
  translations: t, 
  language,
  onRestart,
  onShare
}: ResultsProps) {
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

  const percentage = (score / (totalQuestions * 20)) * 100;

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ width: '100%' }}
    >
      <VStack spacing={8} width="100%">
        <Card width="100%">
          <CardBody>
            <VStack spacing={6}>
              <Heading size="lg">{t.complete}</Heading>
              <Box width="100%" textAlign="center">
                <Text fontSize="2xl" mb={4}>
                  {t.score} {score} / {totalQuestions * 20}
                </Text>
                <Progress
                  value={percentage}
                  size="lg"
                  colorScheme={percentage >= 70 ? "green" : percentage >= 40 ? "yellow" : "red"}
                  borderRadius="full"
                />
              </Box>
              <VStack spacing={4}>
                <Button colorScheme="blue" onClick={onRestart}>
                  {t.tryAgain}
                </Button>
                {onShare && (
                  <Button colorScheme="telegram" onClick={onShare}>
                    {t.shareScore}
                  </Button>
                )}
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} width="100%">
          {questions.map((question, index) => {
            const guessTime = guessTimes[index];
            const correctOption = question.options[question.correctAnswer];
            
            return (
              <Card key={question.id}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Heading size="md" mb={2}>
                        {language === "en" ? correctOption.name : correctOption.russian}
                      </Heading>
                      <Badge colorScheme="purple" mb={2}>
                        {getOstTypeText(question.ostType)}
                      </Badge>
                    </Box>

                    <Box mt="auto">
                      <video
                        src={question.ostUrl}
                        style={{
                          width: '100%',
                          borderRadius: '8px',
                          maxHeight: '200px',
                          objectFit: 'contain',
                          backgroundColor: 'black'
                        }}
                        controls
                      />
                    </Box>

                    <Grid templateColumns="1fr auto" gap={4} alignItems="center">
                      <Badge
                        colorScheme={guessTime.isCorrect ? "green" : "red"}
                        p={2}
                        textAlign="center"
                      >
                        {guessTime.isCorrect ? 
                          (language === "en" ? "Correct" : "Правильно") : 
                          (language === "en" ? "Incorrect" : "Неправильно")}
                      </Badge>
                      {guessTime.isCorrect && guessTime.timeLeft !== null && (
                        <Text fontSize="sm" color="gray.600">
                          {language === "en" ? 
                            `Time bonus: +${guessTime.timeLeft}` : 
                            `Бонус времени: +${guessTime.timeLeft}`}
                        </Text>
                      )}
                    </Grid>
                  </VStack>
                </CardBody>
              </Card>
            );
          })}
        </SimpleGrid>
      </VStack>
    </MotionBox>
  );
} 
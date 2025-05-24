import {
  Box,
  Button,
  VStack,
  Badge,
  Flex,
  Text,
  Link,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { SHIKIMORI_URL } from "@/utils/shikiAPI";
import { OstType } from "@/app/api/getOst/route";

interface AnswerInfoProps {
  question: {
    ostType: OstType;
    options: Array<{
      id: number;
      name: string;
      russian: string;
    }>;
    correctAnswer: number;
  };
  selectedAnswer: number | null;
  translations: {
    correct: string;
    incorrect: string;
    opening: string;
    ending: string;
    trailer: string;
    other: string;
  };
  language: string;
}

export function AnswerInfo({ question, selectedAnswer, translations: t, language }: AnswerInfoProps) {
  const correctOption = question.options[question.correctAnswer];
  const isCorrect = selectedAnswer === question.correctAnswer;

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
} 
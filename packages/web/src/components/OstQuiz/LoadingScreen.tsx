import {
  Box,
  Heading,
  Progress,
  Text,
  VStack,
} from "@chakra-ui/react";

interface LoadingScreenProps {
  loadingProgress: number;
  translations: {
    loading: string;
  };
  language: string;
}

export function LoadingScreen({ loadingProgress, translations: t, language }: LoadingScreenProps) {
  return (
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
  );
} 
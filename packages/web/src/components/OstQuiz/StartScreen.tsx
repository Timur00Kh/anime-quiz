import {
  Card,
  CardBody,
  VStack,
  Heading,
  Text,
  Button,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaPlay } from "react-icons/fa";

const MotionBox = motion.div;

interface StartScreenProps {
  translations: {
    title: string;
  };
  language: string;
  onStart: () => void;
}

export function StartScreen({ translations: t, language, onStart }: StartScreenProps) {
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
              onClick={onStart}
            >
              {language === "en" ? "Start Quiz" : "Начать викторину"}
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </MotionBox>
  );
} 
import {
  Card,
  CardBody,
  VStack,
  Heading,
  Text,
  Button,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion.div;

interface ResultsProps {
  score: number;
  totalQuestions: number;
  translations: {
    complete: string;
    score: string;
    tryAgain: string;
  };
  onRestart: () => void;
}

export function Results({ score, totalQuestions, translations: t, onRestart }: ResultsProps) {
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
              {t.score} {score} / {totalQuestions}
            </Text>
            <Button colorScheme="blue" onClick={onRestart}>
              {t.tryAgain}
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </MotionBox>
  );
} 
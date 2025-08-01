"use client";

import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  Stack,
  Badge,
  Flex,
} from "@chakra-ui/react";
import { Doc } from "@@convex/_generated/dataModel";
import { api } from "@@convex/_generated/api";
import { useQuery } from "convex/react";
import { useMemo } from "react";

interface OSTCardProps {
  ost: Doc<"waOstParseLog">["osts"][number];
}

export function OSTCard({ ost }: OSTCardProps) {

  const video = useQuery(api.worldArt.getWaOstParseLogVideo, { videoId: ost.waOstParseLogVideoId });
  const downloadStatus = useMemo(() => video?.downloadStatus, [video]);

  return (
    <Card
      key={ost.id}
      variant="outline"
      borderRadius="xl"
      boxShadow="sm"
      transition="all 0.2s"
    >
      <CardBody p={6}>
        <Stack spacing={5}>
          <Box>
            <Heading size="md" mb={3} color="gray.800" lineHeight="tight">
              {ost.title}
            </Heading>
            <Flex align="center" gap={3}>
              <Text color="gray.500" fontSize="sm" fontWeight="medium">
                {ost.unparsed_type}
              </Text>
              <Badge
                colorScheme="blue"
                px={3}
                py={1}
                borderRadius="full"
                fontSize="xs"
                fontWeight="semibold"
                textTransform="uppercase"
                letterSpacing="wide"
              >
                {ost.type}
              </Badge>
            </Flex>
          </Box>

          {ost.authors?.length > 0 && (
            <Box>
              <Text fontWeight="semibold" mb={3} color="gray.700" fontSize="sm">
                Authors
              </Text>
              <Stack spacing={2}>
                {ost.authors.map((author) => (
                  <Flex
                    key={author.id}
                    p={3}
                    bg="gray.50"
                    borderRadius="lg"
                    justify="space-between"
                    align="center"
                    border="1px solid"
                    borderColor="gray.100"
                    _hover={{ bg: "gray.100" }}
                    transition="background 0.2s"
                  >
                    <Text fontWeight="medium" color="gray.800">
                      {author.name}
                    </Text>
                    <Badge
                      colorScheme="purple"
                      borderRadius="full"
                      px={2}
                      py={1}
                      fontSize="xs"
                      fontWeight="semibold"
                    >
                      {author.role}
                    </Badge>
                  </Flex>
                ))}
              </Stack>
            </Box>
          )}

          <Box>
            <Text fontWeight="medium" mb={3} color="gray.700">OST Preview</Text>
            {downloadStatus === "completed" && (
              <Box
                borderRadius="lg"
                overflow="hidden"
                boxShadow="md"
                bg="gray.50"
              >
                <video
                  controls
                  preload="metadata"
                  src={video?.videoUrl || ''}
                  style={{
                    width: '100%',
                    borderRadius: '8px',
                    backgroundColor: '#f7fafc'
                  }}
                  onLoadedMetadata={(e) => {
                    const video = e.currentTarget;
                    video.currentTime = 0.33;
                  }}
                />
              </Box>
            )}
            {downloadStatus === "pending" && (
              <Box
                p={4}
                bg="blue.50"
                borderRadius="md"
                border="1px solid"
                borderColor="blue.200"
              >
                <Flex align="center" gap={2}>
                  <Box
                    w={4}
                    h={4}
                    borderRadius="full"
                    bg="blue.500"
                    animation="pulse 1.5s ease-in-out infinite"
                  />
                  <Text color="blue.700" fontWeight="medium">Видео обрабатывается...</Text>
                </Flex>
              </Box>
            )}
            {downloadStatus === "failed" && (
              <Box
                p={4}
                bg="red.50"
                borderRadius="md"
                border="1px solid"
                borderColor="red.200"
              >
                <Flex align="center" gap={2}>
                  <Box
                    w={4}
                    h={4}
                    borderRadius="full"
                    bg="red.500"
                  />
                  <Text color="red.700" fontWeight="medium">Не удалось обработать видео</Text>
                </Flex>
              </Box>
            )}
          </Box>
        </Stack>
      </CardBody>
    </Card>
  );
} 
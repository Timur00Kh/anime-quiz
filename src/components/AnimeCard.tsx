"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Flex,
  Heading,
  Image,
  Link,
  Skeleton,
  SkeletonText,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { IAnime, SHIKIMORI_URL } from "@/utils/shikiAPI";

interface AnimeCardProps {
  anime: IAnime | null;
}

export function AnimeCardSkeleton() {
  return (
    <Card w="100%">
      <CardBody>
        <Stack spacing={6}>
          <Center>
            <Skeleton height={320} width="100%" maxW="500px" borderRadius="lg" />
          </Center>
          
          <Stack align="center" justify="center" direction="row" spacing={2}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="24px" width="80px" borderRadius="full" />
            ))}
          </Stack>

          <Stack spacing={3}>
            <Skeleton height="28px" width="80%" />
            <Skeleton height="24px" width="60%" />
            <Stack spacing={2}>
              <Skeleton height="20px" width="100%" />
              <Skeleton height="20px" width="95%" />
              <Skeleton height="20px" width="90%" />
            </Stack>
          </Stack>

          <Skeleton height="40px" width="100%" />
        </Stack>
      </CardBody>
    </Card>
  );
}

export function AnimeCard({ anime }: AnimeCardProps) {
  const isLoaded = !!anime;

  return (
    <Card w="100%">
      <CardBody>
        <Stack spacing={6}>
          <Center>
            <Skeleton height={320} isLoaded={isLoaded}>
              <Image
                src={anime?.image?.original || ""}
                alt={anime?.name || "Anime cover"}
                borderRadius="lg"
                maxW="500px"
                w="100%"
                objectFit="cover"
              />
            </Skeleton>
          </Center>

          <Stack
            align="center"
            justify="center"
            direction="row"
            spacing={2}
            flexWrap="wrap"
          >
            {anime?.genres.map((genre) => (
              <Badge
                key={genre.id}
                px={3}
                py={1}
                bg={useColorModeValue("gray.50", "gray.800")}
                color={useColorModeValue("gray.800", "gray.200")}
                fontWeight="500"
                borderRadius="full"
                fontSize="sm"
              >
                {genre.russian}
              </Badge>
            ))}
          </Stack>

          <Stack spacing={3}>
            <Skeleton isLoaded={isLoaded}>
              <Heading size="lg">{anime?.name}</Heading>
            </Skeleton>
            <Skeleton isLoaded={isLoaded}>
              <Heading size="md" color="gray.500">
                {anime?.russian}
              </Heading>
            </Skeleton>
            <SkeletonText
              noOfLines={4}
              spacing="3"
              skeletonHeight="3"
              isLoaded={isLoaded}
            >
              <Text color="gray.600" lineHeight="1.6">
                {anime?.description}
              </Text>
            </SkeletonText>
          </Stack>

          <Link
            href={`${SHIKIMORI_URL}${anime?.url}`}
            isExternal
            _hover={{ textDecoration: "none" }}
          >
            <Button
              w="100%"
              colorScheme="blue"
              rightIcon={<ExternalLinkIcon />}
              isDisabled={!isLoaded}
            >
              Open on Shikimori
            </Button>
          </Link>
        </Stack>
      </CardBody>
    </Card>
  );
} 
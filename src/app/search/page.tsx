"use client";

import { getAnimes, ShikiAPIAnimeSearch } from "@/utils/shikiAPI";
import { useEffect, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import {
  Box,
  Button,
  Heading,
  Input,
  Stack,
  Image,
  Text,
  LinkOverlay,
  InputGroup,
  InputRightElement,
  Spinner,
  Center,
  IconButton,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react";
import { LinkBox } from "@chakra-ui/react";
import { Card, CardBody, CardFooter } from "@chakra-ui/react";
import { useToastErr } from "@/utils/useToastErr";
import { CloseIcon, SearchIcon } from "@chakra-ui/icons";

export default function () {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const search = useDebounce(text, 500);
  const [data, setData] = useState<ShikiAPIAnimeSearch[]>([]);
  const toastErr = useToastErr();

  const handleClearSearch = () => {
    setText("");
    setData([]);
  };

  const loadAnimes = async (s: string) => {
    
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await getAnimes(s);
      setData(results);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      toastErr(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
      loadAnimes(search);
  }, [search]);

  // Initial load
  useEffect(() => {
    loadAnimes("");
  }, []);

  return (
    <main style={{ display: "flex", width: "100%", justifyContent: "center" }}>
      <Box p={5} maxW={600} width={"100%"}>
        <Heading mb={4}>Поиск аниме</Heading>
        
        <InputGroup>
          <Input
            type="text"
            placeholder="Введите название аниме..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label="Search anime"
            pr="4.5rem"
          />
          <InputRightElement width="4.5rem">
            {text && (
              <IconButton
                h="1.75rem"
                size="sm"
                aria-label="Clear search"
                icon={<CloseIcon />}
                onClick={handleClearSearch}
              />
            )}
          </InputRightElement>
        </InputGroup>

        <Box mt={4} minH="400px">
          {isLoading ? (
            <Stack spacing={4}>
              {[1, 2, 3].map((i) => (
                <Box key={i} borderWidth="1px" borderRadius="lg" overflow="hidden">
                  <Stack direction={{ base: "column", sm: "row" }}>
                    <Skeleton height="200px" width={{ base: "100%", sm: "200px" }} />
                    <Box p={4} width="100%">
                      <SkeletonText mt="1" noOfLines={1} skeletonHeight="6" width="60%" />
                      <SkeletonText mt="4" noOfLines={2} spacing="4" />
                      <Skeleton mt="6" height="10" width="120px" />
                    </Box>
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : error ? (
            <Center p={8} minH="200px">
              <Text color="red.500">Произошла ошибка при поиске. Пожалуйста, попробуйте еще раз.</Text>
            </Center>
          ) : data.length === 0 && text ? (
            <Center p={8} minH="200px">
              <Text>Ничего не найдено</Text>
            </Center>
          ) : (
            <Stack spacing={4}>
              {data.map((anime) => (
                <LinkBox key={anime.id}>
                  <Card
                    direction={{ base: "column", sm: "row" }}
                    overflow="hidden"
                    variant="outline"
                    _hover={{ shadow: "md" }}
                    transition="box-shadow 0.2s"
                  >
                    <Box position="relative" width={{ base: "100%", sm: "200px" }} height="200px">
                      <Image
                        objectFit="cover"
                        src={anime.image.preview}
                        alt={anime.name}
                        loading="lazy"
                        position="absolute"
                        top="0"
                        left="0"
                        width="100%"
                        height="100%"
                      />
                    </Box>

                    <Stack>
                      <CardBody>
                        <Heading size="md">
                          <LinkOverlay href={`/search/${anime.id}`}>
                            {anime.name}
                          </LinkOverlay>
                        </Heading>

                        <Text py="2">{anime.russian}</Text>
                        
                        <Text fontSize="sm" color="gray.500">
                          {anime.episodes} эп. • {anime.score} ★
                        </Text>
                      </CardBody>

                      <CardFooter>
                        <Button 
                          variant="solid" 
                          colorScheme="blue"
                          leftIcon={<SearchIcon />}
                        >
                          Подробнее
                        </Button>
                      </CardFooter>
                    </Stack>
                  </Card>
                </LinkBox>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </main>
  );
}

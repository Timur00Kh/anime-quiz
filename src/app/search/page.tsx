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
} from "@chakra-ui/react";
import { LinkBox } from "@chakra-ui/react";
import { Card, CardBody, CardFooter } from "@chakra-ui/react";
import { useToastErr } from "@/utils/useToastErr";

export default function () {
  const [text, setText] = useState("");
  const search = useDebounce(text, 500);
  const [data, setData] = useState<ShikiAPIAnimeSearch[]>([]);
  const toastErr = useToastErr();

  const loadAnimes = (s: string) => {
    return getAnimes(search)
      .then((e) => setData(e))
      .catch(toastErr);
  };

  useEffect(() => {
    if (search?.length > 3) {
      loadAnimes(search);
    }
  }, [search]);

  useEffect(() => {
    loadAnimes(search);
  }, []);

  return (
    <main style={{ display: "flex", width: "100%", justifyContent: "center" }}>
      <Box p={5} maxW={600} width={"100%"}>
        <Heading>Поиск</Heading>
        <Input type="text" onInput={(e) => setText(e.currentTarget.value)} />
        <Box mt={2}>
          {data.map((anime) => (
            <LinkBox key={anime.id} mt={4}>
              <Card
                direction={{ base: "column", sm: "row" }}
                overflow="hidden"
                variant="outline"
              >
                <Image
                  objectFit="cover"
                  maxW={{ base: "100%", sm: "200px" }}
                  src={anime.image.preview}
                  alt="Caffe Latte"
                />

                <Stack>
                  <CardBody>
                    <Heading size="md">
                      <LinkOverlay href={`/search/${anime.id}`}>
                        {anime.name}
                      </LinkOverlay>
                    </Heading>

                    <Text py="2">{anime.russian}</Text>
                  </CardBody>

                  <CardFooter>
                    <Button variant="solid" colorScheme="blue">
                      Посмотреть
                    </Button>
                  </CardFooter>
                </Stack>
              </Card>
            </LinkBox>
          ))}
        </Box>
      </Box>
    </main>
  );
}

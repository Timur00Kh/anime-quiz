"use client";
import {
  Box,
  Card,
  CardBody,
  Divider,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  getAnime,
  getAnimeExternals,
  IAnime,
  IExternalLink,
} from "@/utils/shikiAPI";
import { useToastErr } from "@/utils/useToastErr";
import { OST } from "@/app/api/getOst/route";
import {
  Badge,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Link,
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { Skeleton, SkeletonCircle, SkeletonText } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

export default function Page({ params, searchParams }) {
  const id = params.id;
  const [anime, setAnime] = useState<IAnime>(null);
  const [animeExternals, setAnimeExternals] = useState<IExternalLink[]>([]);
  const [osts, setOsts] = useState<OST[]>([]);
  const toastErr = useToastErr();

  useEffect(() => {
    (async () => {
      getAnime(id)
        .then((a) => setAnime(a))
        .catch(toastErr);

      try {
        const externalLinks = (await getAnimeExternals(id)) || [];
        setAnimeExternals(externalLinks);
        const waExternal = externalLinks.find((e) => e.kind === "world_art");

        if (waExternal) {
          let waId;

          const match = waExternal.url.match(/id=(\d)+/g);
          if (match) {
            const [idStr] = match;
            waId = Number(idStr.split("=")[1]);
          } else {
            throw new Error("не удалось распарсить waId");
          }

          const data = await fetch(`/api/getOst?waId=${waId}`).then((res) =>
            res.json()
          );
          setOsts(data);
        } else {
          toastErr("У этого аниме нет WA");
        }
      } catch (e) {
        toastErr(e.message);
      }
    })();
  }, [id]);

  return (
    <Box p={5}>
      <Center>
        <Box maxW={600} w="100%">
          <Card w="100%">
            <CardBody w="100%">
              <Center>
                <Skeleton height={320} isLoaded={!!anime}>
                  <Image
                    src={anime?.image?.original || ""}
                    alt="Green double couch with wooden legs"
                    borderRadius="lg"
                  />
                </Skeleton>
              </Center>
              <Stack
                align={"center"}
                justify={"center"}
                direction={"row"}
                mt={6}
              >
                {anime?.genres.map((genre) => (
                  <Badge
                    px={2}
                    py={1}
                    bg={useColorModeValue("gray.50", "gray.800")}
                    fontWeight={"400"}
                  >
                    {genre.russian}
                  </Badge>
                ))}
              </Stack>
              <Stack mt="6" spacing="3">
                <Skeleton isLoaded={!!anime}>
                  <Heading size="md">{anime?.name}</Heading>
                </Skeleton>
                <Skeleton isLoaded={!!anime}>
                  <Heading size="sm">{anime?.russian}</Heading>
                </Skeleton>
                <SkeletonText
                  noOfLines={4}
                  spacing="4"
                  skeletonHeight="2"
                  isLoaded={!!anime}
                >
                  <Text>{anime?.description}</Text>
                </SkeletonText>
              </Stack>
              <Stack mt={6} justifyContent="end">
                <Link href={"https://shikimori.me/" + anime?.url}>
                  <Button w={"100%"} as="span">
                    Open on Shiki <ExternalLinkIcon mx="2px" />
                  </Button>
                </Link>
              </Stack>
            </CardBody>
          </Card>
          <Stack>
            {osts.map((ost) => (
              <Box mt={6}>
                <Heading size="md">{ost.title}</Heading>
                <Heading size="sm">
                  {ost.unparsed_type}
                  <Badge
                    px={2}
                    py={1}
                    my={2}
                    bg={useColorModeValue("gray.50", "gray.800")}
                    fontWeight={"400"}
                  >
                    {ost.type}
                  </Badge>
                </Heading>
                {ost.authors.map((author) => (
                  <Box>
                    {author.name} ({author.role})
                  </Box>
                ))}
                <video controls src={"http://www.world-art.ru/" + ost.video} />
              </Box>
            ))}
          </Stack>
          <pre>{JSON.stringify(anime, null, 2)}</pre>
          <pre>{JSON.stringify(animeExternals, null, 2)}</pre>
          <pre>{JSON.stringify(osts, null, 2)}</pre>
        </Box>
      </Center>
    </Box>
  );
}

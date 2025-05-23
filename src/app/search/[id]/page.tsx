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
  SHIKIMORI_URL,
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
import { OSTCard } from "@/components/OSTCard";
import { OSTSkeletonList } from "@/components/OSTSkeleton";

export default function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}): JSX.Element {
  const id = Number(params.id);
  const [anime, setAnime] = useState<IAnime | null>(null);
  const [animeExternals, setAnimeExternals] = useState<IExternalLink[]>([]);
  const [osts, setOsts] = useState<OST[]>([]);
  const [isLoadingOsts, setIsLoadingOsts] = useState(false);
  const toastErr = useToastErr();

  useEffect(() => {
    (async () => {
      getAnime(id)
        .then((a) => setAnime(a))
        .catch(toastErr);

      try {
        setIsLoadingOsts(true);
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
          toastErr(new Error("У этого аниме нет WA"));
        }
      } catch (e) {
        toastErr(new Error(e instanceof Error ? e.message : String(e)));
      } finally {
        setIsLoadingOsts(false);
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
                <Link href={`${SHIKIMORI_URL}${anime?.url}`}>
                  <Button w={"100%"} as="span">
                    Open on Shiki <ExternalLinkIcon mx="2px" />
                  </Button>
                </Link>
              </Stack>
            </CardBody>
          </Card>
          <Stack spacing={4} mt={4}>
            {isLoadingOsts ? (
              <OSTSkeletonList />
            ) : (
              osts.map((ost) => (
                <OSTCard key={ost.id} ost={ost} />
              ))
            )}
          </Stack>
        </Box>
      </Center>
    </Box>
  );
}

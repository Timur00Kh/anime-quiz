"use client";
import { Box, Center, Stack, Button, ButtonGroup, Card, CardBody, Heading } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  getAnime,
  getAnimeExternals,
  IAnime,
  IExternalLink,
} from "@/utils/shikiAPI";
import { useToastErr } from "@/utils/useToastErr";
import { OST, OstType } from "@/app/api/getOst/route";
import { OSTCard } from "@/components/OSTCard";
import { OSTSkeletonList } from "@/components/OSTSkeleton";
import { AnimeCard, AnimeCardSkeleton } from "@/components/AnimeCard";

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
  const [selectedType, setSelectedType] = useState<string>("ALL");
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
  }, [id, toastErr]);

  return (
    <Box p={5}>
      <Center>
        <Box maxW={600} w="100%">
          {anime === null ? <AnimeCardSkeleton /> : <AnimeCard anime={anime} />}
          
          <Card mt={6}>
            <CardBody>
              <Heading size="sm" mb={4}>Filter OSTs</Heading>
              <ButtonGroup spacing={2} size="sm">
                <Button
                  colorScheme={selectedType === "ALL" ? "blue" : "gray"}
                  onClick={() => setSelectedType("ALL")}
                >
                  All
                </Button>
                <Button
                  colorScheme={selectedType === OstType.OP ? "blue" : "gray"}
                  onClick={() => setSelectedType(OstType.OP)}
                >
                  Openings
                </Button>
                <Button
                  colorScheme={selectedType === OstType.ED ? "blue" : "gray"}
                  onClick={() => setSelectedType(OstType.ED)}
                >
                  Endings
                </Button>
                <Button
                  colorScheme={selectedType === OstType.TRAILER ? "blue" : "gray"}
                  onClick={() => setSelectedType(OstType.TRAILER)}
                >
                  Trailers
                </Button>
              </ButtonGroup>
            </CardBody>
          </Card>

          <Stack spacing={4} mt={4}>
            {isLoadingOsts ? (
              <OSTSkeletonList />
            ) : (
              osts
                .filter(ost => selectedType === "ALL" || ost.type === selectedType)
                .map((ost) => (
                  <OSTCard key={ost.id} ost={ost} />
                ))
            )}
          </Stack>
        </Box>
      </Center>
    </Box>
  );
}

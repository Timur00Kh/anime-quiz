"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, ButtonGroup, Card, CardBody, Center, Heading, Stack } from "@chakra-ui/react";
import { getAnime, getAnimeExternals, IAnime, IExternalLink } from "@/utils/shikiAPI";
import { AnimeCard, AnimeCardSkeleton } from "@/components/AnimeCard";
import { OSTCard } from "@/components/OSTCard";
import { OSTSkeletonList } from "@/components/OSTSkeleton";
import { useToastErr } from "@/utils/useToastErr";
import { OstType } from "world-art-parser";
import { api } from "@@convex/_generated/api";
import { useAction, useQuery } from "convex/react";
import { GetServerSidePropsContext } from "next";
import { convex } from "@/utils/convex";


type FilterType = OstType | "ALL";

export function getServerSideProps(context: GetServerSidePropsContext) {
  const id = Number(context.params?.id);
  const anime = await convex.action(api.shikiApi.parseShikimoriAnimeData, { id });
  return { props: { anime } };
}

export default function AnimePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
}): JSX.Element {
  const id = Number(params.id);
  const [anime, setAnime] = useState<IAnime | null>(null);
  const [animeExternals, setAnimeExternals] = useState<IExternalLink[]>([]);
  const waId = useMemo(() => {
    const waExternal = animeExternals.find((e) => e.kind === "world_art");
    if (waExternal) {
      const match = waExternal.url.match(/id=(\d)+/g);
      if (match) {
        return Number(match[0].split("=")[1]);
      }
    }
    return undefined;
  }, [animeExternals]);

  const [selectedType, setSelectedType] = useState<FilterType>("ALL");
  const toastErr = useToastErr();
  const parseOsts = useAction(api.worldArt.parseOstsFromWorldArt);
  const osts = useQuery(api.worldArt.getAnimeOst, { waId });
  const isLoadingOsts = useMemo(() => Boolean(osts), [osts])

  useEffect(() => {
    if (waId && !isLoadingOsts) {
      parseOsts({ waId, shikimoriId: id });
    }
  }, [waId, id, parseOsts, osts]);

  useEffect(() => {
    (async () => {
      getAnime(id)
        .then((a) => setAnime(a))
        .catch(toastErr);

      try {
        const externalLinks = (await getAnimeExternals(id)) || [];
        setAnimeExternals(externalLinks);
      } catch (e) {
        toastErr(new Error(e instanceof Error ? e.message : String(e)));
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
            {!osts ? (
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

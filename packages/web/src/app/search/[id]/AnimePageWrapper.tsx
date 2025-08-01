"use client";

import { Box, Center } from "@chakra-ui/react";
import { IAnime, IExternalLink } from "@/utils/shikiAPI";
import { AnimeCard, AnimeCardSkeleton } from "@/components/AnimeCard";
import AnimePageClient from "./AnimePageClient";
import { api } from "@@convex/_generated/api";
import { Preloaded } from "convex/react";


interface AnimePageWrapperProps {
  id: number;
  waId?: number;
  anime: IAnime | null;
  osts: Preloaded<typeof api.worldArt.getAnimeOst>;
}

export default function AnimePageWrapper({
  id,
  waId,
  anime,
  osts
}: AnimePageWrapperProps): JSX.Element {
  return (
    <Box p={5}>
      <Center>
        <Box maxW={600} w="100%">
          {anime === null ? <AnimeCardSkeleton /> : <AnimeCard anime={anime} />}

          <AnimePageClient
            id={id}
            waId={waId}
            initialOsts={osts}
          />
        </Box>
      </Center>
    </Box>
  );
} 
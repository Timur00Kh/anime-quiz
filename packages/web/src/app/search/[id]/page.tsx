import { getAnime, getAnimeExternals, IAnime, IExternalLink } from "@/utils/shikiAPI";
import AnimePageWrapper from "./AnimePageWrapper";
import { api } from "@@convex/_generated/api";
import { preloadQuery } from "convex/nextjs";

export default async function AnimePage({
  params,
}: {
  params: { id: string };
}): Promise<JSX.Element> {
  const id = Number(params.id);

  // Загружаем данные на сервере
  let anime: IAnime | null = null;
  let animeExternals: IExternalLink[] = [];

  try {
    // Загружаем аниме данные
    anime = await getAnime(id);

    // Загружаем внешние ссылки
    animeExternals = (await getAnimeExternals(id)) || [];
  } catch (error) {
    console.error("Error loading anime data:", error);
  }

  // Находим World Art ID
  const waId = (() => {
    const waExternal = animeExternals.find((e) => e.kind === "world_art");
    if (waExternal) {
      const match = waExternal.url.match(/id=(\d)+/g);
      if (match) {
        return Number(match[0].split("=")[1]);
      }
    }
    return undefined;
  })();

  const osts = await preloadQuery(api.worldArt.getAnimeOst, { waId });

  

  return (
    <AnimePageWrapper
      id={id}
      waId={waId}
      anime={anime}
      osts={osts}
    />
  );
}

const TOKEN = "-W3G1vS3THMpvK_8ICeugjpp0RvTyMl0L0MGBgvJMXs";
const USER_AGENT = "Api Test";
const DOMAIN = "https://shikimori.one";

export interface ShikiAPIAnimeSearch {
  id: number;
  name: string;
  russian: string;
  image: {
    original: string;
    preview: string;
    x96: string;
    x48: string;
  };
  url: string;
  kind: string;
  score: string;
  status: string;
  episodes: number;
  episodes_aired: number;
  aired_on: string | null;
  released_on: string | null;
}

export function getAnimes(search: string): Promise<ShikiAPIAnimeSearch[]> {
  return fetch(`${DOMAIN}/api/animes?search=${search}&limit=20`, {
    headers: { "User-Agent": USER_AGENT, Authorization: `Bearer ${TOKEN}` },
  })
    .then((res) => res.json())
    .then((animes: ShikiAPIAnimeSearch[]) =>
      animes.map((anime) => ({
        ...anime,
        image: {
          original: `${DOMAIN}${anime.image.original}`,
          preview: `${DOMAIN}${anime.image.preview}`,
          x96: `${DOMAIN}${anime.image.x96}`,
          x48: `${DOMAIN}${anime.image.x48}`,
        },
      }))
    );
}

export interface IAnime {
  id: number;
  name: string;
  russian: string;
  image: {
    original: string;
    preview: string;
    x96: string;
    x48: string;
  };
  url: string;
  kind: string;
  score: string;
  status: string;
  episodes: number;
  episodes_aired: number;
  aired_on: string | null;
  released_on: string | null;
  rating: string;
  english: string[];
  japanese: string[];
  synonyms: string[];
  license_name_ru: string;
  duration: number;
  description: string;
  description_html: string;
  description_source: string;
  franchise: string | null;
  favoured: boolean;
  anons: boolean;
  ongoing: boolean;
  thread_id: number;
  topic_id: number;
  myanimelist_id: number;
  rates_scores_stats: never[];
  rates_statuses_stats: never[];
  updated_at: string | Date | null;
  next_episode_at: string | Date | null;
  fansubbers: never[];
  fandubbers: never[];
  licensors: never[];
  genres: {
    id: number;
    name: string;
    russian: string;
    kind: never;
  }[];
  studios: never[];
  videos: never[];
  screenshots: never[];
  user_rate: never;
}

export function getAnime(id: number): Promise<IAnime> {
  return fetch(`${DOMAIN}/api/animes/${id}`, {
    headers: { "User-Agent": USER_AGENT, Authorization: `Bearer ${TOKEN}` },
  })
    .then((res) => res.json())
    .then((anime: IAnime) => ({
      ...anime,
      image: {
        original: `${DOMAIN}${anime.image.original}`,
        preview: `${DOMAIN}${anime.image.preview}`,
        x96: `${DOMAIN}${anime.image.x96}`,
        x48: `${DOMAIN}${anime.image.x48}`,
      },
    }));
}

export interface IExternalLink {
  id: number;
  kind: string;
  url: string;
  source: string;
  entry_id: number;
  entry_type: string;
  created_at: null | string | Date;
  updated_at: null | string | Date;
  imported_at: null | string | Date;
}

export function getAnimeExternals(id: number): Promise<IExternalLink[]> {
  return fetch(`${DOMAIN}/api/animes/${id}/external_links`, {
    headers: { "User-Agent": USER_AGENT, Authorization: `Bearer ${TOKEN}` },
  }).then((res) => res.json());
}

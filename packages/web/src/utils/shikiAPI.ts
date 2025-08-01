import { rateLimiter } from "./rateLimiter";

const USER_AGENT = "Api Test";
export const DOMAIN = "https://shikimori.one";
export const SHIKIMORI_URL = "https://shikimori.one";

const getToken = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('shikimori_token') || '';
};

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

export interface AnimeSearchParams {
  search?: string;
  order?: 'ranked' | 'popularity' | 'name' | 'aired_on' | 'episodes' | 'status' | 'random';
  status?: 'anons' | 'ongoing' | 'released';
  season?: string;
  score?: number;
  duration?: 'S' | 'D' | 'F';
  rating?: 'none' | 'g' | 'pg' | 'pg_13' | 'r' | 'r_plus' | 'rx';
  genre?: string[];
  studio?: string[];
  limit?: number;
  page?: number;
}

export function getAnimes(params: Partial<AnimeSearchParams> = {}): Promise<ShikiAPIAnimeSearch[]> {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v.toString()));
      } else {
        searchParams.append(key, value.toString());
      }
    }
  });

  const queryString = searchParams.toString();
  
  return rateLimiter.enqueue(() => 
    fetch(`${DOMAIN}/api/animes${queryString ? `?${queryString}` : ''}`, {
      headers: { "User-Agent": USER_AGENT, Authorization: `Bearer ${getToken()}` },
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
      )
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
  return rateLimiter.enqueue(() =>
    fetch(`${DOMAIN}/api/animes/${id}`, {
      headers: { "User-Agent": USER_AGENT, Authorization: `Bearer ${getToken()}` },
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
      }))
  );
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
  return rateLimiter.enqueue(() =>
    fetch(`${DOMAIN}/api/animes/${id}/external_links`, {
      headers: { "User-Agent": USER_AGENT, Authorization: `Bearer ${getToken()}` },
    }).then((res) => res.json())
  );
}

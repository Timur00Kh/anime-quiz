// Common types for the entire monorepo
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
    aired_on: string;
    released_on: string;
}

export interface IExternalLink {
    id: number;
    kind: string;
    url: string;
    source: string;
    entry_id: number;
    entry_type: string;
    created_at: string;
    updated_at: string;
}

export interface IAuthor {
    id: number;
    name: string;
    href: string;
    role: string;
}

export interface OST {
    id: number;
    unparsed_type: string;
    type: "OP" | "ED" | "TRAILER" | "UNRECOGNIZED";
    href: string;
    video: string;
    title: string;
    authors: IAuthor[];
    ost_order: number;
}

export enum OstType {
    OP = "OP",
    ED = "ED",
    TRAILER = "TRAILER",
    UNRECOGNIZED = "UNRECOGNIZED"
}

// Common utilities
export const API_ENDPOINTS = {
    SHIKIMORI: "https://shikimori.one",
    WORLD_ART: "http://www.world-art.ru",
} as const;

export const ANIME_KINDS = {
    TV: "tv",
    MOVIE: "movie",
    OVA: "ova",
    ONA: "ona",
    SPECIAL: "special",
    MUSIC: "music",
} as const; 
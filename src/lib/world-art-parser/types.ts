export enum OstType {
  OP = "OP",
  ED = "ED", 
  TRAILER = "TRAILER",
  UNRECOGNIZED = "UNRECOGNIZED",
}

export interface Author {
  id: number;
  name: string;
  href: string;
  role: string;
}

export interface OST {
  id: number;
  unparsed_type: string;
  type: OstType;
  href: string;
  video: string;
  title: string;
  authors: Author[];
  ost_order: number;
  storagePath?: string;
  videoUrl?: string;
  downloadError?: string;
}

export interface ParsedResult {
  osts: OST[];
  rawData?: any;
  parserVersion: string;
  parsedAt: number;
}

export interface ParserConfig {
  enableCache: boolean;
  cacheTtl: number;
  domain: string;
  encoding: string;
  requestTimeout: number;
  userAgent?: string;
}

export interface ParseProgress {
  phase: 'fetching_links' | 'parsing_ost' | 'processing_video' | 'complete';
  current: number;
  total: number;
  message?: string;
}

export interface ParserError extends Error {
  code: 'NETWORK_ERROR' | 'PARSE_ERROR' | 'VALIDATION_ERROR' | 'TIMEOUT_ERROR';
  waId?: number;
  url?: string;
}

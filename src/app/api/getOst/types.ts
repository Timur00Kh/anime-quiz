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
  video: string; // original World-Art video URL
  title: string;
  authors: Author[];
  ost_order: number;
  storagePath?: string; // path in Supabase Storage if uploaded
  videoUrl?: string; // signed URL for video playback
  downloadError?: string; // error message if video download/upload failed
} 
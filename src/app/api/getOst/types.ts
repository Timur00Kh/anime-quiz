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
  order?: number;
  a?: any;
} 
import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";
import * as os from "os";
import { ChildNode } from "domhandler/lib/node";

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("waId");
  if (!id) {
    return NextResponse.json({ error: "Кажется нет waId" }, { status: 400 });
  }

  const osts = await getLinkList(id);
  const fullOSTs = [];

  for (const ost of osts) {
    const fullOst = await getFullOST(ost);
    fullOSTs.push(fullOst);
  }

  return NextResponse.json(fullOSTs);
}

async function getFullOST(ost: Partial<OST>): Promise<OST> {
  const html = await fetch(`http://www.world-art.ru/animation/${ost.href}`, {
    cache: "force-cache",
  })
    .then((res) => res.arrayBuffer())
    .then((buffer) => new TextDecoder("windows-1251").decode(buffer));

  const $ = cheerio.load(html);
  // noinspection TypeScriptValidateTypes
  const $title = $('td[width="20"] ~ td[valign="top"] font[size="3"]');
  const title = $title
    .text()
    .replace(/композиция:?/i, "")
    .trim();

  // noinspection TypeScriptValidateTypes
  const $videoSource = $("video source");
  const video = ($videoSource.attr("src") || "").replace(/^\.\./, "");

  // noinspection TypeScriptValidateTypes
  const $a = $('td[width="20"] ~ td[valign="top"] p.review');
  let a = $a[0] ? getSiblings($a[0].childNodes[0]) : [];

  const authors: Author[] = [];
  let currentRole;
  for (let node of a) {
    if (node.type === "text") {
      const t = $(node).text();
      if (t.length > 3) {
        currentRole = $(node).text().replace(":", "").trim();
      }
    }
    if (node.type === "tag" && node.tagName === "a") {
      const href = node.attributes.find((e) => e.name === "href");
      const match = href?.value.match(/id=(\d)+/g);
      let id;
      if (match) {
        const [idStr] = match;
        id = Number(idStr.split("=")[1]);
      }

      authors.push({
        id: id || 0,
        role: currentRole || 'Unknown',
        href: href?.value || '',
        name: $(node).text(),
      });
    }
  }

  return {
    id: ost.id || 0,
    authors,
    href: ost.href || '',
    order: 0,
    ost_order: ost.ost_order || 0,
    title,
    type: ost.type || OstType.UNRECOGNIZED,
    unparsed_type: ost.unparsed_type || '',
    video: video,
  };
}

function getSiblings(sibling: ChildNode): ChildNode[] {
  const siblings: ChildNode[] = [sibling];
  let current: ChildNode | null | undefined = sibling;
  do {
    siblings.push(current);
    current = current?.nextSibling;
  } while (current);
  return siblings.filter(Boolean);
}

async function getLinkList(id: string): Promise<Partial<OST>[]> {
  const html = await fetch(
    `http://www.world-art.ru/animation/animation_trailers.php?id=${id}`
  )
    .then((res) => res.arrayBuffer())
    .then((buffer) => new TextDecoder("windows-1251").decode(buffer));

  const $ = cheerio.load(html);
  // noinspection TypeScriptValidateTypes
  const $links = $('font[size="2"] ~ table').find("a");
  let arr: Partial<OST>[] = [];
  $links.each((i, el) => {
    const href = el.attributes.find((a) => a.name === "href");
    arr.push({ unparsed_type: $(el).text(), href: href.value, ost_order: i });
  });

  arr = arr.map((link) => {
    let type, id;
    const unparsed_type = link.unparsed_type
      ? link.unparsed_type.toLowerCase()
      : undefined;

    if (unparsed_type === undefined) {
      type = OstType.UNRECOGNIZED;
    } else if (unparsed_type.includes("заставка")) {
      type = OstType.OP;
    } else if (unparsed_type.includes("концовка")) {
      type = OstType.ED;
    } else if (unparsed_type.includes("трейлер")) {
      type = OstType.TRAILER;
    } else {
      type = OstType.UNRECOGNIZED;
    }

    if (link.href) {
      const match = link.href.match(/trailer_id=(\d)+/g);
      if (match) {
        const [idStr] = match;
        id = Number(idStr.split("=")[1]);
      }
    }

    return { ...link, type, id };
  });

  return arr;
}

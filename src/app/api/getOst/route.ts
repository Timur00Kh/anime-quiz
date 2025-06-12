import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";
import * as os from "os";
import { ChildNode } from "domhandler/lib/node";
import { Author, OST, OstType } from "./types";
import { getExistingParseResults, saveParseResults } from "@/utils/supabase";
import { createClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'ost_videos';
const WA_DOMAIN = 'http://www.world-art.ru';

async function ensureBucketExists(serviceClient: any) {
  const { data: bucket, error } = await serviceClient.storage.getBucket(BUCKET_NAME);
  
  if (error && error.message.includes('not found')) {
    const { data, error: createError } = await serviceClient.storage.createBucket(BUCKET_NAME, {
      public: false,
      allowedMimeTypes: ['video/mp4']
    });
    if (createError) throw createError;
    return data;
  } else if (error) {
    throw error;
  }
  
  return bucket;
}

async function processOstVideo(ost: OST, serviceClient: any): Promise<OST> {
  if (!ost.video && !ost.storagePath) {
    return ost;
  }

  try {
    let storagePath = ost.storagePath;

    // Only download and upload if we don't have a storage path
    if (!storagePath) {
      // Ensure video URL has domain
      const videoUrl = ost.video.startsWith('http') 
        ? ost.video 
        : `${WA_DOMAIN}${ost.video}`;

      // Download video from World-Art
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
      }
      
      const videoBlob = await response.blob();
      storagePath = `worldart/ost_${ost.id}.mp4`;

      // Upload to Supabase Storage
      const { error: uploadError } = await serviceClient.storage
        .from(BUCKET_NAME)
        .upload(storagePath, videoBlob, {
          contentType: 'video/mp4',
          upsert: true
        });

      if (uploadError) throw uploadError;
    }

    // Generate signed URL for either existing or newly uploaded file
    const { data: urlData, error: urlError } = await serviceClient.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, 3600);

    if (urlError) throw urlError;
    
    return {
      ...ost,
      storagePath,
      videoUrl: urlData.signedUrl
    };
  } catch (error: any) {
    console.error(`Error processing video for OST ${ost.id}:`, error);
    return {
      ...ost,
      downloadError: error.message || 'Unknown error occurred while processing video'
    };
  }
}

// Simple memoization utility
const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Development mode check
const isDev = process.env.NODE_ENV === 'development';

function getSiblings(start: ChildNode): ChildNode[] {
  const siblings: ChildNode[] = [];
  let current: ChildNode | null | undefined = start;
  while (current) {
    siblings.push(current);
    current = current.nextSibling;
  }
  return siblings;
}

const getFullOSTImpl = async (ost: Partial<OST>): Promise<OST> => {
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
    ost_order: ost.ost_order || 0,
    title,
    type: ost.type || OstType.UNRECOGNIZED,
    unparsed_type: ost.unparsed_type || '',
    video: video || '',
  };
};

const getLinkListImpl = async (id: string): Promise<Partial<OST>[]> => {
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
    arr.push({ unparsed_type: $(el).text(), href: href?.value, ost_order: i });
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
};

// memoized versions in dev mode, regular versions in prod
const getLinkList = isDev ? memoize(getLinkListImpl) : getLinkListImpl;
const getFullOST = isDev ? memoize(getFullOSTImpl) : getFullOSTImpl;

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: 'Server configuration error: Missing Supabase credentials' },
      { status: 500 }
    );
  }

  const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("waId");
  if (!id) {
    return NextResponse.json({ error: "Кажется нет waId" }, { status: 400 });
  }

  try {
    // Check if we have recent parse results
    const existingResults = await getExistingParseResults(Number(id));
    if (existingResults) {
      // Process videos for existing results to get fresh signed URLs
      await ensureBucketExists(serviceClient);
      const processedOsts = await Promise.all(
        existingResults.osts.map(ost => processOstVideo(ost, serviceClient))
      );
      return NextResponse.json(processedOsts);
    }

    // If not, parse and save
    const osts = await getLinkList(id);
    const fullOSTs = [];

    for (const ost of osts) {
      const fullOst = await getFullOST(ost);
      fullOSTs.push(fullOst);
    }

    // Process videos and save results
    await ensureBucketExists(serviceClient);
    const processedOsts = await Promise.all(
      fullOSTs.map(ost => processOstVideo(ost, serviceClient))
    );

    // Remove videoUrl before saving to database as it's temporary
    const ostsForStorage = processedOsts.map(({ videoUrl, ...rest }) => rest);
    await saveParseResults(Number(id), undefined, ostsForStorage);

    // Return processed OSTs with videoUrl to the client
    return NextResponse.json(processedOsts);
  } catch (error: any) {
    console.error('Error in getOst:', error);

    // Handle specific error types
    if (error.message?.includes('Supabase')) {
      return NextResponse.json(
        { error: 'Storage service unavailable' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch OST data' },
      { status: 500 }
    );
  }
}

// Add route segment config
export const dynamic = 'force-dynamic'; // Ensure we can use Response headers
export const revalidate = 240; // Cache for 4 minutes

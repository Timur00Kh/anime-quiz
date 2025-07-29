import { createClient } from '@supabase/supabase-js';
import { OST } from '@/lib/world-art-parser/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for public operations (database queries)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public'
  }
});

// Client with service role for storage operations
export const serviceClient = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    }
  })
  : supabase;

// Types for our database schema
export interface WaParseLog {
  id: string;
  worldart_anime_id: number;
  shikimori_id?: number;
  parser_version: string;
  parsed_at: string;
  osts: OST[];
  raw?: any;
}

// Helper functions for working with parse logs
export async function saveParseResults(worldartAnimeId: number, shikimoriId: number | undefined, osts: OST[], raw?: any) {
  const parseLog: Omit<WaParseLog, 'id' | 'parsed_at'> = {
    worldart_anime_id: worldartAnimeId,
    shikimori_id: shikimoriId,
    parser_version: '1.0.0', // Update this when parser logic changes
    osts,
    raw
  };

  const { data, error } = await serviceClient
    .from('wa_parse_logs')
    .insert([parseLog])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getExistingParseResults(worldartAnimeId: number): Promise<WaParseLog | null> {
  const { data, error } = await serviceClient
    .from('wa_parse_logs')
    .select('*')
    .eq('worldart_anime_id', worldartAnimeId)
    .order('parsed_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // No rows returned
      return null;
    }
    throw error;
  }

  return data;
} 
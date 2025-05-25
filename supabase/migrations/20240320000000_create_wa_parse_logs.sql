-- Create wa_parse_logs table
CREATE TABLE wa_parse_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worldart_anime_id INTEGER NOT NULL,
  shikimori_id INTEGER,
  parser_version VARCHAR NOT NULL,
  parsed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  osts JSONB NOT NULL,
  raw JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(worldart_anime_id, parser_version)
);

-- Create index for faster lookups
CREATE INDEX idx_wa_parse_logs_worldart_anime_id ON wa_parse_logs(worldart_anime_id);

-- Create index for sorting by parsed_at
CREATE INDEX idx_wa_parse_logs_parsed_at ON wa_parse_logs(parsed_at DESC);

-- Add RLS policies
ALTER TABLE wa_parse_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
  ON wa_parse_logs
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated insert
CREATE POLICY "Allow authenticated insert"
  ON wa_parse_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true); 
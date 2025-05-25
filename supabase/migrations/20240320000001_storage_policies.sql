-- Enable storage by creating policies
BEGIN;

-- Create policy to allow public read access to ost_videos bucket
CREATE POLICY "Allow public read access on ost_videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ost_videos');

-- Create policy to allow service role to upload videos
CREATE POLICY "Allow service role to upload videos"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'ost_videos');

-- Create policy to allow service role to update videos
CREATE POLICY "Allow service role to update videos"
ON storage.objects FOR UPDATE
TO service_role
USING (bucket_id = 'ost_videos');

COMMIT; 
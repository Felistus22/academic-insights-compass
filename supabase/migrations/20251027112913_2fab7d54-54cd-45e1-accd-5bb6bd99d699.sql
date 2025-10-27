-- Create storage bucket for report cards
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('report-cards', 'report-cards', true, 10485760, ARRAY['application/pdf']);

-- Create policy to allow authenticated users to upload report cards
CREATE POLICY "Authenticated users can upload report cards"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'report-cards' AND
  auth.uid() IS NOT NULL
);

-- Create policy to allow public access to view report cards
CREATE POLICY "Anyone can view report cards"
ON storage.objects
FOR SELECT
USING (bucket_id = 'report-cards');

-- Create policy to allow authenticated users to delete report cards
CREATE POLICY "Authenticated users can delete report cards"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'report-cards' AND
  auth.uid() IS NOT NULL
);
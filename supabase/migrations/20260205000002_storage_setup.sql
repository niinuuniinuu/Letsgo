-- 6. Storage Bucket Setup
-- Note: This assumes the 'storage' schema and tables exist (standard in Supabase)

-- Create Bucket 'question-images'
INSERT INTO storage.buckets (id, name, public)
VALUES ('question-images', 'question-images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for Storage
-- 1. Public Read Access
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'question-images' );

-- 2. Admin Upload/Delete Access
-- Using the same Admin Profile check as before
CREATE POLICY "Admin Write Access"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'question-images' 
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin Update Access"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'question-images' 
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admin Delete Access"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'question-images' 
    AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

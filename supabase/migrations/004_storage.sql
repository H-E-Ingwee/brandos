-- ============================================================
-- BrandOS Storage Buckets — Run in Supabase SQL Editor
-- ============================================================

-- Create storage bucket for brand assets (logos, images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-assets', 'brand-assets', true, 5242880,
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own brand assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'brand-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own brand assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'brand-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own brand assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'brand-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view brand assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'brand-assets');

-- Add new columns to visual_identity
ALTER TABLE public.visual_identity
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS custom_colors jsonb,
  ADD COLUMN IF NOT EXISTS custom_fonts jsonb,
  ADD COLUMN IF NOT EXISTS ai_recommendations jsonb,
  ADD COLUMN IF NOT EXISTS brand_guidelines_generated boolean DEFAULT false;
-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'app-91hx0yyrhd6p_property_images',
  'app-91hx0yyrhd6p_property_images',
  true,
  1048576,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
);

-- Storage policies for property images
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'app-91hx0yyrhd6p_property_images');

CREATE POLICY "Public can view property images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'app-91hx0yyrhd6p_property_images');

CREATE POLICY "Authenticated users can update their property images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'app-91hx0yyrhd6p_property_images');

CREATE POLICY "Authenticated users can delete their property images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'app-91hx0yyrhd6p_property_images');
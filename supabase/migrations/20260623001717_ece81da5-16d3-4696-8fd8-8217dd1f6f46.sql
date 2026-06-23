-- Lock down the unused private 'site-images' bucket with explicit deny-all RLS policies.
-- service_role bypasses RLS, so admin/server-side uploads still work if needed in the future.
CREATE POLICY "site-images deny select" ON storage.objects FOR SELECT USING (bucket_id <> 'site-images');
CREATE POLICY "site-images deny insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id <> 'site-images');
CREATE POLICY "site-images deny update" ON storage.objects FOR UPDATE USING (bucket_id <> 'site-images') WITH CHECK (bucket_id <> 'site-images');
CREATE POLICY "site-images deny delete" ON storage.objects FOR DELETE USING (bucket_id <> 'site-images');
CREATE TABLE public.site_content (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read site content" ON public.site_content FOR SELECT USING (true);
INSERT INTO public.site_content (id, data) VALUES ('main', '{}'::jsonb);
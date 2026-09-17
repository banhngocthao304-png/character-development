CREATE TABLE public.body_targets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  weight_kg numeric,
  body_fat_percent numeric,
  bmi numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.body_targets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.body_targets TO authenticated;
GRANT ALL ON public.body_targets TO service_role;

ALTER TABLE public.body_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "single user app access body_targets" ON public.body_targets
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TRIGGER set_body_targets_updated_at BEFORE UPDATE ON public.body_targets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE UNIQUE INDEX body_targets_user_id_key ON public.body_targets(user_id);

INSERT INTO public.body_targets (user_id, weight_kg, body_fat_percent, bmi)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 58, 30, 21.8);
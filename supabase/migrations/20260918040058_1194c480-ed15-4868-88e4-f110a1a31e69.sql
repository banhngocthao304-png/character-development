CREATE TABLE public.supplements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  name text NOT NULL,
  dosage numeric NOT NULL,
  unit text NOT NULL,
  frequency text NOT NULL,
  timing text,
  note text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplements TO anon;
GRANT ALL ON public.supplements TO service_role;
ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "single user app access supplements" ON public.supplements FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER update_supplements_updated_at BEFORE UPDATE ON public.supplements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX supplements_user_sort_idx ON public.supplements (user_id, sort_order);
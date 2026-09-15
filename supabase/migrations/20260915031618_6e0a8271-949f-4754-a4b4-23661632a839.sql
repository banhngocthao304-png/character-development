-- Single-user app: one fixed owner id, no auth required.
DO $$
DECLARE
  t text;
  owner uuid := '00000000-0000-0000-0000-000000000001';
  fk record;
  pol record;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'profiles','pt_settings','pt_sessions','pt_session_exercises',
    'body_measurements','recipes','recipe_ingredients','recipe_steps','recipe_tags',
    'meal_plan_days','planned_meals','planned_meal_ingredients'
  ]) LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      -- drop FK constraints on user_id -> auth.users
      FOR fk IN
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace ns ON ns.oid = rel.relnamespace
        WHERE ns.nspname = 'public' AND rel.relname = t AND con.contype = 'f'
          AND con.confrelid = 'auth.users'::regclass
      LOOP
        EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', t, fk.conname);
      END LOOP;

      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN user_id SET DEFAULT %L', t, owner);
      EXECUTE format('UPDATE public.%I SET user_id = %L WHERE user_id IS DISTINCT FROM %L', t, owner, owner);

      -- replace policies with open app access (single-user private app)
      FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP
        EXECUTE format('DROP POLICY %I ON public.%I', pol.policyname, t);
      END LOOP;

      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon, authenticated', t);
      EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)',
        'single user app access ' || t, t
      );
    END IF;
  END LOOP;
END $$;

-- Storage: meal photos accessible without sign-in
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='storage' AND tablename='objects' LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "meal photos single user access"
ON storage.objects FOR ALL TO anon, authenticated
USING (bucket_id = 'meal-photos')
WITH CHECK (bucket_id = 'meal-photos');
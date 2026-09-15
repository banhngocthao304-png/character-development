CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN
  INSERT INTO public.profiles (user_id, display_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name') ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.pt_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_sessions INTEGER,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pt_cycle_dates CHECK (end_date > start_date),
  CONSTRAINT pt_cycle_sessions CHECK (total_sessions IS NULL OR total_sessions > 0)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pt_cycles TO authenticated;
GRANT ALL ON public.pt_cycles TO service_role;
ALTER TABLE public.pt_cycles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pt_cycles" ON public.pt_cycles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_pt_cycles_updated BEFORE UPDATE ON public.pt_cycles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.pt_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  cycle_id UUID NOT NULL REFERENCES public.pt_cycles(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_type TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cycle_id, session_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pt_sessions TO authenticated;
GRANT ALL ON public.pt_sessions TO service_role;
ALTER TABLE public.pt_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pt_sessions" ON public.pt_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_pt_sessions_updated BEFORE UPDATE ON public.pt_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  measurement_date DATE NOT NULL,
  weight_kg NUMERIC(6,2),
  waist_cm NUMERIC(6,2),
  hip_cm NUMERIC(6,2),
  bust_cm NUMERIC(6,2),
  thigh_cm NUMERIC(6,2),
  arm_cm NUMERIC(6,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, measurement_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.body_measurements TO authenticated;
GRANT ALL ON public.body_measurements TO service_role;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own body_measurements" ON public.body_measurements FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_body_updated BEFORE UPDATE ON public.body_measurements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  photo_path TEXT,
  prep_minutes INTEGER,
  servings INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipes TO authenticated;
GRANT ALL ON public.recipes TO service_role;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own recipes" ON public.recipes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_recipes_updated BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity NUMERIC(10,2),
  unit TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_ingredients TO authenticated;
GRANT ALL ON public.recipe_ingredients TO service_role;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own recipe_ingredients" ON public.recipe_ingredients FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.recipe_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL DEFAULT 1,
  instruction TEXT NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_steps TO authenticated;
GRANT ALL ON public.recipe_steps TO service_role;
ALTER TABLE public.recipe_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own recipe_steps" ON public.recipe_steps FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.recipe_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  tag TEXT NOT NULL
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recipe_tags TO authenticated;
GRANT ALL ON public.recipe_tags TO service_role;
ALTER TABLE public.recipe_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own recipe_tags" ON public.recipe_tags FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.meal_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  plan_date DATE NOT NULL,
  daily_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, plan_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_plan_days TO authenticated;
GRANT ALL ON public.meal_plan_days TO service_role;
ALTER TABLE public.meal_plan_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own meal_plan_days" ON public.meal_plan_days FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_mpd_updated BEFORE UPDATE ON public.meal_plan_days FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.planned_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  meal_plan_day_id UUID NOT NULL REFERENCES public.meal_plan_days(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL,
  meal_name TEXT NOT NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  photo_path TEXT,
  planned_time TIME,
  notes TEXT,
  logged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planned_meals TO authenticated;
GRANT ALL ON public.planned_meals TO service_role;
ALTER TABLE public.planned_meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own planned_meals" ON public.planned_meals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_pm_updated BEFORE UPDATE ON public.planned_meals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.planned_meal_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  planned_meal_id UUID NOT NULL REFERENCES public.planned_meals(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity NUMERIC(10,2),
  unit TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planned_meal_ingredients TO authenticated;
GRANT ALL ON public.planned_meal_ingredients TO service_role;
ALTER TABLE public.planned_meal_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own planned_meal_ingredients" ON public.planned_meal_ingredients FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  log_date DATE NOT NULL,
  meal_type TEXT NOT NULL,
  meal_name TEXT NOT NULL,
  planned_meal_id UUID REFERENCES public.planned_meals(id) ON DELETE SET NULL,
  recipe_id UUID REFERENCES public.recipes(id) ON DELETE SET NULL,
  actual_time TIME,
  photo_path TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_logs TO authenticated;
GRANT ALL ON public.meal_logs TO service_role;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own meal_logs" ON public.meal_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_ml_updated BEFORE UPDATE ON public.meal_logs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.meal_log_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  meal_log_id UUID NOT NULL REFERENCES public.meal_logs(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity NUMERIC(10,2),
  unit TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_log_ingredients TO authenticated;
GRANT ALL ON public.meal_log_ingredients TO service_role;
ALTER TABLE public.meal_log_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own meal_log_ingredients" ON public.meal_log_ingredients FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_pt_sessions_cycle ON public.pt_sessions(cycle_id);
CREATE INDEX idx_body_user_date ON public.body_measurements(user_id, measurement_date DESC);
CREATE INDEX idx_planned_meals_day ON public.planned_meals(meal_plan_day_id);
CREATE INDEX idx_meal_logs_user_date ON public.meal_logs(user_id, log_date DESC);
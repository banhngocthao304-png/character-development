DROP TABLE IF EXISTS public.meal_log_ingredients;
DROP TABLE IF EXISTS public.meal_logs;
ALTER TABLE public.planned_meals DROP COLUMN IF EXISTS logged;

DROP TABLE IF EXISTS public.pt_sessions;
DROP TABLE IF EXISTS public.pt_cycles;

CREATE TABLE public.pt_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users ON DELETE CASCADE,
  period_start_day INTEGER NOT NULL DEFAULT 15,
  sessions_per_period INTEGER NOT NULL DEFAULT 16,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pt_settings_day CHECK (period_start_day BETWEEN 1 AND 28),
  CONSTRAINT pt_settings_sessions CHECK (sessions_per_period > 0)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pt_settings TO authenticated;
GRANT ALL ON public.pt_settings TO service_role;
ALTER TABLE public.pt_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pt_settings" ON public.pt_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_pt_settings_updated BEFORE UPDATE ON public.pt_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.pt_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_type TEXT,
  session_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, session_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pt_sessions TO authenticated;
GRANT ALL ON public.pt_sessions TO service_role;
ALTER TABLE public.pt_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pt_sessions" ON public.pt_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_pt_sessions_updated BEFORE UPDATE ON public.pt_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_pt_sessions_user_date ON public.pt_sessions(user_id, session_date DESC);

CREATE TABLE public.pt_session_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  pt_session_id UUID NOT NULL REFERENCES public.pt_sessions(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  weight NUMERIC(8,2),
  weight_unit TEXT NOT NULL DEFAULT 'kg',
  sets INTEGER,
  reps INTEGER,
  exercise_note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pt_session_exercises TO authenticated;
GRANT ALL ON public.pt_session_exercises TO service_role;
ALTER TABLE public.pt_session_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pt_session_exercises" ON public.pt_session_exercises FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_pt_ex_updated BEFORE UPDATE ON public.pt_session_exercises FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_pt_ex_session ON public.pt_session_exercises(pt_session_id);
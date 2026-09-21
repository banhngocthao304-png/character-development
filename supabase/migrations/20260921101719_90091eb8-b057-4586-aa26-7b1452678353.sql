ALTER TABLE public.pt_session_exercises
  ADD COLUMN exercise_library_id uuid REFERENCES public.exercise_library(id) ON DELETE SET NULL;

CREATE INDEX idx_pt_session_exercises_library_id
  ON public.pt_session_exercises(exercise_library_id);

UPDATE public.exercise_library
SET aliases = (
  SELECT ARRAY(
    SELECT DISTINCT alias_value
    FROM unnest(
      aliases || CASE exercise_name
        WHEN 'Lat Pulldown' THEN ARRAY['lat pull down']::text[]
        WHEN 'Wide Grip Lat Pulldown' THEN ARRAY['wide grip lat pull down']::text[]
        WHEN 'Close Grip Lat Pulldown' THEN ARRAY['close grip lat pull down']::text[]
        WHEN 'Single Arm Lat Pulldown' THEN ARRAY['single arm lat pull down']::text[]
        WHEN 'Seated Cable Row' THEN ARRAY['seated row']::text[]
        WHEN 'Dumbbell Row' THEN ARRAY['dumbbell bent over row']::text[]
        WHEN 'Chest Press Machine' THEN ARRAY['chest press','machine press chest']::text[]
        WHEN 'Dumbbell Bench Press' THEN ARRAY['dumbbell chest press']::text[]
        WHEN 'Incline Bench Press' THEN ARRAY['incline chest press','incline barbell press']::text[]
        WHEN 'Incline Dumbbell Press' THEN ARRAY['incline dumbbell chest press']::text[]
        WHEN 'Bicep Curl' THEN ARRAY['bicep curls','biceps curls']::text[]
        WHEN 'Tricep Pushdown' THEN ARRAY['tricep push down','triceps push down']::text[]
        WHEN 'Overhead Tricep Extension' THEN ARRAY['tricep extension','triceps extension']::text[]
        WHEN 'Shoulder Press' THEN ARRAY['barbell shoulder press']::text[]
        WHEN 'Rear Delt Fly' THEN ARRAY['rear delt flies']::text[]
        WHEN 'Rear Delt Machine' THEN ARRAY['reverse pec-deck','reverse fly machine']::text[]
        ELSE '{}'::text[]
      END
    ) AS alias_value
    WHERE btrim(alias_value) <> ''
  )
)
WHERE exercise_name IN (
  'Lat Pulldown','Wide Grip Lat Pulldown','Close Grip Lat Pulldown','Single Arm Lat Pulldown',
  'Seated Cable Row','Dumbbell Row','Chest Press Machine','Dumbbell Bench Press',
  'Incline Bench Press','Incline Dumbbell Press','Bicep Curl','Tricep Pushdown',
  'Overhead Tricep Extension','Shoulder Press','Rear Delt Fly','Rear Delt Machine'
);

CREATE OR REPLACE FUNCTION public.resolve_exercise_library_id(_exercise_name text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH wanted AS (
    SELECT lower(regexp_replace(btrim(_exercise_name), '[^a-zA-Z0-9]+', ' ', 'g')) AS normalized
  ), candidates AS (
    SELECT library.id
    FROM public.exercise_library AS library
    CROSS JOIN wanted
    WHERE lower(regexp_replace(btrim(library.exercise_name), '[^a-zA-Z0-9]+', ' ', 'g')) = wanted.normalized
       OR EXISTS (
         SELECT 1
         FROM unnest(library.aliases) AS alias_name
         WHERE lower(regexp_replace(btrim(alias_name), '[^a-zA-Z0-9]+', ' ', 'g')) = wanted.normalized
       )
    ORDER BY CASE
      WHEN lower(regexp_replace(btrim(library.exercise_name), '[^a-zA-Z0-9]+', ' ', 'g')) = wanted.normalized THEN 0
      ELSE 1
    END, library.exercise_name
    LIMIT 1
  )
  SELECT id FROM candidates
$$;

CREATE OR REPLACE FUNCTION public.sync_pt_exercise_library_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.exercise_library_id IS NULL OR NEW.exercise_name IS DISTINCT FROM OLD.exercise_name THEN
    NEW.exercise_library_id := public.resolve_exercise_library_id(NEW.exercise_name);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_pt_exercise_library_id
  BEFORE INSERT OR UPDATE OF exercise_name, exercise_library_id
  ON public.pt_session_exercises
  FOR EACH ROW EXECUTE FUNCTION public.sync_pt_exercise_library_id();

UPDATE public.pt_session_exercises
SET exercise_library_id = public.resolve_exercise_library_id(exercise_name)
WHERE exercise_library_id IS NULL;
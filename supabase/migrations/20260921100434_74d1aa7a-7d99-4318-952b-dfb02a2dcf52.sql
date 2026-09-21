ALTER TABLE public.exercise_library
  ADD COLUMN primary_muscle_groups text[] NOT NULL DEFAULT '{}',
  ADD COLUMN secondary_muscle_groups text[] NOT NULL DEFAULT '{}';

UPDATE public.exercise_library
SET
  primary_muscle_groups = CASE primary_muscle_group
    WHEN 'Glutes' THEN ARRAY['Glutes']::text[]
    WHEN 'Quads' THEN ARRAY['Quads']::text[]
    WHEN 'Hamstrings' THEN ARRAY['Hamstrings']::text[]
    WHEN 'Back' THEN ARRAY['Back']::text[]
    WHEN 'Chest' THEN ARRAY['Chest']::text[]
    WHEN 'Shoulders' THEN ARRAY['Shoulders']::text[]
    WHEN 'Biceps' THEN ARRAY['Arms']::text[]
    WHEN 'Triceps' THEN ARRAY['Arms']::text[]
    WHEN 'Core' THEN ARRAY['Core']::text[]
    ELSE '{}'::text[]
  END,
  secondary_muscle_groups = CASE secondary_muscle_group
    WHEN 'Glutes' THEN ARRAY['Glutes']::text[]
    WHEN 'Quads' THEN ARRAY['Quads']::text[]
    WHEN 'Hamstrings' THEN ARRAY['Hamstrings']::text[]
    WHEN 'Back' THEN ARRAY['Back']::text[]
    WHEN 'Chest' THEN ARRAY['Chest']::text[]
    WHEN 'Shoulders' THEN ARRAY['Shoulders']::text[]
    WHEN 'Biceps' THEN ARRAY['Arms']::text[]
    WHEN 'Triceps' THEN ARRAY['Arms']::text[]
    WHEN 'Forearms' THEN ARRAY['Arms']::text[]
    WHEN 'Core' THEN ARRAY['Core']::text[]
    ELSE '{}'::text[]
  END;

UPDATE public.exercise_library
SET primary_muscle_groups = ARRAY['Quads','Glutes'],
    secondary_muscle_groups = ARRAY['Hamstrings']
WHERE exercise_name IN (
  'Bulgarian Split Squat', 'Back Squat', 'Front Squat', 'Goblet Squat',
  'Smith Machine Squat', 'Hack Squat'
);

UPDATE public.exercise_library
SET primary_muscle_groups = ARRAY['Quads','Glutes'],
    secondary_muscle_groups = '{}'
WHERE exercise_name IN ('Leg Press', 'Single Leg Press');

UPDATE public.exercise_library
SET primary_muscle_groups = ARRAY['Chest'],
    secondary_muscle_groups = ARRAY['Shoulders','Arms']
WHERE exercise_name IN (
  'Bench Press', 'Barbell Bench Press', 'Dumbbell Bench Press',
  'Incline Bench Press', 'Incline Dumbbell Press', 'Chest Press Machine',
  'Smith Machine Bench Press', 'Push Up'
);

UPDATE public.exercise_library
SET primary_muscle_groups = ARRAY['Shoulders'],
    secondary_muscle_groups = ARRAY['Arms']
WHERE exercise_name IN (
  'Shoulder Press', 'Dumbbell Shoulder Press', 'Machine Shoulder Press', 'Arnold Press'
);

UPDATE public.exercise_library
SET primary_muscle_groups = ARRAY['Back'],
    secondary_muscle_groups = ARRAY['Arms']
WHERE primary_muscle_group = 'Back' AND secondary_muscle_group = 'Biceps';

UPDATE public.exercise_library
SET primary_muscle_groups = ARRAY['Glutes','Hamstrings'],
    secondary_muscle_groups = ARRAY['Back']
WHERE exercise_name = 'Sumo Deadlift';

UPDATE public.exercise_library
SET primary_muscle_groups = ARRAY['Hamstrings','Back'],
    secondary_muscle_groups = ARRAY['Glutes']
WHERE exercise_name = 'Deadlift';

UPDATE public.exercise_library
SET primary_muscle_groups = ARRAY['Glutes','Hamstrings'],
    secondary_muscle_groups = ARRAY['Core']
WHERE exercise_name = 'Kettlebell Swing';

UPDATE public.exercise_library
SET primary_muscle_groups = ARRAY['Quads','Glutes','Shoulders'],
    secondary_muscle_groups = ARRAY['Core','Arms']
WHERE exercise_name = 'Thruster';

UPDATE public.exercise_library
SET primary_muscle_groups = ARRAY['Chest','Quads'],
    secondary_muscle_groups = ARRAY['Shoulders','Arms','Core']
WHERE exercise_name = 'Burpee';

UPDATE public.exercise_library
SET primary_muscle_groups = ARRAY['Core','Back'],
    secondary_muscle_groups = ARRAY['Glutes']
WHERE exercise_name = 'Farmer Carry';

UPDATE public.exercise_library
SET primary_muscle_groups = ARRAY['Back'],
    secondary_muscle_groups = ARRAY['Core']
WHERE exercise_name = 'Rowing Machine';
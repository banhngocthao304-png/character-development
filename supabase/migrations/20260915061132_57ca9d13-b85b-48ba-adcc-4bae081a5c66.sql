ALTER TABLE public.body_measurements RENAME COLUMN hip_cm TO hips_cm;
ALTER TABLE public.body_measurements RENAME COLUMN thigh_cm TO thighs_cm;
ALTER TABLE public.body_measurements RENAME COLUMN arm_cm TO upper_arms_cm;
ALTER TABLE public.body_measurements ADD COLUMN IF NOT EXISTS bmi numeric;
ALTER TABLE public.body_measurements ADD COLUMN IF NOT EXISTS body_fat_mass_kg numeric;
ALTER TABLE public.body_measurements ADD COLUMN IF NOT EXISTS muscle_mass_kg numeric;
ALTER TABLE public.body_measurements ADD COLUMN IF NOT EXISTS belly_cm numeric;
ALTER TABLE public.body_measurements ADD COLUMN IF NOT EXISTS glutes_cm numeric;
ALTER TABLE public.supplements
ADD COLUMN daily_quantity_unit text;

COMMENT ON COLUMN public.supplements.daily_quantity_unit IS 'Unit type for daily quantity, separate from dosage unit (for example capsule, tablet, softgel, gummy, scoop, serving).';
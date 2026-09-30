ALTER TABLE public.meal_plan_meals ADD COLUMN IF NOT EXISTS is_optional boolean NOT NULL DEFAULT false;
DO $$
DECLARE o uuid := '00000000-0000-0000-0000-000000000001'; s uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.meal_plan_meals WHERE user_id = o AND lower(meal_name) = 'snack') THEN
    INSERT INTO public.meal_plan_meals (user_id, meal_name, sort_order, is_optional) VALUES (o,'Snack',3,true) RETURNING id INTO s;
    INSERT INTO public.meal_plan_items (user_id, meal_id, food_name, quantity, unit, preparation, calories, sort_order) VALUES
    (o,s,'Nuts',10,'g',NULL,60,0),(o,s,'Fruit',100,'g',NULL,50,1),(o,s,'Greek yogurt',1,'serving',NULL,90,2);
  END IF;
END $$;
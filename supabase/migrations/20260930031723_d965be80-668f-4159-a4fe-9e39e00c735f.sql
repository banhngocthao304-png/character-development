ALTER TABLE public.meal_plan_items ADD COLUMN IF NOT EXISTS calories numeric;

DO $$
DECLARE o uuid := '00000000-0000-0000-0000-000000000001'; b uuid; l uuid; d uuid;
BEGIN
  DELETE FROM public.meal_plan_meals WHERE user_id = o;
  INSERT INTO public.meal_plan_meals (user_id, meal_name, sort_order) VALUES (o,'Breakfast',0) RETURNING id INTO b;
  INSERT INTO public.meal_plan_meals (user_id, meal_name, sort_order) VALUES (o,'Lunch',1) RETURNING id INTO l;
  INSERT INTO public.meal_plan_meals (user_id, meal_name, sort_order) VALUES (o,'Dinner',2) RETURNING id INTO d;
  INSERT INTO public.meal_plan_items (user_id, meal_id, food_name, quantity, unit, preparation, calories, sort_order) VALUES
  (o,b,'Black coffee',1,'cup',NULL,0,0),
  (o,b,'Oat milk',100,'ml',NULL,55,1),
  (o,b,'Condensed milk',1,'tbsp',NULL,50,2),
  (o,l,'White rice',200,'g','cooked',260,0),
  (o,l,'Chicken breast',230,'g','cooked',380,1),
  (o,l,'Egg',1,'whole',NULL,70,2),
  (o,l,'Vegetables',150,'g',NULL,40,3),
  (o,l,'Cooking oil',10,'g',NULL,90,4),
  (o,l,'Fruit',100,'g',NULL,50,5),
  (o,l,'Nuts',10,'g',NULL,60,6),
  (o,d,'Whey protein',30,'g','(1 scoop)',140,0),
  (o,d,'Oat milk',100,'ml',NULL,55,1),
  (o,d,'Blueberries',100,'g',NULL,57,2),
  (o,d,'Ice/water',1,'glass',NULL,0,3);
END $$;
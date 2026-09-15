DROP TABLE IF EXISTS public.planned_meal_ingredients;
DROP TABLE IF EXISTS public.planned_meals;
DROP TABLE IF EXISTS public.meal_plan_days;
DROP TABLE IF EXISTS public.recipe_tags;
DROP TABLE IF EXISTS public.recipe_steps;
DROP TABLE IF EXISTS public.recipe_ingredients;
DROP TABLE IF EXISTS public.recipes;

CREATE TABLE public.nutrition_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  calories_min NUMERIC(10,2) NOT NULL DEFAULT 1550,
  calories_max NUMERIC(10,2) NOT NULL DEFAULT 1650,
  protein_min_g NUMERIC(10,2) NOT NULL DEFAULT 120,
  protein_max_g NUMERIC(10,2) NOT NULL DEFAULT 130,
  carbs_min_g NUMERIC(10,2) NOT NULL DEFAULT 120,
  carbs_max_g NUMERIC(10,2) NOT NULL DEFAULT 140,
  fat_min_g NUMERIC(10,2) NOT NULL DEFAULT 40,
  fat_max_g NUMERIC(10,2) NOT NULL DEFAULT 45,
  water_min_l NUMERIC(10,2) NOT NULL DEFAULT 2.5,
  water_max_l NUMERIC(10,2) NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id),
  CONSTRAINT nutrition_targets_calories_range CHECK (calories_min >= 0 AND calories_max >= calories_min),
  CONSTRAINT nutrition_targets_protein_range CHECK (protein_min_g >= 0 AND protein_max_g >= protein_min_g),
  CONSTRAINT nutrition_targets_carbs_range CHECK (carbs_min_g >= 0 AND carbs_max_g >= carbs_min_g),
  CONSTRAINT nutrition_targets_fat_range CHECK (fat_min_g >= 0 AND fat_max_g >= fat_min_g),
  CONSTRAINT nutrition_targets_water_range CHECK (water_min_l >= 0 AND water_max_l >= water_min_l)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nutrition_targets TO anon, authenticated;
GRANT ALL ON public.nutrition_targets TO service_role;
ALTER TABLE public.nutrition_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "single user app access nutrition_targets" ON public.nutrition_targets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_nutrition_targets_updated BEFORE UPDATE ON public.nutrition_targets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.meal_plan_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  meal_name TEXT NOT NULL CHECK (length(trim(meal_name)) > 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_plan_meals TO anon, authenticated;
GRANT ALL ON public.meal_plan_meals TO service_role;
ALTER TABLE public.meal_plan_meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "single user app access meal_plan_meals" ON public.meal_plan_meals FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_meal_plan_meals_updated BEFORE UPDATE ON public.meal_plan_meals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.meal_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  meal_id UUID NOT NULL REFERENCES public.meal_plan_meals(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL CHECK (length(trim(food_name)) > 0),
  quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
  unit TEXT NOT NULL CHECK (length(trim(unit)) > 0),
  preparation TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_plan_items TO anon, authenticated;
GRANT ALL ON public.meal_plan_items TO service_role;
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "single user app access meal_plan_items" ON public.meal_plan_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_meal_plan_items_updated BEFORE UPDATE ON public.meal_plan_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_meal_plan_items_meal_order ON public.meal_plan_items(meal_id, sort_order);

CREATE TABLE public.food_option_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.food_option_categories TO anon, authenticated;
GRANT ALL ON public.food_option_categories TO service_role;
ALTER TABLE public.food_option_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "single user app access food_option_categories" ON public.food_option_categories FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_food_option_categories_updated BEFORE UPDATE ON public.food_option_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.food_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  category_id UUID NOT NULL REFERENCES public.food_option_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(trim(name)) > 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.food_options TO anon, authenticated;
GRANT ALL ON public.food_options TO service_role;
ALTER TABLE public.food_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "single user app access food_options" ON public.food_options FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER trg_food_options_updated BEFORE UPDATE ON public.food_options FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_food_options_category_order ON public.food_options(category_id, sort_order);

INSERT INTO public.nutrition_targets (
  calories_min, calories_max, protein_min_g, protein_max_g,
  carbs_min_g, carbs_max_g, fat_min_g, fat_max_g, water_min_l, water_max_l
) VALUES (1550, 1650, 120, 130, 120, 140, 40, 45, 2.5, 3);

WITH meals AS (
  INSERT INTO public.meal_plan_meals (meal_name, sort_order)
  VALUES ('Breakfast', 0), ('Lunch', 1), ('Dinner', 2)
  RETURNING id, meal_name
)
INSERT INTO public.meal_plan_items (meal_id, food_name, quantity, unit, preparation, sort_order)
SELECT id, food_name, quantity, unit, preparation, sort_order
FROM meals
CROSS JOIN LATERAL (
  VALUES
    ('Breakfast', 'Whole eggs', 2::numeric, 'pieces', NULL::text, 0),
    ('Lunch', 'Chicken breast', 180::numeric, 'g', 'grilled', 0),
    ('Lunch', 'White rice', 150::numeric, 'g', 'cooked', 1),
    ('Lunch', 'Vegetables', 200::numeric, 'g', 'steamed', 2),
    ('Dinner', 'Salmon', 170::numeric, 'g', NULL::text, 0),
    ('Dinner', 'Mixed vegetables', 250::numeric, 'g', NULL::text, 1),
    ('Dinner', 'Sweet potato', 120::numeric, 'g', 'baked', 2)
) AS item(target_meal, food_name, quantity, unit, preparation, sort_order)
WHERE meals.meal_name = item.target_meal;

WITH categories AS (
  INSERT INTO public.food_option_categories (name, sort_order)
  VALUES
    ('Protein Options', 0),
    ('Carbohydrate Options', 1),
    ('Vegetables', 2),
    ('Fruits', 3)
  RETURNING id, name
)
INSERT INTO public.food_options (category_id, name, sort_order)
SELECT id, option_name, option_order
FROM categories
CROSS JOIN LATERAL (
  VALUES
    ('Protein Options', 'Chicken breast', 0),
    ('Protein Options', 'Lean beef', 1),
    ('Protein Options', 'Salmon', 2),
    ('Protein Options', 'Tuna', 3),
    ('Protein Options', 'Shrimp', 4),
    ('Protein Options', 'Eggs', 5),
    ('Protein Options', 'Tofu', 6),
    ('Protein Options', 'Whey protein', 7),
    ('Carbohydrate Options', 'White rice', 0),
    ('Carbohydrate Options', 'Brown rice', 1),
    ('Carbohydrate Options', 'Sweet potatoes', 2),
    ('Carbohydrate Options', 'Potatoes', 3),
    ('Carbohydrate Options', 'Oats', 4),
    ('Carbohydrate Options', 'Whole wheat bread', 5),
    ('Vegetables', 'Broccoli', 0),
    ('Vegetables', 'Spinach', 1),
    ('Vegetables', 'Lettuce', 2),
    ('Vegetables', 'Cucumbers', 3),
    ('Vegetables', 'Tomatoes', 4),
    ('Vegetables', 'Green beans', 5),
    ('Vegetables', 'Bell peppers', 6),
    ('Vegetables', 'Zucchini', 7),
    ('Fruits', 'Apple', 0),
    ('Fruits', 'Banana', 1),
    ('Fruits', 'Orange', 2),
    ('Fruits', 'Kiwi', 3),
    ('Fruits', 'Strawberries', 4),
    ('Fruits', 'Dragon fruit', 5),
    ('Fruits', 'Blueberries', 6)
) AS option(target_category, option_name, option_order)
WHERE categories.name = option.target_category;
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { OWNER_ID } from "@/features/pt/api";

export type NutritionTarget = Tables<"nutrition_targets">;
export type MealPlanMeal = Tables<"meal_plan_meals">;
export type MealPlanItem = Tables<"meal_plan_items">;
export type FoodOptionCategory = Tables<"food_option_categories">;
export type FoodOption = Tables<"food_options">;
export type Supplement = Tables<"supplements">;

export type MealWithItems = MealPlanMeal & { items: MealPlanItem[] };
export type CategoryWithOptions = FoodOptionCategory & { options: FoodOption[] };

export type MealsData = {
  target: NutritionTarget | null;
  meals: MealWithItems[];
  categories: CategoryWithOptions[];
  supplements: Supplement[];
};

export async function fetchMealsData(): Promise<MealsData> {
  const [targetResult, mealsResult, itemsResult, categoriesResult, optionsResult] = await Promise.all([
    supabase.from("nutrition_targets").select("*").eq("user_id", OWNER_ID).maybeSingle(),
    supabase.from("meal_plan_meals").select("*").eq("user_id", OWNER_ID).order("sort_order"),
    supabase.from("meal_plan_items").select("*").eq("user_id", OWNER_ID).order("sort_order"),
    supabase.from("food_option_categories").select("*").eq("user_id", OWNER_ID).order("sort_order"),
    supabase.from("food_options").select("*").eq("user_id", OWNER_ID).order("sort_order"),
  ]);
  const supplementsResult = await supabase.from("supplements").select("*").eq("user_id", OWNER_ID).order("sort_order");
  const error = targetResult.error ?? mealsResult.error ?? itemsResult.error ?? categoriesResult.error ?? optionsResult.error ?? supplementsResult.error;
  if (error) throw error;

  const items = itemsResult.data ?? [];
  const options = optionsResult.data ?? [];
  return {
    target: targetResult.data,
    meals: (mealsResult.data ?? []).map((meal) => ({
      ...meal,
      items: items.filter((item) => item.meal_id === meal.id),
    })),
    categories: (categoriesResult.data ?? []).map((category) => ({
      ...category,
      options: options.filter((option) => option.category_id === category.id),
    })),
    supplements: supplementsResult.data ?? [],
  };
}

export type TargetValues = Pick<NutritionTarget,
  "calories_min" | "calories_max" | "protein_min_g" | "protein_max_g" |
  "carbs_min_g" | "carbs_max_g" | "fat_min_g" | "fat_max_g" |
  "water_min_l" | "water_max_l"
>;

export async function saveNutritionTarget(id: string | null, values: TargetValues) {
  const query = id
    ? supabase.from("nutrition_targets").update(values).eq("id", id)
    : supabase.from("nutrition_targets").insert({ ...values, user_id: OWNER_ID });
  const { data, error } = await query.select("*").single();
  if (error) throw error;
  return data;
}

export async function addMeal(mealName: string, sortOrder: number) {
  const { data, error } = await supabase.from("meal_plan_meals")
    .insert({ user_id: OWNER_ID, meal_name: mealName.trim(), sort_order: sortOrder }).select("*").single();
  if (error) throw error;
  return data;
}

export async function renameMeal(id: string, mealName: string) {
  const { error } = await supabase.from("meal_plan_meals").update({ meal_name: mealName.trim() }).eq("id", id);
  if (error) throw error;
}

export async function deleteMeal(id: string) {
  const { error } = await supabase.from("meal_plan_meals").delete().eq("id", id);
  if (error) throw error;
}

export type ItemValues = Pick<MealPlanItem, "food_name" | "quantity" | "unit" | "preparation">;

export async function addMealItem(mealId: string, values: ItemValues, sortOrder: number) {
  const { error } = await supabase.from("meal_plan_items").insert({
    user_id: OWNER_ID, meal_id: mealId, sort_order: sortOrder,
    food_name: values.food_name.trim(), quantity: values.quantity, unit: values.unit.trim(),
    preparation: values.preparation?.trim() || null,
  });
  if (error) throw error;
}

export async function updateMealItem(id: string, values: ItemValues) {
  const { error } = await supabase.from("meal_plan_items").update({
    food_name: values.food_name.trim(), quantity: values.quantity, unit: values.unit.trim(),
    preparation: values.preparation?.trim() || null,
  }).eq("id", id);
  if (error) throw error;
}

export async function deleteMealItem(id: string) {
  const { error } = await supabase.from("meal_plan_items").delete().eq("id", id);
  if (error) throw error;
}

async function swapOrder(table: "meal_plan_meals" | "meal_plan_items" | "food_option_categories" | "food_options" | "supplements", first: { id: string; sort_order: number }, second: { id: string; sort_order: number }) {
  const firstResult = await supabase.from(table).update({ sort_order: second.sort_order }).eq("id", first.id);
  if (firstResult.error) throw firstResult.error;
  const secondResult = await supabase.from(table).update({ sort_order: first.sort_order }).eq("id", second.id);
  if (secondResult.error) throw secondResult.error;
}

export const reorderMeals = (first: MealPlanMeal, second: MealPlanMeal) => swapOrder("meal_plan_meals", first, second);
export const reorderMealItems = (first: MealPlanItem, second: MealPlanItem) => swapOrder("meal_plan_items", first, second);
export const reorderCategories = (first: FoodOptionCategory, second: FoodOptionCategory) => swapOrder("food_option_categories", first, second);
export const reorderFoodOptions = (first: FoodOption, second: FoodOption) => swapOrder("food_options", first, second);

export async function addCategory(name: string, sortOrder: number) {
  const { error } = await supabase.from("food_option_categories")
    .insert({ user_id: OWNER_ID, name: name.trim(), sort_order: sortOrder });
  if (error) throw error;
}

export async function renameCategory(id: string, name: string) {
  const { error } = await supabase.from("food_option_categories").update({ name: name.trim() }).eq("id", id);
  if (error) throw error;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("food_option_categories").delete().eq("id", id);
  if (error) throw error;
}

export async function addFoodOption(categoryId: string, name: string, sortOrder: number) {
  const { error } = await supabase.from("food_options")
    .insert({ user_id: OWNER_ID, category_id: categoryId, name: name.trim(), sort_order: sortOrder });
  if (error) throw error;
}

export async function renameFoodOption(id: string, name: string) {
  const { error } = await supabase.from("food_options").update({ name: name.trim() }).eq("id", id);
  if (error) throw error;
}

export async function deleteFoodOption(id: string) {
  const { error } = await supabase.from("food_options").delete().eq("id", id);
  if (error) throw error;
}

export type SupplementValues = Pick<Supplement, "name" | "dosage" | "unit" | "frequency" | "timing" | "note" | "daily_quantity">;

export async function addSupplement(values: SupplementValues, sortOrder: number) {
  const { error } = await supabase.from("supplements").insert({
    user_id: OWNER_ID, sort_order: sortOrder,
    name: values.name.trim(), dosage: values.dosage, unit: values.unit.trim(),
    frequency: values.frequency.trim(), timing: values.timing?.trim() || null, note: values.note?.trim() || null,
  });
  if (error) throw error;
}

export async function updateSupplement(id: string, values: SupplementValues) {
  const { error } = await supabase.from("supplements").update({
    name: values.name.trim(), dosage: values.dosage, unit: values.unit.trim(),
    frequency: values.frequency.trim(), timing: values.timing?.trim() || null, note: values.note?.trim() || null,
  }).eq("id", id);
  if (error) throw error;
}

export async function deleteSupplement(id: string) {
  const { error } = await supabase.from("supplements").delete().eq("id", id);
  if (error) throw error;
}

export const reorderSupplements = (first: Supplement, second: Supplement) => swapOrder("supplements", first, second);

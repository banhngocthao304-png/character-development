import { supabase } from "@/integrations/supabase/client";
import { OWNER_ID } from "@/features/pt/api";

export type BodyMeasurement = {
  id: string;
  measurement_date: string;
  weight_kg: number | null;
  bmi: number | null;
  body_fat_mass_kg: number | null;
  muscle_mass_kg: number | null;
  waist_cm: number | null;
  belly_cm: number | null;
  hips_cm: number | null;
  glutes_cm: number | null;
  upper_arms_cm: number | null;
  thighs_cm: number | null;
  bust_cm: number | null;
  created_at: string;
  updated_at: string;
};

export type MeasurementValues = Pick<
  BodyMeasurement,
  | "measurement_date"
  | "weight_kg"
  | "bmi"
  | "body_fat_mass_kg"
  | "muscle_mass_kg"
  | "waist_cm"
  | "belly_cm"
  | "hips_cm"
  | "glutes_cm"
  | "upper_arms_cm"
  | "thighs_cm"
  | "bust_cm"
>;

const SELECT_FIELDS =
  "id, measurement_date, weight_kg, bmi, body_fat_mass_kg, muscle_mass_kg, waist_cm, belly_cm, hips_cm, glutes_cm, upper_arms_cm, thighs_cm, bust_cm, created_at, updated_at";

export async function fetchBodyMeasurements(): Promise<BodyMeasurement[]> {
  const { data, error } = await supabase
    .from("body_measurements")
    .select(SELECT_FIELDS)
    .eq("user_id", OWNER_ID)
    .order("measurement_date", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BodyMeasurement[];
}

export async function createBodyMeasurement(values: MeasurementValues): Promise<BodyMeasurement> {
  const { data, error } = await supabase
    .from("body_measurements")
    .insert({ ...values, user_id: OWNER_ID })
    .select(SELECT_FIELDS)
    .single();
  if (error) throw error;
  return data as BodyMeasurement;
}

export async function updateBodyMeasurement({
  id,
  values,
}: {
  id: string;
  values: MeasurementValues;
}): Promise<BodyMeasurement> {
  const { data, error } = await supabase
    .from("body_measurements")
    .update(values)
    .eq("id", id)
    .select(SELECT_FIELDS)
    .single();
  if (error) throw error;
  return data as BodyMeasurement;
}

export async function deleteBodyMeasurement(id: string): Promise<void> {
  const { error } = await supabase.from("body_measurements").delete().eq("id", id);
  if (error) throw error;
}
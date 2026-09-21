import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_PERIOD_START_DAY, DEFAULT_SESSIONS_PER_PERIOD } from "@/lib/pt";

export type PtSession = {
  id: string;
  session_date: string;
  session_type: string | null;
  session_note: string | null;
};

export type PtExercise = {
  id: string;
  pt_session_id: string;
  exercise_library_id: string | null;
  exercise_name: string;
  weight: number | null;
  weight_unit: string;
  sets: number | null;
  reps: number | null;
  exercise_note: string | null;
  sort_order: number;
};

/** Single-user private app: every row belongs to this fixed owner. */
export const OWNER_ID = "00000000-0000-0000-0000-000000000001";

export async function currentUserId(): Promise<string> {
  return OWNER_ID;
}

export async function fetchPtSettings() {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("pt_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (data) return data;
  const { data: created, error: insertError } = await supabase
    .from("pt_settings")
    .insert({
      user_id: userId,
      period_start_day: DEFAULT_PERIOD_START_DAY,
      sessions_per_period: DEFAULT_SESSIONS_PER_PERIOD,
    })
    .select("*")
    .single();
  if (insertError) throw insertError;
  return created;
}

export async function fetchSessionsBetween(startISO: string, endISO: string) {
  const { data, error } = await supabase
    .from("pt_sessions")
    .select("id, session_date, session_type, session_note")
    .gte("session_date", startISO)
    .lte("session_date", endISO)
    .order("session_date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PtSession[];
}

export async function createSession(dateISO: string) {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("pt_sessions")
    .insert({ user_id: userId, session_date: dateISO })
    .select("id, session_date, session_type, session_note")
    .single();
  if (error) throw error;
  return data as PtSession;
}

export async function deleteSession(id: string) {
  const { error } = await supabase.from("pt_sessions").delete().eq("id", id);
  if (error) throw error;
}

export async function updateSession(
  id: string,
  patch: { session_type?: string | null; session_note?: string | null },
) {
  const { error } = await supabase.from("pt_sessions").update(patch).eq("id", id);
  if (error) throw error;
}

export async function fetchExercises(sessionId: string) {
  const { data, error } = await supabase
    .from("pt_session_exercises")
    .select("*")
    .eq("pt_session_id", sessionId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as PtExercise[];
}

export async function addExercise(
  sessionId: string,
  sortOrder: number,
  name = "",
  exerciseLibraryId?: string | null,
) {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("pt_session_exercises")
    .insert({
      user_id: userId,
      pt_session_id: sessionId,
      exercise_library_id: exerciseLibraryId ?? null,
      exercise_name: name,
      weight_unit: "kg",
      sort_order: sortOrder,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as PtExercise;
}

export async function updateExercise(id: string, patch: Partial<PtExercise>) {
  const { error } = await supabase.from("pt_session_exercises").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteExercise(id: string) {
  const { error } = await supabase.from("pt_session_exercises").delete().eq("id", id);
  if (error) throw error;
}

export type ExerciseHistoryEntry = {
  exercise_name: string;
  weight: number | null;
  weight_unit: string;
  sets: number | null;
  reps: number | null;
  session_date: string;
};

export type MuscleBalanceExercise = {
  exercise_name: string;
  sets: number | null;
  session_date: string;
  exercise_library_id: string | null;
  primary_muscle_groups: string[];
  secondary_muscle_groups: string[];
};

/** All previously logged exercises (own data only), newest session first. */
export async function fetchExerciseHistory(): Promise<ExerciseHistoryEntry[]> {
  const { data, error } = await supabase
    .from("pt_session_exercises")
    .select("exercise_name, weight, weight_unit, sets, reps, pt_sessions(session_date)")
    .order("created_at", { ascending: false })
    .limit(600);
  if (error) throw error;
  return (data ?? [])
    .map((row) => {
      const rel = row.pt_sessions as unknown as { session_date: string } | null;
      return {
        exercise_name: row.exercise_name,
        weight: row.weight,
        weight_unit: row.weight_unit,
        sets: row.sets,
        reps: row.reps,
        session_date: rel?.session_date ?? "",
      };
    })
    .filter((row) => row.exercise_name.trim().length > 0 && row.session_date);
}

/** Complete exercise history used for period-based working-set summaries. */
export async function fetchMuscleBalanceExercises(): Promise<MuscleBalanceExercise[]> {
  const { data, error } = await supabase
    .from("pt_session_exercises")
    .select(
      "exercise_name, sets, exercise_library_id, pt_sessions(session_date), exercise_library(primary_muscle_groups, secondary_muscle_groups)",
    );
  if (error) throw error;
  return (data ?? [])
    .map((row) => {
      const rel = row.pt_sessions as unknown as { session_date: string } | null;
      const library = row.exercise_library as unknown as {
        primary_muscle_groups: string[];
        secondary_muscle_groups: string[];
      } | null;
      return {
        exercise_name: row.exercise_name,
        sets: row.sets,
        session_date: rel?.session_date ?? "",
        exercise_library_id: row.exercise_library_id,
        primary_muscle_groups: library?.primary_muscle_groups ?? [],
        secondary_muscle_groups: library?.secondary_muscle_groups ?? [],
      };
    })
    .filter((row) => row.exercise_name.trim().length > 0 && row.session_date);
}

export type LibraryExercise = {
  id: string;
  exercise_name: string;
  primary_muscle_group: string;
  primary_muscle_groups: string[];
  secondary_muscle_group: string | null;
  secondary_muscle_groups: string[];
  equipment: string | null;
  aliases: string[];
  is_custom: boolean;
};

export async function fetchExerciseLibrary(): Promise<LibraryExercise[]> {
  const { data, error } = await supabase
    .from("exercise_library")
    .select(
      "id, exercise_name, primary_muscle_group, primary_muscle_groups, secondary_muscle_group, secondary_muscle_groups, equipment, aliases, is_custom",
    )
    .order("exercise_name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as LibraryExercise[];
}

/** Save a user-typed exercise name into the library so it is suggested next time. */
export async function createCustomExercise(name: string): Promise<LibraryExercise | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("exercise_library")
    .insert({
      user_id: userId,
      exercise_name: trimmed,
      primary_muscle_group: "Custom",
      is_custom: true,
    })
    .select(
      "id, exercise_name, primary_muscle_group, primary_muscle_groups, secondary_muscle_group, secondary_muscle_groups, equipment, aliases, is_custom",
    )
    .maybeSingle();
  // A duplicate name simply means it already exists — not an error worth surfacing.
  if (error && error.code !== "23505") throw error;
  return (data as LibraryExercise | null) ?? null;
}

/** Most recent weight used for `name` strictly before `beforeISO`. */
export function lastTimeFor(
  history: ExerciseHistoryEntry[],
  name: string,
  beforeISO: string,
): ExerciseHistoryEntry | null {
  const key = name.trim().toLowerCase();
  if (!key) return null;
  const matches = history
    .filter(
      (h) =>
        h.exercise_name.trim().toLowerCase() === key &&
        h.session_date < beforeISO &&
        h.weight != null,
    )
    .sort((a, b) => (a.session_date < b.session_date ? 1 : -1));
  return matches[0] ?? null;
}

export function uniqueExerciseNames(history: ExerciseHistoryEntry[]): string[] {
  const seen = new Map<string, string>();
  for (const h of history) {
    const key = h.exercise_name.trim().toLowerCase();
    if (key && !seen.has(key)) seen.set(key, h.exercise_name.trim());
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b));
}

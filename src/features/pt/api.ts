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
  exercise_name: string;
  weight: number | null;
  weight_unit: string;
  sets: number | null;
  reps: number | null;
  exercise_note: string | null;
  sort_order: number;
};

export async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("You need to be signed in.");
  return data.user.id;
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

export async function addExercise(sessionId: string, sortOrder: number) {
  const userId = await currentUserId();
  const { data, error } = await supabase
    .from("pt_session_exercises")
    .insert({
      user_id: userId,
      pt_session_id: sessionId,
      exercise_name: "",
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
  session_date: string;
};

/** All previously logged exercises (own data only), newest session first. */
export async function fetchExerciseHistory(): Promise<ExerciseHistoryEntry[]> {
  const { data, error } = await supabase
    .from("pt_session_exercises")
    .select("exercise_name, weight, weight_unit, pt_sessions(session_date)")
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
        session_date: rel?.session_date ?? "",
      };
    })
    .filter((row) => row.exercise_name.trim().length > 0 && row.session_date);
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

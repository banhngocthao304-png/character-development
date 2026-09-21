import { todayISO } from "@/lib/dates";
import type { LibraryExercise, MuscleBalanceExercise } from "./api";

export const MUSCLES = [
  "Glutes",
  "Quads",
  "Hamstrings",
  "Back",
  "Chest",
  "Shoulders",
  "Arms",
  "Core",
] as const;

export type Muscle = (typeof MUSCLES)[number];
export type MuscleCredit = { muscle: Muscle; credits: number };

type CreditExercise = Pick<
  MuscleBalanceExercise,
  "exercise_name" | "sets" | "exercise_library_id"
> &
  Partial<Pick<MuscleBalanceExercise, "session_date" | "primary_muscle_groups" | "secondary_muscle_groups">>;

function normalizedName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function includedMuscles(values: string[] | null | undefined): Muscle[] {
  return (values ?? []).filter((value): value is Muscle => MUSCLES.includes(value as Muscle));
}

function resolveLibraryMapping(name: string, library: LibraryExercise[]) {
  const wanted = normalizedName(name);
  if (!wanted) return null;

  const exact = library.find(
    (item) =>
      normalizedName(item.exercise_name) === wanted ||
      (item.aliases ?? []).some((alias) => normalizedName(alias) === wanted),
  );
  if (exact) return exact;

  const candidates = library.filter((item) =>
    [item.exercise_name, ...(item.aliases ?? [])].some((candidate) => {
      const key = normalizedName(candidate);
      return key.length >= 6 && (wanted.includes(key) || key.includes(wanted));
    }),
  );
  const uniqueIds = new Set(candidates.map((item) => item.id));
  return uniqueIds.size === 1 ? candidates[0] : null;
}

export function calculateMuscleCredits(
  exercises: CreditExercise[],
  library: LibraryExercise[],
  startISO?: string,
  endISO = todayISO(),
): MuscleCredit[] {
  const totals = Object.fromEntries(MUSCLES.map((muscle) => [muscle, 0])) as Record<Muscle, number>;

  for (const exercise of exercises) {
    if (
      exercise.session_date &&
      (exercise.session_date > endISO || (startISO && exercise.session_date < startISO))
    ) {
      continue;
    }
    const sets = exercise.sets ?? 0;
    if (!Number.isFinite(sets) || sets <= 0) continue;

    const mapping = exercise.exercise_library_id
      ? library.find((item) => item.id === exercise.exercise_library_id)
      : resolveLibraryMapping(exercise.exercise_name, library);
    const loggedPrimary = includedMuscles(exercise.primary_muscle_groups);
    const loggedSecondary = includedMuscles(exercise.secondary_muscle_groups);
    const primary = loggedPrimary.length
      ? loggedPrimary
      : includedMuscles(mapping?.primary_muscle_groups);
    const secondary = (loggedSecondary.length
      ? loggedSecondary
      : includedMuscles(mapping?.secondary_muscle_groups)
    ).filter((muscle) => !primary.includes(muscle));

    for (const muscle of primary) totals[muscle] += sets / primary.length;
    for (const muscle of secondary) totals[muscle] += sets * 0.5;
  }

  return MUSCLES.map((muscle) => ({
    muscle,
    credits: Math.round(totals[muscle] * 10) / 10,
  }));
}
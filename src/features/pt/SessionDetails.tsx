import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Check, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Chip, FieldLabel, Skeleton } from "@/components/ui-kit";
import { formatDate, formatDateShort } from "@/lib/dates";
import { SESSION_TYPES } from "@/lib/pt";
import {
  addExercise,
  deleteExercise,
  fetchExerciseHistory,
  fetchExercises,
  lastTimeFor,
  uniqueExerciseNames,
  updateExercise,
  updateSession,
  type PtExercise,
  type PtSession,
} from "./api";

type SaveState = "idle" | "saving" | "saved";

function useAutosaveState() {
  const [state, setState] = useState<SaveState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function saving() {
    setState("saving");
  }
  function saved() {
    setState("saved");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1800);
  }
  useEffect(() => () => timer.current && clearTimeout(timer.current), []);
  return { state, saving, saved };
}

export function SessionDetails({
  session,
  onRemoveSession,
}: {
  session: PtSession;
  onRemoveSession: () => void;
}) {
  const queryClient = useQueryClient();
  const save = useAutosaveState();

  const exercisesQuery = useQuery({
    queryKey: ["pt-exercises", session.id],
    queryFn: () => fetchExercises(session.id),
  });
  const historyQuery = useQuery({
    queryKey: ["pt-exercise-history"],
    queryFn: fetchExerciseHistory,
  });

  const knownNames = useMemo(
    () => uniqueExerciseNames(historyQuery.data ?? []),
    [historyQuery.data],
  );

  const [sessionType, setSessionType] = useState(session.session_type ?? "");
  const [note, setNote] = useState(session.session_note ?? "");

  useEffect(() => {
    setSessionType(session.session_type ?? "");
    setNote(session.session_note ?? "");
  }, [session.id, session.session_type, session.session_note]);

  const sessionMutation = useMutation({
    mutationFn: (patch: { session_type?: string | null; session_note?: string | null }) =>
      updateSession(session.id, patch),
    onMutate: save.saving,
    onSuccess: () => {
      save.saved();
      queryClient.invalidateQueries({ queryKey: ["pt-sessions"] });
    },
    onError: () => toast.error("Couldn't save this session. Please try again."),
  });

  // Debounced note autosave
  useEffect(() => {
    if ((session.session_note ?? "") === note) return;
    const t = setTimeout(() => sessionMutation.mutate({ session_note: note || null }), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note]);

  const addMutation = useMutation({
    mutationFn: () => addExercise(session.id, (exercisesQuery.data?.length ?? 0) + 1),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pt-exercises", session.id] }),
    onError: () => toast.error("Couldn't add the exercise. Please try again."),
  });

  const exercises = exercisesQuery.data ?? [];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-base font-bold sm:text-lg">{formatDate(session.session_date)}</p>
          <p className="text-xs text-muted-foreground">1 PT session</p>
        </div>
        <div className="flex items-center gap-2">
          <SaveIndicator state={save.state} />
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={onRemoveSession}
          >
            <Trash2 />
            Remove
          </Button>
        </div>
      </div>

      <div className="mb-5">
        <FieldLabel hint="(optional)">Session type</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {SESSION_TYPES.map((type) => {
            const active = sessionType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  const next = active ? "" : type;
                  setSessionType(next);
                  sessionMutation.mutate({ session_type: next || null });
                }}
                className={
                  active
                    ? "rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                    : "rounded-full bg-lavender-faint px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-lavender-soft hover:text-accent-foreground"
                }
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {exercisesQuery.isLoading ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : exercises.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-lavender-faint/40 px-4 py-6 text-center text-sm text-muted-foreground">
            No exercises recorded yet.
          </p>
        ) : (
          exercises.map((exercise, index) => (
            <ExerciseRow
              key={exercise.id}
              exercise={exercise}
              index={index}
              total={exercises.length}
              sessionDate={session.session_date}
              knownNames={knownNames}
              history={historyQuery.data ?? []}
              onSaving={save.saving}
              onSaved={save.saved}
              siblings={exercises}
            />
          ))
        )}
      </div>

      <Button
        variant="soft"
        className="mt-4 w-full"
        onClick={() => addMutation.mutate()}
        disabled={addMutation.isPending}
      >
        {addMutation.isPending ? <Loader2 className="animate-spin" /> : null}
        Add exercise
      </Button>

      <div className="mt-6">
        <FieldLabel htmlFor="session-note" hint="(optional)">
          Session note
        </FieldLabel>
        <Textarea
          id="session-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="How did the session feel?"
          className="min-h-24 rounded-xl bg-card"
        />
      </div>
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
      {state === "saving" ? (
        <>
          <Loader2 className="size-3.5 animate-spin" /> Saving…
        </>
      ) : (
        <>
          <Check className="size-3.5 text-success" /> Saved
        </>
      )}
    </span>
  );
}

function ExerciseRow({
  exercise,
  index,
  total,
  sessionDate,
  knownNames,
  history,
  onSaving,
  onSaved,
  siblings,
}: {
  exercise: PtExercise;
  index: number;
  total: number;
  sessionDate: string;
  knownNames: string[];
  history: Parameters<typeof lastTimeFor>[0];
  onSaving: () => void;
  onSaved: () => void;
  siblings: PtExercise[];
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(exercise.exercise_name);
  const [weight, setWeight] = useState(exercise.weight != null ? String(exercise.weight) : "");
  const [unit, setUnit] = useState(exercise.weight_unit || "kg");
  const [sets, setSets] = useState(exercise.sets != null ? String(exercise.sets) : "");
  const [reps, setReps] = useState(exercise.reps != null ? String(exercise.reps) : "");
  const [exNote, setExNote] = useState(exercise.exercise_note ?? "");

  const patchMutation = useMutation({
    mutationFn: (patch: Partial<PtExercise>) => updateExercise(exercise.id, patch),
    onMutate: onSaving,
    onSuccess: () => {
      onSaved();
      queryClient.invalidateQueries({ queryKey: ["pt-exercise-history"] });
    },
    onError: () => toast.error("Couldn't save this exercise. Please try again."),
  });

  const removeMutation = useMutation({
    mutationFn: () => deleteExercise(exercise.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pt-exercises", exercise.pt_session_id] });
      queryClient.invalidateQueries({ queryKey: ["pt-exercise-history"] });
    },
    onError: () => toast.error("Couldn't remove this exercise. Please try again."),
  });

  const moveMutation = useMutation({
    mutationFn: async (delta: number) => {
      const other = siblings[index + delta];
      if (!other) return;
      await updateExercise(exercise.id, { sort_order: other.sort_order });
      await updateExercise(other.id, { sort_order: exercise.sort_order });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["pt-exercises", exercise.pt_session_id] }),
  });

  // Debounced field autosave
  useEffect(() => {
    const t = setTimeout(() => {
      const patch: Partial<PtExercise> = {
        exercise_name: name.trim(),
        weight: weight.trim() === "" ? null : Number(weight),
        weight_unit: unit,
        sets: sets.trim() === "" ? null : Math.round(Number(sets)),
        reps: reps.trim() === "" ? null : Math.round(Number(reps)),
        exercise_note: exNote.trim() === "" ? null : exNote,
      };
      const unchanged =
        patch.exercise_name === exercise.exercise_name &&
        patch.weight === exercise.weight &&
        patch.weight_unit === exercise.weight_unit &&
        patch.sets === exercise.sets &&
        patch.reps === exercise.reps &&
        (patch.exercise_note ?? null) === (exercise.exercise_note ?? null);
      if (unchanged) return;
      if (patch.weight != null && Number.isNaN(patch.weight)) return;
      patchMutation.mutate(patch);
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, weight, unit, sets, reps, exNote]);

  const last = lastTimeFor(history, name, sessionDate);
  const listId = `exercise-names-${exercise.id}`;

  return (
    <div className="rounded-2xl border border-border bg-lavender-faint/40 p-3.5">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <Input
            aria-label="Exercise name"
            list={listId}
            placeholder="Exercise name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="font-semibold"
          />
          <datalist id={listId}>
            {knownNames.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="iconSm"
              aria-label="Move up"
              disabled={index === 0 || moveMutation.isPending}
              onClick={() => moveMutation.mutate(-1)}
            >
              <ArrowUp />
            </Button>
            <Button
              variant="ghost"
              size="iconSm"
              aria-label="Move down"
              disabled={index === total - 1 || moveMutation.isPending}
              onClick={() => moveMutation.mutate(1)}
            >
              <ArrowDown />
            </Button>
            <Button
              variant="ghost"
              size="iconSm"
              aria-label="Remove exercise"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => removeMutation.mutate()}
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="flex items-center gap-1.5">
          <Input
            aria-label="Weight"
            inputMode="decimal"
            placeholder="Weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
          <select
            aria-label="Weight unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="h-11 rounded-xl border border-input bg-card px-2 text-sm font-semibold"
          >
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </select>
        </div>
        <Input
          aria-label="Sets"
          inputMode="numeric"
          placeholder="Sets"
          value={sets}
          onChange={(e) => setSets(e.target.value)}
        />
        <Input
          aria-label="Reps"
          inputMode="numeric"
          placeholder="Reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
        <Input
          aria-label="Exercise note"
          placeholder="Note"
          value={exNote}
          onChange={(e) => setExNote(e.target.value)}
        />
      </div>

      {last ? (
        <p className="mt-2.5 text-xs text-muted-foreground">
          Last time:{" "}
          <span className="font-semibold text-foreground">
            {last.weight} {last.weight_unit}
          </span>{" "}
          · {formatDateShort(last.session_date)}
        </p>
      ) : null}

      {exercise.sets && exercise.reps ? (
        <div className="mt-2">
          <Chip>
            {exercise.sets} × {exercise.reps}
          </Chip>
        </div>
      ) : null}
    </div>
  );
}

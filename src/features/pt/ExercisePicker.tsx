import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createCustomExercise,
  fetchExerciseLibrary,
  type ExerciseHistoryEntry,
  type LibraryExercise,
} from "./api";

function norm(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

type Suggestion = {
  name: string;
  detail: string | null;
  history: ExerciseHistoryEntry | null;
  score: number;
};

/** Most recent logged entry per exercise name (history arrives newest-first). */
function latestByName(history: ExerciseHistoryEntry[]): Map<string, ExerciseHistoryEntry> {
  const map = new Map<string, ExerciseHistoryEntry>();
  const sorted = [...history].sort((a, b) => (a.session_date < b.session_date ? 1 : -1));
  for (const entry of sorted) {
    const key = norm(entry.exercise_name);
    if (key && !map.has(key)) map.set(key, entry);
  }
  return map;
}

function matchScore(query: string, name: string, aliases: string[]): number | null {
  const q = norm(query);
  if (!q) return 0;
  const n = norm(name);
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  if (n.split(" ").some((word) => word.startsWith(q))) return 2;
  if (n.includes(q)) return 3;
  for (const alias of aliases) {
    const a = norm(alias);
    if (!a) continue;
    if (a.startsWith(q)) return 4;
    if (a.includes(q)) return 5;
  }
  return null;
}

function historyLine(entry: ExerciseHistoryEntry): string | null {
  const parts: string[] = [];
  if (entry.weight != null) parts.push(`${entry.weight} ${entry.weight_unit}`);
  if (entry.sets != null && entry.reps != null) parts.push(`${entry.sets} × ${entry.reps}`);
  if (parts.length === 0) return null;
  return `Last: ${parts.join(" · ")}`;
}

export function ExercisePicker({
  history,
  onPick,
  onCancel,
  busy,
}: {
  history: ExerciseHistoryEntry[];
  onPick: (name: string) => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const libraryQuery = useQuery({ queryKey: ["exercise-library"], queryFn: fetchExerciseLibrary });
  const library = libraryQuery.data ?? [];
  const latest = useMemo(() => latestByName(history), [history]);

  const customMutation = useMutation({
    mutationFn: (name: string) => createCustomExercise(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exercise-library"] }),
  });

  const recent = useMemo(() => {
    const seen: Suggestion[] = [];
    const sorted = [...history].sort((a, b) => (a.session_date < b.session_date ? 1 : -1));
    const used = new Set<string>();
    for (const entry of sorted) {
      const key = norm(entry.exercise_name);
      if (!key || used.has(key)) continue;
      used.add(key);
      seen.push({
        name: entry.exercise_name.trim(),
        detail: null,
        history: entry,
        score: 0,
      });
      if (seen.length >= 8) break;
    }
    return seen;
  }, [history]);

  const results = useMemo<Suggestion[]>(() => {
    if (!query.trim()) return [];
    const items: Suggestion[] = [];
    const covered = new Set<string>();

    // Previously logged exercises rank above unused library entries.
    for (const [key, entry] of latest) {
      const score = matchScore(query, entry.exercise_name, []);
      if (score == null) continue;
      const lib = library.find((l) => norm(l.exercise_name) === key);
      covered.add(key);
      items.push({
        name: entry.exercise_name.trim(),
        detail: lib ? muscleLine(lib) : null,
        history: entry,
        score: score - 100,
      });
    }

    for (const lib of library) {
      const key = norm(lib.exercise_name);
      if (covered.has(key)) continue;
      const score = matchScore(query, lib.exercise_name, lib.aliases ?? []);
      if (score == null) continue;
      items.push({ name: lib.exercise_name, detail: muscleLine(lib), history: null, score });
    }

    return items
      .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name))
      .slice(0, 25);
  }, [query, library, latest]);

  const exactExists =
    !!query.trim() &&
    [...library.map((l) => l.exercise_name), ...[...latest.values()].map((e) => e.exercise_name)].some(
      (n) => norm(n) === norm(query),
    );

  function pick(name: string) {
    onPick(name);
  }

  async function addCustom() {
    const name = query.trim();
    if (!name) return;
    await customMutation.mutateAsync(name).catch(() => undefined);
    pick(name);
  }

  const list = query.trim() ? results : recent;

  return (
    <div className="mt-3 rounded-2xl border border-border bg-card p-2.5">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            aria-label="Search exercise"
            placeholder="Search exercise…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onCancel();
              if (e.key === "Enter") {
                e.preventDefault();
                const first = list[0];
                if (first) pick(first.name);
                else void addCustom();
              }
            }}
            className="pl-8"
          />
        </div>
        <Button variant="ghost" size="iconSm" aria-label="Close exercise search" onClick={onCancel}>
          <X />
        </Button>
      </div>

      {!query.trim() && recent.length > 0 ? (
        <p className="mt-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Recent
        </p>
      ) : null}

      <div className="mt-1.5 max-h-72 overflow-y-auto">
        {libraryQuery.isLoading ? (
          <p className="px-1 py-2 text-xs text-muted-foreground">Loading exercises…</p>
        ) : list.length === 0 ? (
          <p className="px-1 py-2 text-xs text-muted-foreground">
            {query.trim() ? "No matches in the library." : "Start typing to search exercises."}
          </p>
        ) : (
          <ul>
            {list.map((item) => {
              const line = item.history ? historyLine(item.history) : null;
              return (
                <li key={`${item.name}-${item.score}`}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => pick(item.name)}
                    className="flex w-full items-center justify-between gap-2 rounded-xl px-2 py-2 text-left hover:bg-lavender-faint disabled:opacity-60"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {item.name}
                      </span>
                      {line || item.detail ? (
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {line ?? item.detail}
                        </span>
                      ) : null}
                    </span>
                    {line && item.detail ? (
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {item.detail}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {query.trim() && !exactExists ? (
          <button
            type="button"
            disabled={busy || customMutation.isPending}
            onClick={() => void addCustom()}
            className="mt-1 flex w-full items-center gap-1.5 rounded-xl bg-lavender-faint px-2 py-2 text-left text-sm font-semibold text-accent-foreground hover:bg-lavender-soft disabled:opacity-60"
          >
            {customMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Plus className="size-3.5" />
            )}
            <span className="truncate">Add “{query.trim()}” as custom exercise</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

function muscleLine(lib: LibraryExercise): string {
  return [lib.primary_muscle_group, lib.equipment].filter(Boolean).join(" · ");
}

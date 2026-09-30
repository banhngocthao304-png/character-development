import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardTitle, Skeleton } from "@/components/ui-kit";
import { fetchExerciseLibrary, fetchPersonalRecordRows } from "./api";

const INITIAL = 7;

type Record = {
  key: string;
  name: string;
  weight: number;
  unit: string;
  reps: number | null;
  lastDate: string;
};

export function PersonalRecords({ className }: { className?: string }) {
  const [showAll, setShowAll] = useState(false);
  // Key shares the muscle-balance prefix so every existing exercise/session mutation refreshes it.
  const rowsQuery = useQuery({ queryKey: ["pt-muscle-balance", "prs"], queryFn: fetchPersonalRecordRows });
  const libraryQuery = useQuery({ queryKey: ["exercise-library"], queryFn: fetchExerciseLibrary });

  const records = useMemo(() => {
    const library = libraryQuery.data ?? [];
    const byId = new Map(library.map((l) => [l.id, l]));
    const byName = new Map<string, (typeof library)[number]>();
    for (const l of library) {
      byName.set(l.exercise_name.trim().toLowerCase(), l);
      for (const a of l.aliases ?? []) {
        const k = a.trim().toLowerCase();
        if (k && !byName.has(k)) byName.set(k, l);
      }
    }
    const map = new Map<string, Record>();
    for (const r of rowsQuery.data ?? []) {
      const lib =
        (r.exercise_library_id && byId.get(r.exercise_library_id)) ||
        byName.get(r.exercise_name.trim().toLowerCase());
      const id = lib ? lib.id : `name:${r.exercise_name.trim().toLowerCase()}`;
      const unit = (r.weight_unit || "kg").toLowerCase();
      const key = `${id}|${unit}`;
      const weight = Number(r.weight);
      const cur = map.get(key);
      if (!cur) {
        map.set(key, {
          key,
          name: lib?.exercise_name ?? r.exercise_name.trim(),
          weight,
          unit,
          reps: r.reps,
          lastDate: r.session_date,
        });
        continue;
      }
      if (r.session_date > cur.lastDate) cur.lastDate = r.session_date;
      if (weight > cur.weight || (weight === cur.weight && (r.reps ?? 0) > (cur.reps ?? 0))) {
        cur.weight = weight;
        cur.reps = r.reps;
      }
    }
    return [...map.values()].sort((a, b) =>
      a.lastDate !== b.lastDate ? (a.lastDate < b.lastDate ? 1 : -1) : a.name.localeCompare(b.name),
    );
  }, [rowsQuery.data, libraryQuery.data]);

  const visible = showAll ? records : records.slice(0, INITIAL);

  return (
    <Card className={className}>
      <CardTitle>
        Personal Records{" "}
        <span className="text-[11px] font-normal text-muted-foreground">(the receipts)</span>
      </CardTitle>
      {rowsQuery.isLoading ? (
        <Skeleton className="h-20" />
      ) : records.length === 0 ? (
        <p className="text-xs text-muted-foreground">Log a weight on any exercise to see it here.</p>
      ) : (
        <>
          <ul className="divide-y divide-border">
            {visible.map((r) => (
              <li key={r.key} className="flex items-center justify-between gap-3 py-1.5 text-sm">
                <span className="min-w-0 truncate">{r.name}</span>
                <span className="shrink-0 font-semibold tabular-nums">
                  {r.weight.toLocaleString(undefined, { maximumFractionDigits: 2 })} {r.unit}
                  {r.reps ? <span className="font-normal text-muted-foreground"> × {r.reps}</span> : null}
                </span>
              </li>
            ))}
          </ul>
          {records.length > INITIAL ? (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-1.5 text-xs font-medium text-primary hover:underline"
            >
              {showAll ? "Show less" : `View all (${records.length})`}
            </button>
          ) : null}
        </>
      )}
    </Card>
  );
}

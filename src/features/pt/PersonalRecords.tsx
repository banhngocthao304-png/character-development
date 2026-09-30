import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardTitle, Skeleton } from "@/components/ui-kit";
import { fetchExerciseLibrary, fetchPersonalRecordRows } from "./api";

const GROUPS = ["Glutes", "Legs", "Back", "Chest", "Shoulders", "Arms", "Core", "Other"] as const;
type Group = (typeof GROUPS)[number];

function groupFor(muscles: string[] | undefined): Group {
  const first = (muscles ?? [])[0];
  if (first === "Quads" || first === "Hamstrings" || first === "Calves") return "Legs";
  return (GROUPS as readonly string[]).includes(first ?? "") ? (first as Group) : "Other";
}

type Record = {
  key: string;
  name: string;
  weight: number;
  unit: string;
  reps: number | null;
  lastDate: string;
  group: Group;
};

export function PersonalRecords({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set());
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
          group: groupFor(lib?.primary_muscle_groups?.length ? lib.primary_muscle_groups : lib ? [lib.primary_muscle_group] : []),
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

  const grouped = GROUPS.map((g) => ({ group: g, items: records.filter((r) => r.group === g) })).filter(
    (g) => g.items.length > 0,
  );

  return (
    <Card className={className}>
      <CardTitle>
        My PRs
      </CardTitle>
      {rowsQuery.isLoading ? (
        <Skeleton className="h-20" />
      ) : records.length === 0 ? (
        <p className="text-xs text-muted-foreground">Log a weight on any exercise to see it here.</p>
      ) : (
        <div className="divide-y divide-border">
          {grouped.map(({ group, items }) => {
            const isOpen = open.has(group);
            return (
              <section key={group} className="min-w-0">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() =>
                    setOpen((prev) => {
                      const next = new Set(prev);
                      if (next.has(group)) next.delete(group);
                      else next.add(group);
                      return next;
                    })
                  }
                  className="flex w-full items-center justify-between gap-2 py-2 text-left"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-brand">
                    {group}
                    <span className="ml-1.5 font-normal text-muted-foreground">{items.length}</span>
                  </span>
                  <ChevronRight
                    className={`size-4 shrink-0 text-brand transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                  />
                </button>
                <div
                  className={`grid transition-[grid-template-rows] duration-200 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                >
                  <ul className="overflow-hidden sm:grid sm:grid-cols-2 sm:gap-x-6">
                    {items.map((r) => (
                      <li key={r.key} className="flex items-baseline justify-between gap-3 py-1 text-[13px] last:pb-2">
                        <span className="min-w-0 truncate text-muted-foreground">{r.name}</span>
                        <span className="shrink-0 font-semibold tabular-nums text-foreground">
                          {r.weight.toLocaleString(undefined, { maximumFractionDigits: 2 })} {r.unit}
                          {r.reps ? <span className="font-normal text-muted-foreground"> × {r.reps}</span> : null}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            );
          })}
        </div>

      )}
    </Card>
  );
}

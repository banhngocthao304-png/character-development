import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  Tooltip,
  type TooltipProps,
} from "recharts";
import { Card, Skeleton } from "@/components/ui-kit";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addDays, parseISODate, todayISO } from "@/lib/dates";
import {
  fetchExerciseLibrary,
  fetchMuscleBalanceExercises,
} from "./api";
import { cn } from "@/lib/utils";
import { calculateMuscleCredits } from "./muscle-logic";
type PeriodOption = "week" | "cycle" | "30days" | "all";

const PERIODS: { value: PeriodOption; label: string }[] = [
  { value: "week", label: "This Week" },
  { value: "cycle", label: "Current Cycle" },
  { value: "30days", label: "Last 30 Days" },
  { value: "all", label: "All Time" },
];

const chartConfig = {
  credits: { label: "Set credits", color: "var(--color-primary)" },
} satisfies ChartConfig;

function periodRange(option: PeriodOption, cycle: { startISO: string; endISO: string }) {
  const today = todayISO();
  if (option === "all") return { startISO: undefined, endISO: today };
  if (option === "30days") return { startISO: addDays(today, -29), endISO: today };
  if (option === "cycle") {
    return { startISO: cycle.startISO, endISO: today < cycle.endISO ? today : cycle.endISO };
  }
  const date = parseISODate(today);
  const mondayOffset = (date.getDay() + 6) % 7;
  return { startISO: addDays(today, -mondayOffset), endISO: today };
}

function MuscleTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload as { muscle?: string; credits?: number } | undefined;
  if (!item?.muscle || item.credits == null) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs shadow-lg">
      <p className="font-semibold text-foreground">{item.muscle}</p>
      <p className="text-muted-foreground">
        {item.credits.toLocaleString()} set {item.credits === 1 ? "credit" : "credits"}
      </p>
    </div>
  );
}

export function MuscleBalance({
  cycle,
  className,
}: {
  cycle: { startISO: string; endISO: string };
  className?: string;
}) {
  const [period, setPeriod] = useState<PeriodOption>("cycle");
  const activityQuery = useQuery({
    queryKey: ["pt-muscle-balance"],
    queryFn: fetchMuscleBalanceExercises,
  });
  const libraryQuery = useQuery({ queryKey: ["exercise-library"], queryFn: fetchExerciseLibrary });
  const range = useMemo(() => periodRange(period, cycle), [period, cycle]);
  const data = useMemo(
    () =>
      calculateMuscleCredits(
        activityQuery.data ?? [],
        libraryQuery.data ?? [],
        range.startISO,
        range.endISO,
      ),
    [activityQuery.data, libraryQuery.data, range],
  );
  const hasData = data.some((item) => item.credits > 0);
  const isLoading = activityQuery.isLoading || libraryQuery.isLoading;

  return (
    <Card className={cn("min-w-0 overflow-hidden", className)}>
      <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-base font-semibold sm:text-lg">Muscle Balance</h2>
          <p className="text-[11px] font-normal text-muted-foreground">
            (apparently I have favorites…)
          </p>
        </div>
        <Select value={period} onValueChange={(value) => setPeriod(value as PeriodOption)}>
          <SelectTrigger
            className="h-8 w-[132px] rounded-xl px-2.5 text-xs font-medium"
            aria-label="Muscle balance period"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PERIODS.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-[260px] sm:h-[300px]" />
      ) : !hasData ? (
        <div className="flex h-[220px] items-center justify-center rounded-2xl border border-dashed border-border bg-lavender-faint/40 px-4 text-center text-sm text-muted-foreground">
          No workouts yet for this period.
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="mx-auto h-[270px] w-full max-w-xl aspect-auto sm:h-[310px]"
        >
          <RadarChart
            data={data}
            outerRadius="62%"
            margin={{ top: 16, right: 46, bottom: 16, left: 46 }}
          >
            <PolarGrid stroke="var(--color-border)" strokeOpacity={0.65} />
            <PolarAngleAxis
              dataKey="muscle"
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11, fontWeight: 500 }}
              tickLine={false}
            />
            <Tooltip content={<MuscleTooltip />} cursor={false} />
            <Radar
              dataKey="credits"
              stroke="var(--color-primary)"
              fill="var(--color-primary)"
              fillOpacity={0.18}
              strokeWidth={1.5}
              dot={{ r: 2.5, fill: "var(--color-primary)", strokeWidth: 0 }}
              activeDot={{
                r: 4,
                fill: "var(--color-primary)",
                stroke: "var(--color-card)",
                strokeWidth: 2,
              }}
            />
          </RadarChart>
        </ChartContainer>
      )}

      <p className="mt-2 text-[10px] text-muted-foreground">
        Based on working sets · Primary 100% · Secondary 50%
      </p>
    </Card>
  );
}
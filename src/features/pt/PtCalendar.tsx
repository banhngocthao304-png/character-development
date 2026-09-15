import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { formatMonthYear, monthGrid, parseISODate, todayISO } from "@/lib/dates";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function PtCalendar({
  year,
  month,
  onMonthChange,
  trainedDates,
  selectedDate,
  onSelectDate,
  periodStartISO,
  periodEndISO,
  busyDate,
}: {
  year: number;
  month: number;
  onMonthChange: (year: number, month: number) => void;
  trainedDates: Set<string>;
  selectedDate: string | null;
  onSelectDate: (dateISO: string) => void;
  periodStartISO: string;
  periodEndISO: string;
  busyDate: string | null;
}) {
  const cells = monthGrid(year, month);
  const today = todayISO();

  function step(delta: number) {
    const d = new Date(year, month + delta, 1);
    onMonthChange(d.getFullYear(), d.getMonth());
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="min-w-0 truncate text-base font-bold sm:text-lg">
          {formatMonthYear(year, month)}
        </h2>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="soft" size="iconSm" aria-label="Previous month" onClick={() => step(-1)}>
            <ChevronLeft />
          </Button>
          <Button variant="soft" size="iconSm" aria-label="Next month" onClick={() => step(1)}>
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-muted-foreground sm:text-xs">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((iso) => {
          const date = parseISODate(iso);
          const inMonth = date.getMonth() === month;
          const trained = trainedDates.has(iso);
          const inPeriod = iso >= periodStartISO && iso <= periodEndISO;
          const selected = selectedDate === iso;
          const isToday = iso === today;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelectDate(iso)}
              aria-pressed={trained}
              aria-label={`${date.getDate()} ${formatMonthYear(date.getFullYear(), date.getMonth())}${trained ? " — trained" : ""}`}
              className={cn(
                "relative flex aspect-square min-h-11 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                inMonth ? "text-foreground" : "text-muted-foreground/40",
                trained
                  ? "scale-100 bg-primary text-primary-foreground hover:bg-primary/90"
                  : inPeriod
                    ? "bg-lavender-faint hover:bg-lavender-soft"
                    : "hover:bg-muted",
                selected && !trained && "ring-2 ring-primary/50",
                selected && trained && "ring-2 ring-primary/40 ring-offset-2 ring-offset-card",
                busyDate === iso && "opacity-60",
                isToday && !trained && "underline decoration-primary decoration-2 underline-offset-4",
              )}
            >
              {date.getDate()}
              {trained ? (
                <Check
                  className="absolute bottom-0.5 size-3 opacity-90"
                  aria-hidden="true"
                  strokeWidth={3}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-2">
          <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-primary" />
          Trained
        </span>
        <span className="flex items-center gap-2">
          <span className="inline-block size-3.5 rounded-full bg-lavender-faint ring-1 ring-border" />
          In current period
        </span>
      </div>
    </div>
  );
}

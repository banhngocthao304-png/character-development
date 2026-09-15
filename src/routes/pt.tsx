import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dumbbell } from "lucide-react";
import { toast } from "sonner";
import { Card, CardTitle, PageHeader, Skeleton } from "@/components/ui-kit";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PtCalendar } from "@/features/pt/PtCalendar";
import { SessionDetails } from "@/features/pt/SessionDetails";
import {
  createSession,
  deleteSession,
  fetchExercises,
  fetchPtSettings,
  fetchSessionsBetween,
  type PtSession,
} from "@/features/pt/api";
import { currentPeriod, DEFAULT_PERIOD_START_DAY, DEFAULT_SESSIONS_PER_PERIOD } from "@/lib/pt";
import { daysLeft, formatDateShort, parseISODate, todayISO } from "@/lib/dates";

export const Route = createFileRoute("/pt")({
  head: () => ({
    meta: [
      { title: "PT Tracker — a healthier, happier me" },
      {
        name: "description",
        content: "Mark the days you trained with your PT and record what you lifted each session.",
      },
      { property: "og:title", content: "PT Tracker" },
      {
        property: "og:description",
        content: "Mark the days you trained with your PT and record what you lifted.",
      },
    ],
  }),
  component: PtPage,
});

function PtPage() {
  const queryClient = useQueryClient();
  const today = todayISO();
  const [view, setView] = useState(() => {
    const d = parseISODate(today);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [pendingRemove, setPendingRemove] = useState<PtSession | null>(null);

  const settingsQuery = useQuery({ queryKey: ["pt-settings"], queryFn: fetchPtSettings });
  const startDay = settingsQuery.data?.period_start_day ?? DEFAULT_PERIOD_START_DAY;
  const perPeriod = settingsQuery.data?.sessions_per_period ?? DEFAULT_SESSIONS_PER_PERIOD;
  const period = useMemo(() => currentPeriod(startDay), [startDay]);

  // Range that covers both the visible calendar grid and the current period.
  const range = useMemo(() => {
    const gridStart = new Date(view.year, view.month - 1, 1);
    const gridEnd = new Date(view.year, view.month + 2, 0);
    const startISO = [
      `${gridStart.getFullYear()}-${String(gridStart.getMonth() + 1).padStart(2, "0")}-01`,
      period.startISO,
    ].sort()[0] as string;
    const endISO = [
      `${gridEnd.getFullYear()}-${String(gridEnd.getMonth() + 1).padStart(2, "0")}-${String(gridEnd.getDate()).padStart(2, "0")}`,
      period.endISO,
    ].sort()[1] as string;
    return { startISO, endISO };
  }, [view, period]);

  const sessionsQuery = useQuery({
    queryKey: ["pt-sessions", range.startISO, range.endISO],
    queryFn: () => fetchSessionsBetween(range.startISO, range.endISO),
  });

  const sessions = sessionsQuery.data ?? [];
  const trainedDates = useMemo(() => new Set(sessions.map((s) => s.session_date)), [sessions]);
  const selectedSession = sessions.find((s) => s.session_date === selectedDate) ?? null;

  const periodCount = sessions.filter(
    (s) => s.session_date >= period.startISO && s.session_date <= period.endISO,
  ).length;
  const remaining = perPeriod - periodCount;
  const progress = Math.min(100, Math.round((periodCount / perPeriod) * 100));

  const createMutation = useMutation({
    mutationFn: createSession,
    onSuccess: (created) => {
      setSelectedDate(created.session_date);
      queryClient.invalidateQueries({ queryKey: ["pt-sessions"] });
    },
    onError: () => toast.error("Couldn't save this PT day. Please try again."),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      setSelectedDate(null);
      setPendingRemove(null);
      queryClient.invalidateQueries({ queryKey: ["pt-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["pt-exercise-history"] });
    },
    onError: () => toast.error("Couldn't remove this PT session. Please try again."),
  });

  async function requestRemove(session: PtSession) {
    const exercises = await fetchExercises(session.id);
    const hasDetails =
      exercises.length > 0 || !!session.session_note?.trim() || !!session.session_type;
    if (hasDetails) {
      setPendingRemove(session);
    } else {
      deleteMutation.mutate(session.id);
    }
  }

  function onSelectDate(dateISO: string) {
    const existing = sessions.find((s) => s.session_date === dateISO);
    if (!existing) {
      setSelectedDate(dateISO);
      createMutation.mutate(dateISO);
      return;
    }
    if (selectedDate === dateISO) {
      void requestRemove(existing);
      return;
    }
    setSelectedDate(dateISO);
  }

  return (
    <>
      <PageHeader
        icon={<Dumbbell className="size-7" />}
        title="PT Tracker"
        subtitle="Show up for yourself"
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-6">
        <div className="space-y-5">
          <Card>
            <CardTitle>Current period</CardTitle>
            {settingsQuery.isLoading || sessionsQuery.isLoading ? (
              <Skeleton className="h-24" />
            ) : (
              <>
                <p className="text-lg font-bold sm:text-xl">
                  {formatDateShort(period.startISO)} – {formatDateShort(period.endISO)}
                </p>
                <p className="mt-2 text-2xl font-bold text-primary">
                  {periodCount} / {perPeriod}
                  <span className="ml-2 text-sm font-semibold text-muted-foreground">sessions</span>
                </p>
                <div
                  className="mt-3 h-2 w-full overflow-hidden rounded-full bg-lavender-soft"
                  role="progressbar"
                  aria-valuenow={periodCount}
                  aria-valuemin={0}
                  aria-valuemax={perPeriod}
                >
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-muted-foreground">
                    {remaining >= 0
                      ? `${remaining} session${remaining === 1 ? "" : "s"} remaining`
                      : `${Math.abs(remaining)} session${Math.abs(remaining) === 1 ? "" : "s"} over package`}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {daysLeft(period.endISO)} days left
                  </span>
                </div>
              </>
            )}
          </Card>

          <Card>
            <PtCalendar
              year={view.year}
              month={view.month}
              onMonthChange={(year, month) => setView({ year, month })}
              trainedDates={trainedDates}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
              periodStartISO={period.startISO}
              periodEndISO={period.endISO}
              busyDate={createMutation.isPending ? createMutation.variables ?? null : null}
            />
          </Card>
        </div>

        <Card className="lg:sticky lg:top-6 lg:self-start">
          <CardTitle>Session details</CardTitle>
          {selectedSession ? (
            <SessionDetails
              session={selectedSession}
              onRemoveSession={() => void requestRemove(selectedSession)}
            />
          ) : (
            <p className="rounded-2xl border border-dashed border-border bg-lavender-faint/40 px-4 py-8 text-center text-sm text-muted-foreground">
              Select a completed PT day to view or add workout details.
            </p>
          )}
        </Card>
      </div>

      <AlertDialog open={!!pendingRemove} onOpenChange={(open) => !open && setPendingRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this PT session?</AlertDialogTitle>
            <AlertDialogDescription>
              The workout details saved for{" "}
              {pendingRemove ? formatDateShort(pendingRemove.session_date) : ""} will also be
              deleted. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => pendingRemove && deleteMutation.mutate(pendingRemove.id)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

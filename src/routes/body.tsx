import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { MoreHorizontal, Plus, Ruler } from "lucide-react";
import { toast } from "sonner";
import { Card, CardTitle, EmptyState, FieldLabel, PageHeader, Skeleton } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  createBodyMeasurement,
  deleteBodyMeasurement,
  fetchBodyMeasurements,
  updateBodyMeasurement,
  type BodyMeasurement,
  type MeasurementValues,
} from "@/features/body/api";
import { formatDate, formatDateShort, parseISODate, todayISO } from "@/lib/dates";

export const Route = createFileRoute("/body")({
  head: () => ({
    meta: [
      { title: "Body Measurements — a healthier, happier me" },
      {
        name: "description",
        content: "Record your weight and body measurements over time and watch the trend.",
      },
      { property: "og:title", content: "Body Measurements" },
      {
        property: "og:description",
        content: "Record your weight and body measurements over time.",
      },
    ],
  }),
  component: BodyPage,
});

function BodyPage() {
  const queryClient = useQueryClient();
  const measurementsQuery = useQuery({
    queryKey: ["body-measurements"],
    queryFn: fetchBodyMeasurements,
  });
  const entries = measurementsQuery.data ?? [];
  const [formEntry, setFormEntry] = useState<BodyMeasurement | "new" | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<BodyMeasurement | null>(null);
  const [metric, setMetric] = useState<MetricKey>("weight_kg");
  const [range, setRange] = useState<RangeKey>("1M");

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["body-measurements"] });
  const deleteMutation = useMutation({
    mutationFn: deleteBodyMeasurement,
    onSuccess: () => {
      setDeleteEntry(null);
      void refresh();
      toast.success("Measurement entry deleted");
    },
    onError: () => toast.error("Couldn't delete this entry. Please try again."),
  });

  return (
    <>
      <PageHeader
        icon={<Ruler className="size-7" />}
        title="Body Measurements"
        subtitle="Progress, not perfection"
      />

      <div className="space-y-5 lg:space-y-6">
        <Card>
          <CardTitle
            action={
              <Button size="sm" onClick={() => setFormEntry("new")}>
                <Plus /> Add Entry
              </Button>
            }
          >
            Latest Measurements
          </CardTitle>
          {measurementsQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
              {METRICS.map((item) => <Skeleton key={item.key} className="h-28" />)}
            </div>
          ) : (
            <LatestMeasurements entries={entries} />
          )}
        </Card>

        <Card>
          <CardTitle>Progress</CardTitle>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Select value={metric} onValueChange={(value) => setMetric(value as MetricKey)}>
              <SelectTrigger className="h-10 w-full rounded-xl bg-card sm:w-44" aria-label="Measurement metric">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRICS.map((item) => <SelectItem key={item.key} value={item.key}>{item.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-5 rounded-xl bg-lavender-faint p-1" aria-label="Time range">
              {RANGES.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant={range === item ? "soft" : "ghost"}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setRange(item)}
                  aria-pressed={range === item}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
          <ProgressGraph entries={entries} metric={metric} range={range} onAdd={() => setFormEntry("new")} />
        </Card>

        <Card>
          <CardTitle>History</CardTitle>
          {measurementsQuery.isLoading ? (
            <Skeleton className="h-48" />
          ) : entries.length === 0 ? (
            <EmptyState title="No measurement entries yet" action={<Button size="sm" onClick={() => setFormEntry("new")}>Add Entry</Button>} />
          ) : (
            <MeasurementHistory entries={entries} onEdit={setFormEntry} onDelete={setDeleteEntry} />
          )}
        </Card>
      </div>

      <MeasurementForm
        open={formEntry !== null}
        entry={formEntry === "new" ? null : formEntry}
        allEntries={entries}
        onOpenChange={(open) => !open && setFormEntry(null)}
        onSaved={() => {
          setFormEntry(null);
          void refresh();
        }}
      />

      <AlertDialog open={deleteEntry !== null} onOpenChange={(open) => !open && setDeleteEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this measurement entry?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteEntry && deleteMutation.mutate(deleteEntry.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

const METRICS = [
  { key: "weight_kg", label: "Weight", unit: "kg" },
  { key: "waist_cm", label: "Waist", unit: "cm" },
  { key: "hip_cm", label: "Hip", unit: "cm" },
  { key: "bust_cm", label: "Bust", unit: "cm" },
  { key: "thigh_cm", label: "Thigh", unit: "cm" },
  { key: "arm_cm", label: "Arm", unit: "cm" },
] as const;
type MetricKey = (typeof METRICS)[number]["key"];
type RangeKey = "1M" | "3M" | "6M" | "1Y" | "All";
const RANGES: RangeKey[] = ["1M", "3M", "6M", "1Y", "All"];

function formatNumber(value: number): string {
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

function LatestMeasurements({ entries }: { entries: BodyMeasurement[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      {METRICS.map((metric) => {
        const valid = entries.filter((entry) => entry[metric.key] != null);
        const latest = valid[0];
        const previous = valid[1];
        const value = latest?.[metric.key];
        const previousValue = previous?.[metric.key];
        const difference = value != null && previousValue != null ? Number(value) - Number(previousValue) : null;
        return (
          <div key={metric.key} className="min-h-28 rounded-xl border border-border bg-lavender-faint/40 p-3.5">
            <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
            {value != null ? (
              <>
                <p className="mt-1 text-xl font-bold tabular-nums">{formatNumber(Number(value))} <span className="text-sm font-medium text-muted-foreground">{metric.unit}</span></p>
                {difference != null && difference !== 0 ? (
                  <p className="mt-1 text-xs font-medium text-primary">{difference < 0 ? "↓" : "↑"} {formatNumber(Math.abs(difference))} {metric.unit}</p>
                ) : <div className="h-5" />}
                <p className="mt-1 text-xs text-muted-foreground">{latest ? formatDateShort(latest.measurement_date) : ""}</p>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Not recorded</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProgressGraph({ entries, metric, range, onAdd }: { entries: BodyMeasurement[]; metric: MetricKey; range: RangeKey; onAdd: () => void }) {
  const config = METRICS.find((item) => item.key === metric) ?? METRICS[0];
  const points = useMemo(() => {
    const months = { "1M": 1, "3M": 3, "6M": 6, "1Y": 12 } as const;
    let cutoff = "";
    if (range !== "All") {
      const date = parseISODate(todayISO());
      date.setMonth(date.getMonth() - months[range]);
      cutoff = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }
    return entries
      .filter((entry) => entry[metric] != null && (!cutoff || entry.measurement_date >= cutoff))
      .map((entry) => ({ date: entry.measurement_date, label: formatDateShort(entry.measurement_date), value: Number(entry[metric]) }))
      .reverse();
  }, [entries, metric, range]);

  if (points.length === 0) {
    return <EmptyState title={`No ${config.label.toLowerCase()} measurements yet.`} action={<Button size="sm" onClick={onAdd}>Add Entry</Button>} />;
  }

  return (
    <div>
      <ChartContainer config={{ value: { label: config.label, color: "var(--color-primary)" } }} className="h-64 w-full aspect-auto sm:h-72">
        <LineChart data={points} margin={{ top: 12, right: 12, bottom: 0, left: -18 }} accessibilityLayer>
          <CartesianGrid vertical={false} stroke="var(--color-border)" strokeOpacity={0.7} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={28} />
          <YAxis tickLine={false} axisLine={false} domain={["dataMin - 1", "dataMax + 1"]} width={48} />
          <ChartTooltip
            cursor={{ stroke: "var(--color-border)" }}
            content={({ active, payload }) => {
              const point = payload?.[0]?.payload as { date?: string; value?: number } | undefined;
              if (!active || point?.date == null || point.value == null) return null;
              return <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lift"><p className="font-medium">{formatDate(point.date)}</p><p className="mt-1 text-muted-foreground">{formatNumber(point.value)} {config.unit}</p></div>;
            }}
          />
          <Line type="linear" dataKey="value" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-card)", stroke: "var(--color-primary)", strokeWidth: 2 }} activeDot={{ r: 5 }} connectNulls={false} />
        </LineChart>
      </ChartContainer>
      {points.length === 1 ? <p className="mt-3 text-center text-xs text-muted-foreground">Add more entries to see your progress over time.</p> : null}
    </div>
  );
}

function MeasurementHistory({ entries, onEdit, onDelete }: { entries: BodyMeasurement[]; onEdit: (entry: BodyMeasurement) => void; onDelete: (entry: BodyMeasurement) => void }) {
  const menu = (entry: BodyMeasurement) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="ghost" size="iconSm" aria-label={`Actions for ${formatDate(entry.measurement_date)}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => onEdit(entry)}>Edit</DropdownMenuItem><DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => onDelete(entry)}>Delete</DropdownMenuItem></DropdownMenuContent>
    </DropdownMenu>
  );
  return (
    <>
      <div className="space-y-3 md:hidden">
        {entries.map((entry) => (
          <article key={entry.id} className="rounded-xl border border-border p-4">
            <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">{formatDate(entry.measurement_date)}</h3>{menu(entry)}</div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              {METRICS.filter((item) => entry[item.key] != null).map((item) => <div key={item.key} className="flex justify-between gap-2 text-sm"><span className="text-muted-foreground">{item.label}</span><span className="font-medium tabular-nums">{formatNumber(Number(entry[item.key]))} {item.unit}</span></div>)}
            </div>
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-border text-xs font-medium text-muted-foreground"><th className="px-3 py-3">Date</th>{METRICS.map((item) => <th key={item.key} className="px-3 py-3">{item.label}</th>)}<th className="w-10"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{entries.map((entry) => <tr key={entry.id} className="border-b border-border last:border-0"><td className="whitespace-nowrap px-3 py-3 font-medium">{formatDate(entry.measurement_date)}</td>{METRICS.map((item) => <td key={item.key} className="px-3 py-3 tabular-nums text-muted-foreground">{entry[item.key] == null ? "—" : `${formatNumber(Number(entry[item.key]))} ${item.unit}`}</td>)}<td>{menu(entry)}</td></tr>)}</tbody>
        </table>
      </div>
    </>
  );
}

type FormState = Record<MetricKey, string> & { measurement_date: string };
function MeasurementForm({ open, entry, allEntries, onOpenChange, onSaved }: { open: boolean; entry: BodyMeasurement | null; allEntries: BodyMeasurement[]; onOpenChange: (open: boolean) => void; onSaved: () => void }) {
  const initial = (): FormState => ({ measurement_date: entry?.measurement_date ?? todayISO(), weight_kg: entry?.weight_kg?.toString() ?? "", waist_cm: entry?.waist_cm?.toString() ?? "", hip_cm: entry?.hip_cm?.toString() ?? "", bust_cm: entry?.bust_cm?.toString() ?? "", thigh_cm: entry?.thigh_cm?.toString() ?? "", arm_cm: entry?.arm_cm?.toString() ?? "" });
  const [form, setForm] = useState<FormState>(initial);
  const existing = allEntries.find((item) => item.measurement_date === form.measurement_date && item.id !== entry?.id) ?? null;
  const hasValue = METRICS.some((item) => form[item.key] !== "");
  const mutation = useMutation({
    mutationFn: async () => {
      const values = Object.fromEntries(METRICS.map((item) => [item.key, form[item.key] === "" ? null : Number(form[item.key])])) as Omit<MeasurementValues, "measurement_date">;
      const payload = { measurement_date: form.measurement_date, ...values };
      if (entry) return updateBodyMeasurement({ id: entry.id, values: payload });
      if (existing) return updateBodyMeasurement({ id: existing.id, values: payload });
      return createBodyMeasurement(payload);
    },
    onSuccess: () => { toast.success(entry || existing ? "Measurements updated" : "Measurements saved"); onSaved(); },
    onError: () => toast.error("Couldn't save these measurements. Please try again."),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={`${entry?.id ?? "new"}-${open}`} className="fixed inset-x-0 bottom-0 left-0 top-auto max-h-[90vh] w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-t-2xl p-5 sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:p-6" onOpenAutoFocus={() => setForm(initial())}>
        <DialogHeader><DialogTitle>{entry ? "Edit Measurements" : "Add Measurements"}</DialogTitle><DialogDescription>Enter at least one measurement.</DialogDescription></DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="col-span-2"><FieldLabel htmlFor="measurement-date">Date</FieldLabel><Input id="measurement-date" type="date" value={form.measurement_date} onChange={(event) => setForm((current) => ({ ...current, measurement_date: event.target.value }))} /></div>
          {METRICS.map((item) => <div key={item.key}><FieldLabel htmlFor={item.key}>{item.label}</FieldLabel><div className="relative"><Input id={item.key} type="number" inputMode="decimal" min="0" step="0.1" className="pr-10" value={form[item.key]} onChange={(event) => setForm((current) => ({ ...current, [item.key]: event.target.value }))} /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{item.unit}</span></div></div>)}
        </div>
        {existing ? <p role="status" className="rounded-xl bg-lavender-faint px-3 py-2 text-sm font-medium text-accent-foreground">Measurements already exist for this date.</p> : null}
        <DialogFooter className="gap-2"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="button" disabled={!form.measurement_date || !hasValue || mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? "Saving…" : existing ? "Update Existing Entry" : entry ? "Update Measurements" : "Save Measurements"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

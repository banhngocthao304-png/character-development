/** Local-date helpers. Never use toISOString() on a calendar date — it shifts by timezone. */

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse a YYYY-MM-DD string as a LOCAL date (no UTC shift). */
export function parseISODate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(value: string, days: number): string {
  const d = parseISODate(value);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function addMonths(value: string, months: number): string {
  const d = parseISODate(value);
  d.setMonth(d.getMonth() + months, 1);
  return toISODate(d);
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const MONTHS_LONG = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** e.g. "15 Sep 2026" */
export function formatDate(value: string): string {
  const d = parseISODate(value);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** e.g. "15 Sep" */
export function formatDateShort(value: string): string {
  const d = parseISODate(value);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** e.g. "Tue, 15 Sep 2026" */
export function formatDateWithWeekday(value: string): string {
  const d = parseISODate(value);
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatMonthYear(year: number, month: number): string {
  return `${MONTHS_LONG[month]} ${year}`;
}

export function monthLabelShort(year: number, month: number): string {
  return `${MONTHS[month]} ${year}`;
}

export function daysBetweenInclusive(startISO: string, endISO: string): number {
  const a = parseISODate(startISO).getTime();
  const b = parseISODate(endISO).getTime();
  return Math.round((b - a) / 86400000) + 1;
}

export function isWithin(value: string, startISO: string, endISO: string): boolean {
  return value >= startISO && value <= endISO;
}

/** Monday-first calendar grid (6 weeks) covering the given month. */
export function monthGrid(year: number, month: number): string[] {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Monday = 0
  const start = new Date(year, month, 1 - offset);
  const cells: string[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push(toISODate(d));
  }
  return cells;
}

/** "12:30" from a Postgres time value like "12:30:00". */
export function formatTime(value: string | null): string | null {
  if (!value) return null;
  return value.slice(0, 5);
}

export function daysLeft(endISO: string): number {
  const diff = Math.ceil(
    (parseISODate(endISO).getTime() - parseISODate(todayISO()).getTime()) / 86400000,
  );
  return Math.max(0, diff);
}

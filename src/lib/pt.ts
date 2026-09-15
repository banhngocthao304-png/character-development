import { addMonths, parseISODate, toISODate, todayISO } from "./dates";

export const DEFAULT_PERIOD_START_DAY = 15;
export const DEFAULT_SESSIONS_PER_PERIOD = 16;

export type PtPeriod = { startISO: string; endISO: string };

/**
 * PT periods recur automatically: startDay of a month → (startDay - 1) of the next month.
 * The period containing `dateISO` is returned. Works across month and year boundaries.
 */
export function periodForDate(dateISO: string, startDay = DEFAULT_PERIOD_START_DAY): PtPeriod {
  const d = parseISODate(dateISO);
  const anchor =
    d.getDate() >= startDay
      ? new Date(d.getFullYear(), d.getMonth(), startDay)
      : new Date(d.getFullYear(), d.getMonth() - 1, startDay);
  const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, startDay - 1);
  return { startISO: toISODate(anchor), endISO: toISODate(end) };
}

export function currentPeriod(startDay = DEFAULT_PERIOD_START_DAY): PtPeriod {
  return periodForDate(todayISO(), startDay);
}

export function shiftPeriod(period: PtPeriod, months: number, startDay: number): PtPeriod {
  return periodForDate(addMonths(period.startISO, months), startDay);
}

export const SESSION_TYPES = [
  "Lower Body",
  "Upper Body",
  "Glutes",
  "Full Body",
  "Cardio",
  "Mobility",
  "Other",
];

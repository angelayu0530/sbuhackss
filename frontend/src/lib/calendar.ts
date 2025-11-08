import { Dayjs } from "dayjs";
import type { CalendarEvent } from "./types";
import { HOURS_END, HOURS_START } from "./types";

export function getMonthGrid(ref: Dayjs) {
  const first = ref.startOf("month");
  const start = first.startOf("week"); // Sunday
  return Array.from({ length: 6 }, (_, r) =>
    Array.from({ length: 7 }, (_, c) => start.add(r * 7 + c, "day"))
  );
}

export function groupByDay(events: CalendarEvent[]) {
  return events.reduce<Record<string, CalendarEvent[]>>((acc, ev) => {
    const key = ev.start.format("YYYY-MM-DD");
    (acc[key] ||= []).push(ev);
    return acc;
  }, {});
}

// Greedy overlap columns for day events
export function computeColumns(dayEvents: CalendarEvent[]) {
  type Placed = CalendarEvent & { col: number; colCount: number };
  const placed: Placed[] = [];
  const byStart = [...dayEvents].sort((a, b) => a.start.valueOf() - b.start.valueOf());
  const active: Placed[] = [];

  for (const ev of byStart) {
    for (let i = active.length - 1; i >= 0; i--) {
      if (active[i].end.valueOf() <= ev.start.valueOf()) active.splice(i, 1);
    }
    const used = new Set(active.map((e) => e.col));
    let col = 0;
    while (used.has(col)) col++;
    const p: Placed = { ...ev, col, colCount: 1 };
    active.push(p);
    placed.push(p);
    const maxCols = Math.max(...active.map((e) => e.col)) + 1;
    active.forEach((e) => (e.colCount = Math.max(e.colCount, maxCols)));
  }
  return placed;
}

export const clampToHours = (d: Dayjs) =>
  d.hour(Math.min(Math.max(d.hour(), HOURS_START), HOURS_END));

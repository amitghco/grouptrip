import type { Money } from "./types";

export function formatMoney(money: Money): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: money.currency,
    maximumFractionDigits: 0,
  }).format(money.amount);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatStops(stops: number): string {
  if (stops === 0) return "Direct";
  return stops === 1 ? "1 stop" : `${stops} stops`;
}

/** Formats a local "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm" string without time zone conversion. */
export function formatDate(isoLocal: string): string {
  const [y, m, d] = isoLocal.slice(0, 10).split("-").map(Number);
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function formatTime(isoLocal: string): string {
  return isoLocal.slice(11, 16);
}

/** Whole-day difference between two local date-times (e.g. +1 for overnight arrivals). */
export function dayOffset(fromIsoLocal: string, toIsoLocal: string): number {
  const from = Date.parse(`${fromIsoLocal.slice(0, 10)}T00:00:00Z`);
  const to = Date.parse(`${toIsoLocal.slice(0, 10)}T00:00:00Z`);
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

export function formatPassengers(adults: number, children: number): string {
  const parts = [`${adults} adult${adults === 1 ? "" : "s"}`];
  if (children > 0) parts.push(`${children} child${children === 1 ? "" : "ren"}`);
  return parts.join(", ");
}

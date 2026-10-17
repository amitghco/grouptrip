/** Time-zone helpers for "YYYY-MM-DDTHH:mm" airport-local times (no offset suffix). */

const MINUTE_MS = 60_000;
const formatters = new Map<string, Intl.DateTimeFormat>();

function offsetFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

/** UTC offset in minutes for `timeZone` at the given instant (DST-aware). */
export function utcOffsetMinutes(timeZone: string, instantMs: number): number {
  const name =
    offsetFormatter(timeZone)
      .formatToParts(new Date(instantMs))
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(name);
  if (!match) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0);
  return match[1] === "-" ? -minutes : minutes;
}

/** Converts an airport-local time to a UTC timestamp. */
export function localToUtc(isoLocal: string, timeZone: string): number {
  const asUtc = Date.parse(`${isoLocal}:00Z`);
  const guess = asUtc - utcOffsetMinutes(timeZone, asUtc) * MINUTE_MS;
  return asUtc - utcOffsetMinutes(timeZone, guess) * MINUTE_MS;
}

/** Converts a UTC timestamp to an airport-local "YYYY-MM-DDTHH:mm" string. */
export function utcToLocal(instantMs: number, timeZone: string): string {
  const local = instantMs + utcOffsetMinutes(timeZone, instantMs) * MINUTE_MS;
  return new Date(local).toISOString().slice(0, 16);
}

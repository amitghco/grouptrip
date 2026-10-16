import type { FlightSearchCriteria } from "./types";

export const LIMITS = {
  maxPassengers: 9,
  minAdults: 1,
  maxDestinations: 8,
  maxBudget: 1_000_000,
  maxDaysAhead: 365,
} as const;

export type SearchField =
  | "origin"
  | "destinations"
  | "departureDate"
  | "returnDate"
  | "adults"
  | "children"
  | "maxBudget";

export type FieldErrors = Partial<Record<SearchField, string>>;

/** Loosely-typed input as it arrives from a form or URL query string. */
export interface RawSearchInput {
  origin?: string | null;
  destinations?: string | string[] | null;
  departureDate?: string | null;
  returnDate?: string | null;
  adults?: string | number | null;
  children?: string | number | null;
  maxBudget?: string | number | null;
}

export type ValidationResult =
  | { ok: true; value: FlightSearchCriteria }
  | { ok: false; errors: FieldErrors };

const IATA_PATTERN = /^[A-Z]{3}$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export function normalizeIata(value: string): string {
  return value.trim().toUpperCase();
}

export function isValidIata(value: string): boolean {
  return IATA_PATTERN.test(normalizeIata(value));
}

/** Parses YYYY-MM-DD into a UTC timestamp, or null if not a real calendar date. */
export function parseIsoDate(value: string): number | null {
  if (!ISO_DATE_PATTERN.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  const time = Date.UTC(y, m - 1, d);
  const date = new Date(time);
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
    return null;
  }
  return time;
}

/** Today's date (YYYY-MM-DD) in the given IANA time zone. */
export function todayIso(timeZone = "Australia/Sydney", now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function parseCount(value: RawSearchInput["adults"]): number | null {
  if (value === undefined || value === null || value === "") return null;
  const num = typeof value === "number" ? value : Number(value);
  return Number.isInteger(num) ? num : NaN;
}

function toDestinationList(value: RawSearchInput["destinations"]): string[] {
  if (!value) return [];
  const parts = Array.isArray(value) ? value : value.split(",");
  const codes = parts.map(normalizeIata).filter(Boolean);
  return Array.from(new Set(codes));
}

export interface ValidateOptions {
  /** Override "today" (YYYY-MM-DD) for deterministic tests. */
  today?: string;
}

export function validateSearchInput(
  input: RawSearchInput,
  options: ValidateOptions = {},
): ValidationResult {
  const errors: FieldErrors = {};

  const origin = normalizeIata(input.origin ?? "");
  if (!origin) errors.origin = "Departure airport is required.";
  else if (!IATA_PATTERN.test(origin)) errors.origin = "Use a 3-letter IATA airport code, e.g. SYD.";

  const destinations = toDestinationList(input.destinations);
  const invalidDestinations = destinations.filter((code) => !IATA_PATTERN.test(code));
  if (destinations.length === 0) {
    errors.destinations = "Choose at least one destination.";
  } else if (invalidDestinations.length > 0) {
    errors.destinations = `Invalid airport code: ${invalidDestinations.join(", ")}.`;
  } else if (destinations.length > LIMITS.maxDestinations) {
    errors.destinations = `Choose up to ${LIMITS.maxDestinations} destinations.`;
  } else if (!errors.origin && destinations.includes(origin)) {
    errors.destinations = "Destination must differ from the departure airport.";
  }

  const today = options.today ?? todayIso();
  const todayTime = parseIsoDate(today)!;
  const departureDate = (input.departureDate ?? "").trim();
  const returnDate = (input.returnDate ?? "").trim();
  const departureTime = parseIsoDate(departureDate);
  const returnTime = parseIsoDate(returnDate);

  if (!departureDate) errors.departureDate = "Departure date is required.";
  else if (departureTime === null) errors.departureDate = "Enter a valid departure date.";
  else if (departureTime < todayTime) errors.departureDate = "Departure date cannot be in the past.";
  else if (departureTime > todayTime + LIMITS.maxDaysAhead * DAY_MS)
    errors.departureDate = `Departure must be within ${LIMITS.maxDaysAhead} days.`;

  if (!returnDate) errors.returnDate = "Return date is required.";
  else if (returnTime === null) errors.returnDate = "Enter a valid return date.";
  else if (departureTime !== null && returnTime <= departureTime)
    errors.returnDate = "Return date must be after the departure date.";
  else if (returnTime > todayTime + LIMITS.maxDaysAhead * DAY_MS)
    errors.returnDate = `Return must be within ${LIMITS.maxDaysAhead} days.`;

  const adults = parseCount(input.adults) ?? 1;
  const children = parseCount(input.children) ?? 0;
  if (Number.isNaN(adults) || adults < LIMITS.minAdults)
    errors.adults = "At least 1 adult is required.";
  if (Number.isNaN(children) || children < 0) errors.children = "Children cannot be negative.";
  if (!errors.adults && !errors.children && adults + children > LIMITS.maxPassengers)
    errors.children = `Maximum ${LIMITS.maxPassengers} passengers per search.`;

  let maxBudget: number | undefined;
  if (input.maxBudget !== undefined && input.maxBudget !== null && input.maxBudget !== "") {
    const budget = Number(input.maxBudget);
    if (!Number.isFinite(budget) || budget <= 0) errors.maxBudget = "Budget must be a positive amount.";
    else if (budget > LIMITS.maxBudget) errors.maxBudget = "Budget is unrealistically large.";
    else maxBudget = Math.round(budget * 100) / 100;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      origin,
      destinations,
      departureDate,
      returnDate,
      passengers: { adults, children },
      ...(maxBudget !== undefined ? { maxBudget } : {}),
    },
  };
}

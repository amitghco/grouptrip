import { isKnownAirport } from "./airports";
import type { FlightSearchCriteria } from "./types";

const DEFAULT_MAX_DAYS_AHEAD = 365;

/**
 * How far ahead travel can be searched. Configurable so it can match the live provider's
 * booking window (NEXT_PUBLIC_ so the browser-side validation uses the same value).
 */
export function resolveMaxDaysAhead(value: string | undefined): number {
  const days = Number(value);
  return value && Number.isInteger(days) && days >= 1 && days <= 730 ? days : DEFAULT_MAX_DAYS_AHEAD;
}

export const LIMITS = {
  /** Seated travellers (adults + children); infants on laps are not counted. */
  maxSeatedPassengers: 9,
  minAdults: 1,
  minChildAge: 2,
  maxChildAge: 11,
  maxDestinations: 8,
  maxBudget: 1_000_000,
  maxDaysAhead: resolveMaxDaysAhead(process.env.NEXT_PUBLIC_MAX_DAYS_AHEAD),
} as const;

export type SearchField =
  | "origin"
  | "destinations"
  | "departureDate"
  | "returnDate"
  | "adults"
  | "childAges"
  | "infants"
  | "maxBudget";

export type FieldErrors = Partial<Record<SearchField, string>>;

type RawValue = string | number | null | undefined;

/** Loosely-typed input as it arrives from a form or URL query string. */
export interface RawSearchInput {
  origin?: string | null;
  destinations?: string | string[] | null;
  departureDate?: string | null;
  returnDate?: string | null;
  adults?: RawValue;
  /** Comma-separated ages or a list; blank entries mean "age not selected". */
  childAges?: string | RawValue[] | null;
  infants?: RawValue;
  maxBudget?: RawValue;
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

/** Last searchable travel date (YYYY-MM-DD) for the given "today". */
export function latestTravelDate(today: string = todayIso(), maxDaysAhead: number = LIMITS.maxDaysAhead): string {
  return new Date(parseIsoDate(today)! + maxDaysAhead * DAY_MS).toISOString().slice(0, 10);
}

function parseCount(value: RawValue): number | null {
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

function toAgeList(value: RawSearchInput["childAges"]): (number | null)[] {
  if (value === undefined || value === null || value === "") return [];
  const parts = Array.isArray(value) ? value : value.split(",");
  return parts.map((part) => parseCount(typeof part === "string" ? part.trim() : part));
}

function airportError(code: string, label: string): string | undefined {
  if (!IATA_PATTERN.test(code)) return `Use a 3-letter IATA airport code for the ${label}, e.g. SYD.`;
  if (!isKnownAirport(code)) return `${code} isn't in GroupTrip's airport list. Pick a suggested airport or check the code.`;
  return undefined;
}

export interface ValidateOptions {
  /** Override "today" (YYYY-MM-DD) for deterministic tests. */
  today?: string;
  maxDaysAhead?: number;
}

export function validateSearchInput(
  input: RawSearchInput,
  options: ValidateOptions = {},
): ValidationResult {
  const errors: FieldErrors = {};

  const origin = normalizeIata(input.origin ?? "");
  if (!origin) errors.origin = "Departure airport is required.";
  else errors.origin = airportError(origin, "departure airport");

  const destinations = toDestinationList(input.destinations);
  const invalidFormat = destinations.filter((code) => !IATA_PATTERN.test(code));
  const unknown = destinations.filter((code) => IATA_PATTERN.test(code) && !isKnownAirport(code));
  if (destinations.length === 0) {
    errors.destinations = "Choose at least one destination.";
  } else if (invalidFormat.length > 0) {
    errors.destinations = `Invalid airport code: ${invalidFormat.join(", ")}.`;
  } else if (unknown.length > 0) {
    errors.destinations = `Unknown airport code: ${unknown.join(", ")}. Pick a suggested airport or check the code.`;
  } else if (destinations.length > LIMITS.maxDestinations) {
    errors.destinations = `Choose up to ${LIMITS.maxDestinations} destinations.`;
  } else if (!errors.origin && destinations.includes(origin)) {
    errors.destinations = "Destination must differ from the departure airport.";
  }

  const maxDaysAhead = options.maxDaysAhead ?? LIMITS.maxDaysAhead;
  const today = options.today ?? todayIso();
  const todayTime = parseIsoDate(today)!;
  const latestTime = todayTime + maxDaysAhead * DAY_MS;
  const departureDate = (input.departureDate ?? "").trim();
  const returnDate = (input.returnDate ?? "").trim();
  const departureTime = parseIsoDate(departureDate);
  const returnTime = parseIsoDate(returnDate);

  if (!departureDate) errors.departureDate = "Departure date is required.";
  else if (departureTime === null) errors.departureDate = "Enter a valid departure date.";
  else if (departureTime < todayTime) errors.departureDate = "Departure date cannot be in the past.";
  else if (departureTime > latestTime) errors.departureDate = `Departure must be within ${maxDaysAhead} days.`;

  if (!returnDate) errors.returnDate = "Return date is required.";
  else if (returnTime === null) errors.returnDate = "Enter a valid return date.";
  else if (departureTime !== null && returnTime <= departureTime)
    errors.returnDate = "Return date must be after the departure date.";
  else if (returnTime > latestTime) errors.returnDate = `Return must be within ${maxDaysAhead} days.`;

  const adults = parseCount(input.adults) ?? 1;
  if (Number.isNaN(adults) || adults < LIMITS.minAdults) errors.adults = "At least 1 adult is required.";

  const rawAges = toAgeList(input.childAges);
  if (rawAges.some((age) => age === null)) {
    errors.childAges = "Select an age for each child.";
  } else if (
    rawAges.some((age) => Number.isNaN(age) || age! < LIMITS.minChildAge || age! > LIMITS.maxChildAge)
  ) {
    errors.childAges = `Children must be aged ${LIMITS.minChildAge}–${LIMITS.maxChildAge}. Add under-2s as infants and 12+ as adults.`;
  }
  const childAges = rawAges as number[];

  if (!errors.adults && adults + childAges.length > LIMITS.maxSeatedPassengers) {
    const field = childAges.length > 0 ? "childAges" : "adults";
    errors[field] ??= `Maximum ${LIMITS.maxSeatedPassengers} adults and children per search.`;
  }

  const infants = parseCount(input.infants) ?? 0;
  if (Number.isNaN(infants) || infants < 0) errors.infants = "Infants cannot be negative.";
  else if (!errors.adults && infants > adults)
    errors.infants = "Each infant must travel on an adult's lap (one infant per adult).";

  let maxBudget: number | undefined;
  if (input.maxBudget !== undefined && input.maxBudget !== null && input.maxBudget !== "") {
    const budget = Number(input.maxBudget);
    if (!Number.isFinite(budget) || budget <= 0) errors.maxBudget = "Budget must be a positive amount.";
    else if (budget > LIMITS.maxBudget) errors.maxBudget = "Budget is unrealistically large.";
    else maxBudget = Math.round(budget * 100) / 100;
  }

  const fieldErrors = Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message !== undefined),
  ) as FieldErrors;
  if (Object.keys(fieldErrors).length > 0) return { ok: false, errors: fieldErrors };

  return {
    ok: true,
    value: {
      origin,
      destinations,
      departureDate,
      returnDate,
      passengers: { adults, childAges, infants },
      ...(maxBudget !== undefined ? { maxBudget } : {}),
    },
  };
}

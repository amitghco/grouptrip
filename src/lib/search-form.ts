import { DEFAULT_ORIGIN, SUGGESTED_DESTINATIONS } from "@/lib/flights/airports";
import { normalizeIata, type RawSearchInput } from "@/lib/flights/validation";

export interface SearchFormValues {
  origin: string;
  destinations: string[];
  departureDate: string;
  returnDate: string;
  adults: number;
  children: number;
  /** Kept as a string so the input can be empty. */
  maxBudget: string;
}

/** Defaults tuned for the April 2027 group holiday. */
export const DEFAULT_FORM_VALUES: SearchFormValues = {
  origin: DEFAULT_ORIGIN,
  destinations: [...SUGGESTED_DESTINATIONS],
  departureDate: "2027-04-10",
  returnDate: "2027-04-20",
  adults: 2,
  children: 2,
  maxBudget: "",
};

export function formValuesToRawInput(values: SearchFormValues): RawSearchInput {
  return {
    origin: values.origin,
    destinations: values.destinations,
    departureDate: values.departureDate,
    returnDate: values.returnDate,
    adults: values.adults,
    children: values.children,
    maxBudget: values.maxBudget.trim(),
  };
}

function toCount(value: string | null, fallback: number): number {
  const num = Number(value);
  return value !== null && value !== "" && Number.isInteger(num) && num >= 0 ? num : fallback;
}

/** Pre-fills the form from a previous search URL (e.g. "Modify search"). */
export function formValuesFromSearchParams(
  params: { get(name: string): string | null },
  defaults: SearchFormValues = DEFAULT_FORM_VALUES,
): SearchFormValues {
  const destinations = params
    .get("destinations")
    ?.split(",")
    .map(normalizeIata)
    .filter(Boolean);
  return {
    origin: params.get("origin") || defaults.origin,
    destinations: destinations?.length ? Array.from(new Set(destinations)) : defaults.destinations,
    departureDate: params.get("departureDate") || defaults.departureDate,
    returnDate: params.get("returnDate") || defaults.returnDate,
    adults: toCount(params.get("adults"), defaults.adults),
    children: toCount(params.get("children"), defaults.children),
    maxBudget: params.get("maxBudget") ?? defaults.maxBudget,
  };
}

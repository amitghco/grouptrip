import type { FlightSearchCriteria } from "./types";
import type { RawSearchInput } from "./validation";

interface SearchParamsReader {
  get(name: string): string | null;
}

/** Serialises criteria into a URL query string (shared by the results page and API route). */
export function criteriaToSearchParams(criteria: FlightSearchCriteria): URLSearchParams {
  const params = new URLSearchParams({
    origin: criteria.origin,
    destinations: criteria.destinations.join(","),
    departureDate: criteria.departureDate,
    returnDate: criteria.returnDate,
    adults: String(criteria.passengers.adults),
    children: String(criteria.passengers.children),
  });
  if (criteria.maxBudget !== undefined) params.set("maxBudget", String(criteria.maxBudget));
  return params;
}

export function searchParamsToRawInput(params: SearchParamsReader): RawSearchInput {
  return {
    origin: params.get("origin"),
    destinations: params.get("destinations"),
    departureDate: params.get("departureDate"),
    returnDate: params.get("returnDate"),
    adults: params.get("adults"),
    children: params.get("children"),
    maxBudget: params.get("maxBudget"),
  };
}

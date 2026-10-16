import type { FlightSearchCriteria } from "./types";
import type { RawSearchInput } from "./validation";

interface SearchParamsReader {
  get(name: string): string | null;
}

/** Serialises criteria into a URL query string (shared by the results page and API route). */
export function criteriaToSearchParams(criteria: FlightSearchCriteria): URLSearchParams {
  const { adults, childAges, infants } = criteria.passengers;
  const params = new URLSearchParams({
    origin: criteria.origin,
    destinations: criteria.destinations.join(","),
    departureDate: criteria.departureDate,
    returnDate: criteria.returnDate,
    adults: String(adults),
  });
  if (childAges.length > 0) params.set("childAges", childAges.join(","));
  if (infants > 0) params.set("infants", String(infants));
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
    childAges: params.get("childAges"),
    infants: params.get("infants"),
    maxBudget: params.get("maxBudget"),
  };
}

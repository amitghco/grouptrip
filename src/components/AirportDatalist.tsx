import { AIRPORTS } from "@/lib/flights/airport-data";

export const AIRPORT_DATALIST_ID = "airport-options";

/** Autocomplete suggestions for airport-code inputs (native <datalist>, no extra JS). */
export function AirportDatalist() {
  return (
    <datalist id={AIRPORT_DATALIST_ID}>
      {AIRPORTS.map((airport) => (
        <option key={airport.code} value={airport.code}>
          {airport.city}, {airport.country}
        </option>
      ))}
    </datalist>
  );
}

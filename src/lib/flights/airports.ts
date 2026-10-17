import { AIRPORTS, type AirportRecord } from "./airport-data";
import type { AirportCode } from "./types";

export type AirportInfo = AirportRecord;

export const KNOWN_AIRPORTS: Readonly<Record<AirportCode, AirportInfo>> = Object.fromEntries(
  AIRPORTS.map((airport) => [airport.code, airport]),
);

/** Destinations offered as one-click options in the search form. */
export const SUGGESTED_DESTINATIONS: AirportCode[] = ["DPS", "AKL", "ZQN", "SGN", "DAD"];

export const DEFAULT_ORIGIN: AirportCode = "SYD";

export function getAirport(code: AirportCode): AirportInfo | undefined {
  return KNOWN_AIRPORTS[code.trim().toUpperCase()];
}

export function isKnownAirport(code: AirportCode): boolean {
  return getAirport(code) !== undefined;
}

export function airportLabel(code: AirportCode): string {
  const airport = getAirport(code);
  return airport ? `${airport.city} (${airport.code})` : code.toUpperCase();
}

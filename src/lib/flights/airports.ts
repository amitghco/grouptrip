import type { AirportCode } from "./types";

export interface AirportInfo {
  code: AirportCode;
  city: string;
  country: string;
  /** Approximate UTC offset in hours during April (used for mock arrival times only). */
  utcOffsetHours: number;
}

export const KNOWN_AIRPORTS: Record<AirportCode, AirportInfo> = {
  SYD: { code: "SYD", city: "Sydney", country: "Australia", utcOffsetHours: 10 },
  DPS: { code: "DPS", city: "Bali (Denpasar)", country: "Indonesia", utcOffsetHours: 8 },
  AKL: { code: "AKL", city: "Auckland", country: "New Zealand", utcOffsetHours: 12 },
  ZQN: { code: "ZQN", city: "Queenstown", country: "New Zealand", utcOffsetHours: 12 },
  SGN: { code: "SGN", city: "Ho Chi Minh City", country: "Vietnam", utcOffsetHours: 7 },
  DAD: { code: "DAD", city: "Da Nang", country: "Vietnam", utcOffsetHours: 7 },
  CHC: { code: "CHC", city: "Christchurch", country: "New Zealand", utcOffsetHours: 12 },
  HAN: { code: "HAN", city: "Hanoi", country: "Vietnam", utcOffsetHours: 7 },
  SIN: { code: "SIN", city: "Singapore", country: "Singapore", utcOffsetHours: 8 },
  KUL: { code: "KUL", city: "Kuala Lumpur", country: "Malaysia", utcOffsetHours: 8 },
  MEL: { code: "MEL", city: "Melbourne", country: "Australia", utcOffsetHours: 10 },
  BNE: { code: "BNE", city: "Brisbane", country: "Australia", utcOffsetHours: 10 },
};

/** Destinations offered as one-click options in the search form. */
export const SUGGESTED_DESTINATIONS: AirportCode[] = ["DPS", "AKL", "ZQN", "SGN", "DAD"];

export const DEFAULT_ORIGIN: AirportCode = "SYD";

export function getAirport(code: AirportCode): AirportInfo | undefined {
  return KNOWN_AIRPORTS[code.toUpperCase()];
}

export function airportLabel(code: AirportCode): string {
  const airport = getAirport(code);
  return airport ? `${airport.city} (${airport.code})` : code.toUpperCase();
}

/**
 * Provider-independent flight search domain model.
 * External providers (mock, Amadeus, ...) map their responses into these types.
 */

/** Three-letter IATA airport code, upper case (e.g. "SYD"). */
export type AirportCode = string;

export type CurrencyCode = "AUD";

export interface Money {
  /** Amount in major units (e.g. dollars), rounded to cents. */
  amount: number;
  currency: CurrencyCode;
}

export interface Airline {
  /** Two-character IATA airline designator (e.g. "QF"). */
  code: string;
  name: string;
}

/**
 * Travellers in one family's search. Age bands follow airline conventions
 * (Amadeus: ADULT 12+, CHILD 2–11, HELD_INFANT under 2 on an adult's lap).
 */
export interface PassengerCounts {
  adults: number;
  /** Age (2–11) of each child on the travel date. */
  childAges: number[];
  /** Infants under 2 travelling on an adult's lap (at most one per adult). */
  infants: number;
}

export interface FlightSearchCriteria {
  origin: AirportCode;
  destinations: AirportCode[];
  /** ISO date, YYYY-MM-DD */
  departureDate: string;
  /** ISO date, YYYY-MM-DD */
  returnDate: string;
  passengers: PassengerCounts;
  /** Optional per-family budget: maximum total return price for these travellers, in AUD. */
  maxBudget?: number;
}

/** One direction of a return trip. Times are airport-local, without offset (YYYY-MM-DDTHH:mm). */
export interface FlightItinerary {
  from: AirportCode;
  to: AirportCode;
  departureAt: string;
  arrivalAt: string;
  durationMinutes: number;
  stops: number;
  /** Connection airports, in order. Empty for direct flights. */
  stopovers: AirportCode[];
  flightNumbers: string[];
}

export type FlightDataSource = "mock" | "amadeus";

export interface FlightOffer {
  id: string;
  source: FlightDataSource;
  origin: AirportCode;
  destination: AirportCode;
  airline: Airline;
  outbound: FlightItinerary;
  inbound: FlightItinerary;
  passengers: PassengerCounts;
  /** Total return price for all travellers in the search (one family). */
  totalPrice: Money;
}

export interface FlightSearchResult {
  offers: FlightOffer[];
  source: FlightDataSource;
  /** True when offers are not live, bookable fares. */
  isMockData: boolean;
  /** ISO timestamp when the search was performed. */
  searchedAt: string;
}

/** Contract every flight data provider must implement. */
export interface FlightProvider {
  readonly id: FlightDataSource;
  readonly isMockData: boolean;
  searchOffers(criteria: FlightSearchCriteria): Promise<FlightOffer[]>;
}

export type SortOption = "price" | "duration" | "stops";

export interface SearchApiError {
  error: "invalid_request" | "provider_error";
  message: string;
  fieldErrors?: Record<string, string>;
}

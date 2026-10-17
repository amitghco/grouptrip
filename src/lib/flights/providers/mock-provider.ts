import { getAirport } from "../airports";
import { localToUtc, utcToLocal } from "../time";
import type {
  AirportCode,
  FlightItinerary,
  FlightOffer,
  FlightProvider,
  FlightSearchCriteria,
} from "../types";
import { genericRouteProfile, MOCK_ROUTES, type MockRouteOption } from "./mock-routes";
import { createRandom, hashString } from "./random";

export const CHILD_FARE_RATIO = 0.75;
/** Lap infants typically pay a small fraction of the adult fare plus taxes. */
export const INFANT_FARE_RATIO = 0.1;
const DEPARTURE_SLOTS = ["06:00", "07:30", "09:15", "10:40", "12:05", "14:20", "16:45", "19:10", "21:30", "23:55"];

export interface MockFlightProviderOptions {
  /** Artificial delay to mimic network latency (ms). */
  latencyMs?: number;
}

/**
 * Generates deterministic, clearly-fake flight offers. The same criteria always
 * produce the same offers, which keeps the UI and tests predictable.
 */
export class MockFlightProvider implements FlightProvider {
  readonly id = "mock" as const;
  readonly isMockData = true;
  private readonly latencyMs: number;

  constructor(options: MockFlightProviderOptions = {}) {
    this.latencyMs = Math.max(0, options.latencyMs ?? 0);
  }

  async searchOffers(criteria: FlightSearchCriteria): Promise<FlightOffer[]> {
    if (this.latencyMs > 0) await new Promise((resolve) => setTimeout(resolve, this.latencyMs));
    return criteria.destinations.flatMap((destination) => this.offersFor(criteria, destination));
  }

  private offersFor(criteria: FlightSearchCriteria, destination: AirportCode): FlightOffer[] {
    const seedKey = [criteria.origin, destination, criteria.departureDate, criteria.returnDate].join("|");
    const random = createRandom(hashString(seedKey));
    const profile = MOCK_ROUTES[destination] ?? genericRouteProfile(random);
    const seasonFactor = weekendFactor(criteria.departureDate) * weekendFactor(criteria.returnDate);

    return profile.options.map((option, index) => {
      const jitter = 0.9 + random() * 0.25;
      const adultFare = profile.baseAdultFare * option.fareFactor * seasonFactor * jitter;
      const { adults, childAges, infants } = criteria.passengers;
      const total =
        adultFare * (adults + childAges.length * CHILD_FARE_RATIO + infants * INFANT_FARE_RATIO);

      return {
        id: `mock-${destination}-${criteria.departureDate}-${criteria.returnDate}-${index}`,
        source: "mock",
        origin: criteria.origin,
        destination,
        airline: option.airline,
        outbound: buildItinerary(criteria.origin, destination, criteria.departureDate, option, random),
        inbound: buildItinerary(destination, criteria.origin, criteria.returnDate, reverse(option), random),
        passengers: { adults, childAges: [...childAges], infants },
        totalPrice: { amount: Math.round(total), currency: "AUD" },
      };
    });
  }
}

function weekendFactor(isoDate: string): number {
  const day = new Date(`${isoDate}T00:00:00Z`).getUTCDay();
  return day === 5 || day === 6 ? 1.08 : 1;
}

function reverse(option: MockRouteOption): MockRouteOption {
  return { ...option, stopovers: [...option.stopovers].reverse() };
}

function buildItinerary(
  from: AirportCode,
  to: AirportCode,
  date: string,
  option: MockRouteOption,
  random: () => number,
): FlightItinerary {
  const slot = DEPARTURE_SLOTS[Math.floor(random() * DEPARTURE_SLOTS.length)];
  const durationMinutes = option.durationMinutes + Math.round((random() - 0.5) * 4) * 10;
  const departureAt = `${date}T${slot}`;
  const arrivalAt = utcToLocal(
    localToUtc(departureAt, timeZone(from, to)) + durationMinutes * 60_000,
    timeZone(to, from),
  );
  const segments = option.stopovers.length + 1;
  const flightNumbers = Array.from(
    { length: segments },
    () => `${option.airline.code}${10 + Math.floor(random() * 980)}`,
  );

  return {
    from,
    to,
    departureAt,
    arrivalAt,
    durationMinutes,
    stops: option.stopovers.length,
    stopovers: option.stopovers,
    flightNumbers,
  };
}

/** Unknown airports fall back to the other end's time zone. */
function timeZone(code: AirportCode, fallback: AirportCode): string {
  return getAirport(code)?.timeZone ?? getAirport(fallback)?.timeZone ?? "Australia/Sydney";
}

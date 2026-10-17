import type { AirportCode, FlightOffer, SortOption } from "./types";

export function totalDurationMinutes(offer: FlightOffer): number {
  return offer.outbound.durationMinutes + offer.inbound.durationMinutes;
}

export function totalStops(offer: FlightOffer): number {
  return offer.outbound.stops + offer.inbound.stops;
}

const comparators: Record<SortOption, (a: FlightOffer, b: FlightOffer) => number> = {
  price: (a, b) =>
    a.totalPrice.amount - b.totalPrice.amount || totalDurationMinutes(a) - totalDurationMinutes(b),
  duration: (a, b) =>
    totalDurationMinutes(a) - totalDurationMinutes(b) || a.totalPrice.amount - b.totalPrice.amount,
  stops: (a, b) =>
    totalStops(a) - totalStops(b) ||
    a.totalPrice.amount - b.totalPrice.amount ||
    totalDurationMinutes(a) - totalDurationMinutes(b),
};

/** Returns a new array sorted by the chosen option (ties broken deterministically). */
export function sortOffers(offers: readonly FlightOffer[], sort: SortOption): FlightOffer[] {
  return [...offers].sort((a, b) => comparators[sort](a, b) || a.id.localeCompare(b.id));
}

export interface OfferFilters {
  /** Only include these destinations; empty/undefined means all. */
  destinations?: AirportCode[];
  /** Maximum stops allowed in each direction; undefined means any. */
  maxStopsPerDirection?: number;
  /** Maximum total price for all passengers. */
  maxTotalPrice?: number;
}

export function filterOffers(offers: readonly FlightOffer[], filters: OfferFilters): FlightOffer[] {
  return offers.filter((offer) => {
    if (filters.destinations?.length && !filters.destinations.includes(offer.destination)) return false;
    if (
      filters.maxStopsPerDirection !== undefined &&
      (offer.outbound.stops > filters.maxStopsPerDirection ||
        offer.inbound.stops > filters.maxStopsPerDirection)
    )
      return false;
    if (filters.maxTotalPrice !== undefined && offer.totalPrice.amount > filters.maxTotalPrice)
      return false;
    return true;
  });
}

export interface DestinationSummary {
  destination: AirportCode;
  offerCount: number;
  cheapest: FlightOffer;
  fastest: FlightOffer;
}

/** Cheapest and fastest offer per destination, ordered by cheapest price. */
export function summarizeByDestination(offers: readonly FlightOffer[]): DestinationSummary[] {
  const groups = new Map<AirportCode, FlightOffer[]>();
  for (const offer of offers) {
    const list = groups.get(offer.destination) ?? [];
    list.push(offer);
    groups.set(offer.destination, list);
  }
  return Array.from(groups, ([destination, list]) => ({
    destination,
    offerCount: list.length,
    cheapest: sortOffers(list, "price")[0],
    fastest: sortOffers(list, "duration")[0],
  })).sort((a, b) => a.cheapest.totalPrice.amount - b.cheapest.totalPrice.amount);
}

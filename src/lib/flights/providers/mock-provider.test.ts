import { describe, expect, it } from "vitest";
import type { FlightSearchCriteria } from "../types";
import { CHILD_FARE_RATIO, MockFlightProvider } from "./mock-provider";

const criteria: FlightSearchCriteria = {
  origin: "SYD",
  destinations: ["DPS", "AKL", "ZQN", "SGN", "DAD", "NAN"],
  departureDate: "2027-04-10",
  returnDate: "2027-04-20",
  passengers: { adults: 2, children: 2 },
};

describe("MockFlightProvider", () => {
  const provider = new MockFlightProvider();

  it("is flagged as mock data", () => {
    expect(provider.id).toBe("mock");
    expect(provider.isMockData).toBe(true);
  });

  it("returns offers for every destination, including unknown IATA codes", async () => {
    const offers = await provider.searchOffers(criteria);
    expect(new Set(offers.map((o) => o.destination))).toEqual(new Set(criteria.destinations));
    expect(new Set(offers.map((o) => o.id)).size).toBe(offers.length);
    for (const offer of offers) {
      expect(offer.source).toBe("mock");
      expect(offer.totalPrice.currency).toBe("AUD");
      expect(offer.totalPrice.amount).toBeGreaterThan(0);
      expect(offer.outbound.departureAt.startsWith("2027-04-10")).toBe(true);
      expect(offer.inbound.departureAt.startsWith("2027-04-20")).toBe(true);
      expect(offer.outbound).toMatchObject({ from: "SYD", to: offer.destination });
      expect(offer.inbound).toMatchObject({ from: offer.destination, to: "SYD" });
      expect(offer.outbound.stops).toBe(offer.outbound.stopovers.length);
      expect(offer.outbound.flightNumbers).toHaveLength(offer.outbound.stops + 1);
    }
  });

  it("is deterministic for the same criteria", async () => {
    expect(await provider.searchOffers(criteria)).toEqual(await provider.searchOffers(criteria));
  });

  it("prices children at a discount and scales with passengers", async () => {
    const [adultsOnly] = await provider.searchOffers({
      ...criteria,
      destinations: ["DPS"],
      passengers: { adults: 1, children: 0 },
    });
    const [family] = await provider.searchOffers({
      ...criteria,
      destinations: ["DPS"],
      passengers: { adults: 2, children: 2 },
    });
    const expected = adultsOnly.totalPrice.amount * (2 + 2 * CHILD_FARE_RATIO);
    expect(Math.abs(family.totalPrice.amount - expected)).toBeLessThanOrEqual(3);
  });

  it("computes local arrival times using time zone differences", async () => {
    const [offer] = await provider.searchOffers({ ...criteria, destinations: ["DPS"] });
    const dep = Date.parse(`${offer.outbound.departureAt}:00Z`);
    const arr = Date.parse(`${offer.outbound.arrivalAt}:00Z`);
    // SYD (UTC+10) -> DPS (UTC+8): local arrival is 2h earlier than elapsed time.
    expect((arr - dep) / 60_000).toBe(offer.outbound.durationMinutes - 120);
  });
});

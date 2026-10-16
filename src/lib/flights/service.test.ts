import { describe, expect, it } from "vitest";
import { makeOffer } from "@/test/fixtures";
import { MockFlightProvider } from "./providers/mock-provider";
import { createFlightProvider, FlightSearchService } from "./service";
import type { FlightProvider, FlightSearchCriteria } from "./types";

const criteria: FlightSearchCriteria = {
  origin: "SYD",
  destinations: ["DPS"],
  departureDate: "2027-04-10",
  returnDate: "2027-04-20",
  passengers: { adults: 2, childAges: [5, 8], infants: 0 },
};

const stubProvider: FlightProvider = {
  id: "mock",
  isMockData: true,
  searchOffers: async () => [
    makeOffer({ id: "pricy", totalPrice: { amount: 5000, currency: "AUD" } }),
    makeOffer({ id: "cheap", totalPrice: { amount: 2500, currency: "AUD" } }),
  ],
};

describe("FlightSearchService", () => {
  const now = () => new Date("2026-10-16T00:00:00Z");

  it("returns offers sorted by price with provider metadata", async () => {
    const result = await new FlightSearchService(stubProvider, now).search(criteria);
    expect(result.offers.map((o) => o.id)).toEqual(["cheap", "pricy"]);
    expect(result).toMatchObject({ source: "mock", isMockData: true, searchedAt: "2026-10-16T00:00:00.000Z" });
  });

  it("excludes offers above the maximum budget", async () => {
    const result = await new FlightSearchService(stubProvider, now).search({ ...criteria, maxBudget: 3000 });
    expect(result.offers.map((o) => o.id)).toEqual(["cheap"]);
  });
});

describe("createFlightProvider", () => {
  it("defaults to the mock provider", () => {
    expect(createFlightProvider({})).toBeInstanceOf(MockFlightProvider);
    expect(createFlightProvider({ FLIGHT_PROVIDER: "MOCK", MOCK_LATENCY_MS: "0" })).toBeInstanceOf(
      MockFlightProvider,
    );
  });

  it("rejects providers that are not available yet", () => {
    expect(() => createFlightProvider({ FLIGHT_PROVIDER: "amadeus" })).toThrow(/not implemented/);
    expect(() => createFlightProvider({ FLIGHT_PROVIDER: "other" })).toThrow(/Unknown/);
  });
});

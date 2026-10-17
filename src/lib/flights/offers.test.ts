import { describe, expect, it } from "vitest";
import { makeOffer } from "@/test/fixtures";
import { filterOffers, sortOffers, summarizeByDestination, totalDurationMinutes, totalStops } from "./offers";

const leg = (durationMinutes: number, stops: number) => ({
  ...makeOffer({ id: "x" }).outbound,
  durationMinutes,
  stops,
  stopovers: Array(stops).fill("SIN"),
});

const cheapSlow = makeOffer({
  id: "a",
  totalPrice: { amount: 2000, currency: "AUD" },
  outbound: leg(700, 1),
  inbound: leg(700, 1),
});
const pricyDirect = makeOffer({
  id: "b",
  totalPrice: { amount: 4000, currency: "AUD" },
  outbound: leg(380, 0),
  inbound: leg(380, 0),
});
const midTwoStop = makeOffer({
  id: "c",
  destination: "SGN",
  totalPrice: { amount: 3000, currency: "AUD" },
  outbound: leg(600, 2),
  inbound: leg(600, 0),
});
const offers = [pricyDirect, midTwoStop, cheapSlow];

describe("sortOffers", () => {
  it("sorts by lowest price", () => {
    expect(sortOffers(offers, "price").map((o) => o.id)).toEqual(["a", "c", "b"]);
  });

  it("sorts by shortest total duration", () => {
    expect(sortOffers(offers, "duration").map((o) => o.id)).toEqual(["b", "c", "a"]);
  });

  it("sorts by fewest stops, then price", () => {
    expect(sortOffers(offers, "stops").map((o) => o.id)).toEqual(["b", "a", "c"]);
  });

  it("does not mutate the input", () => {
    sortOffers(offers, "price");
    expect(offers.map((o) => o.id)).toEqual(["b", "c", "a"]);
  });
});

describe("filterOffers", () => {
  it("filters by destination, stops per direction and price", () => {
    expect(filterOffers(offers, { destinations: ["SGN"] }).map((o) => o.id)).toEqual(["c"]);
    expect(filterOffers(offers, { maxStopsPerDirection: 0 }).map((o) => o.id)).toEqual(["b"]);
    expect(filterOffers(offers, { maxStopsPerDirection: 1 }).map((o) => o.id)).toEqual(["b", "a"]);
    expect(filterOffers(offers, { maxTotalPrice: 3000 }).map((o) => o.id)).toEqual(["c", "a"]);
    expect(filterOffers(offers, {})).toHaveLength(3);
  });
});

describe("summaries", () => {
  it("computes totals", () => {
    expect(totalDurationMinutes(midTwoStop)).toBe(1200);
    expect(totalStops(midTwoStop)).toBe(2);
  });

  it("summarises cheapest and fastest per destination", () => {
    const summary = summarizeByDestination(offers);
    expect(summary.map((s) => s.destination)).toEqual(["DPS", "SGN"]);
    expect(summary[0]).toMatchObject({ offerCount: 2, cheapest: { id: "a" }, fastest: { id: "b" } });
  });
});

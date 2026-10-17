import { describe, expect, it } from "vitest";
import {
  isValidIata,
  latestTravelDate,
  parseIsoDate,
  resolveMaxDaysAhead,
  todayIso,
  validateSearchInput,
  type RawSearchInput,
} from "./validation";

const today = "2026-10-16";
const valid: RawSearchInput = {
  origin: "syd",
  destinations: "dps, akl,DPS",
  departureDate: "2027-04-10",
  returnDate: "2027-04-20",
  adults: "2",
  childAges: "4, 7",
  infants: "1",
  maxBudget: "8000",
};

const validate = (overrides: Partial<RawSearchInput> = {}) =>
  validateSearchInput({ ...valid, ...overrides }, { today });

describe("validateSearchInput", () => {
  it("normalises and returns valid criteria", () => {
    expect(validate()).toEqual({
      ok: true,
      value: {
        origin: "SYD",
        destinations: ["DPS", "AKL"],
        departureDate: "2027-04-10",
        returnDate: "2027-04-20",
        passengers: { adults: 2, childAges: [4, 7], infants: 1 },
        maxBudget: 8000,
      },
    });
  });

  it("accepts destinations as an array and omits an empty budget", () => {
    const result = validate({ destinations: ["ZQN", "nan"], maxBudget: "" });
    expect(result.ok && result.value.destinations).toEqual(["ZQN", "NAN"]);
    expect(result.ok && "maxBudget" in result.value).toBe(false);
  });

  it.each([
    [{ origin: "" }, "origin", "required"],
    [{ origin: "SY1" }, "origin", "IATA"],
    [{ origin: "XYZ" }, "origin", "airport list"],
    [{ destinations: "DPS,XYZ" }, "destinations", "Unknown airport code: XYZ"],
    [{ destinations: "" }, "destinations", "at least one"],
    [{ destinations: "DPS,BALI" }, "destinations", "BALI"],
    [{ destinations: "SYD" }, "destinations", "differ"],
    [{ destinations: "DPS,AKL,ZQN,SGN,DAD,HAN,SIN,KUL,NAN" }, "destinations", "up to 8"],
    [{ departureDate: "" }, "departureDate", "required"],
    [{ departureDate: "2027-02-30" }, "departureDate", "valid"],
    [{ departureDate: "2026-10-15" }, "departureDate", "past"],
    [{ departureDate: "2027-12-01", returnDate: "2027-12-10" }, "departureDate", "within"],
    [{ returnDate: "2027-04-10" }, "returnDate", "after"],
    [{ returnDate: "2027-04-01" }, "returnDate", "after"],
    [{ returnDate: "nope" }, "returnDate", "valid"],
    [{ adults: "0" }, "adults", "1 adult"],
    [{ adults: "1.5" }, "adults", "1 adult"],
    [{ childAges: "4," }, "childAges", "Select an age"],
    [{ childAges: "1" }, "childAges", "aged 2–11"],
    [{ childAges: "12" }, "childAges", "aged 2–11"],
    [{ childAges: "x" }, "childAges", "aged 2–11"],
    [{ adults: "5", childAges: "2,3,4,5,6" }, "childAges", "Maximum 9"],
    [{ adults: "10", childAges: "" }, "adults", "Maximum 9"],
    [{ infants: "-1" }, "infants", "negative"],
    [{ adults: "1", infants: "2" }, "infants", "lap"],
    [{ maxBudget: "-10" }, "maxBudget", "positive"],
    [{ maxBudget: "abc" }, "maxBudget", "positive"],
    [{ maxBudget: "5000000" }, "maxBudget", "large"],
  ] as const)("rejects %j", (overrides, field, message) => {
    const result = validate(overrides);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[field]).toContain(message);
  });

  it("allows departing today and defaults passengers to 1 adult", () => {
    const result = validate({ departureDate: today, adults: undefined, childAges: undefined, infants: undefined });
    expect(result.ok && result.value.passengers).toEqual({ adults: 1, childAges: [], infants: 0 });
  });

  it("does not count lap infants towards the 9-seat limit", () => {
    const result = validate({ adults: "5", childAges: "2,3,4,5", infants: "5" });
    expect(result.ok).toBe(true);
  });

  it("supports a configurable booking window", () => {
    const result = validateSearchInput(
      { ...valid, departureDate: "2026-11-20", returnDate: "2026-11-25" },
      { today, maxDaysAhead: 30 },
    );
    expect(!result.ok && result.errors.departureDate).toContain("within 30 days");
    expect(latestTravelDate(today, 30)).toBe("2026-11-15");
    expect(resolveMaxDaysAhead(undefined)).toBe(365);
    expect(resolveMaxDaysAhead("180")).toBe(180);
    expect(resolveMaxDaysAhead("0")).toBe(365);
    expect(resolveMaxDaysAhead("abc")).toBe(365);
  });
});

describe("helpers", () => {
  it("validates IATA codes", () => {
    expect(isValidIata(" dps ")).toBe(true);
    expect(isValidIata("DP")).toBe(false);
  });

  it("parses only real calendar dates", () => {
    expect(parseIsoDate("2028-02-29")).not.toBeNull();
    expect(parseIsoDate("2027-02-29")).toBeNull();
    expect(parseIsoDate("10/04/2027")).toBeNull();
  });

  it("computes today in Sydney time", () => {
    expect(todayIso("Australia/Sydney", new Date("2026-10-16T14:30:00Z"))).toBe("2026-10-17");
  });
});

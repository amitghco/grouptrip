import { describe, expect, it } from "vitest";
import { isValidIata, parseIsoDate, todayIso, validateSearchInput, type RawSearchInput } from "./validation";

const today = "2026-10-16";
const valid: RawSearchInput = {
  origin: "syd",
  destinations: "dps, akl,DPS",
  departureDate: "2027-04-10",
  returnDate: "2027-04-20",
  adults: "2",
  children: "2",
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
        passengers: { adults: 2, children: 2 },
        maxBudget: 8000,
      },
    });
  });

  it("accepts destinations as an array and omits an empty budget", () => {
    const result = validate({ destinations: ["ZQN", "XYZ"], maxBudget: "" });
    expect(result.ok && result.value.destinations).toEqual(["ZQN", "XYZ"]);
    expect(result.ok && "maxBudget" in result.value).toBe(false);
  });

  it.each([
    [{ origin: "" }, "origin", "required"],
    [{ origin: "SY1" }, "origin", "IATA"],
    [{ destinations: "" }, "destinations", "at least one"],
    [{ destinations: "DPS,BALI" }, "destinations", "BALI"],
    [{ destinations: "SYD" }, "destinations", "differ"],
    [{ destinations: "AAA,BBB,CCC,DDD,EEE,FFF,GGG,HHH,III" }, "destinations", "up to 8"],
    [{ departureDate: "" }, "departureDate", "required"],
    [{ departureDate: "2027-02-30" }, "departureDate", "valid"],
    [{ departureDate: "2026-10-15" }, "departureDate", "past"],
    [{ departureDate: "2027-12-01", returnDate: "2027-12-10" }, "departureDate", "within"],
    [{ returnDate: "2027-04-10" }, "returnDate", "after"],
    [{ returnDate: "2027-04-01" }, "returnDate", "after"],
    [{ returnDate: "nope" }, "returnDate", "valid"],
    [{ adults: "0" }, "adults", "1 adult"],
    [{ adults: "1.5" }, "adults", "1 adult"],
    [{ children: "-1" }, "children", "negative"],
    [{ adults: "5", children: "5" }, "children", "Maximum 9"],
    [{ maxBudget: "-10" }, "maxBudget", "positive"],
    [{ maxBudget: "abc" }, "maxBudget", "positive"],
    [{ maxBudget: "5000000" }, "maxBudget", "large"],
  ] as const)("rejects %j", (overrides, field, message) => {
    const result = validate(overrides);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[field]).toContain(message);
  });

  it("allows departing today and defaults passengers to 1 adult", () => {
    const result = validate({ departureDate: today, adults: undefined, children: undefined });
    expect(result.ok && result.value.passengers).toEqual({ adults: 1, children: 0 });
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

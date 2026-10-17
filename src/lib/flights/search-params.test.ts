import { describe, expect, it } from "vitest";
import { DEFAULT_FORM_VALUES, formValuesFromSearchParams } from "../search-form";
import { criteriaToSearchParams, searchParamsToRawInput } from "./search-params";
import type { FlightSearchCriteria } from "./types";
import { validateSearchInput } from "./validation";

const criteria: FlightSearchCriteria = {
  origin: "SYD",
  destinations: ["DPS", "NAN"],
  departureDate: "2027-04-10",
  returnDate: "2027-04-20",
  passengers: { adults: 4, childAges: [3, 6, 10], infants: 1 },
  maxBudget: 12000,
};

describe("search params", () => {
  it("round-trips criteria through the URL", () => {
    const params = criteriaToSearchParams(criteria);
    const result = validateSearchInput(searchParamsToRawInput(params), { today: "2026-10-16" });
    expect(result).toEqual({ ok: true, value: criteria });
  });

  it("omits maxBudget when not set", () => {
    const params = criteriaToSearchParams({ ...criteria, maxBudget: undefined });
    expect(params.has("maxBudget")).toBe(false);
  });

  it("pre-fills form values from a URL, falling back to defaults", () => {
    const values = formValuesFromSearchParams(criteriaToSearchParams(criteria));
    expect(values).toEqual({
      origin: "SYD",
      destinations: ["DPS", "NAN"],
      departureDate: "2027-04-10",
      returnDate: "2027-04-20",
      adults: 4,
      childAges: [3, 6, 10],
      infants: 1,
      maxBudget: "12000",
    });
    expect(formValuesFromSearchParams(new URLSearchParams("adults=x"))).toEqual(DEFAULT_FORM_VALUES);
  });
});

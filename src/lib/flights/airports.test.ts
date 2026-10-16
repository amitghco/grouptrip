import { describe, expect, it } from "vitest";
import { AIRPORTS } from "./airport-data";
import { airportLabel, DEFAULT_ORIGIN, isKnownAirport, SUGGESTED_DESTINATIONS } from "./airports";

describe("airport reference data", () => {
  it("has unique, well-formed codes and valid IANA time zones", () => {
    const codes = AIRPORTS.map((a) => a.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const airport of AIRPORTS) {
      expect(airport.code).toMatch(/^[A-Z]{3}$/);
      expect(() => new Intl.DateTimeFormat("en", { timeZone: airport.timeZone })).not.toThrow();
    }
  });

  it("includes the default origin and suggested destinations", () => {
    for (const code of [DEFAULT_ORIGIN, ...SUGGESTED_DESTINATIONS]) expect(isKnownAirport(code)).toBe(true);
  });

  it("looks up codes case-insensitively", () => {
    expect(isKnownAirport(" nan ")).toBe(true);
    expect(isKnownAirport("XYZ")).toBe(false);
    expect(airportLabel("dps")).toBe("Bali (Denpasar) (DPS)");
    expect(airportLabel("xyz")).toBe("XYZ");
  });
});

import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isoDaysFromToday } from "@/test/fixtures";
import { GET } from "./route";

const call = (query: string) => GET(new NextRequest(`http://localhost/api/flights/search?${query}`));

describe("GET /api/flights/search", () => {
  beforeEach(() => {
    vi.stubEnv("FLIGHT_PROVIDER", "mock");
    vi.stubEnv("MOCK_LATENCY_MS", "0");
  });
  afterEach(() => vi.unstubAllEnvs());

  const validQuery = () =>
    new URLSearchParams({
      origin: "SYD",
      destinations: "DPS,AKL",
      departureDate: isoDaysFromToday(30),
      returnDate: isoDaysFromToday(40),
      adults: "2",
      childAges: "6",
    }).toString();

  it("returns mock offers flagged as mock data", async () => {
    const response = await call(validQuery());
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    const body = await response.json();
    expect(body.isMockData).toBe(true);
    expect(body.source).toBe("mock");
    expect(body.offers.length).toBeGreaterThan(0);
  });

  it("returns 400 with field errors for invalid input", async () => {
    const response = await call("origin=S&destinations=&adults=0");
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("invalid_request");
    expect(Object.keys(body.fieldErrors)).toEqual(
      expect.arrayContaining(["origin", "destinations", "departureDate", "returnDate", "adults"]),
    );
  });

  it("returns 502 when the provider fails", async () => {
    vi.stubEnv("FLIGHT_PROVIDER", "amadeus");
    vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await call(validQuery());
    expect(response.status).toBe(502);
    expect((await response.json()).error).toBe("provider_error");
  });
});

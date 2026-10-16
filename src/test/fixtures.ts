import { todayIso } from "@/lib/flights/validation";
import type { FlightOffer } from "@/lib/flights/types";

/** YYYY-MM-DD `days` after today (Sydney time), so tests don't go stale. */
export function isoDaysFromToday(days: number): string {
  const date = new Date(`${todayIso()}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function makeOffer(overrides: Partial<FlightOffer> & { id: string }): FlightOffer {
  const leg = {
    from: "SYD",
    to: "DPS",
    departureAt: "2027-04-10T09:15",
    arrivalAt: "2027-04-10T13:35",
    durationMinutes: 380,
    stops: 0,
    stopovers: [],
    flightNumbers: ["QF43"],
  };
  return {
    source: "mock",
    origin: "SYD",
    destination: "DPS",
    airline: { code: "QF", name: "Qantas" },
    outbound: leg,
    inbound: { ...leg, from: "DPS", to: "SYD", departureAt: "2027-04-20T10:00", arrivalAt: "2027-04-20T20:20" },
    passengers: { adults: 2, children: 2 },
    totalPrice: { amount: 3000, currency: "AUD" },
    ...overrides,
  };
}

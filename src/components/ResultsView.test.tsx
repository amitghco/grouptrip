import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { criteriaToSearchParams } from "@/lib/flights/search-params";
import type { FlightSearchResult } from "@/lib/flights/types";
import { isoDaysFromToday, makeOffer } from "@/test/fixtures";
import { ResultsView } from "./ResultsView";

let searchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({ useSearchParams: () => searchParams }));

const criteria = {
  origin: "SYD",
  destinations: ["DPS", "AKL"],
  departureDate: isoDaysFromToday(30),
  returnDate: isoDaysFromToday(40),
  passengers: { adults: 2, childAges: [5, 8], infants: 0 },
};

const result: FlightSearchResult = {
  source: "mock",
  isMockData: true,
  searchedAt: "2026-10-16T00:00:00.000Z",
  offers: [
    makeOffer({
      id: "dps-cheap",
      airline: { code: "JQ", name: "Jetstar" },
      totalPrice: { amount: 2000, currency: "AUD" },
      outbound: { ...makeOffer({ id: "x" }).outbound, durationMinutes: 700, stops: 1, stopovers: ["SIN"] },
    }),
    makeOffer({
      id: "akl-fast",
      destination: "AKL",
      airline: { code: "NZ", name: "Air New Zealand" },
      totalPrice: { amount: 3000, currency: "AUD" },
      outbound: { ...makeOffer({ id: "x" }).outbound, to: "AKL", durationMinutes: 185 },
      inbound: { ...makeOffer({ id: "x" }).inbound, from: "AKL", durationMinutes: 200 },
    }),
  ],
};

const mockFetch = (status: number, body: unknown) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }),
  );

const offerNames = () => screen.getAllByRole("article").map((a) => a.getAttribute("aria-label"));

describe("ResultsView", () => {
  beforeEach(() => {
    searchParams = criteriaToSearchParams(criteria);
  });
  afterEach(() => vi.restoreAllMocks());

  it("shows loading, then mock-labelled results sorted by price", async () => {
    const fetchSpy = mockFetch(200, result);
    render(<ResultsView />);
    expect(screen.getByRole("status")).toHaveTextContent("Searching mock flights");

    expect(await screen.findByText("Showing 2 of 2 mock options")).toBeInTheDocument();
    expect(fetchSpy.mock.calls[0][0]).toContain("/api/flights/search?origin=SYD");
    expect(screen.getByRole("note", { name: "Mock data notice" })).toHaveTextContent("not live prices");
    expect(screen.getAllByText("Mock fare")).toHaveLength(2);
    expect(offerNames()).toEqual(["Jetstar to Bali (Denpasar) (DPS)", "Air New Zealand to Auckland (AKL)"]);
  });

  it("re-sorts and filters results", async () => {
    mockFetch(200, result);
    const user = userEvent.setup();
    render(<ResultsView />);
    await screen.findByText("Showing 2 of 2 mock options");

    await user.click(screen.getByRole("button", { name: "Shortest duration" }));
    expect(offerNames()[0]).toBe("Air New Zealand to Auckland (AKL)");

    await user.click(screen.getByRole("button", { name: "Lowest price" }));
    expect(offerNames()[0]).toBe("Jetstar to Bali (Denpasar) (DPS)");

    await user.selectOptions(screen.getByLabelText("Stops (each way)"), "0");
    expect(offerNames()).toEqual(["Air New Zealand to Auckland (AKL)"]);

    await user.selectOptions(screen.getByLabelText("Destination"), "DPS");
    expect(screen.getByText("No flights match these filters")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(offerNames()).toHaveLength(2);

    const summary = screen.getByRole("region", { name: "Cheapest by destination" });
    await user.click(within(summary).getByRole("button", { name: /Auckland/ }));
    expect(offerNames()).toEqual(["Air New Zealand to Auckland (AKL)"]);
  });

  it("shows an empty state when nothing fits the budget", async () => {
    searchParams = criteriaToSearchParams({ ...criteria, maxBudget: 100 });
    mockFetch(200, { ...result, offers: [] });
    render(<ResultsView />);
    expect(await screen.findByText("No flights found")).toBeInTheDocument();
    expect(screen.getByText(/fit your family budget/)).toBeInTheDocument();
  });

  it("shows an error state with retry when the API fails", async () => {
    const fetchSpy = mockFetch(502, { error: "provider_error", message: "Flight search is temporarily unavailable." });
    const user = userEvent.setup();
    render(<ResultsView />);
    expect(await screen.findByText("Flight search is temporarily unavailable.")).toBeInTheDocument();

    fetchSpy.mockResolvedValue(new Response(JSON.stringify(result), { status: 200 }));
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Showing 2 of 2 mock options")).toBeInTheDocument();
  });

  it("shows validation errors for an invalid URL without calling the API", () => {
    searchParams = new URLSearchParams("origin=SYD&destinations=DPS");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<ResultsView />);
    expect(screen.getByRole("alert")).toHaveTextContent("Departure date is required.");
    expect(screen.getByRole("link", { name: "Fix search criteria" })).toHaveAttribute(
      "href",
      "/?origin=SYD&destinations=DPS",
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

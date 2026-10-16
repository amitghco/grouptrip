import { filterOffers, sortOffers } from "./offers";
import { MockFlightProvider } from "./providers/mock-provider";
import type { FlightProvider, FlightSearchCriteria, FlightSearchResult } from "./types";

/** Application-level search service; UI and API code depend on this, not on a provider. */
export class FlightSearchService {
  constructor(
    private readonly provider: FlightProvider,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async search(criteria: FlightSearchCriteria): Promise<FlightSearchResult> {
    const offers = await this.provider.searchOffers(criteria);
    const affordable =
      criteria.maxBudget === undefined ? offers : filterOffers(offers, { maxTotalPrice: criteria.maxBudget });

    return {
      offers: sortOffers(affordable, "price"),
      source: this.provider.id,
      isMockData: this.provider.isMockData,
      searchedAt: this.now().toISOString(),
    };
  }
}

type ProviderEnv = Record<string, string | undefined>;

export function createFlightProvider(env: ProviderEnv = process.env): FlightProvider {
  const providerId = (env.FLIGHT_PROVIDER || "mock").trim().toLowerCase();
  switch (providerId) {
    case "mock": {
      const latency = Number(env.MOCK_LATENCY_MS ?? 400);
      return new MockFlightProvider({ latencyMs: Number.isFinite(latency) ? latency : 0 });
    }
    case "amadeus":
      throw new Error("The Amadeus provider is not implemented yet. Set FLIGHT_PROVIDER=mock.");
    default:
      throw new Error(`Unknown FLIGHT_PROVIDER "${providerId}". Supported: mock.`);
  }
}

export function createFlightSearchService(env?: ProviderEnv): FlightSearchService {
  return new FlightSearchService(createFlightProvider(env));
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DestinationSummary } from "@/components/DestinationSummary";
import { FlightOfferCard } from "@/components/FlightOfferCard";
import { MockDataBanner } from "@/components/MockDataBanner";
import { ResultsToolbar, type StopsFilter } from "@/components/ResultsToolbar";
import { EmptyState, ErrorState, LoadingState } from "@/components/StatusMessage";
import { formatDate, formatMoney, formatPassengers } from "@/lib/flights/format";
import { filterOffers, sortOffers, summarizeByDestination } from "@/lib/flights/offers";
import { criteriaToSearchParams, searchParamsToRawInput } from "@/lib/flights/search-params";
import type { AirportCode, FlightSearchResult, SearchApiError, SortOption } from "@/lib/flights/types";
import { validateSearchInput } from "@/lib/flights/validation";

type FetchState = { key: string; result: FlightSearchResult } | { key: string; error: string };

const linkButton =
  "inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-100";

export function ResultsView() {
  const queryString = useSearchParams().toString();
  const validation = useMemo(
    () => validateSearchInput(searchParamsToRawInput(new URLSearchParams(queryString))),
    [queryString],
  );

  const [attempt, setAttempt] = useState(0);
  const [fetchState, setFetchState] = useState<FetchState | null>(null);
  const [sort, setSort] = useState<SortOption>("price");
  const [destination, setDestination] = useState<AirportCode | "all">("all");
  const [stops, setStops] = useState<StopsFilter>("any");

  const requestKey = `${queryString}#${attempt}`;

  useEffect(() => {
    if (!validation.ok) return;
    const controller = new AbortController();
    const url = `/api/flights/search?${criteriaToSearchParams(validation.value).toString()}`;
    fetch(url, { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const body = (await response.json()) as FlightSearchResult | SearchApiError;
        if (!response.ok || "error" in body) {
          throw new Error("message" in body ? body.message : `Search failed (${response.status}).`);
        }
        setFetchState({ key: requestKey, result: body });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setFetchState({
          key: requestKey,
          error: error instanceof Error ? error.message : "Something went wrong.",
        });
      });
    return () => controller.abort();
  }, [validation, requestKey]);

  const modifyHref = `/?${queryString}`;

  if (!validation.ok) {
    return (
      <ErrorState
        title="We couldn't run that search"
        action={
          <Link href={modifyHref} className={linkButton}>
            Fix search criteria
          </Link>
        }
      >
        <ul className="list-disc pl-5">
          {Object.entries(validation.errors).map(([field, message]) => (
            <li key={field}>{message}</li>
          ))}
        </ul>
      </ErrorState>
    );
  }

  const criteria = validation.value;
  const current = fetchState?.key === requestKey ? fetchState : null;
  const activeDestination =
    destination !== "all" && criteria.destinations.includes(destination) ? destination : "all";

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Return flights from {criteria.origin}</h1>
          <p className="text-sm text-slate-600">
            {formatDate(criteria.departureDate)} – {formatDate(criteria.returnDate)} ·{" "}
            {formatPassengers(criteria.passengers.adults, criteria.passengers.children)}
            {criteria.maxBudget !== undefined &&
              ` · Budget ${formatMoney({ amount: criteria.maxBudget, currency: "AUD" })}`}
          </p>
        </div>
        <Link href={modifyHref} className={linkButton}>
          Modify search
        </Link>
      </header>

      <MockDataBanner />

      {!current && <LoadingState label="Searching mock flights…" />}

      {current && "error" in current && (
        <ErrorState
          title="Search failed"
          action={
            <button type="button" className={linkButton} onClick={() => setAttempt((n) => n + 1)}>
              Try again
            </button>
          }
        >
          <p>{current.error}</p>
        </ErrorState>
      )}

      {current && "result" in current && current.result.offers.length === 0 && (
        <EmptyState
          title="No flights found"
          action={
            <Link href={modifyHref} className={linkButton}>
              Modify search
            </Link>
          }
        >
          {criteria.maxBudget !== undefined
            ? "No options fit your budget. Try increasing it or changing dates."
            : "No options were found for these destinations and dates."}
        </EmptyState>
      )}

      {current && "result" in current && current.result.offers.length > 0 && (
        <ResultsList
          result={current.result}
          sort={sort}
          onSortChange={setSort}
          destination={activeDestination}
          onDestinationChange={setDestination}
          stops={stops}
          onStopsChange={setStops}
        />
      )}
    </div>
  );
}

interface ResultsListProps {
  result: FlightSearchResult;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  destination: AirportCode | "all";
  onDestinationChange: (destination: AirportCode | "all") => void;
  stops: StopsFilter;
  onStopsChange: (stops: StopsFilter) => void;
}

function ResultsList({ result, sort, destination, stops, ...handlers }: ResultsListProps) {
  const summaries = useMemo(() => summarizeByDestination(result.offers), [result.offers]);
  const visible = useMemo(
    () =>
      sortOffers(
        filterOffers(result.offers, {
          destinations: destination === "all" ? undefined : [destination],
          maxStopsPerDirection: stops === "any" ? undefined : Number(stops),
        }),
        sort,
      ),
    [result.offers, destination, stops, sort],
  );

  return (
    <>
      <DestinationSummary summaries={summaries} selected={destination} onSelect={handlers.onDestinationChange} />
      <ResultsToolbar
        sort={sort}
        onSortChange={handlers.onSortChange}
        destinations={summaries.map((s) => s.destination)}
        destination={destination}
        onDestinationChange={handlers.onDestinationChange}
        stops={stops}
        onStopsChange={handlers.onStopsChange}
      />
      <p className="text-sm text-slate-600" aria-live="polite">
        Showing {visible.length} of {result.offers.length} mock options
      </p>
      {visible.length === 0 ? (
        <EmptyState
          title="No flights match these filters"
          action={
            <button
              type="button"
              className={linkButton}
              onClick={() => {
                handlers.onDestinationChange("all");
                handlers.onStopsChange("any");
              }}
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <ol className="space-y-3">
          {visible.map((offer) => (
            <li key={offer.id}>
              <FlightOfferCard offer={offer} />
            </li>
          ))}
        </ol>
      )}
    </>
  );
}

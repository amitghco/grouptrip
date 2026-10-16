"use client";

import { airportLabel } from "@/lib/flights/airports";
import type { AirportCode, SortOption } from "@/lib/flights/types";

export type StopsFilter = "any" | "0" | "1";

const SORT_LABELS: Record<SortOption, string> = {
  price: "Lowest price",
  duration: "Shortest duration",
  stops: "Fewest stops",
};

interface ResultsToolbarProps {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  destinations: AirportCode[];
  destination: AirportCode | "all";
  onDestinationChange: (destination: AirportCode | "all") => void;
  stops: StopsFilter;
  onStopsChange: (stops: StopsFilter) => void;
}

const selectClass = "mt-1 block h-10 w-full rounded-lg border border-slate-300 bg-white px-2 text-sm";

export function ResultsToolbar(props: ResultsToolbarProps) {
  return (
    <div className="grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 sm:grid-cols-[2fr_1fr_1fr]">
      <fieldset>
        <legend className="text-sm font-medium text-slate-700">Sort by</legend>
        <div className="mt-1 grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
          {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={props.sort === option}
              onClick={() => props.onSortChange(option)}
              className={`rounded-md px-2 py-1.5 text-xs font-medium sm:text-sm ${
                props.sort === option ? "bg-white text-sky-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {SORT_LABELS[option]}
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="filter-destination" className="text-sm font-medium text-slate-700">
          Destination
        </label>
        <select
          id="filter-destination"
          value={props.destination}
          onChange={(event) => props.onDestinationChange(event.target.value)}
          className={selectClass}
        >
          <option value="all">All destinations</option>
          {props.destinations.map((code) => (
            <option key={code} value={code}>
              {airportLabel(code)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="filter-stops" className="text-sm font-medium text-slate-700">
          Stops (each way)
        </label>
        <select
          id="filter-stops"
          value={props.stops}
          onChange={(event) => props.onStopsChange(event.target.value as StopsFilter)}
          className={selectClass}
        >
          <option value="any">Any</option>
          <option value="0">Direct only</option>
          <option value="1">Up to 1 stop</option>
        </select>
      </div>
    </div>
  );
}

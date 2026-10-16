import { airportLabel } from "@/lib/flights/airports";
import { formatDuration, formatMoney } from "@/lib/flights/format";
import { totalDurationMinutes, type DestinationSummary as Summary } from "@/lib/flights/offers";
import type { AirportCode } from "@/lib/flights/types";

interface DestinationSummaryProps {
  summaries: Summary[];
  selected: AirportCode | "all";
  onSelect: (destination: AirportCode | "all") => void;
}

export function DestinationSummary({ summaries, selected, onSelect }: DestinationSummaryProps) {
  return (
    <section aria-labelledby="summary-heading">
      <h2 id="summary-heading" className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Cheapest by destination
      </h2>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {summaries.map((summary) => {
          const active = selected === summary.destination;
          return (
            <li key={summary.destination}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(active ? "all" : summary.destination)}
                className={`h-full w-full rounded-xl p-3 text-left ring-1 transition ${
                  active ? "bg-sky-50 ring-2 ring-sky-600" : "bg-white ring-slate-200 hover:ring-sky-400"
                }`}
              >
                <span className="block text-sm font-medium text-slate-700">
                  {airportLabel(summary.destination)}
                </span>
                <span className="block text-lg font-bold text-slate-900">
                  from {formatMoney(summary.cheapest.totalPrice)}
                </span>
                <span className="block text-xs text-slate-500">
                  {summary.offerCount} options · fastest {formatDuration(totalDurationMinutes(summary.fastest))} total
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import { airportLabel } from "@/lib/flights/airports";
import {
  dayOffset,
  formatDate,
  formatDuration,
  formatMoney,
  formatPassengers,
  formatStops,
  formatTime,
} from "@/lib/flights/format";
import { totalDurationMinutes } from "@/lib/flights/offers";
import type { FlightItinerary, FlightOffer } from "@/lib/flights/types";

function ItineraryRow({ label, itinerary }: { label: string; itinerary: FlightItinerary }) {
  const days = dayOffset(itinerary.departureAt, itinerary.arrivalAt);
  return (
    <div className="grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-0.5 text-sm sm:grid-cols-[5rem_1fr_auto] sm:items-center">
      <span className="font-medium text-slate-500">{label}</span>
      <div>
        <div className="font-medium text-slate-800">
          {formatDate(itinerary.departureAt)} · {formatTime(itinerary.departureAt)} {itinerary.from} →{" "}
          {formatTime(itinerary.arrivalAt)}
          {days !== 0 && <sup className="ml-0.5 text-xs text-slate-500">{days > 0 ? `+${days}` : days}</sup>}{" "}
          {itinerary.to}
        </div>
        <div className="text-xs text-slate-500">{itinerary.flightNumbers.join(" / ")}</div>
      </div>
      <div className="col-start-2 text-slate-600 sm:col-start-auto sm:text-right">
        {formatDuration(itinerary.durationMinutes)} ·{" "}
        <span className={itinerary.stops === 0 ? "text-emerald-700" : ""}>
          {formatStops(itinerary.stops)}
          {itinerary.stopovers.length > 0 && ` via ${itinerary.stopovers.join(", ")}`}
        </span>
      </div>
    </div>
  );
}

export function FlightOfferCard({ offer }: { offer: FlightOffer }) {
  const { adults, children } = offer.passengers;
  return (
    <article
      aria-label={`${offer.airline.name} to ${airportLabel(offer.destination)}`}
      className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-slate-900">{airportLabel(offer.destination)}</h3>
          <p className="text-sm text-slate-600">
            {offer.airline.name} ({offer.airline.code}) · {formatDuration(totalDurationMinutes(offer))} total
            flying
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-2xl font-bold text-slate-900">{formatMoney(offer.totalPrice)}</p>
          <p className="text-xs text-slate-500">
            Return total
            <span className="block sm:inline">
              <span className="hidden sm:inline"> · </span>
              {formatPassengers(adults, children)}
            </span>
          </p>
          {offer.source === "mock" && (
            <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              Mock fare
            </span>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
        <ItineraryRow label="Outbound" itinerary={offer.outbound} />
        <ItineraryRow label="Return" itinerary={offer.inbound} />
      </div>
    </article>
  );
}

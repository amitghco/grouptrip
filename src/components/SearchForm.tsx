"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { AIRPORT_DATALIST_ID, AirportDatalist } from "@/components/AirportDatalist";
import { ChildAgeSelect } from "@/components/ChildAgeSelect";
import { DestinationPicker } from "@/components/DestinationPicker";
import { PassengerStepper } from "@/components/PassengerStepper";
import { criteriaToSearchParams } from "@/lib/flights/search-params";
import {
  latestTravelDate,
  LIMITS,
  todayIso,
  validateSearchInput,
  type FieldErrors,
} from "@/lib/flights/validation";
import { DEFAULT_FORM_VALUES, formValuesToRawInput, type SearchFormValues } from "@/lib/search-form";

interface SearchFormProps {
  initialValues?: SearchFormValues;
}

const inputClass =
  "mt-1 block h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900 aria-[invalid=true]:border-red-500";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm text-red-600">
      {message}
    </p>
  );
}

export function SearchForm({ initialValues = DEFAULT_FORM_VALUES }: SearchFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<SearchFormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof SearchFormValues>(key: K, value: SearchFormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const setAdults = (adults: number) =>
    setValues((current) => ({ ...current, adults, infants: Math.min(current.infants, adults) }));

  const setChildCount = (count: number) =>
    setValues((current) => ({
      ...current,
      childAges: Array.from({ length: count }, (_, i) => current.childAges[i] ?? null),
    }));

  const setChildAge = (index: number, age: number | null) =>
    setValues((current) => ({
      ...current,
      childAges: current.childAges.map((existing, i) => (i === index ? age : existing)),
    }));

  const today = todayIso();
  const latestDate = latestTravelDate(today);
  const seatsLeft = LIMITS.maxSeatedPassengers - values.adults - values.childAges.length;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = validateSearchInput(formValuesToRawInput(values));
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    router.push(`/results?${criteriaToSearchParams(result.value).toString()}`);
  };

  const describedBy = (field: keyof FieldErrors) => (errors[field] ? `${field}-error` : undefined);
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-label="Flight search"
      className="space-y-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="origin" className="block text-sm font-medium text-slate-700">
            Departure airport
          </label>
          <input
            id="origin"
            value={values.origin}
            maxLength={3}
            list={AIRPORT_DATALIST_ID}
            autoComplete="off"
            autoCapitalize="characters"
            aria-invalid={Boolean(errors.origin)}
            aria-describedby={describedBy("origin")}
            onChange={(event) => update("origin", event.target.value.toUpperCase())}
            className={`${inputClass} uppercase`}
          />
          <FieldError id="origin-error" message={errors.origin} />
        </div>
        <div>
          <label htmlFor="departureDate" className="block text-sm font-medium text-slate-700">
            Departure date
          </label>
          <input
            id="departureDate"
            type="date"
            value={values.departureDate}
            min={today}
            max={latestDate}
            aria-invalid={Boolean(errors.departureDate)}
            aria-describedby={describedBy("departureDate")}
            onChange={(event) => update("departureDate", event.target.value)}
            className={inputClass}
          />
          <FieldError id="departureDate-error" message={errors.departureDate} />
        </div>
        <div>
          <label htmlFor="returnDate" className="block text-sm font-medium text-slate-700">
            Return date
          </label>
          <input
            id="returnDate"
            type="date"
            value={values.returnDate}
            min={values.departureDate || today}
            max={latestDate}
            aria-invalid={Boolean(errors.returnDate)}
            aria-describedby={describedBy("returnDate")}
            onChange={(event) => update("returnDate", event.target.value)}
            className={inputClass}
          />
          <FieldError id="returnDate-error" message={errors.returnDate} />
        </div>
      </div>

      <p className="-mt-3 text-xs text-slate-500">
        Travel dates can be up to {LIMITS.maxDaysAhead} days ahead.
      </p>

      <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-800">Your family&apos;s travellers</legend>
        <p className="-mt-2 text-xs text-slate-500">
          Search once per family: prices and the budget below cover only these travellers.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <PassengerStepper
            id="adults"
            label="Adults"
            hint="12 years and over"
            value={values.adults}
            min={LIMITS.minAdults}
            max={values.adults + seatsLeft}
            error={errors.adults}
            onChange={setAdults}
          />
          <PassengerStepper
            id="children"
            label="Children"
            hint="2–11 years, own seat"
            value={values.childAges.length}
            min={0}
            max={values.childAges.length + seatsLeft}
            onChange={setChildCount}
          />
          <PassengerStepper
            id="infants"
            label="Infants"
            hint="Under 2, on an adult's lap"
            value={values.infants}
            min={0}
            max={values.adults}
            error={errors.infants}
            onChange={(infants) => update("infants", infants)}
          />
        </div>
        {values.childAges.length > 0 && (
          <div>
            <div className="flex flex-wrap gap-3">
              {values.childAges.map((age, index) => (
                <ChildAgeSelect
                  key={index}
                  index={index}
                  value={age}
                  invalid={Boolean(errors.childAges)}
                  onChange={(next) => setChildAge(index, next)}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-500">Age on the travel date.</p>
          </div>
        )}
        <FieldError id="childAges-error" message={errors.childAges} />

        <div className="sm:max-w-xs">
          <label htmlFor="maxBudget" className="block text-sm font-medium text-slate-700">
            Family budget (AUD, optional)
          </label>
          <p className="text-xs text-slate-500">Max total return price for the travellers above</p>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 mt-1 flex items-center text-slate-500">
              $
            </span>
            <input
              id="maxBudget"
              type="number"
              inputMode="decimal"
              min={1}
              step={50}
              placeholder="No limit"
              value={values.maxBudget}
              aria-invalid={Boolean(errors.maxBudget)}
              aria-describedby={describedBy("maxBudget")}
              onChange={(event) => update("maxBudget", event.target.value)}
              className={`${inputClass} pl-7`}
            />
          </div>
          <FieldError id="maxBudget-error" message={errors.maxBudget} />
        </div>
      </fieldset>

      <DestinationPicker
        selected={values.destinations}
        datalistId={AIRPORT_DATALIST_ID}
        error={errors.destinations}
        onChange={(destinations) => update("destinations", destinations)}
      />

      {hasErrors && (
        <p role="alert" className="text-sm font-medium text-red-600">
          Please fix the highlighted fields.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="h-12 w-full rounded-xl bg-sky-600 px-6 font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Searching…" : "Search Flights"}
      </button>
      <AirportDatalist />
    </form>
  );
}

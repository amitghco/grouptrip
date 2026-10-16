"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { DestinationPicker } from "@/components/DestinationPicker";
import { PassengerStepper } from "@/components/PassengerStepper";
import { criteriaToSearchParams } from "@/lib/flights/search-params";
import { LIMITS, validateSearchInput, type FieldErrors } from "@/lib/flights/validation";
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
            min={values.departureDate || undefined}
            aria-invalid={Boolean(errors.returnDate)}
            aria-describedby={describedBy("returnDate")}
            onChange={(event) => update("returnDate", event.target.value)}
            className={inputClass}
          />
          <FieldError id="returnDate-error" message={errors.returnDate} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <PassengerStepper
          id="adults"
          label="Adults"
          hint="12 years and over"
          value={values.adults}
          min={LIMITS.minAdults}
          max={LIMITS.maxPassengers}
          error={errors.adults}
          onChange={(value) => update("adults", value)}
        />
        <PassengerStepper
          id="children"
          label="Children"
          hint="2–11 years"
          value={values.children}
          min={0}
          max={LIMITS.maxPassengers - 1}
          error={errors.children}
          onChange={(value) => update("children", value)}
        />
        <div>
          <label htmlFor="maxBudget" className="block text-sm font-medium text-slate-700">
            Max budget (AUD, optional)
          </label>
          <p className="text-xs text-slate-500">Total return price for all passengers</p>
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
      </div>

      <DestinationPicker
        selected={values.destinations}
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
    </form>
  );
}

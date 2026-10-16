"use client";

import { useState } from "react";
import { airportLabel, SUGGESTED_DESTINATIONS } from "@/lib/flights/airports";
import { isValidIata, normalizeIata } from "@/lib/flights/validation";

interface DestinationPickerProps {
  selected: string[];
  error?: string;
  onChange: (destinations: string[]) => void;
}

export function DestinationPicker({ selected, error, onChange }: DestinationPickerProps) {
  const [customCode, setCustomCode] = useState("");
  const [customError, setCustomError] = useState<string>();
  const customSelected = selected.filter((code) => !SUGGESTED_DESTINATIONS.includes(code));

  const toggle = (code: string) =>
    onChange(selected.includes(code) ? selected.filter((c) => c !== code) : [...selected, code]);

  const addCustom = () => {
    const code = normalizeIata(customCode);
    if (!isValidIata(code)) {
      setCustomError("Enter a 3-letter IATA code, e.g. NAN.");
      return;
    }
    setCustomError(undefined);
    setCustomCode("");
    if (!selected.includes(code)) onChange([...selected, code]);
  };

  return (
    <fieldset aria-describedby={error ? "destinations-error" : undefined}>
      <legend className="text-sm font-medium text-slate-700">Destinations to compare</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {SUGGESTED_DESTINATIONS.map((code) => {
          const active = selected.includes(code);
          return (
            <button
              key={code}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(code)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                active
                  ? "border-sky-600 bg-sky-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-sky-400"
              }`}
            >
              {airportLabel(code)}
            </button>
          );
        })}
        {customSelected.map((code) => (
          <span
            key={code}
            className="inline-flex items-center gap-1 rounded-full border border-sky-600 bg-sky-600 py-1.5 pl-3 pr-1.5 text-sm text-white"
          >
            {airportLabel(code)}
            <button
              type="button"
              aria-label={`Remove ${code}`}
              onClick={() => toggle(code)}
              className="rounded-full px-1.5 hover:bg-sky-700"
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-start gap-2">
        <div>
          <label htmlFor="custom-destination" className="sr-only">
            Other destination IATA code
          </label>
          <input
            id="custom-destination"
            value={customCode}
            maxLength={3}
            placeholder="Other IATA code"
            autoCapitalize="characters"
            aria-invalid={Boolean(customError)}
            aria-describedby={customError ? "custom-destination-error" : undefined}
            onChange={(event) => setCustomCode(event.target.value.toUpperCase())}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCustom();
              }
            }}
            className="h-10 w-40 rounded-lg border border-slate-300 px-3 uppercase placeholder:normal-case"
          />
          {customError && (
            <p id="custom-destination-error" className="mt-1 text-sm text-red-600">
              {customError}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={addCustom}
          className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Add
        </button>
      </div>
      {error && (
        <p id="destinations-error" role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}

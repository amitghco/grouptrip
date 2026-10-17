"use client";

interface PassengerStepperProps {
  id: string;
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  error?: string;
  onChange: (value: number) => void;
}

export function PassengerStepper({ id, label, hint, value, min, max, error, onChange }: PassengerStepperProps) {
  const buttonClass =
    "flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 bg-white text-lg font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      <div className="mt-1 flex items-center gap-2">
        <button
          type="button"
          className={buttonClass}
          aria-label={`Decrease ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          −
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => {
            const next = Number.parseInt(event.target.value, 10);
            onChange(Number.isNaN(next) ? min : Math.min(max, Math.max(min, next)));
          }}
          className="h-10 w-16 rounded-lg border border-slate-300 text-center"
        />
        <button
          type="button"
          className={buttonClass}
          aria-label={`Increase ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          +
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

"use client";

import { LIMITS } from "@/lib/flights/validation";

interface ChildAgeSelectProps {
  index: number;
  value: number | null;
  invalid: boolean;
  onChange: (age: number | null) => void;
}

const AGES = Array.from(
  { length: LIMITS.maxChildAge - LIMITS.minChildAge + 1 },
  (_, i) => LIMITS.minChildAge + i,
);

export function ChildAgeSelect({ index, value, invalid, onChange }: ChildAgeSelectProps) {
  const id = `child-age-${index}`;
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-600">
        Child {index + 1} age
      </label>
      <select
        id={id}
        value={value ?? ""}
        aria-invalid={invalid && value === null}
        onChange={(event) => onChange(event.target.value === "" ? null : Number(event.target.value))}
        className="mt-1 h-10 w-24 rounded-lg border border-slate-300 bg-white px-2 text-slate-900 aria-[invalid=true]:border-red-500"
      >
        <option value="">Age</option>
        {AGES.map((age) => (
          <option key={age} value={age}>
            {age}
          </option>
        ))}
      </select>
    </div>
  );
}

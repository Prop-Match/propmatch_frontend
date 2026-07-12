"use client";

import { cn } from "@/src/utils/cn";

export interface ChipProps {
  label: string;
  selected?: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}

/** Pill-shaped selectable chip for multi/single-select groups. */
export function Chip({ label, selected, onToggle, disabled }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "rounded-pill border px-4 py-1.5 text-small font-medium transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary",
        selected
          ? "border-primary bg-primary text-white"
          : "border-hairline bg-surface text-body-text hover:border-primary hover:text-primary",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {label}
    </button>
  );
}

export interface ChipGroupProps<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T[] | T | null;
  onChange: (next: T[] | T) => void;
  multiple?: boolean;
  label?: string;
  error?: string;
}

export function ChipGroup<T extends string>({ options, value, onChange, multiple, label, error }: ChipGroupProps<T>) {
  const selectedValues: T[] = multiple
    ? ((value as T[] | null) ?? [])
    : value !== null && value !== undefined
      ? [value as T]
      : [];

  function toggle(v: T) {
    if (multiple) {
      const next = selectedValues.includes(v)
        ? selectedValues.filter((s) => s !== v)
        : [...selectedValues, v];
      onChange(next);
    } else {
      onChange(v);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-small font-semibold text-ink">{label}</span>}
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((opt) => (
          <Chip
            key={opt.value}
            label={opt.label}
            selected={selectedValues.includes(opt.value)}
            onToggle={() => toggle(opt.value)}
          />
        ))}
      </div>
      {error && <p className="text-caption text-error">{error}</p>}
    </div>
  );
}

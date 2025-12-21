import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  gainRate: number;
  min?: number;
  max?: number;
  step?: number;
  id?: string;
  Icon: LucideIcon;
  accentClassName?: string; // e.g., bg-red-500 for fill and ring
  iconClassName?: string; // e.g., text-red-500 for icon tint
}

export function SliderControl({
  label,
  value,
  onChange,
  gainRate,
  min = 0,
  max = 10,
  step = 0.1,
  id,
  Icon,
  accentClassName = "bg-tint",
  iconClassName = "text-foreground",
}: SliderControlProps) {
  const inputId = id ?? `slider-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const [focused, setFocused] = useState(false);

  const percent = useMemo(() => {
    const clamped = Math.min(max, Math.max(min, value));
    const range = max - min;
    if (range <= 0) return 0;
    return ((clamped - min) / range) * 100;
  }, [max, min, value]);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold" htmlFor={inputId}>{label}</label>
        <span className="text-sm font-semibold">{value.toFixed(1)}</span>
      </div>
      <div className="relative h-14">
        <div
          className={`absolute inset-y-0 my-auto h-2 w-full rounded-full bg-surface-alt ${focused ? "ring-2 ring-offset-2 ring-offset-background ring-border" : ""}`}
        >
          <div
            className={`h-full rounded-full ${accentClassName}`}
            style={{ width: `${percent}%` }}
            aria-hidden
          />
        </div>

        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center h-12 w-12 rounded-full border border-border bg-background shadow-md pointer-events-none transition-transform ${focused ? "ring-2 ring-offset-2 ring-offset-background" : ""}`}
          style={{ left: `${percent}%` }}
          aria-hidden
        >
          <Icon size={22} className={iconClassName} />
        </div>

        <input
          type="range"
          id={inputId}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="absolute inset-0 w-full h-14 opacity-0 cursor-pointer"
        />
      </div>
      <div className="text-right text-xs text-text opacity-80 mt-2">
        Gain/s: +{gainRate.toFixed(3)}
      </div>
    </div>
  );
}

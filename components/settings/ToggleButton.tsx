'use client';

interface ToggleButtonProps {
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}

export function ToggleButton({ value, onChange, disabled = false, ariaLabel, ariaLabelledBy }: ToggleButtonProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      role="switch"
      aria-checked={value}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={`relative inline-flex h-7 w-12 rounded-full transition-colors ${value ? 'bg-tint' : 'bg-surface-alt'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-1'} my-auto`}
      />
    </button>
  );
}

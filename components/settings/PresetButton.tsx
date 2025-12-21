'use client';

import type { ThemePreset } from '@/types/core_game_types';

const PRESET_LABELS: Record<ThemePreset, string> = {
  default: 'Default',
  ocean: 'Ocean',
  forest: 'Forest',
  sunset: 'Sunset',
  monochrome: 'Monochrome',
};

interface PresetButtonProps {
  preset: ThemePreset;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function PresetButton({ preset, isActive, onClick, disabled = false }: PresetButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-2 px-3 rounded-lg border transition-opacity ${isActive ? 'bg-tint border-tint text-foreground font-bold shadow-sm ring-1 ring-tint/70' : 'bg-surface-alt border-gray-400'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {isActive && '✓ '}
      {PRESET_LABELS[preset]}
    </button>
  );
}

// src/systems/status.ts

import type { CommonsState } from '@/state/store';
import { BASE_SUPPLY_RATE, TICK_INTERVAL_MS } from './tick';

type StatusTuning = {
  resilienceBias?: number;
};

export function calculateStatus(state: CommonsState, tuning?: StatusTuning) {
  const resilienceBias = tuning?.resilienceBias ?? 0;
  const trend = state.rolling.supplyTrend;
  const unmetNeedScore = state.needs.food + state.needs.shelter + state.needs.care;
  const unmetThreshold = Math.max(0.2, 0.5 - resilienceBias * 0.25);
  const hasUnmetNeeds = unmetNeedScore > unmetThreshold; // simple guard to block "well_supported" when needs remain

  if (trend.length < 5) return 'holding';

  const avgDelta = trend.reduce((sum, v) => sum + v, 0) / trend.length;

  const volunteerStrainThreshold = Math.max(1, 3 - resilienceBias);
  const volunteerStrain = state.volunteerTime < volunteerStrainThreshold;

  const basePerTick = BASE_SUPPLY_RATE * (TICK_INTERVAL_MS / 1000);
  const improvingGate = basePerTick * 0.35 * Math.max(0.65, 1 - resilienceBias * 0.2);
  const wellSupportedGate = basePerTick * 0.75 * Math.max(0.6, 1 - resilienceBias * 0.3);

  // If community members still have notable needs, never report "well_supported"
  if (hasUnmetNeeds) {
    if (avgDelta > improvingGate && !volunteerStrain) {
      return 'improving';
    }
    return 'holding';
  }

  if (avgDelta > wellSupportedGate && !volunteerStrain) {
    return 'well_supported';
  }

  if (avgDelta > improvingGate) {
    return 'improving';
  }

  return 'holding';
}

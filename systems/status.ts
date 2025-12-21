// src/systems/status.ts

import type { CommonsState } from '@/state/store';

export function calculateStatus(state: CommonsState) {
  const trend = state.rolling.supplyTrend;
  const unmetNeedScore = state.needs.food + state.needs.shelter + state.needs.care;
  const hasUnmetNeeds = unmetNeedScore > 0.5; // simple guard to block "well_supported" when needs remain

  if (trend.length < 5) return 'holding';

  const avgDelta = trend.reduce((sum, v) => sum + v, 0) / trend.length;

  const volunteerStrain = state.volunteerTime < 3;

  // If community members still have notable needs, never report "well_supported"
  if (hasUnmetNeeds) {
    if (avgDelta > 0.05 && !volunteerStrain) {
      return 'improving';
    }
    return 'holding';
  }

  if (avgDelta > 0.15 && !volunteerStrain) {
    return 'well_supported';
  }

  if (avgDelta > 0.05) {
    return 'improving';
  }

  return 'holding';
}

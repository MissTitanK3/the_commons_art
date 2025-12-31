import { DEV_CONFIG } from '@/config/dev';
import { DAY_MS } from '@/utils/time';
import { CategoryValues } from '@/types/core_game_types';

export const UB_KEYS = ['ubi', 'ubs', 'ubm', 'ubr'] as const;
export type UniversalBasicKey = (typeof UB_KEYS)[number];

// Total resource budget each bar consumes before applying the per-resource ratios.
const UB_TOTAL_REQUIREMENT = 30;
const UB_REQUIREMENT_MULTIPLIER = 150; // Increase difficulty to avoid instant completes

const ZERO_VALUES: CategoryValues = { food: 0, shelter: 0, care: 0 };

export type UbBarProgress = {
  contributed: CategoryValues;
  completed: boolean;
};

export type UniversalBasicsProgress = Record<UniversalBasicKey, UbBarProgress>;
export type UniversalBasicsCredits = Record<UniversalBasicKey, boolean>;

export const UNIVERSAL_BASICS: Record<
  UniversalBasicKey,
  {
    key: UniversalBasicKey;
    label: string;
    ratios: CategoryValues;
  }
> = {
  ubi: {
    key: 'ubi',
    label: 'Universal Basic Income',
    ratios: { food: 1, shelter: 1, care: 1 },
  },
  ubs: {
    key: 'ubs',
    label: 'Universal Basic Services',
    ratios: { food: 1, shelter: 2, care: 3 },
  },
  ubm: {
    key: 'ubm',
    label: 'Universal Basic Maintenance',
    ratios: { food: 3, shelter: 2, care: 1 },
  },
  ubr: {
    key: 'ubr',
    label: 'Universal Basic Readiness',
    ratios: { food: 2, shelter: 2, care: 2 },
  },
};

export function getUbDayLengthMs() {
  return DEV_CONFIG.enabled && DEV_CONFIG.UB_DAY_MS ? DEV_CONFIG.UB_DAY_MS : DAY_MS;
}

export function createEmptyUbProgress(): UniversalBasicsProgress {
  return UB_KEYS.reduce((acc, key) => {
    acc[key] = { contributed: { ...ZERO_VALUES }, completed: false };
    return acc;
  }, {} as UniversalBasicsProgress);
}

export function createEmptyUbCredits(): UniversalBasicsCredits {
  return UB_KEYS.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as UniversalBasicsCredits);
}

export function getUbRequirements(key: UniversalBasicKey): CategoryValues {
  const def = UNIVERSAL_BASICS[key];
  const totalWeight = def.ratios.food + def.ratios.shelter + def.ratios.care;
  if (totalWeight <= 0) return { ...ZERO_VALUES };
  const scale = (UB_TOTAL_REQUIREMENT * UB_REQUIREMENT_MULTIPLIER) / totalWeight;
  return {
    food: def.ratios.food * scale,
    shelter: def.ratios.shelter * scale,
    care: def.ratios.care * scale,
  };
}

export function getUbDayInfo(dayStartAt: number, now = Date.now()) {
  const dayLengthMs = getUbDayLengthMs();
  const elapsedMs = Math.max(0, now - dayStartAt);
  const cyclesElapsed = Math.floor(elapsedMs / dayLengthMs);
  const dayElapsedMs = elapsedMs % dayLengthMs;
  const fractionOfDay = dayLengthMs > 0 ? dayElapsedMs / dayLengthMs : 0;
  const hour = fractionOfDay * 24;
  return {
    dayLengthMs,
    elapsedMs,
    cyclesElapsed,
    fractionOfDay,
    hour,
    progressCap: 1,
  };
}

export function getUbProgressValue(contributed: CategoryValues, requirements: CategoryValues) {
  const foodProgress = requirements.food === 0 ? 1 : contributed.food / requirements.food;
  const shelterProgress = requirements.shelter === 0 ? 1 : contributed.shelter / requirements.shelter;
  const careProgress = requirements.care === 0 ? 1 : contributed.care / requirements.care;

  return Math.min(1, foodProgress, shelterProgress, careProgress);
}

export function getUbContributionPlan(options: {
  key: UniversalBasicKey;
  contributed: CategoryValues;
  available: CategoryValues;
}) {
  const { key, contributed, available } = options;
  const requirements = getUbRequirements(key);
  const progressCap = 1;

  const currentProgress = getUbProgressValue(contributed, requirements);
  if (currentProgress >= 1) {
    return {
      requirements,
      progressCap,
      currentProgress,
      targetProgress: currentProgress,
      needed: { ...ZERO_VALUES },
    };
  }

  const maxWithAvailable = Math.min(
    (contributed.food + available.food) / (requirements.food || 1),
    (contributed.shelter + available.shelter) / (requirements.shelter || 1),
    (contributed.care + available.care) / (requirements.care || 1),
  );

  const targetProgress = Math.min(1, progressCap, maxWithAvailable);

  const needed = {
    food: Math.max(0, targetProgress * requirements.food - contributed.food),
    shelter: Math.max(0, targetProgress * requirements.shelter - contributed.shelter),
    care: Math.max(0, targetProgress * requirements.care - contributed.care),
  };

  return {
    requirements,
    progressCap,
    currentProgress,
    targetProgress,
    needed,
  };
}

export function buildUbEffectModifiers(active: UniversalBasicsCredits) {
  const resilienceBias = (active.ubi ? 0.2 : 0) + (active.ubm ? 0.1 : 0) + (active.ubs ? 0.05 : 0); // slight ease when community care/services are present

  const needGenerationMultiplier = active.ubm ? 0.9 : 1;

  // Soften negative events/wipes when services or readiness are active.
  const eventNegativeMultiplier = active.ubr ? 0.85 : active.ubs ? 0.9 : 1;
  const wipeChanceMultiplier = active.ubs ? 0.6 : active.ubr ? 0.8 : 1;
  const wipeMagnitudeMultiplier = active.ubr ? 0.8 : 1;

  return {
    resilienceBias,
    needGenerationMultiplier,
    eventNegativeMultiplier,
    wipeChanceMultiplier,
    wipeMagnitudeMultiplier,
  };
}

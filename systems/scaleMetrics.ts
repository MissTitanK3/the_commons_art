import { CommunityScale, Needs } from '@/types/core_game_types';
import { BASE_SUPPLY_RATE } from './tick';

// Needs generated per second for each scale tier
export const NEED_GENERATION_RATE: Record<CommunityScale, number> = {
  // Tuned for light pressure at each tier; kept below sustainable rate so growth is possible.
  house: 0.04,
  block: 0.048,
  village: 0.056,
  town: 0.064,
  townhall: 0.072,
  apartment: 0.08,
  neighborhood: 0.088,
  district: 0.096,
  borough: 0.104,
  municipal: 0.112,
  city: 0.12,
  metropolis: 0.128,
  county: 0.136,
  province: 0.144,
  region: 0.152,
};

export const SCALE_REQUIREMENTS: Record<CommunityScale, number> = {
  house: 0,
  block: 40,
  village: 90,
  town: 150,
  townhall: 210,
  apartment: 270,
  neighborhood: 330,
  district: 390,
  borough: 450,
  municipal: 510,
  city: 570,
  metropolis: 630,
  county: 680,
  province: 715,
  region: 750,
};

export const PRESTIGE_REQUIREMENT_STEP = 0.25;

// Grace periods before auto-downgrade (in milliseconds)
export const DOWNGRADE_GRACE_PERIODS: Record<number, number> = {
  0: 24 * 60 * 60 * 1000, // First downgrade: 24 hours
  1: 48 * 60 * 60 * 1000, // Second downgrade: 48 hours
  2: 72 * 60 * 60 * 1000, // Third and beyond: 72 hours
};

export function getGracePeriodMs(downgradeLevelFromCurrent: number): number {
  if (downgradeLevelFromCurrent === 0) return DOWNGRADE_GRACE_PERIODS[0]!;
  if (downgradeLevelFromCurrent === 1) return DOWNGRADE_GRACE_PERIODS[1]!;
  return DOWNGRADE_GRACE_PERIODS[2]!; // 72 hours for all subsequent downgrades
}

const SCALE_TIERS: CommunityScale[] = [
  'house',
  'block',
  'village',
  'town',
  'townhall',
  'apartment',
  'neighborhood',
  'district',
  'borough',
  'municipal',
  'city',
  'metropolis',
  'county',
  'province',
  'region',
];

export function getScaleTierIndex(scale: CommunityScale): number {
  return SCALE_TIERS.indexOf(scale);
}

export function getSustainableScale(): CommunityScale {
  // Find the highest tier that can be sustained with a buffer (20%) against BASE_SUPPLY_RATE.
  const sustainableRate = BASE_SUPPLY_RATE * 0.8;

  for (let i = SCALE_TIERS.length - 1; i >= 0; i--) {
    const tier = SCALE_TIERS[i]!;
    if (NEED_GENERATION_RATE[tier] <= sustainableRate) {
      return tier;
    }
  }

  return 'house'; // Always at least sustainable at house
}

type SustainabilityInput = {
  communityScale: CommunityScale;
  supplyTrend: number[];
  needs: Needs;
  supplies: {
    food: number;
    shelter: number;
    care: number;
  };
  resilienceBias?: number;
};

export function canSustainScale(input: SustainabilityInput): boolean {
  const { supplyTrend, needs, supplies, resilienceBias = 0 } = input;
  const window = supplyTrend.slice(-10);
  if (window.length < 6) return true; // not enough data, assume stable

  const avgSupplyDelta = window.reduce((sum, v) => sum + v, 0) / window.length;
  const totalSupplies = supplies.food + supplies.shelter + supplies.care;
  const needPressure = needs.food + needs.shelter + needs.care;
  const buffer = totalSupplies - needPressure;

  const deficitThreshold = -0.3 * Math.max(0.6, 1 - resilienceBias * 0.4); // require meaningful decline
  const bufferThreshold = Math.max(4, 8 - resilienceBias * 6); // allow slack before marking unsustainable
  const overwhelmedByNeeds = needPressure > totalSupplies * 0.8 && totalSupplies < 12;

  return !(avgSupplyDelta < deficitThreshold && (buffer < bufferThreshold || overwhelmedByNeeds));
}

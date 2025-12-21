import { CommunityScale } from '@/types/core_game_types';
import { BASE_SUPPLY_RATE } from './tick';

// Needs generated per second for each scale tier
export const NEED_GENERATION_RATE: Record<CommunityScale, number> = {
  // Keep every tier under BASE_SUPPLY_RATE so players can always net-positive and save toward upgrades.
  house: 0.03,
  block: 0.039,
  village: 0.048,
  town: 0.057,
  townhall: 0.066,
  apartment: 0.075,
  neighborhood: 0.084,
  district: 0.093,
  borough: 0.102,
  municipal: 0.111,
  city: 0.12,
  metropolis: 0.129,
  county: 0.138,
  province: 0.147,
  region: 0.156,
};

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

export function canSustainScale(scale: CommunityScale): boolean {
  const needRate = NEED_GENERATION_RATE[scale];
  const sustainableRate = BASE_SUPPLY_RATE * 0.8; // 20% buffer
  return needRate <= sustainableRate;
}

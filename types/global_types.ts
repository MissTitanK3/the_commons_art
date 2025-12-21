import { CommonsState } from '@/state/store';

export type OfflineState = Pick<
  CommonsState,
  'suppliesFood' | 'suppliesShelter' | 'suppliesCare' | 'priority' | 'volunteerTime' | 'communityScale'
>;

export type Needs = {
  food: number;
  shelter: number;
  care: number;
};

export type NeedDirection = 'increasing' | 'steady' | 'decreasing';

export type EventEffect = {
  suppliesFoodDelta?: number;
  suppliesShelterDelta?: number;
  suppliesCareDelta?: number;
  shelterPriorityBoost?: number;
  foodPriorityBoost?: number;
  carePriorityBoost?: number;
};

export type EventChoice = {
  id: 'A' | 'B';
  label: string;
  effect: (state: CommonsState) => EventEffect;
  effectDescription?: string;
};

export type CommonsEvent = {
  id: string;
  title: string;
  body: string;
  choices: readonly [EventChoice, EventChoice];
};

export type ThemePreset = 'default' | 'ocean' | 'forest' | 'sunset' | 'monochrome';

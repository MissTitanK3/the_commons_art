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

export type EventChoiceId = 'A' | 'B' | 'C' | 'D';

export type NeedDirection = 'increasing' | 'steady' | 'decreasing';

export type EventEffect = {
  suppliesFoodDelta?: number;
  suppliesShelterDelta?: number;
  suppliesCareDelta?: number;
  shelterPriorityBoost?: number;
  foodPriorityBoost?: number;
  carePriorityBoost?: number;
  wipeRisk?: {
    target: keyof Needs;
    chance: number; // 0–1 probability
    minFraction: number; // fraction of bucket to wipe, e.g., 0.5 = 50%
    maxFraction: number;
  };
};

export type EventChoice = {
  id: EventChoiceId;
  label: string;
  effect: (state: CommonsState) => EventEffect;
  effectDescription?: string;
};

export type CommonsEvent = {
  id: string;
  title: string;
  body: string;
  choices: readonly EventChoice[];
};

export type ThemePreset = 'default' | 'ocean' | 'forest' | 'sunset' | 'monochrome';

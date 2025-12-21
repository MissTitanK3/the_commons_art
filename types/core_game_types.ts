/**
 * Core game state types for The Commons
 */

import { CATEGORY_COLORS } from '@/config/constants';

export type ScaleStatus = 'downgrading' | 'holding' | 'stable' | 'improving' | 'well_supported';
export type ThemeMode = 'light' | 'dark' | 'lofi' | 'dim';
export type ThemePreset = 'default' | 'ocean' | 'forest' | 'sunset' | 'monochrome';
export type Category = 'food' | 'shelter' | 'care';

export interface CategoryValues {
  food: number;
  shelter: number;
  care: number;
}

export interface EventEntry {
  id: string;
  title: string;
  body: string;
  choiceA: string;
  choiceB: string;
  effectA: string;
  effectB: string;
  choiceMade?: 'a' | 'b';
  timestamp: number;
}

export interface GameState {
  // Supplies
  suppliesFood: number;
  suppliesShelter: number;
  suppliesCare: number;

  // Volunteer time (hours worked)
  volunteerTime: number;

  // Community needs
  needsFood: number;
  needsShelter: number;
  needsCare: number;

  // Priority sliders (0-10)
  priorityFood: number;
  priorityShelter: number;
  priorityCare: number;

  // Community scale
  communityScale: CommunityScale;
  communityInvestment: number;
  status: ScaleStatus;

  // Events
  currentEventId?: string;
  eventLog: EventEntry[];

  // Self-care tracking (timestamp of last completion)
  selfCareActionTimestamps: Record<string, number>;

  // Persistence
  lastActiveAt: number;
  lastCheckInAt: number;
  hasSeenCheckIn: boolean;

  // Version for migrations
  version: number;
}

export interface UIState {
  highContrastOverride?: boolean;
  themeOverride?: ThemeMode;
  themePreset: ThemePreset;
  aboutDrawerOpen: boolean;
}

export type Needs = {
  food: number;
  shelter: number;
  care: number;
};

export type TickInput = {
  supplies: {
    food: number;
    shelter: number;
    care: number;
  };
  priority: {
    food: number;
    shelter: number;
    care: number;
  };
  volunteerTime: number;
  elapsedSeconds: number;
  communityScale?: CommunityScale;
};

export type Rolling = {
  supplyTrend: number[];
};

export type CommunityStatus = 'holding' | 'stable' | 'improving' | 'well_supported';

export type CommunityScale =
  | 'house'
  | 'block'
  | 'village'
  | 'town'
  | 'townhall'
  | 'apartment'
  | 'neighborhood'
  | 'district'
  | 'borough'
  | 'municipal'
  | 'city'
  | 'metropolis'
  | 'county'
  | 'province'
  | 'region';

export type ScaleOption = {
  key: CommunityScale;
  label: string;
  requirement: number;
};

export type Category_Colors = keyof typeof CATEGORY_COLORS;

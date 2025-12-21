import { Category, CommunityScale, ThemePreset } from '@/types/core_game_types';
import { HandHeart, HeartHandshake, HouseHeart } from 'lucide-react';

export const CATEGORY_COLORS = {
  food: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-red-500',
    icon: 'text-red-500',
    text: 'text-red-600 dark:text-red-300',
    label: 'Food',
  },
  shelter: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-500',
    icon: 'text-blue-500',
    text: 'text-blue-600 dark:text-blue-300',
    label: 'Shelter',
  },
  care: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-500',
    icon: 'text-green-500',
    text: 'text-green-600 dark:text-green-300',
    label: 'Care',
  },
};

export const CATEGORY_LABELS = {
  food: 'Food',
  shelter: 'Shelter',
  care: 'Care',
};

export const CATEGORY_ICONS = {
  food: HandHeart,
  shelter: HouseHeart,
  care: HeartHandshake,
};

export const SCALE_LABELS: Record<string, string> = {
  house: 'House',
  block: 'Block',
  village: 'Village',
  town: 'Town',
  townhall: 'Town Hall',
  apartment: 'Apartment',
  neighborhood: 'Neighborhood',
  district: 'District',
  borough: 'Borough',
  municipal: 'Municipal',
  city: 'City',
  metropolis: 'Metropolis',
  county: 'County',
  province: 'Province',
  region: 'Region',
};

export const SCALE_ORDER: CommunityScale[] = [
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

export const THRESHOLD_REQUIREMENTS: Record<string, Record<string, number>> = {
  house: { food: 50, shelter: 50, care: 50 },
  block: { food: 100, shelter: 100, care: 100 },
  village: { food: 200, shelter: 200, care: 200 },
  town: { food: 400, shelter: 400, care: 400 },
  townhall: { food: 400, shelter: 400, care: 400 },
  apartment: { food: 400, shelter: 400, care: 400 },
  neighborhood: { food: 600, shelter: 600, care: 600 },
  district: { food: 600, shelter: 600, care: 600 },
  borough: { food: 800, shelter: 800, care: 800 },
  municipal: { food: 800, shelter: 800, care: 800 },
  city: { food: 1000, shelter: 1000, care: 1000 },
  metropolis: { food: 1000, shelter: 1000, care: 1000 },
  county: { food: 1200, shelter: 1200, care: 1200 },
  province: { food: 1200, shelter: 1200, care: 1200 },
  region: { food: 1600, shelter: 1600, care: 1600 },
};

export const tradeOptions = [
  {
    label: 'Trade 5 Food → 1 Care',
    cost: { food: 5, shelter: 0, care: 0 },
    gain: { food: 0, shelter: 0, care: 1 },
  },
  {
    label: 'Trade 5 Care → 1 Shelter',
    cost: { food: 0, shelter: 0, care: 5 },
    gain: { food: 0, shelter: 1, care: 0 },
  },
  {
    label: 'Trade 1 Shelter → 5 Food',
    cost: { food: 0, shelter: 1, care: 0 },
    gain: { food: 5, shelter: 0, care: 0 },
  },
  {
    label: 'Trade 1 Shelter → 5 Care',
    cost: { food: 0, shelter: 1, care: 0 },
    gain: { food: 0, shelter: 0, care: 5 },
  },
] as const;

export const memberCount = 3; // Hardcoded for now, represents community members needing help

export const categories: Category[] = ['food', 'shelter', 'care'];

export const THEME_PRESETS: ThemePreset[] = ['default', 'ocean', 'forest', 'sunset', 'monochrome'];

export const SELF_CARE_ACTIONS = {
  food: [
    { id: 'food-1', label: 'Eat a simple meal', bonus: 3 },
    { id: 'food-2', label: 'Drink water', bonus: 1 },
    { id: 'food-3', label: 'Have a warm beverage', bonus: 2 },
    { id: 'food-4', label: 'Prepare food for later', bonus: 4 },
    { id: 'food-5', label: 'Eat something familiar', bonus: 2 },
    { id: 'food-6', label: 'Keep regular meal timing', bonus: 3 },
    { id: 'food-7', label: 'Sit down while eating', bonus: 2 },
    { id: 'food-8', label: 'Snack when energy dips', bonus: 1 },
    { id: 'food-9', label: 'Reduce decision load around food', bonus: 2 },
    { id: 'food-10', label: 'Accept food from others', bonus: 3 },
  ],
  shelter: [
    { id: 'shelter-1', label: 'Rest or nap', bonus: 4 },
    { id: 'shelter-2', label: 'Go somewhere warm or cool', bonus: 2 },
    { id: 'shelter-3', label: 'Tidy a small area', bonus: 3 },
    { id: 'shelter-4', label: 'Adjust lighting', bonus: 2 },
    { id: 'shelter-5', label: 'Change into comfortable clothing', bonus: 2 },
    { id: 'shelter-6', label: 'Sit or lie down intentionally', bonus: 3 },
    { id: 'shelter-7', label: 'Create a quiet space', bonus: 3 },
    { id: 'shelter-8', label: 'Reduce sensory input', bonus: 2 },
    { id: 'shelter-9', label: 'Maintain personal space', bonus: 2 },
    { id: 'shelter-10', label: 'Secure belongings', bonus: 1 },
  ],
  care: [
    { id: 'care-1', label: 'Check in with someone', bonus: 3 },
    { id: 'care-2', label: 'Ask for help', bonus: 4 },
    { id: 'care-3', label: 'Offer help', bonus: 3 },
    { id: 'care-4', label: 'Take a break without guilt', bonus: 3 },
    { id: 'care-5', label: 'Breathe slowly', bonus: 2 },
    { id: 'care-6', label: 'Write or reflect briefly', bonus: 3 },
    { id: 'care-7', label: 'Notice body signals', bonus: 2 },
    { id: 'care-8', label: 'Say no to a request', bonus: 2 },
    { id: 'care-9', label: 'Maintain a routine', bonus: 3 },
    { id: 'care-10', label: 'Acknowledge effort without judgment', bonus: 2 },
  ],
} as const;

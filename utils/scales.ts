import { ScaleOption } from '@/state/store';

export const options: ScaleOption[] = [
  { key: 'house', label: 'House', requirement: 0 },
  { key: 'block', label: 'City Block', requirement: 30 },
  { key: 'village', label: 'Village', requirement: 60 },
  { key: 'town', label: 'Town', requirement: 95 },
  { key: 'townhall', label: 'Town Hall', requirement: 135 },
  { key: 'apartment', label: 'Apartment Complex', requirement: 180 },
  { key: 'neighborhood', label: 'Neighborhood', requirement: 230 },
  { key: 'district', label: 'District', requirement: 285 },
  { key: 'borough', label: 'Borough', requirement: 345 },
  { key: 'municipal', label: 'Municipal', requirement: 410 },
  { key: 'city', label: 'City', requirement: 480 },
  { key: 'metropolis', label: 'Metropolis', requirement: 555 },
  { key: 'county', label: 'County', requirement: 635 },
  { key: 'province', label: 'Province', requirement: 720 },
  { key: 'region', label: 'Region', requirement: 810 },
];

// src/systems/tick.ts

export const TICK_INTERVAL_MS = 5000; // 5 seconds

export const OFFLINE_CAP_MS = 1000 * 60 * 60 * 8; // 8 hours

// Tuned for per-need buckets: higher base gain with light passive drain per need
export const BASE_SUPPLY_RATE = 0.9; // unified base supply rate per second

export const NEED_DRAIN = {
  food: 0.05,
  shelter: 0.05,
  care: 0.05,
};

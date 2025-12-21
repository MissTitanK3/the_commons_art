// src/systems/tick.ts

export const TICK_INTERVAL_MS = 5000; // 5 seconds

export const OFFLINE_CAP_MS = 1000 * 60 * 60 * 8; // 8 hours

// Tuned for per-need buckets: no passive drain, gains scale by priority
export const BASE_SUPPLY_RATE = 0.3421875; // unified base supply rate

export const NEED_DRAIN = {
  food: 0,
  shelter: 0,
  care: 0,
};

export const DEV_CONFIG = {
  enabled: process.env.NODE_ENV === 'development',

  // Time compression
  CHECKIN_INTERVAL_MS: 1000 * 30, // 30 seconds
  EVENT_INTERVAL_MS: 1000 * 30, // 30 seconds
  UB_DAY_MS: 1000 * 60 * 12, // 12 minutes for a full UB day

  // Manual triggers
  allowManualEventTrigger: true,
  allowManualCheckIn: true,
};

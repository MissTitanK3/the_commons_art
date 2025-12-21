export const DEV_CONFIG = {
  enabled: process.env.NODE_ENV === 'development',

  // Time compression
  CHECKIN_INTERVAL_MS: 1000 * 30, // 30 seconds
  EVENT_INTERVAL_MS: 1000 * 30, // 30 seconds

  // Manual triggers
  allowManualEventTrigger: true,
  allowManualCheckIn: true,
};

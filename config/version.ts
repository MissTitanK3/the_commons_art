import packageJson from '../package.json';

// Application version used for cache/store invalidation and display.
export const APP_VERSION = (process.env.NEXT_PUBLIC_APP_VERSION ?? packageJson.version ?? 'dev').trim();

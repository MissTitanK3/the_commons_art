'use client';

import { ThemeProvider } from 'next-themes';

import { BottomNavigation } from '@/components/BottomNavigation';
import PWAInstall from '@/components/pwa-install';
import { ThemeController } from '@/components/ThemeController';
import { ThemePrefsProvider } from '@/state/ui';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="commons-major-theme"
      themes={['light', 'dark', 'lofi', 'dim']}
    >
      <ThemePrefsProvider>
        <ThemeController />
        <div className="pb-20 pt-2">
          {children}
        </div>
        <BottomNavigation />
        <PWAInstall />
      </ThemePrefsProvider>
    </ThemeProvider>
  );
}

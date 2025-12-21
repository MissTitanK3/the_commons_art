'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void> | void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>;
};

export default function PWAInstall() {
  const isProd = process.env.NODE_ENV === 'production';
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Avoid registering service workers or prompting installs during local dev; it breaks HMR and clutters the console.
    if (!isProd) {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((reg) => reg.unregister());
        });
      }
      return;
    }

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      // setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      const promptEvent = e as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      setInstallPrompt(promptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setInstallPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration failed: ', err);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isProd]);

  const handleInstall = async () => {
    if (!installPrompt) return;

    const prompt = installPrompt;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowPrompt(false);
    }
    setInstallPrompt(null);
  };

  // Don't render anything if app is installed or prompt shouldn't be shown
  if (!isProd || isInstalled || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground rounded-lg shadow-lg p-4 max-w-sm">
      <div className="flex flex-col items-start gap-3">
        <div className="flex-1">
          <div className='flex w-full justify-between'>
            <h3 className="font-semibold text-sm mb-1">Install App</h3>
            <button
              onClick={() => setShowPrompt(false)}
              className="text-xs opacity-75 hover:opacity-100 ml-2 shrink-0"
            >
              ✕
            </button>
          </div>
          <p className="text-xs opacity-90">Add The Commons Game to your home screen for quick access</p>
        </div>
        <button
          onClick={handleInstall}
          className="mt-3 w-full px-3 py-2 bg-primary-foreground text-primary rounded font-medium text-sm hover:opacity-90 transition-opacity"
        >
          Install
        </button>
      </div>
    </div>
  );
}

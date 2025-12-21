'use client';

import { Heart, Home, BookOpen, Settings, Sliders } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNavigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-surface-alt bg-card text-card-foreground z-30">
      <div className="flex justify-around items-center h-16 px-2">
        <Link href="/" className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-opacity ${isActive('/') ? 'text-tint' : 'text-icon opacity-60'}`} aria-label="Home" aria-current={isActive('/') ? 'page' : undefined}>
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link href="/selfcare" className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-opacity ${isActive('/selfcare') ? 'text-tint' : 'text-icon opacity-60'}`} aria-label="Self-Care" aria-current={isActive('/selfcare') ? 'page' : undefined}>
          <Heart size={24} />
          <span className="text-xs mt-1">Self-Care</span>
        </Link>

        <Link href="/needs" className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-opacity ${isActive('/needs') ? 'text-tint' : 'text-icon opacity-60'}`} aria-label="Needs" aria-current={isActive('/needs') ? 'page' : undefined}>
          <Sliders size={24} />
          <span className="text-xs mt-1">Needs</span>
        </Link>

        <Link href="/log" className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-opacity ${isActive('/log') ? 'text-tint' : 'text-icon opacity-60'}`} aria-label="Log" aria-current={isActive('/log') ? 'page' : undefined}>
          <BookOpen size={24} />
          <span className="text-xs mt-1">Log</span>
        </Link>

        <Link href="/settings" className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-opacity ${isActive('/settings') ? 'text-tint' : 'text-icon opacity-60'}`} aria-label="Settings" aria-current={isActive('/settings') ? 'page' : undefined}>
          <Settings size={24} />
          <span className="text-xs mt-1">Settings</span>
        </Link>
      </div>
    </nav>
  );
}

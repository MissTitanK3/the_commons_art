'use client';

import type { ReactNode } from 'react';

interface SettingSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function SettingSection({ title, description, children }: SettingSectionProps) {
  return (
    <div className="bg-surface rounded-xl p-4 mt-5">
      {title && <h2 className="text-base font-semibold mb-2">{title}</h2>}
      {description && <p className="text-sm text-text opacity-75 mb-4">{description}</p>}
      {children}
    </div>
  );
}

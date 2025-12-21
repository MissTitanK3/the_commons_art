"use client";

import { useTheme } from "next-themes";

import { PresetButton } from "@/components/settings/PresetButton";
import { SettingSection } from "@/components/settings/SettingSection";
import { ToggleButton } from "@/components/settings/ToggleButton";
import { useThemePrefs } from "@/state/ui";
import { CommonsState, useCommonsStore } from "@/state/store";
import { THEME_PRESETS } from "@/config/constants";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { highContrast, setHighContrast, accentPreset, setAccentPreset } = useThemePrefs();
  const devReset = useCommonsStore((s: CommonsState) => s.devReset);

  const isDev = process.env.NODE_ENV === "development";

  const currentTheme = theme ?? "system";

  return (
    <main className="min-h-screen bg-background text-text overflow-x-hidden px-4">
      {/* Header */}
      <section className="pt-8 pb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-sm text-text opacity-70">
          Customize your experience and adjust accessibility options to suit
          your needs.
        </p>
      </section>

      {/* Content */}
      <section className="max-w-sm mx-auto pb-8">
        {/* High Contrast */}
        <SettingSection title="High Contrast">
          <div className="flex items-center justify-between">
            <label id="high-contrast-label" className="text-sm font-semibold">
              Enable High Contrast
            </label>
            <ToggleButton
              value={highContrast}
              onChange={(value) => setHighContrast(!!value)}
              ariaLabelledBy="high-contrast-label"
            />
          </div>
        </SettingSection>

        {/* Theme Selection */}
        <SettingSection
          title="Major Theme"
          description="Controls base appearance"
        >
          <div className="space-y-2">
            <button
              onClick={() => setTheme("system")}
              className={`w-full py-2 px-3 rounded-lg border transition-opacity ${currentTheme === "system"
                ? "bg-tint border-tint text-foreground font-bold shadow-sm ring-1 ring-tint/70"
                : "bg-surface-alt border-border"
                }`}
            >
              {currentTheme === "system" && "✓ "}System
            </button>
            <button
              onClick={() => setTheme("light")}
              className={`w-full py-2 px-3 rounded-lg border transition-opacity ${currentTheme === "light"
                ? "bg-tint border-tint text-foreground font-bold shadow-sm ring-1 ring-tint/70"
                : "bg-surface-alt border-border"
                }`}
            >
              {currentTheme === "light" && "✓ "}Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`w-full py-2 px-3 rounded-lg border transition-opacity ${currentTheme === "dark"
                ? "bg-tint border-tint text-foreground font-bold shadow-sm ring-1 ring-tint/70"
                : "bg-surface-alt border-border"
                }`}
            >
              {currentTheme === "dark" && "✓ "}Dark
            </button>
            <button
              onClick={() => setTheme("lofi")}
              className={`w-full py-2 px-3 rounded-lg border transition-opacity ${currentTheme === "lofi"
                ? "bg-tint border-tint text-foreground font-bold shadow-sm ring-1 ring-tint/70"
                : "bg-surface-alt border-border"
                }`}
            >
              {currentTheme === "lofi" && "✓ "}Lofi
            </button>
            <button
              onClick={() => setTheme("dim")}
              className={`w-full py-2 px-3 rounded-lg border transition-opacity ${currentTheme === "dim"
                ? "bg-tint border-tint text-foreground font-bold shadow-sm ring-1 ring-tint/70"
                : "bg-surface-alt border-border"
                }`}
            >
              {currentTheme === "dim" && "✓ "}Dim
            </button>
          </div>
        </SettingSection>

        {/* Accent Theme */}
        <SettingSection
          title="Accent Theme"
          description="Choose a color palette for the interface"
        >
          {highContrast && (
            <p className="text-sm italic text-text opacity-60 mb-3">
              Accent themes are disabled when High Contrast is active
            </p>
          )}
          <div className="space-y-2">
            {THEME_PRESETS.map((preset) => (
              <PresetButton
                key={preset}
                preset={preset}
                isActive={accentPreset === preset}
                onClick={() => setAccentPreset(preset)}
                disabled={highContrast}
              />
            ))}
          </div>
        </SettingSection>

        {/* About */}
        <SettingSection title="About">
          <p className="text-sm leading-relaxed">
            The Commons is a calm coordination game. It is built to be safe to
            leave and return.
          </p>
        </SettingSection>

        {/* Accessibility */}
        <SettingSection title="Accessibility">
          <ul className="text-sm space-y-2 leading-relaxed">
            <li>• No time pressure</li>
            <li>• Fully playable without sound</li>
            <li>• No color-only indicators</li>
            <li>• Slow, low-stimulation UI</li>
            <li>• Accessibility toggles can be added later</li>
          </ul>
          <p className="text-xs text-text opacity-60 mt-3">
            The baseline experience should already be usable.
          </p>
        </SettingSection>

        {/* Support */}
        <SettingSection title="Support">
          <div className="space-y-3 text-sm leading-relaxed text-text opacity-80">
            <p>The Commons is maintained by a small independent developer.</p>
            <p>
              Any optional support helps sustain long-term work on calm,
              community-centered tools.
            </p>
            <p>The game is complete without payment.</p>
            <p>
              If you would like to offer support outside the game, you can do so
              on Ko-fi.
            </p>
            <p className="text-xs">
              This opens an external page and is optional.
            </p>
          </div>
          <a
            href="https://ko-fi.com/techwitch"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-4 py-2 px-3 rounded-lg bg-surface-alt hover:opacity-90 transition-opacity text-center block text-sm font-semibold"
          >
            Open Ko-fi (external)
          </a>
        </SettingSection>

        {/* Developer Tools */}
        {isDev && (
          <SettingSection title="Developer Tools">
            <p className="text-xs text-text opacity-60 mb-3">
              Dev tools are visible in development only.
            </p>
            <button
              onClick={() => devReset?.()}
              className="w-full py-2 px-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:opacity-90 transition-opacity font-semibold text-sm"
            >
              DEV: Reset App State
            </button>
          </SettingSection>
        )}
      </section>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { ThemePreset, useThemePrefs } from "@/state/ui";

type MajorTheme = "light" | "dark" | "lofi" | "dim";

const MAJOR_THEME_CLASSES: MajorTheme[] = ["dark", "lofi", "dim"];
const ACCENT_THEME_CLASSES: ThemePreset[] = [
  "ocean",
  "forest",
  "sunset",
  "monochrome",
];

function useSystemPrefersDark() {
  const [prefersDark, setPrefersDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return;

    const listener = (event: MediaQueryListEvent) => setPrefersDark(event.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return prefersDark;
}

export function ThemeController() {
  const { theme } = useTheme();
  const { accentPreset, setAccentPreset, highContrast } = useThemePrefs();
  const prefersDark = useSystemPrefersDark();

  // When high contrast is on, lock the accent preset to default.
  useEffect(() => {
    if (highContrast && accentPreset !== "default") {
      setAccentPreset("default");
    }
  }, [highContrast, accentPreset, setAccentPreset]);

  const effectiveMajor: MajorTheme = (() => {
    const explicit = theme as MajorTheme | "system" | undefined;
    if (explicit === "system" || explicit === undefined) {
      return prefersDark ? "dark" : "light";
    }
    return explicit as MajorTheme;
  })();

  const effectiveAccent: ThemePreset = highContrast ? "default" : accentPreset;

  useEffect(() => {
    const root = document.documentElement;
    const shouldForceDarkClass = effectiveMajor === "dim";

    // Clear previous theme classes we control, but keep any unrelated classes (e.g., scroll behaviors).
    root.classList.remove(...MAJOR_THEME_CLASSES, ...ACCENT_THEME_CLASSES, "high-contrast");

    // Apply major theme class (light is the default/no-class case).
    if (effectiveMajor !== "light") {
      root.classList.add(effectiveMajor);
    }

    // Dim should opt into dark-mode styles for contrast-sensitive UI.
    if (shouldForceDarkClass) {
      root.classList.add("dark");
    }

    // Apply accent class when not in high contrast and not default.
    if (!highContrast && effectiveAccent !== "default") {
      root.classList.add(effectiveAccent);
    }

    // High contrast flag applies on top of major theme.
    if (highContrast) {
      root.classList.add("high-contrast");
    }
  }, [effectiveMajor, effectiveAccent, highContrast]);

  // Expose helpers for SettingsPage via data attributes (optional future use).
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.accentPreset = accentPreset;
    root.dataset.highContrast = highContrast ? "true" : "false";
    return () => {
      delete root.dataset.accentPreset;
      delete root.dataset.highContrast;
    };
  }, [accentPreset, highContrast]);

  return null;
}

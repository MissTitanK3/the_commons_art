"use client";

import { Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AboutDrawer } from "@/components/AboutDrawer";
import { CommunityGrid } from "@/components/CommunityGrid";
import { CommunityScaleSummary } from "@/components/CommunityScaleSummary";
import { SuppliesGrid } from "@/components/SuppliesGrid";
import { useCommonsStore, type CommonsState } from "@/state/store";
import { TICK_INTERVAL_MS } from "@/systems/tick";

export default function HomePage() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [catchingUp, setCatchingUp] = useState(false);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const hydrate = useCommonsStore((s: CommonsState) => s.hydrate);
  const persist = useCommonsStore((s: CommonsState) => s.persist);
  const tick = useCommonsStore((s: CommonsState) => s.tick);
  const resumeFromLastActive = useCommonsStore((s: CommonsState) => s.resumeFromLastActive);
  const touch = useCommonsStore((s: CommonsState) => s.touch);
  const maybeTriggerEvent = useCommonsStore((s: CommonsState) => s.maybeTriggerEvent);
  const getCurrentEvent = useCommonsStore((s: CommonsState) => s.getCurrentEvent);
  const currentEventId = useCommonsStore((s: CommonsState) => s.currentEventId);
  const resolveEvent = useCommonsStore((s: CommonsState) => s.resolveEvent);
  const currentEvent = getCurrentEvent();
  const pendingDecisionCount = currentEventId ? 1 : 0;
  const hydratedRef = useRef(false);
  const eventDialogRef = useRef<HTMLDivElement | null>(null);
  const closeEventButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    // Load game state from storage
    hydrate()
      .catch((error: unknown) => {
        console.error("Failed to hydrate game state:", error);
      })
      .finally(() => {
        hydratedRef.current = true;
        setHydrated(true);
      });

    const flushPersist = () => {
      persist().catch((error: unknown) => {
        console.error("Failed to persist game state:", error);
      });
    };

    // Setup auto-persist interval
    const persistInterval = setInterval(flushPersist, 60000); // Every 60 seconds

    // Live tick loop to keep metrics updating without refresh
    let lastTickAt = Date.now();
    const runTick = () => {
      const now = Date.now();
      const elapsedSeconds = Math.max(0, (now - lastTickAt) / 1000);
      lastTickAt = now;
      if (!hydratedRef.current) return;
      tick(elapsedSeconds);
      maybeTriggerEvent();
    };
    runTick();
    const tickInterval = setInterval(runTick, TICK_INTERVAL_MS);

    // Flush when tab is hidden or closing to avoid losing progress
    const handleVisibility = () => {
      if (document.hidden) {
        touch();
        flushPersist();
      } else {
        setCatchingUp(true);
        try {
          resumeFromLastActive();
        } finally {
          setCatchingUp(false);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    const handlePageHide = () => {
      touch();
      flushPersist();
    };
    const handleBeforeUnload = () => {
      touch();
      flushPersist();
    };

    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(persistInterval);
      clearInterval(tickInterval);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hydrate, persist, tick, resumeFromLastActive, touch, maybeTriggerEvent]);

  useEffect(() => {
    if (!eventModalOpen) return;

    const focusableSelector = "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])";

    // Focus the close button when the modal opens.
    closeEventButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!eventModalOpen) return;

      if (event.key === "Escape") {
        event.preventDefault();
        setEventModalOpen(false);
      }

      if (event.key === "Tab" && eventDialogRef.current) {
        const focusable = eventDialogRef.current.querySelectorAll<HTMLElement>(focusableSelector);
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [eventModalOpen]);

  return (
    <main className="relative min-h-screen text-text overflow-x-hidden">
      {(!hydrated || catchingUp) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="px-4 py-3 rounded-lg bg-surface border border-surface-alt text-sm font-semibold">
            {catchingUp ? "Syncing your progress..." : "Loading your community..."}
          </div>
        </div>
      )}

      {/* Info Button */}
      <div className="w-full flex justify-between">
        <button
          onClick={() => setAboutOpen(true)}
          className="p-2 bg-surface-alt rounded-lg hover:bg-surface transition-colors"
          aria-label="Open about information"
        >
          <Info size={30} />
        </button>
      </div>

      {/* Header Section */}
      <section className="pt-8 pb-6 text-center px-4">
        <h1 className="text-3xl font-bold mb-2">The Commons</h1>
        <p className="text-sm text-text opacity-70 max-w-sm mx-auto">
          Build and sustain a thriving community by managing resources and
          meeting collective needs.
        </p>
      </section>

      {/* Main Content */}
      <section className="space-y-6 pb-8">
        {/* Supplies Grid */}
        <SuppliesGrid
          pendingDecisionCount={pendingDecisionCount}
          onEventBellClick={() => setEventModalOpen(true)}
        />

        {/* Community Grid */}
        <CommunityGrid />

        {/* Community Scale Summary */}
        <CommunityScaleSummary />
      </section>

      {/* About Drawer */}
      <AboutDrawer isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />

      {/* Event Decisions Modal */}
      {eventModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div
            ref={eventDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pending-decisions-title"
            className="w-full max-w-sm bg-surface rounded-xl border border-border shadow-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 id="pending-decisions-title" className="text-lg font-semibold">Pending Decisions</h2>
              <button
                ref={closeEventButtonRef}
                onClick={() => setEventModalOpen(false)}
                className="text-sm font-semibold text-text opacity-70 hover:opacity-100"
              >
                Close
              </button>
            </div>

            {currentEventId && currentEvent ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold">{currentEvent.title}</p>
                  <p className="text-sm text-text opacity-80 mt-1">{currentEvent.body}</p>
                </div>
                <div className="space-y-2">
                  {currentEvent.choices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => {
                        resolveEvent(choice.id);
                        setEventModalOpen(false);
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-surface-alt border border-border text-sm font-semibold hover:opacity-90 transition-opacity text-left"
                    >
                      <span className="block text-xs uppercase opacity-70 mb-1">Choice {choice.id}</span>
                      <span className="block">{choice.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-text opacity-70">No decisions waiting right now.</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

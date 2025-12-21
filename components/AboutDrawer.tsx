"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";


type AboutDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AboutDrawer({ isOpen, onClose }: AboutDrawerProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Focus the close button for keyboard users when the drawer opens.
      closeButtonRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
        );
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
  }, [isOpen, onClose]);

  return (
    <div className={`${isOpen ? "fixed inset-0 z-50 flex items-center justify-center bg-black/50" : "hidden"}`}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        className="sm:max-w-sm border border-surface-alt shadow-2xl bg-background rounded-lg w-[90vw] max-w-md"
      >
        <div className="flex-row items-center justify-between gap-2 border-b border-surface-alt pb-3 w-full flex px-4 pt-4">
          <div>
            <div id="about-title">About The Commons</div>
            <div>The game and how it works</div>
          </div>
          <button
            ref={closeButtonRef}
            aria-label="Close about drawer"
            className="p-2 rounded-lg hover:bg-surface-alt transition-colors"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <section>
            <h3 className="font-semibold mb-2">The Game</h3>
            <p className="text-sm text-text opacity-80">
              The Commons is a calm coordination game about building and
              sustaining community resilience. Work together to meet collective
              needs while managing shared resources.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Getting Started</h3>
            <p className="text-sm text-text opacity-80">
              Manage three types of supplies: Food, Shelter, and Care. Balance
              community needs, help individual members, and grow your community
              while staying sustainable.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Key Principles</h3>
            <ul className="text-sm text-text opacity-80 space-y-1">
              <li>• No time pressure - play at your own pace</li>
              <li>• Safe to leave and return</li>
              <li>• Community-centered decisions</li>
              <li>• Low-stimulation design</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold mb-2">Resources</h3>
            <p className="text-sm text-text opacity-80">
              Made with care by a small independent team dedicated to creating
              calm, community-centered tools.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

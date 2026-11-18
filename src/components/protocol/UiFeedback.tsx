"use client";
import { useEffect, useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { playClick, setSoundEnabled, soundEnabled, subscribeSound } from "@/lib/ui/click-sound";

const INTERACTIVE = "button, a[href], summary, [role='button'], [role='tab'], [role='switch'], input[type='checkbox'], input[type='radio'], select";

/** One delegated listener for the whole app: every enabled control clicks, with no per-button wiring. */
export function UiClickSounds() {
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (event.button !== 0) return;
      const el = (event.target as Element | null)?.closest?.(INTERACTIVE) as HTMLElement | null;
      if (!el || el.closest("[data-silent]")) return;
      if ((el as HTMLButtonElement).disabled || el.getAttribute("aria-disabled") === "true") return;
      const variant = el.dataset.sound === "confirm" || el.matches("[type='submit']") ? "confirm"
        : el.matches("[role='tab'], [role='switch'], input, select, summary") ? "soft" : "tap";
      playClick(variant);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Enter" && event.key !== " ") return;
      const el = (event.target as Element | null)?.closest?.("button, a[href], [role='button']") as HTMLElement | null;
      if (el && !el.closest("[data-silent]") && !(el as HTMLButtonElement).disabled) playClick("tap");
    }
    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("pointerdown", onPointerDown); document.removeEventListener("keydown", onKeyDown); };
  }, []);
  return null;
}

export function SoundToggle({ className = "" }: { className?: string }) {
  const on = useSyncExternalStore(subscribeSound, soundEnabled, () => true);
  return <button type="button" role="switch" aria-checked={on} aria-label={on ? "Turn interface sounds off" : "Turn interface sounds on"}
    onClick={() => { setSoundEnabled(!on); if (!on) playClick("soft"); }}
    className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${className}`}>
    {on ? <Volume2 size={14} /> : <VolumeX size={14} />}<span>Sounds {on ? "on" : "off"}</span>
  </button>;
}

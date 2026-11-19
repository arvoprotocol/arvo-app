"use client";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Info } from "lucide-react";

const WIDTH = 270, GAP = 8, EDGE = 12;

/**
 * Small "i" button that opens a short explanation. Opens on tap/click (and on hover with a mouse),
 * closes on outside tap, Escape, or when its icon leaves the screen. The popup is drawn at the top of the page (a portal),
 * so cards, carousels and anything else with clipped edges can never cut it off.
 */
export function InfoTip({ label, children, dark = false, ink = false, align = "left", size = 13 }: { label: string; children: ReactNode; dark?: boolean; ink?: boolean; align?: "left" | "right" | "center"; size?: number }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; above: boolean } | null>(null);
  const id = useId(), button = useRef<HTMLButtonElement>(null), tip = useRef<HTMLSpanElement>(null), hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const place = useCallback(() => {
    const b = button.current?.getBoundingClientRect();
    if (!b) return;
    const width = Math.min(WIDTH, window.innerWidth - EDGE * 2);
    const preferred = align === "right" ? b.right - width : align === "center" ? b.left + b.width / 2 - width / 2 : b.left - 8;
    const left = Math.max(EDGE, Math.min(preferred, window.innerWidth - width - EDGE));
    const height = tip.current?.offsetHeight ?? 120;
    const above = b.bottom + GAP + height > window.innerHeight - EDGE && b.top - GAP - height > EDGE;
    setPos({ top: above ? b.top - GAP - height : b.bottom + GAP, left, above });
  }, [align]);

  // Position before paint, then again once the popup's real height is known.
  useLayoutEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    place();
    const raf = requestAnimationFrame(place);
    return () => cancelAnimationFrame(raf);
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => { const t = e.target as Node; if (!button.current?.contains(t) && !tip.current?.contains(t)) setOpen(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    // Follow the icon while the page or a carousel moves; close only once the icon is off screen.
    let frame = 0;
    const follow = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => {
      const b = button.current?.getBoundingClientRect();
      if (!b || b.bottom < 0 || b.top > window.innerHeight || b.right < 0 || b.left > window.innerWidth) setOpen(false); else place();
    }); };
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape);
    window.addEventListener("scroll", follow, true); window.addEventListener("resize", follow);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); window.removeEventListener("scroll", follow, true); window.removeEventListener("resize", follow); };
  }, [open, place]);

  const hover = (next: boolean) => (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(next), next ? 120 : 180);
  };

  return <span className="inline-flex align-middle">
    <button ref={button} type="button" data-sound="soft" aria-label={label} aria-expanded={open} aria-describedby={open ? id : undefined}
      onClick={() => setOpen(v => !v)} onPointerEnter={hover(true)} onPointerLeave={hover(false)}
      className={`inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${ink ? "text-[#07090b] hover:bg-black/10 focus-visible:outline-[#07090b]" : dark ? "text-white/40 hover:bg-white/10 hover:text-white/85 focus-visible:outline-[#e2a98e]" : "text-black/35 hover:bg-black/[0.06] hover:text-black/75 focus-visible:outline-[#ad7058]"}`}>
      <Info size={size} strokeWidth={2} />
    </button>
    {open && typeof document !== "undefined" && createPortal(
      <span ref={tip} id={id} role="tooltip" onPointerEnter={hover(true)} onPointerLeave={hover(false)}
        style={{ position: "fixed", top: pos?.top ?? -9999, left: pos?.left ?? -9999, width: Math.min(WIDTH, (typeof window !== "undefined" ? window.innerWidth : WIDTH + EDGE * 2) - EDGE * 2), visibility: pos ? "visible" : "hidden" }}
        className={`arvo-tip z-[200] block rounded-2xl border p-3.5 text-left text-[12px] font-normal normal-case leading-5 tracking-normal shadow-[0_18px_40px_rgba(7,9,11,.28)] ${dark ? "border-white/12 bg-[#15181c] text-white/80" : "border-black/[0.08] bg-white text-black/70"}`}>
        {children}
      </span>, document.body)}
  </span>;
}

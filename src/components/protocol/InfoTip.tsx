"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Info } from "lucide-react";

/**
 * Small "i" button that opens a short explanation. Opens on tap/click (and on hover with a mouse),
 * closes on outside tap, Escape or blur. Content is announced to screen readers via aria-describedby.
 */
export function InfoTip({ label, children, dark = false, align = "left", size = 13 }: { label: string; children: ReactNode; dark?: boolean; align?: "left" | "right" | "center"; size?: number }) {
  const [open, setOpen] = useState(false);
  const id = useId(), wrap = useRef<HTMLSpanElement>(null), hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false); };
    const escape = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", outside); document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [open]);
  const hover = (next: boolean) => (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(next), next ? 120 : 180);
  };
  const position = align === "right" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0";
  return <span ref={wrap} className="relative inline-flex align-middle" onPointerEnter={hover(true)} onPointerLeave={hover(false)}>
    <button type="button" data-sound="soft" aria-label={label} aria-expanded={open} aria-describedby={open ? id : undefined} onClick={() => setOpen(v => !v)}
      className={`inline-flex h-5 w-5 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${dark ? "text-white/40 hover:bg-white/10 hover:text-white/85 focus-visible:outline-[#e2a98e]" : "text-black/35 hover:bg-black/[0.06] hover:text-black/75 focus-visible:outline-[#ad7058]"}`}>
      <Info size={size} strokeWidth={2} />
    </button>
    {open && <span id={id} role="tooltip" className={`arvo-tip absolute top-full z-40 mt-2 w-[min(270px,calc(100vw-48px))] rounded-2xl border p-3.5 text-left text-[12px] font-normal normal-case leading-5 tracking-normal shadow-[0_18px_40px_rgba(7,9,11,.22)] ${position} ${dark ? "border-white/12 bg-[#15181c] text-white/80" : "border-black/[0.08] bg-white text-black/70"}`}>
      {children}
    </span>}
  </span>;
}

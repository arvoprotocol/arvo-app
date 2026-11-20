"use client";
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { appPath } from "@/lib/protocol/app-url";

// Dismissible strip under the app header about moving from First Edition to Genesis Pilot.
// Remembered per browser; stops showing once the planned Genesis window has passed.
const KEY = "arvo-genesis-notice-dismissed";
const EVENT = "arvo-genesis-notice";
const SHOW_UNTIL = Date.parse("2027-02-02T12:00:00Z");

function dismissed() { try { return localStorage.getItem(KEY) === "1"; } catch { return false; } }
function subscribe(cb: () => void) { window.addEventListener(EVENT, cb); window.addEventListener("storage", cb); return () => { window.removeEventListener(EVENT, cb); window.removeEventListener("storage", cb); }; }

export function GenesisNotice() {
  const hidden = useSyncExternalStore(subscribe, () => dismissed() || Date.now() > SHOW_UNTIL, () => true);
  if (hidden) return null;
  const close = () => { try { localStorage.setItem(KEY, "1"); } catch {} window.dispatchEvent(new Event(EVENT)); };
  return <div className="border-b border-[#c9846a]/20 bg-[linear-gradient(90deg,#f3e2d6_0%,#f8ede6_55%,#efe4f6_100%)]">
    <div className="flex items-start gap-3 px-4 py-3 md:items-center md:px-7 lg:px-9 xl:px-11">
      <p className="min-w-0 flex-1 text-[13px] leading-5 text-[#3a2a22]">
        <span className="font-semibold text-[#07090b]">First Edition participants can move straight into Genesis Pilot.</span>{" "}
        It’s planned to open as First Edition stakes unlock and is sized so every First Edition stake can move across.{" "}
        <Link href={appPath("/app/stake")} className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-[#ad7058] hover:text-[#07090b]">View vaults <ArrowRight size={13} /></Link>
      </p>
      <button type="button" onClick={close} aria-label="Dismiss notice" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-black/45 transition hover:bg-black/[0.06] hover:text-black"><X size={15} /></button>
    </div>
  </div>;
}

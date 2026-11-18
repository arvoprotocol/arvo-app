"use client";
import { useSyncExternalStore } from "react";
import type { MarketPrice } from "@/lib/protocol/price";
import { appPath } from "@/lib/protocol/app-url";

// One shared poller for the whole app: every component reads the same ARVO price.
let price: MarketPrice | null = null, timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();
async function refresh() {
  try {
    const r = await fetch(appPath("/app/market-price"), { cache: "no-store" });
    const next = await r.json();
    if (!r.ok || typeof next.priceUsd !== "string" || !(Number(next.priceUsd) > 0)) throw new Error("Unavailable");
    price = next;
  } catch { /* keep the last good price */ }
  listeners.forEach(l => l());
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) { void refresh(); timer = setInterval(() => { if (document.visibilityState !== "hidden") void refresh(); }, 60_000); }
  return () => { listeners.delete(listener); if (!listeners.size && timer) { clearInterval(timer); timer = null; } };
}
export function useArvoPrice(): MarketPrice | null { return useSyncExternalStore(subscribe, () => price, () => null); }

/** "$448" / "$1.2k" / "$29.9k" — rough USD value of an ARVO amount, for orientation only. */
export function usdApprox(arvo: number, p: MarketPrice | null): string | null {
  if (!p || !Number.isFinite(arvo) || arvo <= 0) return null;
  const v = arvo * Number(p.priceUsd);
  if (!Number.isFinite(v) || v <= 0) return null;
  return v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(2)}m` : v >= 10_000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toLocaleString("en-US", { maximumFractionDigits: v < 10 ? 2 : 0 })}`;
}
export function formatArvoPrice(p: MarketPrice | null): string {
  if (!p) return "—";
  const n = Number(p.priceUsd);
  return `$${n < 0.01 ? n.toPrecision(4).replace(/0+$/, "") : n.toFixed(4)}`;
}

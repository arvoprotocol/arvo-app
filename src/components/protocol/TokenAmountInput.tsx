"use client";
import { useState } from "react";
import { formatAmount, ungroupAmount } from "@/lib/staking/presentation";
export function TokenAmountInput({ value, onChange, label, disabled = false }: { value: string; onChange: (value: string) => void; label: string; disabled?: boolean }) {
  const [focused, setFocused] = useState(false);
  return <input aria-label={label} type="text" inputMode="decimal" autoComplete="off" disabled={disabled} value={focused ? value : formatAmount(value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onChange={event => onChange(ungroupAmount(event.target.value.trim()))} className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-lg font-semibold tabular-nums outline-none focus:border-[#ad7058]/60 disabled:opacity-50" />;
}

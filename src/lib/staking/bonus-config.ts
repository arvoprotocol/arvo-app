import { isAddress, zeroAddress, type Address } from "viem";

/**
 * Deployed bonus contracts (one per vault), comma-separated in
 * NEXT_PUBLIC_BONUS_ADDRESSES. NEXT_PUBLIC_FIRST_EDITION_BONUS_ADDRESS is also read.
 */
export function bonusAddresses(): Address[] {
  const raw = [process.env.NEXT_PUBLIC_BONUS_ADDRESSES, process.env.NEXT_PUBLIC_FIRST_EDITION_BONUS_ADDRESS].filter(Boolean).join(",");
  const out = new Set<string>();
  for (const part of raw.split(",")) {
    const value = part.trim();
    if (value && isAddress(value) && value.toLowerCase() !== zeroAddress) out.add(value.toLowerCase());
  }
  return [...out] as Address[];
}

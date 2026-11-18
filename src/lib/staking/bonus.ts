import { isAddress, zeroAddress, type Abi, type Address } from "viem";
import bonusArtifact from "./ArvoFirstEditionBonus.abi.json";
import { stakingAbi, stakingConnection } from "./pool-transactions";

export const bonusAbi = bonusArtifact as Abi;

/** Address of the deployed ArvoFirstEditionBonus, or null when not configured. */
export function bonusAddress(): Address | null {
  const value = process.env.NEXT_PUBLIC_FIRST_EDITION_BONUS_ADDRESS;
  if (!value || !isAddress(value) || value.toLowerCase() === zeroAddress) return null;
  return value as Address;
}

export type BonusState = {
  address: Address;
  poolId: number;
  pot: bigint;
  closesAt: bigint;
  claimDeadline: bigint;
  snapshotTaken: boolean;
  /** Final eligible ARVO after the snapshot, otherwise current pool principal. */
  eligible: bigint;
  /** Maximum ARVO principal for the pool (0 = uncapped). */
  maxPrincipal: bigint;
  /** ARVO held by the bonus contract (pot funding check). */
  balance: bigint;
};

const BPS = 10_000n;

/** Reads the bonus for a staking pool. Returns null when no bonus applies. */
export async function readBonus(poolId: number): Promise<BonusState | null> {
  const address = bonusAddress();
  const c = stakingConnection();
  if (!address || !c) return null;
  const read = (functionName: string, args: readonly unknown[] = []) =>
    c.publicClient.readContract({ address, abi: bonusAbi, functionName, args });
  const [bonusPool, stakingAddress] = await Promise.all([read("poolId"), read("staking")]);
  if (Number(bonusPool) !== poolId) return null;
  // Only trust a bonus contract bound to the configured staking proxy.
  if ((stakingAddress as string).toLowerCase() !== c.address.toLowerCase()) return null;
  const [pot, closesAt, claimDeadline, snapshotTaken, totalEligible, arvo] = await Promise.all([
    read("bonusPot"), read("closesAt"), read("claimDeadline"), read("snapshotTaken"), read("totalEligible"), read("arvo"),
  ]);
  const [principal, pool, balance] = await Promise.all([
    c.publicClient.readContract({ address: c.address, abi: stakingAbi, functionName: "vaultArvoPrincipal", args: [poolId] }),
    c.publicClient.readContract({ address: c.address, abi: stakingAbi, functionName: "pool", args: [poolId] }),
    c.publicClient.readContract({
      address: arvo as Address,
      abi: [{ type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "a", type: "address" }], outputs: [{ type: "uint256" }] }],
      functionName: "balanceOf", args: [address],
    }),
  ]);
  return {
    address,
    poolId,
    pot: pot as bigint,
    closesAt: BigInt(closesAt as bigint | number),
    claimDeadline: BigInt(claimDeadline as bigint | number),
    snapshotTaken: snapshotTaken as boolean,
    eligible: (snapshotTaken ? totalEligible : principal) as bigint,
    maxPrincipal: (pool as { maxArvoPrincipal: bigint }).maxArvoPrincipal,
    balance: balance as bigint,
  };
}

/** Bonus in ARVO for `amount`, assuming it is added to the current total. */
export function estimateBonus(state: BonusState, amount: bigint, alreadyIncluded = false): bigint {
  const total = alreadyIncluded ? state.eligible : state.eligible + amount;
  if (total === 0n || amount === 0n) return 0n;
  return (state.pot * amount) / total;
}

/** Bonus as basis points of principal at a given eligible total. */
export function bonusBps(state: BonusState, total: bigint): bigint | null {
  if (total === 0n) return null;
  return (state.pot * BPS) / total;
}

export function bpsLabel(bps: bigint | null): string {
  if (bps === null) return "—";
  const whole = Number(bps) / 100;
  return `${whole >= 100 ? whole.toFixed(0) : whole.toFixed(2).replace(/\.?0+$/, "")}%`;
}

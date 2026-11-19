import { type Abi, type Address } from "viem";
import { bonusAddresses } from "./bonus-config";
import bonusArtifact from "./ArvoSharedBonus.abi.json";
import { stakingAbi, stakingConnection } from "./pool-transactions";

export { bonusAddresses };

export const bonusAbi = bonusArtifact as Abi;

const poolCache = new Map<string, Promise<number | null>>();
/** Bonus contract bound to `poolId` and to the configured staking proxy, if any. */
async function bonusAddressFor(poolId: number): Promise<Address | null> {
  const c = stakingConnection();
  if (!c) return null;
  for (const address of bonusAddresses()) {
    const key = `${c.chain.id}:${address}`;
    if (!poolCache.has(key)) {
      poolCache.set(key, (async () => {
        const [pool, staking] = await Promise.all([
          c.publicClient.readContract({ address, abi: bonusAbi, functionName: "poolId" }),
          c.publicClient.readContract({ address, abi: bonusAbi, functionName: "staking" }),
        ]);
        // Only trust a bonus contract bound to the configured staking proxy.
        return (staking as string).toLowerCase() === c.address.toLowerCase() ? Number(pool) : null;
      })().catch(() => { poolCache.delete(key); return null; }));
    }
    if (await poolCache.get(key) === poolId) return address;
  }
  return null;
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
  earliestMaturity: bigint;
  totalClaimed: bigint;
  /** ARVO still reserved for claims; anything above it can go to treasury. */
  outstanding: bigint;
  treasury: Address;
};

const BPS = 10_000n;

/** Reads the bonus for a staking pool. Returns null when no bonus applies. */
export async function readBonus(poolId: number): Promise<BonusState | null> {
  const c = stakingConnection();
  const address = await bonusAddressFor(poolId);
  if (!address || !c) return null;
  const read = (functionName: string, args: readonly unknown[] = []) =>
    c.publicClient.readContract({ address, abi: bonusAbi, functionName, args });
  const [pot, closesAt, claimDeadline, snapshotTaken, totalEligible, arvo, earliestMaturity, totalClaimed, outstanding, treasury] = await Promise.all([
    read("bonusPot"), read("closesAt"), read("claimDeadline"), read("snapshotTaken"), read("totalEligible"), read("arvo"),
    read("earliestMaturity"), read("totalClaimed"), read("outstanding"), read("treasury"),
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
    earliestMaturity: BigInt(earliestMaturity as bigint | number),
    totalClaimed: totalClaimed as bigint,
    outstanding: outstanding as bigint,
    treasury: treasury as Address,
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
  if (bps === null) return "–";
  const whole = Number(bps) / 100;
  return `${whole >= 100 ? whole.toFixed(0) : whole.toFixed(2).replace(/\.?0+$/, "")}%`;
}

/** Every configured bonus that is bound to the configured staking proxy. */
export async function listBonuses(): Promise<BonusState[]> {
  const c = stakingConnection();
  if (!c) return [];
  const pools = await Promise.all(bonusAddresses().map(address =>
    c.publicClient.readContract({ address, abi: bonusAbi, functionName: "poolId" }).then(Number).catch(() => null)));
  const states = await Promise.all([...new Set(pools.filter((p): p is number => p !== null))].map(readBonus));
  return states.filter((s): s is BonusState => s !== null);
}

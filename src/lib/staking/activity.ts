import "server-only";
import { createPublicClient, http, isAddress, parseAbiItem, type Address, type PublicClient } from "viem";
import stakingArtifact from "@/lib/staking/ArvoStaking.abi.json";

// Indexes a vault's Staked / EmergencyExited events from chain (no database).
// Logs are read in chunks (the Robinhood RPC rejects unbounded ranges) from
// the first block at or after the vault's opening time, then incrementally.

const stakingAbi = ((stakingArtifact as { abi?: unknown }).abi ?? stakingArtifact) as readonly unknown[];
const STAKED = parseAbiItem("event Staked(uint256 indexed positionId, address indexed user, uint32 indexed vaultId, uint8 stakeMode, uint8 rewardMode, uint256 arvoPrincipal, uint256 usdcPrincipal, uint256 arvoReward, uint256 usdcReward, uint256 maturesAt)");
const EXITED = parseAbiItem("event EmergencyExited(uint256 indexed positionId, address indexed user, uint256 arvoPrincipal, uint256 usdcPrincipal, uint256 arvoRewardForfeited, uint256 usdcRewardForfeited, uint64 settledAt)");
const CHUNK = BigInt(Math.max(100, Number(process.env.STAKING_LOG_CHUNK) || 50_000));

export type Deposit = { positionId: bigint; user: Address; arvo: bigint; usdc: bigint; block: bigint; maturesAt: bigint };
type State = { startBlock: bigint; scannedTo: bigint; deposits: Deposit[]; exited: Set<string>; at: number };

const states = new Map<number, State>();
const inflight = new Map<number, Promise<State>>();
const blockTimes = new Map<bigint, number>();

function client(): { c: PublicClient; proxy: Address } | null {
  const rpc = process.env.NEXT_PUBLIC_STAKING_RPC_URL, proxy = process.env.NEXT_PUBLIC_STAKING_PROXY_ADDRESS;
  if (!rpc || !proxy || !isAddress(proxy)) return null;
  return { c: createPublicClient({ transport: http(rpc, { timeout: 15_000 }) }) as PublicClient, proxy: proxy as Address };
}

async function blockTime(c: PublicClient, n: bigint) {
  const hit = blockTimes.get(n);
  if (hit !== undefined) return hit;
  const t = Number((await c.getBlock({ blockNumber: n })).timestamp);
  blockTimes.set(n, t);
  return t;
}

/** First block whose timestamp is >= `ts` (binary search). */
async function firstBlockAtOrAfter(c: PublicClient, ts: bigint, latest: bigint) {
  let lo = 0n, hi = latest;
  if (BigInt(await blockTime(c, hi)) < ts) return hi;
  while (lo < hi) {
    const mid = (lo + hi) / 2n;
    if (BigInt(await blockTime(c, mid)) < ts) lo = mid + 1n; else hi = mid;
  }
  return lo;
}

async function refresh(poolId: number): Promise<State> {
  const cx = client();
  if (!cx) throw new Error("Staking is not configured.");
  const { c, proxy } = cx;
  const latest = await c.getBlockNumber();
  let state = states.get(poolId);
  if (!state) {
    const pool = await c.readContract({ address: proxy, abi: stakingAbi as never, functionName: "pool" as never, args: [poolId] as never }) as { opensAt: bigint };
    const start = await firstBlockAtOrAfter(c, BigInt(pool.opensAt), latest);
    state = { startBlock: start, scannedTo: start - 1n, deposits: [], exited: new Set(), at: 0 };
  }
  for (let from = state.scannedTo + 1n; from <= latest; from += CHUNK) {
    const to = from + CHUNK - 1n > latest ? latest : from + CHUNK - 1n;
    const [staked, exits] = await Promise.all([
      c.getLogs({ address: proxy, event: STAKED, args: { vaultId: poolId }, fromBlock: from, toBlock: to }),
      c.getLogs({ address: proxy, event: EXITED, fromBlock: from, toBlock: to }),
    ]);
    for (const log of staked) {
      const a = log.args;
      if (a.positionId === undefined || !a.user) continue;
      state.deposits.push({ positionId: a.positionId, user: a.user, arvo: a.arvoPrincipal ?? 0n, usdc: a.usdcPrincipal ?? 0n, block: log.blockNumber ?? to, maturesAt: a.maturesAt ?? 0n });
    }
    for (const log of exits) if (log.args.positionId !== undefined) state.exited.add(log.args.positionId.toString());
    state.scannedTo = to;
  }
  state.at = Date.now();
  states.set(poolId, state);
  return state;
}

/** Cached for 30 seconds; concurrent callers share one scan. */
export async function vaultState(poolId: number) {
  const cached = states.get(poolId);
  if (cached && Date.now() - cached.at < 30_000) return cached;
  if (!inflight.has(poolId)) inflight.set(poolId, refresh(poolId).finally(() => inflight.delete(poolId)));
  return inflight.get(poolId)!;
}

export async function vaultActivity(poolId: number, recentCount = 5) {
  const state = await vaultState(poolId);
  const cx = client();
  const live = state.deposits.filter(d => !state.exited.has(d.positionId.toString()));
  const recent = await Promise.all(state.deposits.slice(-recentCount).reverse().map(async d => ({
    user: d.user, arvo: d.arvo, usdc: d.usdc, at: cx ? await blockTime(cx.c, d.block).catch(() => null) : null,
  })));
  return { stakers: new Set(live.map(d => d.user.toLowerCase())).size, deposits: state.deposits.length, recent };
}

/** Wallets with at least one deposit in the pool that was not emergency-exited. */
export async function foundingStakers(poolId: number) {
  const state = await vaultState(poolId);
  const map = new Map<string, { address: Address; arvo: bigint; positions: number; firstBlock: bigint }>();
  for (const d of state.deposits) {
    if (state.exited.has(d.positionId.toString())) continue;
    const key = d.user.toLowerCase();
    const row = map.get(key) ?? { address: d.user, arvo: 0n, positions: 0, firstBlock: d.block };
    row.arvo += d.arvo; row.positions += 1;
    map.set(key, row);
  }
  return [...map.values()].sort((a, b) => (a.firstBlock < b.firstBlock ? -1 : 1));
}

export function foundingPoolId() {
  const value = Number(process.env.NEXT_PUBLIC_FOUNDING_POOL_ID);
  return Number.isSafeInteger(value) && value >= 0 && process.env.NEXT_PUBLIC_FOUNDING_POOL_ID?.trim() ? value : null;
}

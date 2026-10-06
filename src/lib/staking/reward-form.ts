import { isAddress, zeroAddress, type Address } from "viem";
import { tokenAmount } from "./pool-form";
export type Asset = "ARVO" | "USDC";
export type RewardAction =
  | { kind: "fund"; asset: Asset; amount: bigint }
  | { kind: "reserve"; poolId: number; arvoAmount: bigint; usdcAmount: bigint }
  | { kind: "withdraw"; asset: Asset; amount: bigint; recipient: Address };
export function prepareFunding(asset: Asset, raw: string): RewardAction {
  const amount = tokenAmount(raw, asset === "ARVO" ? 18 : 6, `${asset} funding`);
  if (amount === BigInt(0)) throw new Error("Funding amount must be greater than zero.");
  return { kind: "fund", asset, amount };
}
export function prepareReservation(id: string, arvo: string, usdc: string): RewardAction {
  if (!/^\d+$/.test(id.trim())) throw new Error("Pool ID must be a whole number, including 0 for the first pool.");
  const poolId = Number(id);
  if (!Number.isSafeInteger(poolId) || poolId < 0 || poolId > 4294967295) throw new Error("Pool ID is outside the contract's valid range.");
  const arvoAmount = tokenAmount(arvo, 18, "ARVO reservation");
  const usdcAmount = tokenAmount(usdc, 6, "USDC reservation");
  if (arvoAmount === BigInt(0) && usdcAmount === BigInt(0)) throw new Error("Reserve a positive amount of at least one asset.");
  return { kind: "reserve", poolId, arvoAmount, usdcAmount };
}
export function prepareWithdrawal(asset: Asset, raw: string, recipient: string): RewardAction {
  const amount = tokenAmount(raw, asset === "ARVO" ? 18 : 6, `${asset} withdrawal`);
  if (amount === BigInt(0)) throw new Error("Withdrawal amount must be greater than zero.");
  const address = recipient.trim();
  if (!isAddress(address) || address.toLowerCase() === zeroAddress) throw new Error("Enter a valid, non-zero recipient address.");
  return { kind: "withdraw", asset, amount, recipient: address };
}
export function rewardContractCall(action: RewardAction) {
  if (action.kind === "reserve") return { functionName: "reservePoolRewardBudget", args: [action.poolId, action.arvoAmount, action.usdcAmount] as readonly unknown[] };
  const suffix = action.asset === "ARVO" ? "Arvo" : "Usdc";
  return action.kind === "fund" ? { functionName: `fund${suffix}Rewards`, args: [action.amount] as readonly unknown[] } : { functionName: `withdraw${suffix}Surplus`, args: [action.recipient, action.amount] as readonly unknown[] };
}

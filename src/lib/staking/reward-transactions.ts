import {getWalletProvider} from "@/lib/wallet/client";
import { createWalletClient, custom, erc20Abi, formatUnits, isAddress, zeroAddress, type Address, type EIP1193Provider, type Hash } from "viem";
import { stakingAbi, stakingConnection } from "./pool-transactions";
import { rewardContractCall, type Asset, type RewardAction } from "./reward-form";
export type AssetAccounting = { token: Address; decimals: number; balance: bigint; principal: bigint; committed: bigint; reserved: bigint; available: bigint; solvent: boolean; walletBalance: bigint | null };
export type RewardAccounting = { ARVO: AssetAccounting; USDC: AssetAccounting };
export type RewardReview = { action: RewardAction; account: Address; chainId: number; proxy: Address; token: Address | null; allowance: bigint; approval: "reset" | "approve" | "none"; summary: [string, string][] };
function connection() {
  const config = stakingConnection();
  if (!config) throw new Error("Configure the testnet chain, RPC and staking proxy before using reward operations.");
  return config;
}
async function validatedConnection() {
  const config = connection();
  if (await config.publicClient.getChainId() !== config.chain.id) throw new Error("Configured RPC does not match the staking chain ID.");
  const code = await config.publicClient.getCode({ address: config.address });
  if (!code || code === "0x") throw new Error("No contract found at the configured staking proxy.");
  return config;
}
export async function rewardWallet(expected?: Address) {
  const config = await validatedConnection();
  const provider = getWalletProvider();
  if (!provider) throw new Error("Open this page with your admin wallet available.");
  const accounts = await provider.request({ method: expected ? "eth_accounts" : "eth_requestAccounts" }) as string[];
  if (!accounts[0] || !isAddress(accounts[0])) throw new Error("No wallet account was selected.");
  const account = accounts[0] as Address;
  if (expected && account.toLowerCase() !== expected.toLowerCase()) throw new Error("Wallet account changed. Review the operation again.");
  const chainId = await provider.request({ method: "eth_chainId" }) as string;
  if (Number(BigInt(chainId)) !== config.chain.id) throw new Error(`Switch your wallet to chain ${config.chain.id}, then retry.`);
  const role = await config.publicClient.readContract({ address: config.address, abi: stakingAbi, functionName: "REWARD_MANAGER_ROLE" });
  const allowed = await config.publicClient.readContract({ address: config.address, abi: stakingAbi, functionName: "hasRole", args: [role, account] });
  if (allowed !== true) throw new Error("This wallet does not hold the contract's reward manager role. Website admin access alone does not grant this permission.");
  return { ...config, account, provider, walletClient: createWalletClient({ account, chain: config.chain, transport: custom(provider as EIP1193Provider) }) };
}
export async function readRewardAccounting(account?: Address): Promise<RewardAccounting> {
  const { publicClient, address } = await validatedConnection();
  const block = await publicClient.getBlock();
  async function assetAccounting(asset: Asset): Promise<AssetAccounting> {
    const prefix = asset === "ARVO" ? "arvo" : "usdc";
    const title = asset === "ARVO" ? "Arvo" : "Usdc";
    const token = await publicClient.readContract({ address, abi: stakingAbi, functionName: prefix, blockNumber: block.number }) as Address;
    if (!isAddress(token) || token.toLowerCase() === zeroAddress) throw new Error(`Invalid ${asset} token returned by staking contract.`);
    const decimals = await publicClient.readContract({ address: token, abi: erc20Abi, functionName: "decimals", blockNumber: block.number });
    if (decimals !== (asset === "ARVO" ? 18 : 6)) throw new Error(`${asset} decimals differ from the staking configuration.`);
    const stakingRead = (functionName: string) => publicClient.readContract({ address, abi: stakingAbi, functionName, blockNumber: block.number });
    const [balance, principal, committed, reserved, available, solvent, walletBalance] = await Promise.all([
      publicClient.readContract({ address: token, abi: erc20Abi, functionName: "balanceOf", args: [address], blockNumber: block.number }),
      stakingRead(`${prefix}PrincipalLiability`), stakingRead(`${prefix}RewardLiability`), stakingRead(`${prefix}RewardBudgetReserved`),
      stakingRead(`available${title}RewardCapacity`), stakingRead(`is${title}Solvent`),
      account ? publicClient.readContract({ address: token, abi: erc20Abi, functionName: "balanceOf", args: [account], blockNumber: block.number }) : Promise.resolve(null),
    ]);
    return { token, decimals, balance, principal: principal as bigint, committed: committed as bigint, reserved: reserved as bigint, available: available as bigint, solvent: solvent === true, walletBalance };
  }
  const [ARVO, USDC] = await Promise.all([assetAccounting("ARVO"), assetAccounting("USDC")]);
  if (ARVO.token.toLowerCase() === USDC.token.toLowerCase()) throw new Error("Staking contract returned identical token addresses.");
  return { ARVO, USDC };
}
export async function reviewRewardAction(action: RewardAction, expected?: Address): Promise<RewardReview> {
  const context = await rewardWallet(expected);
  const accounting = await readRewardAccounting(context.account);
  let token: Address | null = null;
  let allowance = BigInt(0);
  let approval: RewardReview["approval"] = "none";
  const summary: [string, string][] = [["Chain", String(context.chain.id)], ["Staking proxy", context.address], ["Reward manager", context.account]];
  if (action.kind === "fund") {
    const asset = accounting[action.asset]; token = asset.token;
    if (asset.walletBalance === null || action.amount > asset.walletBalance) throw new Error(`Insufficient ${action.asset} balance in the reward manager wallet.`);
    allowance = await context.publicClient.readContract({ address: token, abi: erc20Abi, functionName: "allowance", args: [context.account, context.address] });
    if (allowance < action.amount) approval = allowance === BigInt(0) ? "approve" : "reset";
    summary.push(["Operation", `Fund ${action.asset} reserve`], ["Amount", `${formatUnits(action.amount, asset.decimals)} ${action.asset}`], ["Token", token], ["Current allowance", formatUnits(allowance, asset.decimals)], ["Pool allocation", "Separate reservation step"]);
  } else if (action.kind === "reserve") {
    const exists = await context.publicClient.readContract({ address: context.address, abi: stakingAbi, functionName: "poolExists", args: [action.poolId] });
    if (exists !== true) throw new Error("This pool does not exist on the configured staking contract.");
    const pool = await context.publicClient.readContract({ address: context.address, abi: stakingAbi, functionName: "pool", args: [action.poolId] }) as { opensAt: bigint; finalized: boolean };
    const block = await context.publicClient.getBlock();
    if (pool.finalized || block.timestamp >= pool.opensAt) throw new Error("Pool budgets are locked once the pool opens or is finalized.");
    if (action.arvoAmount > accounting.ARVO.available || action.usdcAmount > accounting.USDC.available) throw new Error("Reservation exceeds the available uncommitted reward capacity. Fund reserves first.");
    summary.push(["Operation", "Reserve pool budget"], ["Pool ID", String(action.poolId)], ["ARVO reservation", formatUnits(action.arvoAmount, 18)], ["USDC reservation", formatUnits(action.usdcAmount, 6)], ["Pool opens (UTC)", new Date(Number(pool.opensAt) * 1000).toISOString()], ["Token transfer", "None; assigns existing reserves"]);
  } else {
    const asset = accounting[action.asset]; token = asset.token;
    if (action.recipient.toLowerCase() === context.address.toLowerCase()) throw new Error("Recipient must differ from the staking contract.");
    if (action.amount > asset.available) throw new Error(`Withdrawal exceeds the available ${action.asset} surplus.`);
    summary.push(["Operation", `Withdraw ${action.asset} surplus`], ["Amount", `${formatUnits(action.amount, asset.decimals)} ${action.asset}`], ["Recipient", action.recipient], ["Token", token]);
  }
  if (action.kind !== "fund" || approval === "none") {
    const call = rewardContractCall(action);
    await context.publicClient.simulateContract({ address: context.address, abi: stakingAbi, ...call, account: context.account });
  }
  return { action, account: context.account, chainId: context.chain.id, proxy: context.address, token, allowance, approval, summary };
}
function checkReview(context: Awaited<ReturnType<typeof rewardWallet>>, review: RewardReview) {
  if (context.chain.id !== review.chainId || context.address.toLowerCase() !== review.proxy.toLowerCase()) throw new Error("Staking configuration changed. Review the operation again.");
}
export async function approveRewardFunding(review: RewardReview): Promise<Hash> {
  if (review.action.kind !== "fund" || !review.token || review.approval === "none") throw new Error("No funding approval is required.");
  const context = await rewardWallet(review.account); checkReview(context, review);
  const fresh = await reviewRewardAction(review.action, review.account);
  if (fresh.token?.toLowerCase() !== review.token.toLowerCase() || fresh.approval !== review.approval) throw new Error("Token or allowance changed. Review funding again.");
  const amount = fresh.approval === "reset" ? BigInt(0) : review.action.amount;
  const { request } = await context.publicClient.simulateContract({ address: review.token, abi: erc20Abi, functionName: "approve", args: [context.address, amount], account: context.account });
  const checked = await rewardWallet(review.account);
  if (checked.provider !== context.provider) throw new Error("Wallet connection changed. Review the operation again.");
  return context.walletClient.writeContract(request);
}
export async function submitRewardAction(review: RewardReview): Promise<Hash> {
  const context = await rewardWallet(review.account); checkReview(context, review);
  const fresh = await reviewRewardAction(review.action, review.account);
  if (fresh.approval !== "none") throw new Error("Approve the funding allowance first.");
  if (review.token && fresh.token?.toLowerCase() !== review.token.toLowerCase()) throw new Error("Reward token changed. Review the operation again.");
  const call = rewardContractCall(review.action);
  const { request } = await context.publicClient.simulateContract({ address: context.address, abi: stakingAbi, ...call, account: context.account });
  const checked = await rewardWallet(review.account);
  if (checked.provider !== context.provider) throw new Error("Wallet connection changed. Review the operation again.");
  return context.walletClient.writeContract(request);
}
export async function confirmRewardTransaction(hash: Hash) {
  const { publicClient } = await validatedConnection();
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return receipt.status === "success";
}

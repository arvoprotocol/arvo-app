"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { formatUnits, type Address, type Hash } from "viem";
import { stakingConnection } from "@/lib/staking/pool-transactions";
import { prepareFunding, prepareReservation, prepareWithdrawal, type Asset, type RewardAction } from "@/lib/staking/reward-form";
import { readRewardAccounting, reviewRewardAction, rewardWallet, approveRewardFunding, submitRewardAction, confirmRewardTransaction, type RewardAccounting, type RewardReview } from "@/lib/staking/reward-transactions";
import {
  AlertTriangle,
  ArrowDownToLine,
  Coins,
  LockKeyhole,
  ShieldCheck,
  WalletCards,
} from "lucide-react";

import {
  PageTitle,
  Panel,
  PanelHeader,
  StatCard,
  StatusPill,
} from "@/components/protocol/ProtocolUI";

type RewardForm = {
  fields: Record<string, string>;
  accounting: RewardAccounting | null;
  account: Address | undefined;
  locked: boolean;
  connected: boolean;
  change: (name: string, value: string) => void;
  reviewAction: (prepare: () => RewardAction) => void;
};
const RewardsContext = createContext<RewardForm | null>(null);
function useRewards() {
  const context = useContext(RewardsContext);
  if (!context) throw new Error("Reward form context is missing.");
  return context;
}
function amount(accounting: RewardAccounting | null, asset: Asset, key: "balance" | "principal" | "committed" | "reserved" | "available" | "walletBalance") {
  const data = accounting?.[asset];
  const value = data?.[key];
  return data && value !== null && value !== undefined ? formatUnits(value, data.decimals) : "–";
}

export default function AdminRewardsPage() {
  const [fields, setFields] = useState<Record<string, string>>({ fundARVO: "0", fundUSDC: "0", poolId: "", reserveARVO: "0", reserveUSDC: "0", recipientARVO: "", recipientUSDC: "", withdrawARVO: "0", withdrawUSDC: "0" });
  const [accounting, setAccounting] = useState<RewardAccounting | null>(null);
  const [account, setAccount] = useState<Address>();
  const [review, setReview] = useState<RewardReview | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  type Pending = { hash: Hash; stage: "approval" | "action"; review: RewardReview };
  const [pending, setPending] = useState<Pending | null>(null);
  const [lastHash, setLastHash] = useState<Hash | null>(null);
  const running = useRef(false);
  const connection = stakingConnection();
  useEffect(() => {
    let cancelled = false;
    if (!stakingConnection()) return;
    setLoading(true);
    readRewardAccounting(account).then((data) => { if (!cancelled) setAccounting(data); }).catch((err) => { if (!cancelled) { setAccounting(null); setError(err instanceof Error ? err.message : "Unable to load reward accounting."); } }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [account]);
  async function refreshBalances(selected = account) {
    setLoading(true);
    try { setAccounting(await readRewardAccounting(selected)); }
    catch (err) { setAccounting(null); setError(err instanceof Error ? err.message : "Unable to refresh balances."); }
    finally { setLoading(false); }
  }
  async function connectWallet() {
    if (running.current || pending) return;
    running.current = true; setBusy(true); setError("");
    try { const wallet = await rewardWallet(); setAccount(wallet.account); setReview(null); await refreshBalances(wallet.account); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to connect reward manager."); }
    finally { running.current = false; setBusy(false); }
  }
  async function openReview(prepare: () => RewardAction) {
    if (running.current || pending) return;
    running.current = true; setBusy(true); setError(""); setNotice(""); setReview(null);
    try { const prepared = prepare(); const checked = await reviewRewardAction(prepared); setAccount(checked.account); setReview(checked); await refreshBalances(checked.account); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to review operation."); }
    finally { running.current = false; setBusy(false); }
  }
  async function finishTransaction(transaction: Pending) {
    const succeeded = await confirmRewardTransaction(transaction.hash);
    setPending(null); setReview(null);
    if (!succeeded) { setError("Transaction reverted. No operation was completed. Review it again before retrying."); await refreshBalances(transaction.review.account); return; }
    if (transaction.stage === "approval") {
      setNotice(transaction.review.approval === "reset" ? "Allowance reset confirmed. Approve the funding amount next." : "Token approval confirmed. Confirm the separate funding transaction when ready.");
      try { setReview(await reviewRewardAction(transaction.review.action, transaction.review.account)); }
      catch (err) { setError(`Approval confirmed. Review funding again: ${err instanceof Error ? err.message : "Unable to refresh funding review."}`); }
    } else {
      const kind = transaction.review.action.kind;
      setNotice(kind === "fund" ? "Reward funding confirmed. Reserve a pool budget separately before the pool opens." : kind === "reserve" ? "Pool reward budget reservation confirmed." : "Surplus withdrawal confirmed.");
    }
    await refreshBalances(transaction.review.account);
  }
  async function send(stage: "approval" | "action") {
    if (!review || running.current || pending) return;
    running.current = true; setBusy(true); setError(""); setNotice("");
    let submitted: Pending | null = null;
    try {
      const hash = stage === "approval" ? await approveRewardFunding(review) : await submitRewardAction(review);
      submitted = { hash, stage, review }; setPending(submitted); setLastHash(hash);
      await finishTransaction(submitted);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to complete the operation.";
      setError(submitted ? `Transaction submitted. ${message} Check confirmation before retrying.` : message);
    } finally { running.current = false; setBusy(false); }
  }
  async function checkConfirmation() {
    if (!pending || running.current) return;
    running.current = true; setBusy(true); setError("");
    try { await finishTransaction(pending); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to check transaction confirmation."); }
    finally { running.current = false; setBusy(false); }
  }
  const manager: RewardForm = {
    fields, accounting, account, locked: busy || Boolean(pending), connected: Boolean(connection),
    change(name, value) { setFields((current) => ({ ...current, [name]: value })); setReview(null); setError(""); },
    reviewAction(prepare) { void openReview(prepare); },
  };
  return (
    <RewardsContext.Provider value={manager}>
    <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
      <PageTitle
        eyebrow="Treasury operations"
        title="Rewards."
        copy="Fund reward reserves, monitor protected balances and reserve reward budgets to staking pools."
      />

      <div className="mt-6 rounded-2xl border border-black/10 bg-white/70 p-5">
        <p className="text-sm font-semibold">{connection ? "Reward manager connection" : "Testnet connection pending"}</p>
        <p className="mt-2 text-xs leading-5 text-black/60">{connection ? `Chain ${connection.chain.id} · Staking proxy ${connection.address}` : "Live balances and transactions become available when the testnet staking proxy is connected."}</p>
        {account && <p className="mt-2 break-all text-xs text-black/50">Wallet balances shown for: {account}</p>}
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" disabled={!connection || busy || Boolean(pending)} onClick={connectWallet} className="rounded-xl bg-[#07090b] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-35">{busy ? "Working…" : account ? "Reconnect reward manager" : "Connect reward manager"}</button>
          <button type="button" disabled={!connection || busy || loading || Boolean(pending)} onClick={() => { setReview(null); void refreshBalances(); }} className="rounded-xl border border-black/10 px-4 py-2.5 text-xs font-semibold disabled:opacity-35">{loading ? "Loading balances…" : "Refresh balances"}</button>
        </div>
      </div>
      {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs leading-5 text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs leading-5 text-emerald-900">{notice}</p>}
      {lastHash && <p className="mt-4 break-all text-[11px] leading-5 text-black/50">Latest transaction: {lastHash}</p>}
      {review && <Panel className="mt-6">
        <PanelHeader eyebrow="Confirm details" title="Transaction review" />
        <div className="divide-y divide-black/[0.06] px-5 md:px-6">{review.summary.map(([label, value]) => <AccountingRow key={label} label={label} value={value} />)}</div>
        <div className="p-5 md:p-6">
          {review.action.kind === "fund" && review.approval !== "none" && <p className="mb-4 text-xs leading-5 text-black/50">{review.approval === "reset" ? "The existing allowance must be reset to zero before approving the new amount. This step transfers no tokens." : "Approve only this funding amount. Approval transfers no tokens; funding requires a separate confirmation."}</p>}
          {review.action.kind === "withdraw" && <p className="mb-4 text-xs leading-5 text-black/50">Confirm the recipient and amount. This transaction transfers surplus out of the staking contract.</p>}
          <div className="flex flex-wrap gap-3">
            {!pending && <button type="button" disabled={busy} onClick={() => setReview(null)} className="rounded-xl border border-black/10 px-4 py-3 text-xs font-semibold disabled:opacity-35">Cancel review</button>}
            {review.action.kind === "fund" && review.approval !== "none" ? <button type="button" disabled={busy || Boolean(pending)} onClick={() => void send("approval")} className="rounded-xl bg-[#07090b] px-4 py-3 text-xs font-semibold text-white disabled:opacity-35">{review.approval === "reset" ? "Reset token allowance" : "Approve funding amount"}</button> : <button type="button" disabled={busy || Boolean(pending)} onClick={() => void send("action")} className="rounded-xl bg-[#07090b] px-4 py-3 text-xs font-semibold text-white disabled:opacity-35">{review.action.kind === "fund" ? "Confirm reward funding" : review.action.kind === "reserve" ? "Confirm pool reservation" : "Confirm surplus withdrawal"}</button>}
          </div>
          {busy && <p role="status" className="mt-4 text-xs text-black/50">{pending ? "Waiting for transaction confirmation…" : "Confirm the request in your wallet…"}</p>}
        </div>
      </Panel>}
      {pending && !busy && <button type="button" onClick={() => void checkConfirmation()} className="mt-5 rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-semibold">Check transaction confirmation</button>}
      <fieldset disabled={busy || Boolean(pending)} className="min-w-0">

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="ARVO available"
          value={amount(accounting, "ARVO", "available")}
          detail="Uncommitted reward capacity"
          icon={<Coins size={16} />}
        />

        <StatCard
          label="USDG available"
          value={amount(accounting, "USDG", "available")}
          detail="Uncommitted reward capacity"
          icon={<WalletCards size={16} />}
        />

        <StatCard
          label="ARVO reserved"
          value={amount(accounting, "ARVO", "reserved")}
          detail="Uncommitted pool budgets"
          icon={<LockKeyhole size={16} />}
        />

        <StatCard
          label="USDG reserved"
          value={amount(accounting, "USDG", "reserved")}
          detail="Uncommitted pool budgets"
          icon={<LockKeyhole size={16} />}
        />
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-2">
        <AssetAccounting asset="ARVO" />
        <AssetAccounting asset="USDG" />
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-2">
        <Panel>
          <PanelHeader
            eyebrow="Reward reserve"
            title="Fund rewards"
            action={<StatusPill>Reward manager</StatusPill>}
          />

          <div className="p-5 md:p-6">
            <p className="max-w-xl text-sm leading-6 text-black/60">
              Transfer ARVO or USDG from the authorised Reward Manager wallet
              into the staking contract. Funding increases the contract balance
              but does not assign those assets to a particular pool.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <FundingCard asset="ARVO" />
              <FundingCard asset="USDG" />
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader
            eyebrow="Pool funding"
            title="Reserve pool budget"
            action={<StatusPill>Reward manager</StatusPill>}
          />

          <div className="p-5 md:p-6">
            <p className="max-w-xl text-sm leading-6 text-black/60">
              Assign already-funded reward capacity to a specific pool. The
              reservation becomes protected and can no longer fund another
              reward promise or be withdrawn as surplus.
            </p>

            <div className="mt-6 space-y-4">
              <Field
                label="Pool ID"
                name="poolId"
                placeholder="Enter pool ID"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="ARVO to reserve"
                  name="reserveARVO"
                  placeholder="0"
                  suffix="ARVO"
                />
                <Field
                  label="USDG to reserve"
                  name="reserveUSDC"
                  placeholder="0"
                  suffix="USDG"
                />
              </div>

              <button
                type="button"
                disabled={!manager.connected || manager.locked}
                onClick={() => manager.reviewAction(() => prepareReservation(fields.poolId, fields.reserveARVO, fields.reserveUSDC))}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#07090b] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                <LockKeyhole size={14} />
                Review reservation
              </button>

              <p className="text-[11px] leading-5 text-black/55">
                Reward budgets can only be added before the pool opens and
                cannot exceed currently available reward capacity.
              </p>
            </div>
          </div>
        </Panel>
      </section>

      <section className="mt-8">
        <Panel>
          <PanelHeader
            eyebrow="Protected accounting"
            title="How available capacity is calculated"
          />

          <div className="p-5 md:p-6">
            <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-center">
              <FormulaBlock
                label="Contract balance"
                copy="Total token balance held by the staking contract."
              />

              <FormulaSymbol symbol="−" />

              <FormulaBlock
                label="User principal"
                copy="Principal owed back to active staking positions."
              />

              <FormulaSymbol symbol="−" />

              <FormulaBlock
                label="Committed rewards"
                copy="Rewards already promised to staking positions."
              />

              <FormulaSymbol symbol="−" />

              <FormulaBlock
                label="Pool budgets"
                copy="Reward capacity reserved for individual pools."
              />
            </div>

            <div className="mt-4 rounded-xl bg-[#c9846a]/[0.07] px-4 py-3">
              <p className="text-xs font-semibold text-[#8f543f]">
                = Available reward capacity
              </p>
            </div>
          </div>
        </Panel>
      </section>

      <section className="mt-8">
        <Panel>
          <PanelHeader
            eyebrow="Surplus"
            title="Withdraw available surplus"
            action={<StatusPill>Reward manager</StatusPill>}
          />

          <div className="grid gap-px bg-black/[0.06] lg:grid-cols-2">
            <SurplusCard asset="ARVO" />
            <SurplusCard asset="USDG" />
          </div>

          <div className="border-t border-black/[0.06] bg-amber-50/60 px-5 py-4 md:px-6">
            <div className="flex gap-3">
              <AlertTriangle
                size={16}
                className="mt-0.5 shrink-0 text-amber-700"
              />

              <p className="text-xs leading-5 text-amber-950/65">
                Only genuine surplus can be withdrawn. User principal,
                committed rewards and pool-reserved reward budgets remain
                protected by the contract accounting.
              </p>
            </div>
          </div>
        </Panel>
      </section>
      </fieldset>
    </div>
    </RewardsContext.Provider>
  );
}

function AssetAccounting({ asset }: { asset: "ARVO" | "USDG" }) {
  const { accounting } = useRewards();
  const data = accounting?.[asset];
  return (
    <Panel>
      <PanelHeader
        eyebrow={`${asset} accounting`}
        title={`${asset === "USDG" ? "Ordinary USDG" : asset} reserve`}
        action={
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-black/55">
            <ShieldCheck size={13} />
            {data ? (data.solvent ? "Solvent" : "Reserve shortfall") : "Awaiting contract data"}
          </span>
        }
      />

      <div className="divide-y divide-black/[0.06] px-5 md:px-6">
        {asset==="USDG"&&<p className="py-4 text-xs leading-5 text-black/50">This reserve covers ordinary staking only. Acquisition cash and future USDG commitments are managed separately under Pools → Acquisition vaults.</p>}
        <AccountingRow label="Contract balance" value={amount(accounting, asset, "balance")} />
        <AccountingRow label="User principal liability" value={amount(accounting, asset, "principal")} />
        <AccountingRow label="Committed reward liability" value={amount(accounting, asset, "committed")} />
        <AccountingRow label="Reserved pool budgets" value={amount(accounting, asset, "reserved")} />

        <div className="flex items-center justify-between py-4">
          <span className="text-xs font-semibold">Available capacity</span>
          <span className="text-base font-semibold tracking-[-0.02em]">{amount(accounting, asset, "available")}</span>
        </div>
      </div>
    </Panel>
  );
}

function FundingCard({ asset }: { asset: "ARVO" | "USDG" }) {
  const manager = useRewards();
  return (
    <div className="rounded-2xl border border-black/[0.07] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{asset}</p>
          <p className="mt-0.5 text-[11px] text-black/55">
            Available in wallet: {amount(manager.accounting, asset, "walletBalance")}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/[0.035]">
          <Coins size={16} className="text-black/60" />
        </div>
      </div>

      <div className="mt-4 flex overflow-hidden rounded-xl border border-black/[0.09]">
        <input
          type="text"
          inputMode="decimal"
          value={manager.fields[`fund${asset}`]}
          onChange={(event) => manager.change(`fund${asset}`, event.target.value)}
          placeholder="0"
          className="min-w-0 flex-1 bg-white px-3 py-3 text-sm outline-none placeholder:text-black/20"
        />
        <span className="flex items-center bg-black/[0.025] px-3 text-[10px] font-semibold text-black/55">
          {asset}
        </span>
      </div>

      <button
        type="button"
        disabled={!manager.connected || manager.locked}
        onClick={() => manager.reviewAction(() => prepareFunding(asset, manager.fields[`fund${asset}`]))}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#07090b] px-3 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-35"
      >
        <ArrowDownToLine size={13} />
        Review {asset} funding
      </button>
    </div>
  );
}

function SurplusCard({ asset }: { asset: "ARVO" | "USDG" }) {
  const manager = useRewards();
  return (
    <div className="bg-white/70 p-5 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">{asset}</p>
          <p className="mt-1 text-xs text-black/60">
            Currently withdrawable: {amount(manager.accounting, asset, "available")}
          </p>
        </div>

        <WalletCards size={18} className="text-black/50" />
      </div>

      <div className="mt-5 space-y-3">
        <Field
          label="Recipient"
          name={`recipient${asset}`}
          placeholder="0x..."
        />

        <Field
          label="Amount"
          name={`withdraw${asset}`}
          placeholder="0"
          suffix={asset}
        />

        <button
          type="button"
          disabled={!manager.connected || manager.locked}
          onClick={() => manager.reviewAction(() => prepareWithdrawal(asset, manager.fields[`withdraw${asset}`], manager.fields[`recipient${asset}`]))}
          className="w-full rounded-xl border border-black/[0.09] px-4 py-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-35"
        >
          Review withdrawal
        </button>
      </div>
    </div>
  );
}

function AccountingRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <span className="text-xs text-black/60">{label}</span>
      <span className="min-w-0 break-all text-right text-xs font-semibold">{value}</span>
    </div>
  );
}

function Field({
  name,
  label,
  placeholder,
  suffix,
}: {
  name: string;
  label: string;
  placeholder: string;
  suffix?: string;
}) {
  const manager = useRewards();
  return (
    <label className="block">
      <span className="text-xs font-semibold text-black/60">{label}</span>

      <div className="mt-2 flex overflow-hidden rounded-xl border border-black/[0.09] bg-white">
        <input
          type="text"
          inputMode={suffix ? "decimal" : undefined}
          value={manager.fields[name]}
          onChange={(event) => manager.change(name, event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-black/20"
        />

        {suffix && (
          <span className="flex items-center border-l border-black/[0.06] bg-black/[0.02] px-3 text-[10px] font-semibold text-black/55">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

function FormulaBlock({
  label,
  copy,
}: {
  label: string;
  copy: string;
}) {
  return (
    <div className="rounded-xl border border-black/[0.07] p-4">
      <p className="text-xs font-semibold">{label}</p>
      <p className="mt-1 text-[11px] leading-4 text-black/55">{copy}</p>
    </div>
  );
}

function FormulaSymbol({ symbol }: { symbol: string }) {
  return (
    <div className="hidden text-center text-lg font-medium text-black/50 lg:block">
      {symbol}
    </div>
  );
}

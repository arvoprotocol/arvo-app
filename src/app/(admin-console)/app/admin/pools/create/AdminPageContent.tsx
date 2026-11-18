"use client";

import { useRouter } from "next/navigation";
import { validateDraft, type VaultDraft } from "@/lib/staking/vault-draft";
import { createContext, useContext, useRef, useState } from "react";
import { launchMinimums, preparePool, initialValues, initialProducts, productLabels, type FormValues, type Products, type PreparedPool } from "@/lib/staking/pool-form";
import type { Hash } from "viem";
import { poolCalldata, stakingConnection, submitPool, confirmPoolTransaction } from "@/lib/staking/pool-transactions";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  Check,
  ChevronRight,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  PageTitle,
  Panel,
  PanelHeader,
  StatusPill,
} from "@/components/protocol/ProtocolUI";

type PoolType = "standard" | "custom";
type StandardKind = "BUILD" | "ADVANCE" | "COMPOUND" | "FOUNDATION";

const standardVaults: Array<{
  kind: StandardKind;
  name: string;
  duration: string;
  arvoReward: string;
  usdcReward: string;
}> = [
  {
    kind: "BUILD",
    name: "Build",
    duration: "60 days",
    arvoReward: "3%",
    usdcReward: "2%",
  },
  {
    kind: "ADVANCE",
    name: "Advance",
    duration: "90 days",
    arvoReward: "4%",
    usdcReward: "3%",
  },
  {
    kind: "COMPOUND",
    name: "Compound",
    duration: "180 days",
    arvoReward: "10%",
    usdcReward: "6.5%",
  },
  {
    kind: "FOUNDATION",
    name: "Foundation",
    duration: "365 days",
    arvoReward: "22%",
    usdcReward: "14%",
  },
];

type PoolFormContext = {
  values: FormValues;
  products: Products;
  changeValue: (key: keyof FormValues, value: string) => void;
  changeProduct: (key: keyof Products, enabled: boolean) => void;
};
const PoolForm = createContext<PoolFormContext | null>(null);
function usePoolForm() {
  const form = useContext(PoolForm);
  if (!form) throw new Error("Pool form context is missing.");
  return form;
}
const fieldKeys: Record<string, keyof FormValues> = {
  "Duration": "duration", "ARVO cycle reward": "arvoRate", "USDG cycle reward": "usdcRate",
  "Dual stake boost": "dualBoost", "Combined boost cap": "boostCap", "Minimum ARVO": "minArvo",
  "Minimum USDG": "minUsdc", "ARVO minimum for USDG rewards": "minArvoUsdc", "Maximum ARVO principal": "maxArvo", "Maximum USDG principal": "maxUsdc", "USDG committed outside the app": "committedUsdc", "Bonus at full capacity": "bonusPct",
};
const productKeys = Object.fromEntries(Object.entries(productLabels).map(([key,label]) => [label,key])) as Record<string,keyof Products>;

export default function CreatePoolPage({ draft }: { draft?: VaultDraft } = {}) {
  const router = useRouter();
  const [savedDraft, setSavedDraft] = useState<VaultDraft | undefined>(draft);
  const [title, setTitle] = useState(draft?.title ?? "Build");
  const [visibility, setVisibility] = useState<"hidden" | "openingSoon">(draft?.visibility ?? "hidden");
  const [sortOrder, setSortOrder] = useState(String(draft?.sortOrder ?? 0));
  const [draftMessage, setDraftMessage] = useState("");
  const linked = savedDraft?.linkedPoolId != null;
  const [poolType, setPoolType] = useState<PoolType>(draft?.poolType ?? "standard");
  const [standardKind, setStandardKind] = useState<StandardKind>(draft?.standardKind ?? "BUILD");

  const [values, setValues] = useState<FormValues>(draft?.values ?? { ...initialValues });
  const [products, setProducts] = useState<Products>(draft?.products ?? { ...initialProducts });
  const [review, setReview] = useState<PreparedPool | null>(null);
  const [error, setError] = useState("");
  const [referencePrice, setReferencePrice] = useState("");
  const [busy, setBusy] = useState(false);
  const [hash, setHash] = useState("");
  const [result, setResult] = useState<{ poolId: string | null } | null>(null);
  const sending = useRef(false);
  const submittedHash = useRef("");
  const connection = stakingConnection();
  function invalidateReview() { setReview(null); setError(""); }
  const form: PoolFormContext = {
    values, products,
    changeValue(key, value) { setValues((current) => ({ ...current, [key]: value })); invalidateReview(); },
    changeProduct(key, enabled) { setProducts((current) => ({ ...current, [key]: enabled })); invalidateReview(); },
  };
  async function saveDraft() {
    if (sending.current || linked || submittedHash.current) return;
    sending.current = true; setBusy(true); setError(""); setDraftMessage("");
    try {
      const terms = validateDraft({ title, poolType, standardKind, values, products, visibility, sortOrder: Number(sortOrder) });
      const response = await fetch(savedDraft ? `/api/admin/vault-drafts/${savedDraft.id}` : "/api/admin/vault-drafts", {
        method: savedDraft ? "PATCH" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...terms, revision: savedDraft?.revision }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save draft.");
      setSavedDraft(data.draft); setDraftMessage(visibility === "openingSoon" ? "Saved. This vault now appears as Opening soon on the app." : "Saved. This vault is hidden from the app.");
      if (!savedDraft) router.replace(`/app/admin/pools/drafts/${data.draft.id}`);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save draft."); }
    finally { sending.current = false; setBusy(false); }
  }
  function reviewPool() {
    setError("");
    try { setReview(preparePool(poolType, standardKind, values, products)); }
    catch (err) { setReview(null); setError(err instanceof Error ? err.message : "Check the pool terms."); }
  }
  async function createPool() {
    if (sending.current || submittedHash.current || result || !review) return;
    sending.current = true;
    setBusy(true); setError("");
    try {
      // Revalidate timestamps immediately before requesting a transaction.
      const prepared = preparePool(poolType, standardKind, values, products);
      const terms = validateDraft({ title, poolType, standardKind, values, products, visibility, sortOrder: Number(sortOrder) });
      const savedResponse = await fetch(savedDraft ? `/api/admin/vault-drafts/${savedDraft.id}` : "/api/admin/vault-drafts", {
        method: savedDraft ? "PATCH" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...terms, revision: savedDraft?.revision }),
      });
      const savedData = await savedResponse.json();
      if (!savedResponse.ok) throw new Error(savedData.error || "Unable to save the vault name and terms. No transaction requested.");
      const currentDraft = savedData.draft as VaultDraft;
      setSavedDraft(currentDraft);
      const created = await submitPool(prepared, (transactionHash) => {
        submittedHash.current = transactionHash;
        setHash(transactionHash);
      });
      setResult({ poolId: created.poolId });
      if (created.poolId !== null) {
        const linkedResponse = await fetch(`/api/admin/vault-drafts/${currentDraft.id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "link", revision: currentDraft.revision, poolId: created.poolId }),
        });
        const linkedData = await linkedResponse.json();
        if (!linkedResponse.ok) throw new Error(linkedData.error || "Pool created, but its saved name was not linked. Use Verify and link pool in the registry.");
        setSavedDraft(linkedData.draft);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create pool.";
      setError(submittedHash.current ? `Transaction was submitted. ${message} Check its receipt before creating another pool.` : message);
    } finally { sending.current = false; setBusy(false); }
  }
  async function checkConfirmation() {
    if (!hash || busy) return;
    setBusy(true); setError("");
    try { const confirmed = await confirmPoolTransaction(hash as Hash); setResult({ poolId: confirmed.poolId }); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to check confirmation."); }
    finally { setBusy(false); }
  }
  function startAnotherPool() {
    setResult(null); setHash(""); submittedHash.current = "";
    setReview(null); setError(""); setValues((current) => ({ ...current, opens: "", closes: "" }));
  }
  async function copyCalldata() {
    if (!review) return;
    try { await navigator.clipboard.writeText(poolCalldata(review)); setError(""); }
    catch { setError("Unable to copy calldata. Your browser must allow clipboard access."); }
  }

  return (
    <PoolForm.Provider value={form}>
    <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
      <Link
        href="/app/admin/pools"
        className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-black/40 transition hover:text-black"
      >
        <ArrowLeft size={14} />
        Back to pools
      </Link>

      <PageTitle
        eyebrow="Pool management"
        title={savedDraft ? "Vault draft." : "Create vault draft."}
        copy="Save planned vault terms and preview them before launch. Creating a live pool and funding its rewards are separate steps."
      />

      <Panel>
        <div className="mt-6 grid gap-4 p-5 md:grid-cols-3 md:p-6">
          <label className="text-xs font-semibold">Vault name<input value={title} onChange={e => setTitle(e.target.value)} maxLength={80} disabled={busy || linked || Boolean(hash)} className="mt-2 w-full rounded-xl border border-black/10 p-3 text-sm font-normal" /></label>
          <label className="text-xs font-semibold">Preview visibility<select value={visibility} onChange={e => setVisibility(e.target.value as "hidden" | "openingSoon")} disabled={busy || linked || Boolean(hash)} className="mt-2 w-full rounded-xl border border-black/10 p-3 text-sm font-normal"><option value="hidden">Hidden</option><option value="openingSoon">Opening soon</option></select></label>
          <label className="text-xs font-semibold">Display order<input value={sortOrder} onChange={e => setSortOrder(e.target.value)} inputMode="numeric" disabled={busy || linked || Boolean(hash)} className="mt-2 w-full rounded-xl border border-black/10 p-3 text-sm font-normal" /></label>
          <div className="md:col-span-3"><button type="button" onClick={saveDraft} disabled={busy || linked || Boolean(hash) || Boolean(result)} className="rounded-xl bg-[#07090b] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{busy ? "Saving…" : savedDraft ? "Save draft changes" : "Save vault draft"}</button>
            <p className="mt-3 text-xs leading-5 text-black/45">{linked ? `Linked to pool #${savedDraft?.linkedPoolId}. On-chain terms are locked.` : "Drafts can be saved without an opening date. Opening soon previews have no deposit button."}</p>
            {draftMessage && <p role="status" className="mt-3 text-sm text-emerald-700">{draftMessage}</p>}
          </div>
        </div>
      </Panel>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">
        <fieldset disabled={busy || linked || Boolean(hash) || Boolean(result)} className="min-w-0 space-y-6">
          <Panel>
            <PanelHeader
              eyebrow="Step 01"
              title="Pool type"
            />

            <div className="grid gap-3 p-5 md:grid-cols-2 md:p-6">
              <TypeCard
                active={poolType === "standard"}
                title="Standard"
                copy="Keep Arvo's standard durations and rates, with your chosen entry minimums."
                onClick={() => { setPoolType("standard"); invalidateReview(); }}
              />

              <TypeCard
                active={poolType === "custom"}
                title="Custom"
                copy="Create bespoke duration, reward rates, minimums and product controls."
                onClick={() => { setPoolType("custom"); invalidateReview(); }}
              />
            </div>
          </Panel>

          {poolType === "standard" ? (
            <StandardConfiguration
              selected={standardKind}
              onSelect={(kind) => { if (title === standardVaults.find(v => v.kind === standardKind)?.name) setTitle(standardVaults.find(v => v.kind === kind)?.name ?? title); setStandardKind(kind); invalidateReview(); }}
            />
          ) : (
            <CustomConfiguration />
          )}

          <Panel>
            <PanelHeader eyebrow="Entry requirements" title="Fixed token minimums" />
            <div className="space-y-5 p-5 md:p-6">
              <p className="text-xs leading-5 text-black/50">Applies to standard presets and custom vaults. Use the same approved minimums across the launch vaults. The reference price sets token thresholds; later market changes do not recalculate them.</p>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <label className="text-xs font-semibold">Approved ARVO reference price (USD)
                  <input value={referencePrice} onChange={e => setReferencePrice(e.target.value)} inputMode="decimal" placeholder="Enter approved price" className="mt-2 w-full rounded-xl border border-black/10 p-3 text-sm font-normal" />
                </label>
                <button type="button" className="self-end rounded-xl bg-[#07090b] px-4 py-3 text-xs font-semibold text-white" onClick={() => {
                  try { const minimums = launchMinimums(referencePrice); setValues(current => ({ ...current, ...minimums })); invalidateReview(); }
                  catch (e) { setError(e instanceof Error ? e.message : "Check the reference price."); }
                }}>Calculate $500 / 110% minimums</button>
              </div>
              <p className="text-[11px] leading-5 text-black/45">Rounds the base up to the next 10 ARVO. USDG-reward eligibility is 110% of that amount, approximately $550 at this same price. Save each draft after applying the approved amounts.</p>
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Minimum ARVO" suffix="ARVO" placeholder="Approved token amount" />
                <Field label="ARVO minimum for USDG rewards" suffix="ARVO" placeholder="110% of the base" />
                <Field label="Minimum USDG" suffix="USDG" placeholder="1,000" />
              </div>
            </div>
          </Panel>

          <PoolWindow />

          <Capacity />

          <ProductControls />
          <CardDetailsControls />

          <div className="rounded-2xl border border-amber-500/20 bg-amber-50/70 p-5">
            <div className="flex gap-3">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0 text-amber-700"
              />

              <div>
                <p className="text-sm font-semibold text-amber-950">
                  Reward budget is not set here.
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-900/60">
                  Creating the pool establishes its terms and capacity only.
                  ARVO and USDG rewards must be funded and reserved separately
                  before the opening time.
                </p>
              </div>
            </div>
          </div>
        </fieldset>

        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <Panel>
            <PanelHeader eyebrow="Review" title="Pool summary" />
            <div className="divide-y divide-black/[0.06] px-5">
              <SummaryRow label="Type" value={poolType === "standard" ? standardVaults.find((vault) => vault.kind === standardKind)?.name ?? "—" : "Custom"} />
              <SummaryRow label="Duration" value={poolType === "custom" ? `${values.duration || "—"} days` : standardVaults.find((vault) => vault.kind === standardKind)?.duration ?? "—"} />
              <SummaryRow label="ARVO cycle reward" value={poolType === "custom" ? `${values.arvoRate || "0"}%` : standardVaults.find((vault) => vault.kind === standardKind)?.arvoReward ?? "—"} />
              <SummaryRow label="USDG cycle reward" value={poolType === "custom" ? `${values.usdcRate || "0"}%` : standardVaults.find((vault) => vault.kind === standardKind)?.usdcReward ?? "—"} />
              <SummaryRow label="Reward budget" value="Separate step" />
              <SummaryRow label="Mixed rewards" value="Disabled" />
            </div>
          </Panel>
          <div className="rounded-2xl bg-[#07090b] p-5 text-white">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#e2a98e]" />
              <p className="text-xs font-semibold">{connection ? "Review pool creation" : "Save your draft above"}</p>
            </div>
            <p className="mt-3 text-xs leading-5 text-white/55">
              {connection ? "Review the terms before approving pool creation in your authorised wallet." : "Save as Hidden or Opening soon while the pages are being reviewed. Live pool creation becomes available after deployment."}
            </p>
            {connection && <p className="mt-3 break-all text-[11px] leading-5 text-white/55">Chain: {connection.chain.id}<br />Staking proxy: {connection.address}</p>}
            {!hash && !result && <button type="button" onClick={reviewPool} disabled={busy || linked || !connection} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-40">Review on-chain creation<ChevronRight size={15} /></button>}
          </div>
          {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs leading-5 text-red-800">{error}</p>}
          {review && !result && <Panel>
            <PanelHeader eyebrow="Confirm terms" title="Transaction review" />
            <div className="divide-y divide-black/[0.06] px-5">
              {review.summary.map(([label, value]) => <SummaryRow key={label} label={label} value={value} />)}
            </div>
            <div className="p-5">
              <p className="text-xs leading-5 text-black/50">Pool terms are fixed at creation. This transaction creates an enabled pool with no reserved reward budget. Fund and reserve rewards before its opening time.</p>
              <button type="button" onClick={copyCalldata} disabled={busy} className="mt-4 w-full rounded-xl border border-black/10 px-4 py-3 text-xs font-semibold disabled:opacity-40">Copy transaction calldata</button>
              <button type="button" onClick={createPool} disabled={!connection || busy || linked || Boolean(hash)} className="mt-3 w-full rounded-xl bg-[#07090b] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{busy ? (hash ? "Waiting for confirmation…" : "Confirm in wallet…") : hash ? "Transaction submitted" : "Create pool"}</button>
            </div>
          </Panel>}
          {hash && !result && !busy && <button type="button" onClick={checkConfirmation} className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-semibold">Check transaction confirmation</button>}
          {hash && <div className="rounded-xl border border-black/10 bg-white p-4 text-xs leading-5"><p className="font-semibold">Transaction hash</p><p className="mt-1 break-all font-mono">{hash}</p></div>}
          {result && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900"><p className="font-semibold">{result.poolId !== null ? `Pool #${result.poolId} created.` : "Pool creation confirmed."}</p><p className="mt-2 text-xs leading-5">Fund and reserve the reward budget before the pool opens.</p><Link href="/app/admin/rewards" className="mt-3 inline-block text-xs font-semibold underline">Go to reward funding</Link><button type="button" onClick={startAnotherPool} className="mt-4 block rounded-lg border border-emerald-900/15 px-3 py-2 text-xs font-semibold">Configure another pool</button></div>}
        </aside>
      </div>
    </div>
    </PoolForm.Provider>
  );
}

function StandardConfiguration({
  selected,
  onSelect,
}: {
  selected: StandardKind;
  onSelect: (kind: StandardKind) => void;
}) {
  return (
    <Panel>
      <PanelHeader
        eyebrow="Step 02"
        title="Standard vault"
      />

      <div className="grid gap-3 p-5 md:grid-cols-2 md:p-6">
        {standardVaults.map((vault) => {
          const active = selected === vault.kind;

          return (
            <button
              key={vault.kind}
              type="button"
              onClick={() => onSelect(vault.kind)}
              className={`rounded-2xl border p-5 text-left transition ${
                active
                  ? "border-[#c9846a]/45 bg-[#c9846a]/[0.06]"
                  : "border-black/[0.08] bg-white hover:border-black/20"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold">{vault.name}</p>
                  <p className="mt-1 text-xs text-black/38">
                    {vault.duration} fixed cycle
                  </p>
                </div>

                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    active
                      ? "bg-[#ad7058] text-white"
                      : "border border-black/10 text-transparent"
                  }`}
                >
                  <Check size={13} />
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <MiniMetric label="ARVO reward" value={vault.arvoReward} />
                <MiniMetric label="USDG reward" value={vault.usdcReward} />
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}

function CustomConfiguration() {
  return (
    <Panel>
      <PanelHeader
        eyebrow="Step 02"
        title="Custom economics"
        action={<StatusPill>Advanced</StatusPill>}
      />

      <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6">
        <Field
          label="Duration"
          suffix="days"
          placeholder="e.g. 120"
          help="Must be greater than zero."
        />

        <div />

        <Field
          label="ARVO cycle reward"
          suffix="%"
          placeholder="0.00"
          help="Maximum 100%."
        />

        <Field
          label="USDG cycle reward"
          suffix="%"
          placeholder="0.00"
          help="Maximum 100%."
        />

        <Field
          label="Dual stake boost"
          suffix="%"
          placeholder="10.00"
          help="Maximum 50%."
        />

        <Field
          label="Combined boost cap"
          suffix="%"
          placeholder="15.00"
          help="Must be at least the dual boost and no more than 50%."
        />

      </div>

      <div className="border-t border-black/[0.06] px-5 py-4 md:px-6">
        <div className="flex items-center gap-3 text-xs text-black/40">
          <LockKeyhole size={14} />
          Mixed ARVO/USDG reward mode remains disabled. Its value-based split is not
          introduced.
        </div>
      </div>
    </Panel>
  );
}

function PoolWindow() {
  return (
    <Panel>
      <PanelHeader
        eyebrow="Step 03"
        title="Pool window"
      />

      <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6">
        <DateField
          label="Opens"
          help="UTC. Choose a future opening with time to fund and reserve rewards."
        />

        <DateField
          label="Closes"
          help="UTC. Leave empty for an open-ended pool."
        />
      </div>
    </Panel>
  );
}

function Capacity() {
  return (
    <Panel>
      <PanelHeader
        eyebrow="Step 04"
        title="Public capacity"
      />

      <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6">
        <Field
          label="Maximum ARVO principal"
          suffix="ARVO"
          placeholder="0"
          help="Enter 0 for uncapped."
        />

        <Field
          label="Maximum USDG principal"
          suffix="USDG"
          placeholder="0"
          help="Enter 0 for uncapped."
        />

        <Field
          label="USDG committed outside the app"
          suffix="USDG"
          placeholder="0"
          help="Real, signed commitments only. Shown as already committed; the rest of the cap is open for onchain deposits. Record it in Allocation after creation."
        />
      </div>

      <div className="border-t border-black/[0.06] px-5 py-4 md:px-6">
        <p className="text-xs leading-5 text-black/40">
          Protocol allocation can only be added against a defined capacity.
          An uncapped asset cannot receive protocol allocation.
        </p>
      </div>
    </Panel>
  );
}

function ProductControls() {
  return (
    <Panel>
      <PanelHeader
        eyebrow="Step 05"
        title="Enabled products"
      />

      <div className="grid gap-3 p-5 sm:grid-cols-2 md:p-6">
        {Object.values(productLabels).map(label => <ToggleRow key={label} title={label} />)}

        <MixedShareField />
        <p className="text-xs leading-5 text-black/50">Dual rewards pay ARVO from the ARVO deposit and USDG from the USDG deposit using the chosen weighting. An acquisition pool is configured after creation in Pools → Acquisition vaults, before its opening time.</p>
      </div>
    </Panel>
  );
}

function TypeCard({
  active,
  title,
  copy,
  onClick,
}: {
  active: boolean;
  title: string;
  copy: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-5 text-left transition ${
        active
          ? "border-[#c9846a]/45 bg-[#c9846a]/[0.06]"
          : "border-black/[0.08] hover:border-black/20"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold">{title}</p>

        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full ${
            active
              ? "bg-[#ad7058] text-white"
              : "border border-black/10 text-transparent"
          }`}
        >
          <Check size={13} />
        </span>
      </div>

      <p className="mt-2 max-w-sm text-xs leading-5 text-black/40">{copy}</p>
    </button>
  );
}

function Field({
  label,
  suffix,
  placeholder,
  help,
}: {
  label: string;
  suffix: string;
  placeholder: string;
  help?: string;
}) {
  const { values, changeValue } = usePoolForm();
  const key = fieldKeys[label];
  return (
    <label className="block">
      <span className="text-xs font-semibold text-black/65">{label}</span>

      <div className="mt-2 flex overflow-hidden rounded-xl border border-black/[0.09] bg-white focus-within:border-[#c9846a]/50">
        <input
          type="text"
          inputMode="decimal"
          value={values[key]}
          onChange={(event) => changeValue(key, event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-black/20"
        />

        <span className="flex items-center border-l border-black/[0.06] bg-black/[0.02] px-3 text-[10px] font-semibold text-black/35">
          {suffix}
        </span>
      </div>

      {help && (
        <span className="mt-1.5 block text-[11px] leading-4 text-black/35">
          {help}
        </span>
      )}
    </label>
  );
}

function DateField({
  label,
  help,
}: {
  label: string;
  help: string;
}) {
  const { values, changeValue } = usePoolForm();
  const key = label === "Opens" ? "opens" : "closes";
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-xs font-semibold text-black/65">
        <CalendarClock size={13} />
        {label}
      </span>

      <input
        type="datetime-local"
        value={values[key]}
        onChange={(event) => changeValue(key, event.target.value)}
        className="mt-2 w-full rounded-xl border border-black/[0.09] bg-white px-4 py-3 text-sm outline-none focus:border-[#c9846a]/50"
      />

      <span className="mt-1.5 block text-[11px] leading-4 text-black/35">
        {help}
      </span>
    </label>
  );
}

function ToggleRow({ title }: { title: string; defaultChecked?: boolean }) {
  const { products, changeProduct } = usePoolForm();
  const key = productKeys[title];
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-black/[0.07] px-4 py-3">
      <span className="text-sm font-semibold">{title}</span>

      <input
        type="checkbox"
        checked={products[key]}
        onChange={(event) => changeProduct(key, event.target.checked)}
        className="h-4 w-4 accent-[#ad7058]"
      />
    </label>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-black/[0.025] px-3 py-2.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/30">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <span className="text-xs text-black/40">{label}</span>
      <span className="min-w-0 break-words text-right text-xs font-semibold">{value}</span>
    </div>
  );
}

function MixedShareField(){const {values,products,changeValue}=usePoolForm();return products.dualMixed?<label className="block text-xs">ARVO share of dual rewards (%)<input value={values.mixedShare} onChange={e=>changeValue("mixedShare",e.target.value)} inputMode="decimal" className="mt-2 w-full rounded-xl border border-black/10 p-3"/><span className="mt-2 block text-black/50">USDG uses the remaining share. Must be above 0% and below 100%.</span></label>:null;}

/** Display-only details for the vault card: bonus strip and the linked project. Not sent to the chain. */
function CardDetailsControls() {
  const { values, changeValue } = usePoolForm();
  return (
    <Panel>
      <PanelHeader eyebrow="Step 06" title="Shown on the vault card" />
      <div className="grid gap-5 p-5 md:grid-cols-2 md:p-6">
        <Field label="Bonus at full capacity" suffix="%" placeholder="0" help="Shown as a bonus strip on the card, e.g. 5 for a pot worth 5% when the vault is full. Live vaults show the figure from their bonus contract instead. 0 hides the strip." />
        <label className="block">
          <span className="text-xs font-semibold text-black/65">Project this vault supports</span>
          <input value={values.projectSlug} onChange={e => changeValue("projectSlug", e.target.value.trim().toLowerCase())} placeholder="project-slug" className="mt-2 w-full rounded-xl border border-black/[0.09] bg-white px-4 py-3 text-sm outline-none placeholder:text-black/20 focus:border-[#c9846a]/50" />
          <span className="mt-2 block text-[11px] leading-5 text-black/45">The slug from Admin → Projects (the end of the project’s link). Shows a thumbnail in “What am I staking in?”. Leave empty for a general explanation only.</span>
        </label>
      </div>
    </Panel>
  );
}

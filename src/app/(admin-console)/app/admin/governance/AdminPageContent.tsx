"use client";
import { useCallback, useEffect, useState } from "react";
import { getAddress, isAddress, type Address } from "viem";
import { CheckCircle2, ChevronDown, Search, ShieldAlert, ShieldCheck, Wallet } from "lucide-react";
import { PageTitle, Panel, PanelHeader, StatusPill } from "@/components/protocol/ProtocolUI";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { openWalletPicker } from "@/lib/wallet/client";
import { stakingConnection } from "@/lib/staking/pool-transactions";
import { stakingNetwork } from "@/lib/protocol/links";
import { ROLES, isContract, isPaused, rolesHeld, savedGovernanceAddresses, type RoleKey } from "@/lib/staking/roles";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const roleLabel = (k: RoleKey) => ROLES.find(r => r.key === k)?.label ?? k;

/** Who can change the protocol, checked live on the contract. No role editing here by design. */
export default function AdminGovernancePage() {
  const saved = savedGovernanceAddresses();
  const wallet = useWalletConnection();
  const connection = stakingConnection();
  const explorer = stakingNetwork(connection ? connection.chain.id : null).explorer;
  const [held, setHeld] = useState<Map<Address, RoleKey[]> | null>(null);
  const [contracts, setContracts] = useState<Set<Address>>(new Set());
  const [paused, setPaused] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [lookup, setLookup] = useState(""), [lookupResult, setLookupResult] = useState<{ address: Address; roles: RoleKey[] } | null>(null), [lookupError, setLookupError] = useState("");
  const account = wallet.account && isAddress(wallet.account) ? getAddress(wallet.account) : null;

  const load = useCallback(async () => {
    if (!stakingConnection()) return;
    try {
      const addresses = [...savedGovernanceAddresses().map(s => s.address), ...(account ? [account] : [])];
      const [roles, p, codes] = await Promise.all([rolesHeld(addresses), isPaused(), Promise.all(addresses.map(async a => [a, await isContract(a)] as const))]);
      setError(""); setHeld(roles); setPaused(p); setContracts(new Set(codes.filter(([, c]) => c).map(([a]) => a)));
    } catch (e) { setError(e instanceof Error ? e.message : "Could not read the contract."); }
  }, [account]);
  useEffect(() => { void load(); }, [load]);

  async function check() {
    setLookupError(""); setLookupResult(null);
    if (!isAddress(lookup.trim())) { setLookupError("Enter a full 0x address."); return; }
    try { const a = getAddress(lookup.trim()); setLookupResult({ address: a, roles: (await rolesHeld([a])).get(a) ?? [] }); }
    catch (e) { setLookupError(e instanceof Error ? e.message : "Could not check that address."); }
  }

  const holdersOf = (key: RoleKey) => [
    ...saved.filter(s => held?.get(s.address)?.includes(key)).map(s => ({ label: s.label, address: s.address })),
    ...(account && held?.get(account)?.includes(key) && !saved.some(s => s.address === account) ? [{ label: "Your wallet", address: account }] : []),
  ];
  const yourRoles = account ? held?.get(account) ?? null : null;
  const link = (a: string) => explorer ? <a href={`${explorer}/address/${a}`} target="_blank" rel="noopener noreferrer" className="font-mono text-[11px] text-black/60 underline-offset-2 hover:underline">{short(a)}</a> : <span className="font-mono text-[11px] text-black/60">{short(a)}</span>;

  return <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
    <PageTitle eyebrow="Protocol safety" title="Governance." copy="Who can change the protocol, checked live on the staking contract." />
    {!connection ? <p className="mt-8 rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/65">The staking contract is not configured on this server, so there is nothing to check yet.</p> : <>
      {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-800">{error}</p>}

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5"><p className="text-xs font-semibold text-black/60">Protocol</p><p className="mt-2 flex items-center gap-2 text-xl font-semibold">{paused === null ? "Checking…" : paused ? <><ShieldAlert size={20} className="text-red-700" />Paused</> : <><ShieldCheck size={20} className="text-emerald-700" />Running</>}</p><p className="mt-1 text-xs text-black/60">{paused ? "New stakes are stopped. Unpausing goes through the timelock." : "Deposits and claims work normally."}</p></div>
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5"><p className="text-xs font-semibold text-black/60">Your transaction wallet</p>{account ? <><p className="mt-2 text-xl font-semibold">{short(account)}</p><p className="mt-1 text-xs text-black/60">{yourRoles === null ? "Checking…" : yourRoles.length ? `Can act as: ${yourRoles.map(roleLabel).join(", ")}` : "No roles on this contract"}</p></> : <><p className="mt-2 text-xl font-semibold">Not connected</p><button type="button" onClick={openWalletPicker} className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-[#ad7058] hover:text-black"><Wallet size={13} />Connect to see what it can do</button></>}</div>
        <div className="rounded-2xl border border-black/[0.08] bg-white p-5"><p className="text-xs font-semibold text-black/60">Network</p><p className="mt-2 text-xl font-semibold">{stakingNetwork(connection.chain.id).label}</p><p className="mt-1 text-xs text-black/60">Staking contract {link(connection.address)}</p></div>
      </section>

      {account && yourRoles && !yourRoles.length && <div className="mt-5 rounded-2xl border border-[#c9846a]/30 bg-[#fbf3ee] p-5 text-sm leading-6"><p className="font-semibold">Your wallet can’t change vaults directly. That is expected.</p><p className="mt-1 text-black/70">On the audited setup, vault and reward changes are made by the Governance Safe, which needs its owners to sign. When a change on the Vaults page is refused, the page shows the exact transaction to submit through the Safe.</p></div>}

      <section className="mt-6"><Panel>
        <PanelHeader eyebrow="Live on the contract" title="Who can do what" action={<button type="button" onClick={() => void load()} className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold">Refresh</button>} />
        <ul className="divide-y divide-black/[0.06]">{ROLES.map(r => {
          const holders = holdersOf(r.key);
          return <li key={r.key} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_1.1fr] md:px-6">
            <div><p className="text-sm font-semibold">{r.label}</p><p className="mt-0.5 text-xs leading-5 text-black/60">{r.does}</p></div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">{held === null ? <span className="text-xs text-black/55">Checking…</span> : holders.length ? holders.map(h => <span key={h.address} className="inline-flex items-center gap-2 rounded-full border border-emerald-700/15 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900"><CheckCircle2 size={13} />{h.label}{contracts.has(h.address) ? " (contract)" : ""} {link(h.address)}</span>) : <span className="text-xs text-black/60">{saved.length ? "None of the saved addresses" : "Save your governance addresses to see this"}</span>}</div>
          </li>;
        })}</ul>
      </Panel></section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel>
          <PanelHeader eyebrow="Any address" title="Check a wallet or Safe" />
          <div className="p-5 md:p-6">
            <div className="flex gap-2"><input value={lookup} onChange={e => setLookup(e.target.value)} onKeyDown={e => { if (e.key === "Enter") void check(); }} placeholder="0x…" className="min-w-0 flex-1 rounded-xl border border-black/10 bg-[#fbfaf9] px-4 py-3 font-mono text-sm outline-none focus:border-black/30" /><button type="button" onClick={() => void check()} className="inline-flex items-center gap-2 rounded-xl bg-[#07090b] px-4 text-sm font-semibold text-white"><Search size={15} />Check</button></div>
            {lookupError && <p role="alert" className="mt-3 text-xs text-red-700">{lookupError}</p>}
            {lookupResult && <p className="mt-4 text-sm">{short(lookupResult.address)} {lookupResult.roles.length ? <>can act as <strong>{lookupResult.roles.map(roleLabel).join(", ")}</strong>.</> : "holds no roles on this contract."}</p>}
          </div>
        </Panel>
        <Panel>
          <PanelHeader eyebrow="Saved addresses" title="Your governance addresses" />
          <div className="p-5 md:p-6">{saved.length ? <ul className="space-y-2">{saved.map(s => <li key={s.address} className="flex items-center justify-between gap-3 text-sm"><span className="font-semibold">{s.label}</span>{link(s.address)}</li>)}</ul> : <div className="text-sm leading-6 text-black/70"><p>No addresses saved yet. Add them to the server’s <code className="rounded bg-black/[0.05] px-1">.env.local</code> so this page can name them, then rebuild:</p><pre className="mt-3 overflow-x-auto rounded-xl bg-[#07090b] p-3 text-[11px] leading-5 text-white/85">NEXT_PUBLIC_GOVERNANCE_ADDRESSES=&quot;Governance Safe=0x…,Timelock=0x…,Emergency wallet=0x…&quot;</pre><p className="mt-2 text-xs text-black/55">Public addresses only. Never add private keys or seed phrases.</p></div>}</div>
        </Panel>
      </section>

      <details className="group mt-6 rounded-2xl border border-black/[0.08] bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold md:px-6 [&::-webkit-details-marker]:hidden">How Arvo is meant to be set up<ChevronDown size={16} className="text-black/50 transition group-open:rotate-180" /></summary>
        <div className="border-t border-black/[0.06] px-5 py-5 text-sm leading-6 text-black/70 md:px-6">
          <ul className="space-y-2">
            <li><strong>Governance Safe</strong> (needs its owners to sign): Vault manager and Reward manager.</li>
            <li><strong>Timelock</strong> (changes wait at least 24 hours): Admin and Upgrader.</li>
            <li><strong>Emergency wallet</strong>: Pauser only, so it can stop new stakes fast but cannot move funds.</li>
            <li><strong>Deployment wallet</strong>: no roles once the handoff is complete.</li>
          </ul>
          <p className="mt-3 text-xs text-black/60"><StatusPill>By design</StatusPill> <span className="ml-1">This console cannot grant or remove roles. Role changes go through the Safe and the timelock.</span></p>
        </div>
      </details>
    </>}
  </div>;
}

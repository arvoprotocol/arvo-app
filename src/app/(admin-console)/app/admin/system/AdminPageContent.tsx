"use client";
import {useAdminContractData} from "@/hooks/useAdminContractData";
import {zeroAddress} from "viem";
import {PageTitle,Panel,PanelHeader,StatCard,StatusPill} from "@/components/protocol/ProtocolUI";
export default function AdminSystemPage(){
 const {data,error,loading,refresh}=useAdminContractData();
 const network=data?(data.chainId===46630?"Robinhood Testnet":data.chainId===4663?"Robinhood Mainnet":`Chain ${data.chainId}`):"Unverified";
 return <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
 <PageTitle eyebrow="Protocol infrastructure" title="System." copy="Inspect the network, proxy implementation, assets and protocol state directly from the configured chain."/>
 <div className="mt-6 flex flex-wrap items-center gap-3"><button type="button" disabled={loading} onClick={refresh} className="rounded-xl border border-black/10 px-4 py-3 text-xs font-semibold disabled:opacity-40">{loading?"Reading contract…":"Refresh verification"}</button>{data&&<span className="text-xs text-black/60">Snapshot block {data.block.toLocaleString()}</span>}</div>
 {error&&<p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
 <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 <StatCard label="Network" value={network} detail="RPC network checked against configuration"/>
 <StatCard label="Chain ID" value={data?String(data.chainId):"–"}/>
 <StatCard label="Staking proxy" value={data?"Connected":"Unverified"} detail="Proxy and implementation code checked"/>
 <StatCard label="Protocol state" value={data?(data.paused?"Paused":"Not paused"):"–"}/>
 </section>
 <section className="mt-8 grid gap-5 xl:grid-cols-2">
 <Panel><PanelHeader eyebrow="Deployment" title="Staking contract" action={<StatusPill>{data?"Read verified":"Awaiting data"}</StatusPill>}/><div className="px-5 md:px-6">
 <Row label="Proxy address" value={data?.proxy??"–"}/><Row label="Implementation" value={data?.implementation??"–"}/><Row label="Next pool ID" value={data?String(data.nextVaultId):"–"}/><Row label="Next position ID" value={data?data.nextPositionId.toLocaleString():"–"}/><Row label="Enabled, non-finalized pools" value={data?.enabledPools?.toLocaleString()??"Unavailable"}/><Row label="Price oracle" value={data?(data.oracle.toLowerCase()===zeroAddress?"Not configured":data.oracle):"–"}/>
 </div></Panel>
 <Panel><PanelHeader eyebrow="Assets" title="Token configuration"/><div className="px-5 md:px-6">{(["ARVO","USDG"] as const).map(asset=><div key={asset}><Row label={`${asset} token`} value={data?.[asset].token??"–"}/><Row label={`${asset} decimals`} value={data?String(data[asset].decimals):"–"}/><Row label={`${asset} protected balances`} value={data?(data[asset].solvent?"Covered":"Reserve shortfall"):"–"}/></div>)}</div></Panel>
 </section>
 <Panel className="mt-8"><PanelHeader eyebrow="Governance" title="Handoff pending"/><div className="p-5 md:p-6"><p className="text-sm leading-6 text-black/55">The Safe and Timelock handoff has not been verified by this page. A working RPC, deployed proxy and covered balances do not establish that governance is ready for mainnet.</p><p className="mt-3 text-xs leading-5 text-black/60">Run the existing governance audit tool against the final deployment manifest before treating the handoff as complete. Token address reads identify the configured assets; they do not certify token authenticity or mainnet readiness.</p></div></Panel>
 </div>;
}
function Row({label,value}:{label:string;value:string}){return <div className="flex items-start justify-between gap-5 border-b border-black/[0.06] py-4 last:border-b-0"><span className="text-xs text-black/55">{label}</span><span className="max-w-[65%] break-all text-right text-xs font-semibold">{value}</span></div>;}

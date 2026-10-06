import Link from "next/link";
import {ArrowRight} from "lucide-react";
import {PageTitle} from "@/components/protocol/ProtocolUI";
import {PublishedVaults} from "@/components/protocol/PublishedVaults";
import {OverviewWalletProvider,OverviewSummary,OverviewPositions,OverviewActions} from "@/components/protocol/OverviewWallet";

export default async function OverviewPage(){
 return <OverviewWalletProvider><div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
  <PageTitle eyebrow="Overview" title="Your Arvo." copy="Your wallet, vaults and staking journey."/>
  <OverviewSummary/>
  <section className="mt-6" aria-label="Your next steps"><OverviewActions/></section>
  <section className="mt-10" aria-label="Staking vaults"><div className="mb-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#ad7058]">Staking vaults</p><h2 className="mt-1 text-3xl font-semibold tracking-[-0.045em]">Choose your vault.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-black/45">Explore upcoming vaults and compare available deposit and reward options.</p></div><Link href="/app/stake" className="inline-flex items-center gap-2 text-sm font-semibold text-black/50 hover:text-black">Compare vaults<ArrowRight size={14}/></Link></div><PublishedVaults/></section>
  <section className="mt-10"><OverviewPositions/></section>
  <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.07] pt-5"><p className="text-xs text-black/45">Stay connected with the Arvo community.</p><Link href="/app/community" className="inline-flex items-center gap-2 text-xs font-semibold text-[#ad7058]">Community updates<ArrowRight size={13}/></Link></div>
 </div></OverviewWalletProvider>;
}

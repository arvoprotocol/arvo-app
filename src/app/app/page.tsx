import Link from "next/link";
import {ArrowRight} from "lucide-react";
import {PageTitle} from "@/components/protocol/ProtocolUI";
import {OverviewVaults} from "@/components/protocol/OverviewVaults";
import {OverviewProjects} from "@/components/protocol/OverviewProjects";
import {OverviewWalletProvider,OverviewSummary,OverviewPositions,OverviewActions} from "@/components/protocol/OverviewWallet";

export default async function OverviewPage(){
 return <OverviewWalletProvider><div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
  <PageTitle eyebrow="Overview" title="Your Arvo." copy="Your wallet, vaults and staking journey."/>
  <OverviewVaults/>
  <OverviewProjects/>
  <OverviewSummary/>
  <section className="mt-6" aria-label="Your next steps"><OverviewActions/></section>
  <section className="mt-10"><OverviewPositions/></section>
  <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.07] pt-5"><p className="text-xs text-black/45">Stay connected with the Arvo community.</p><Link href="/app/community" className="inline-flex items-center gap-2 text-xs font-semibold text-[#ad7058]">Community updates<ArrowRight size={13}/></Link></div>
 </div></OverviewWalletProvider>;
}

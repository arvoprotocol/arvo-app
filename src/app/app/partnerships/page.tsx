import type { Metadata } from "next";
import { Building2, Handshake, LandPlot } from "lucide-react";
import { PageTitle } from "@/components/protocol/ProtocolUI";
import { PartnershipEnquiryForm } from "@/components/protocol/PartnershipEnquiry";

export const metadata: Metadata = { title: "Private Partnerships | Arvo" };

const areas = [
  { icon: LandPlot, title: "Full-site acquisitions", copy: "Acquire or co-acquire whole sites alongside the Arvo operating team, from purchase through planning, subdivision and sale." },
  { icon: Building2, title: "Co-development", copy: "Work with us on consented and in-planning developments, from groundworks to completion." },
  { icon: Handshake, title: "Land and project partnerships", copy: "Landowners and developers can bring sites to Arvo and agree a structure that suits the project." },
];

const steps = [
  ["Enquire", "Tell us who you are and what you’re looking for."],
  ["Introductory call", "A member of the team gets in touch to discuss fit, timing and scale."],
  ["Due diligence", "Both sides review the opportunity before anything is agreed."],
  ["Private agreement", "Any arrangement is documented directly between the parties."],
];

export default function PartnershipsPage() {
  return <div className="px-6 py-10 sm:px-8 lg:px-12 lg:py-12"><div className="mx-auto max-w-[1720px] space-y-9 lg:space-y-11">
    <PageTitle eyebrow="Private partnerships · Enquiry only" title="Partner with Arvo" copy="For family offices, institutions, developers and landowners looking at larger land opportunities with the Arvo operating team. Arranged privately, by enquiry only." />
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,560px)] xl:gap-10">
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">{areas.map(({ icon: Icon, title, copy }) => <div key={title} className="rounded-[22px] border border-black/[.07] bg-white p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f8ede6] text-[#ad7058]"><Icon size={20} /></span>
          <h2 className="mt-4 text-lg font-semibold tracking-[-0.02em]">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-black/55">{copy}</p>
        </div>)}</div>
        <div className="rounded-[22px] border border-black/[.07] bg-white p-6 md:p-7">
          <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#ad7058]">How it works</p>
          <ol className="mt-5 grid gap-5 sm:grid-cols-2">{steps.map(([title, copy], i) => <li key={title} className="flex gap-3.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#07090b] text-xs font-semibold text-white">{i + 1}</span>
            <span><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-sm leading-6 text-black/55">{copy}</span></span>
          </li>)}</ol>
        </div>
        <p className="rounded-[18px] bg-[#f3e9e2] px-5 py-4 text-xs leading-5 text-black/55">Private partnerships are separate from Arvo’s onchain vaults and aren’t available through this app. Nothing on this page is an offer or invitation to invest. Any arrangement is subject to eligibility, due diligence, applicable law and a written agreement between the parties.</p>
      </div>
      <div className="xl:sticky xl:top-28 xl:self-start"><PartnershipEnquiryForm /></div>
    </div>
  </div></div>;
}

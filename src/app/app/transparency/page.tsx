import type { Metadata } from "next";
import { PageTitle } from "@/components/protocol/ProtocolUI";
import { TransparencyView } from "@/components/protocol/TransparencyView";
import { readTransparency } from "@/lib/protocol/transparency";

export const metadata: Metadata = { title: "Transparency & security", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AppTransparencyPage() {
  const t = await readTransparency();
  return <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
    <PageTitle eyebrow="Transparency" title="Verify everything." copy={`Audits, safeguards, contract addresses and live reserves, read directly from ${t.network}.`} />
    <div className="mt-8 overflow-hidden rounded-[28px] bg-[#07090b] pb-4 text-white">
      <TransparencyView t={t} inner="px-6 md:px-10" />
    </div>
  </div>;
}

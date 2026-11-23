import { PageTitle } from "@/components/protocol/ProtocolUI";
import { PartnerAllocation } from "@/components/protocol/PartnerAllocation";

export const metadata = { title: "Partner allocation | Arvo", referrer: "no-referrer" as const };

export default function AllocationPage() {
  return <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
    <PageTitle eyebrow="Strategic Partners" title="Your ARVO allocation" copy="For Arvo Strategic Partners: your allocation, how it was worked out and when each release is due." />
    <PartnerAllocation />
  </div>;
}

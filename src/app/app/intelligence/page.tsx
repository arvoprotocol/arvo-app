import type { Metadata } from "next";
import { IntelligenceExplorer } from "@/components/protocol/IntelligenceExplorer";
import { intelligenceProjects } from "@/lib/intelligence/data";

export const metadata: Metadata = { title: "Arvo Intelligence (beta)", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

// Access is enforced by the /app layout (invite code during early access,
// everyone after APP_PUBLIC_ACCESS). Only admin-enabled, published projects show.
export default async function IntelligencePage() {
  const projects = (await intelligenceProjects()).map(p => ({ slug: p.slug, title: p.title, location: p.location, titleNumber: p.titleNumber, image: p.image, status: p.status, statusLabel: p.statusLabel, stage: p.stage, acres: p.acres, plots: p.plots, plotsSold: p.plotsSold, topics: p.topics }));
  return <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
    <IntelligenceExplorer projects={projects} />
  </div>;
}

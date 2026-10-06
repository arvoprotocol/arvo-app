import type { Metadata } from "next";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/layout/Footer";
import { LaunchHero } from "@/components/sections/LaunchHero";
import { HomeIntro } from "@/components/sections/HomeIntro";
import { OperatingModel } from "@/components/sections/OperatingModel";
import { Flywheel } from "@/components/sections/Flywheel";
import { RoadmapPreview } from "@/components/sections/RoadmapPreview";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { TreasuryToken } from "@/components/sections/TreasuryToken";

export const metadata: Metadata = {
  title: "Launch Preview",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LaunchPreview() {
  return (
    <main>
      <div className="noise" />
      <Header launch />
      <LaunchHero />
      <HomeIntro />
      <OperatingModel />
      <Flywheel />
      <TreasuryToken />
      <RoadmapPreview />
      <FinalCTA />
      <Footer />
    </main>
  );
}

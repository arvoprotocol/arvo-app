import {appUrl} from "@/lib/protocol/app-url";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Arvo Vaults",
  description: "Explore Arvo vaults, fixed rewards and staking terms.",
  openGraph: {
    type: "website",
    siteName: "Arvo",
    title: "Arvo Vaults",
    description: "Explore Arvo vaults, fixed rewards and staking terms.",
    url: appUrl("/app/stake"),
    images: [{
      url: "https://arvoprotocol.com/platform-og.jpg",
      alt: "Arvo staking platform",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Arvo Vaults",
    description: "Explore Arvo vaults, fixed rewards and staking terms.",
    images: ["https://arvoprotocol.com/platform-og.jpg"],
  },
};

export default function StakeLayout({children}: {children: ReactNode}) {
  return children;
}

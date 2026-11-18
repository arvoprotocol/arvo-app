import type { Metadata } from "next";

const description =
  "Explore Arvo fixed-term vaults for $ARVO and USDG, with defined terms, maturity dates and reward structures.";

export const metadata: Metadata = {
  title: "Vaults & Staking",
  description,
  alternates: {
    canonical: "/vaults",
  },
  openGraph: {
    type: "website",
    url: "/vaults",
    siteName: "Arvo",
    title: "Vaults & Staking | Arvo",
    description,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Arvo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vaults & Staking | Arvo",
    description,
    images: ["/og-image.jpg"],
  },
};

export default function VaultsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

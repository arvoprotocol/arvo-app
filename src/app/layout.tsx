import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const satoshi = localFont({
  src: "../../public/fonts/satoshi/Satoshi-Variable.ttf",
  variable: "--font-satoshi",
  weight: "300 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://arvoprotocol.com"),

  title: {
    default: "Arvo | Real Businesses. On-Chain Participation.",
    template: "%s | Arvo",
  },

  description:
    "Arvo connects on-chain participation with real operating businesses, disciplined capital allocation and a growing protocol Treasury.",

  applicationName: "Arvo",

  other: {
    "virtual-protocol-site-verification": "a17ef60aa7c58acab83ce1dd3e51c04f",
  },

  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    siteName: "Arvo",
    title: "Arvo | Real Businesses. On-Chain Participation.",
    description:
      "Arvo connects on-chain participation with real operating businesses, disciplined capital allocation and a growing protocol Treasury.",
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
    title: "Arvo | Real Businesses. On-Chain Participation.",
    description:
      "Arvo connects on-chain participation with real operating businesses, disciplined capital allocation and a growing protocol Treasury.",
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={satoshi.variable}>
      <body>{children}</body>
    </html>
  );
}

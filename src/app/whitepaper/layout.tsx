import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Whitepaper",
  robots: {
    index: false,
    follow: true,
  },
};

export default function WhitepaperLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

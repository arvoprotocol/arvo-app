import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transparency",
  robots: {
    index: false,
    follow: true,
  },
};

export default function TransparencyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

import type { Metadata } from "next";

import { AppAccessGate } from "@/components/protocol/AppAccessGate";
import { AppShellRouter } from "@/components/protocol/AppShellRouter";
import { hasAppAccess, hasAppAccessError } from "@/lib/app-access/session";

export const metadata: Metadata = {
  title: "Arvo App",
  description:
    "Access Arvo vaults, manage positions, view rewards and follow the Arvo Treasury.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const access = await hasAppAccess();

  if (!access) {
    const invalid = await hasAppAccessError();
    return <AppAccessGate invalid={invalid} />;
  }

  return <AppShellRouter>{children}</AppShellRouter>;
}

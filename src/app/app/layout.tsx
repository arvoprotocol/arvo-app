import type { Metadata } from "next";

import { AppAccessGate } from "@/components/protocol/AppAccessGate";
import { AppShellRouter } from "@/components/protocol/AppShellRouter";
import { hasAppAccess, hasAppAccessError } from "@/lib/app-access/session";
import { headers } from "next/headers";
import { JurisdictionNotice, RestrictedRegion } from "@/components/protocol/JurisdictionNotice";
import { isRestrictedCountry } from "@/lib/legal/jurisdictions";

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
  // Optional location blocking (GEO_BLOCK=1) using the CDN country header,
  // e.g. Cloudflare's cf-ipcountry. Off by default; the notice always applies.
  if (process.env.GEO_BLOCK === "1") {
    const h = await headers();
    if (isRestrictedCountry(h.get("cf-ipcountry") || h.get("x-vercel-ip-country") || h.get("x-country-code"))) return <RestrictedRegion />;
  }

  const access = await hasAppAccess();

  if (!access) {
    const invalid = await hasAppAccessError();
    return <AppAccessGate invalid={invalid} />;
  }

  return <><JurisdictionNotice /><AppShellRouter>{children}</AppShellRouter></>;
}

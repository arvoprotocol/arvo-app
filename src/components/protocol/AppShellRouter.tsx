"use client";
import {internalAppPath, appPath} from "@/lib/protocol/app-url";

import { usePathname } from "next/navigation";
import { ProtocolShell } from "@/components/protocol/ProtocolShell";

export function AppShellRouter({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = internalAppPath(usePathname());

  const isAdmin =
    pathname === "/app/admin" || pathname.startsWith("/app/admin/");

  if (isAdmin) {
    return <>{children}</>;
  }

  return <ProtocolShell>{children}</ProtocolShell>;
}

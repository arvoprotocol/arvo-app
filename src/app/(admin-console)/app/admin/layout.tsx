import type { Metadata } from "next";

import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminSession } from "@/lib/admin/session";

export const metadata: Metadata = {
  title: "Admin | Arvo Protocol",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAdminSession();

  if (!session) {
    return <AdminLogin />;
  }

  return <AdminShell>{children}</AdminShell>;
}

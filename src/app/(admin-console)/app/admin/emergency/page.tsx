import AdminPageContent from "./AdminPageContent";
import { getAdminSession } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!await getAdminSession()) return null;
  return <AdminPageContent />;
}

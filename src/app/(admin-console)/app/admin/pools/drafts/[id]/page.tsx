import { notFound } from "next/navigation";
import { getAdminSession } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma";
import { serializeDraft } from "@/lib/staking/vault-draft-data";
import CreatePoolPage from "../../create/AdminPageContent";
export const dynamic = "force-dynamic";
export default async function EditVaultDraft({ params }: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) return null;
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id) || Number(id) > 2147483647) notFound();
  const row = await prisma.stakingVaultDraft.findUnique({ where: { id: Number(id) } });
  if (!row) notFound();
  return <CreatePoolPage key={`${row.id}-${row.revision}`} draft={serializeDraft(row)} />;
}

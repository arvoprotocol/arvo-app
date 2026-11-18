import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin/session';
import { WaitlistManager } from './WaitlistManager';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminWaitlistPage() {
  // Authenticate before reading or serialising any subscriber information.
  if (!await getAdminSession()) return null;
  const signups = await prisma.platformSignup.findMany({
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    select: { id: true, type: true, contact: true, source: true, createdAt: true, notifiedAt: true },
  });
  return <WaitlistManager signups={signups.map(signup => ({
    ...signup,
    createdAt: signup.createdAt.toISOString(),
    notifiedAt: signup.notifiedAt?.toISOString() ?? null,
  }))} />;
}

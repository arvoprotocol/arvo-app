import { hasAppAccess } from "@/lib/app-access/session";
import { getAdminSession } from "@/lib/admin/session";
import { NextResponse } from "next/server";
import { publicDraftPreviews, publicPoolTitles } from "@/lib/staking/vault-draft-data";
export const dynamic = "force-dynamic";
export async function GET() {
  try { if (!await hasAppAccess() && !await getAdminSession()) return NextResponse.json({ error: "Sign in to the app to view previews." }, { status: 401 }); return NextResponse.json({ previews: await publicDraftPreviews(), poolTitles: await publicPoolTitles() }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return NextResponse.json({ error: "Opening soon previews are temporarily unavailable." }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}

import { NextResponse } from "next/server";
import { hasAppAccess } from "@/lib/app-access/session";
import { getAdminSession } from "@/lib/admin/session";
import { intelligenceProjects } from "@/lib/intelligence/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Projects the floating assistant can open. Same access rule as asking a question. */
export async function GET() {
  if (!await hasAppAccess() && !await getAdminSession()) return NextResponse.json({ error: "Enter the app first." }, { status: 401 });
  try {
    const projects = (await intelligenceProjects()).map(p => ({
      slug: p.slug, title: p.title, location: p.location, image: p.image ?? null, stage: p.stage, acres: p.acres, plots: p.plots,
      documents: p.documentCount,
    }));
    return NextResponse.json({ projects }, { headers: { "Cache-Control": "private, max-age=60" } });
  } catch {
    return NextResponse.json({ error: "Projects are unavailable right now." }, { status: 503 });
  }
}

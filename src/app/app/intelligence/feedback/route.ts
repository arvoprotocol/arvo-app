import { NextResponse } from "next/server";
import { hasAppAccess } from "@/lib/app-access/session";
import { getAdminSession } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma";
import { limitRequest, privateKey, readJson, RequestError, requireSameOrigin, securityFailure } from "@/lib/security/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Rate an answer (+1 / -1) with an optional comment. Only the visitor who
// asked (same hashed network identity) can rate it.
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    if (!await hasAppAccess() && !await getAdminSession()) return NextResponse.json({ error: "Enter the app first." }, { status: 401 });
    await limitRequest(request, "intelligence-feedback", 60);
    const body = await readJson(request, 4096);
    const id = Number(body.id), rating = Number(body.rating);
    if (!Number.isSafeInteger(id) || id < 1 || (rating !== 1 && rating !== -1)) throw new RequestError("Invalid feedback.");
    const feedback = typeof body.comment === "string" ? body.comment.trim().slice(0, 1000) || null : null;
    const ip = (request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown").trim().slice(0, 120);
    const updated = await prisma.intelligenceQuestion.updateMany({
      where: { id, actorHash: privateKey(`intelligence:${ip}`) },
      data: { rating, feedback },
    });
    if (updated.count !== 1) throw new RequestError("Answer not found.", 404);
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return securityFailure(error);
  }
}

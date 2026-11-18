import { NextResponse } from "next/server";
import { hasAppAccess } from "@/lib/app-access/session";
import { getAdminSession } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma";
import { askClaude, IntelligenceUnavailable, retrieveSources } from "@/lib/intelligence/answer";
import { intelligenceContext } from "@/lib/intelligence/data";
import { limitRequest, privateKey, readJson, RequestError, requireSameOrigin, securityFailure } from "@/lib/security/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAILY_PER_VISITOR = Math.max(1, Number(process.env.INTELLIGENCE_DAILY_LIMIT) || 10);

// Early access: only people with app access (invite code/password). After the
// public release APP_PUBLIC_ACCESS opens the app, and this route, to everyone.
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    if (!await hasAppAccess() && !await getAdminSession()) return NextResponse.json({ error: "Enter the app with your invitation code first." }, { status: 401 });
    const body = await readJson(request, 4096);
    const slug = typeof body.slug === "string" ? body.slug.trim() : "";
    const question = typeof body.question === "string" ? body.question.trim().replace(/\s+/g, " ") : "";
    if (!/^[a-z0-9-]{1,120}$/.test(slug)) throw new RequestError("Choose a project.");
    if (question.length < 3 || question.length > 500) throw new RequestError("Ask a question of 3 to 500 characters.");
    await limitRequest(request, "intelligence-ask", DAILY_PER_VISITOR, 86_400_000);

    const context = await intelligenceContext(slug);
    if (!context) throw new RequestError("This project is not available in Arvo Intelligence.", 404);
    const sources = retrieveSources(question, context.record, context.chunks);
    const result = await askClaude(context.title, question, sources);

    const ip = (request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown").trim().slice(0, 120);
    const row = await prisma.intelligenceQuestion.create({
      data: {
        projectId: context.projectId, actorHash: privateKey(`intelligence:${ip}`), question,
        answerJson: JSON.stringify(result.answer), model: result.model,
        inputTokens: result.inputTokens, outputTokens: result.outputTokens,
      },
      select: { id: true },
    });
    return NextResponse.json({ id: row.id, answer: result.answer }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof IntelligenceUnavailable) return NextResponse.json({ error: error.message }, { status: 503, headers: { "Cache-Control": "no-store" } });
    return securityFailure(error);
  }
}

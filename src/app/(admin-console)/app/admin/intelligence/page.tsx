import { getAdminSession } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma";
import { IntelligenceAdmin } from "./IntelligenceAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function thirtyDaysAgo() { return new Date(Date.now() - 30 * 86_400_000); }

export default async function AdminIntelligencePage() {
  if (!await getAdminSession()) return null;
  const since = thirtyDaysAgo();
  const [projects, features, documents, questions, usage] = await Promise.all([
    prisma.project.findMany({ select: { id: true, title: true, publishStatus: true }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
    prisma.intelligenceProject.findMany({ select: { projectId: true, enabled: true } }),
    prisma.intelligenceDocument.findMany({ orderBy: [{ projectId: "asc" }, { createdAt: "desc" }], select: { id: true, projectId: true, title: true, docType: true, documentDate: true, source: true, pages: true, status: true, createdAt: true, _count: { select: { chunks: true } } } }),
    prisma.intelligenceQuestion.findMany({ orderBy: { createdAt: "desc" }, take: 40, select: { id: true, projectId: true, question: true, answerJson: true, rating: true, feedback: true, createdAt: true } }),
    prisma.intelligenceQuestion.aggregate({ where: { createdAt: { gte: since } }, _count: { _all: true }, _sum: { inputTokens: true, outputTokens: true } }),
  ]);
  const enabled = new Set(features.filter(f => f.enabled).map(f => f.projectId));
  return <IntelligenceAdmin
    configured={Boolean(process.env.ANTHROPIC_API_KEY)}
    model={process.env.INTELLIGENCE_MODEL || "claude-sonnet-5-5"}
    projects={projects.map(p => ({ ...p, enabled: enabled.has(p.id) }))}
    documents={documents.map(d => ({ id: d.id, projectId: d.projectId, title: d.title, docType: d.docType, source: d.source, pages: d.pages, status: d.status, chunks: d._count.chunks, documentDate: d.documentDate?.toISOString().slice(0, 10) ?? null, createdAt: d.createdAt.toISOString() }))}
    questions={questions.map(q => {
      let summary = "";
      try { summary = (JSON.parse(q.answerJson) as { summary?: string }).summary ?? ""; } catch { summary = ""; }
      return { id: q.id, projectId: q.projectId, question: q.question, summary, rating: q.rating, feedback: q.feedback, createdAt: q.createdAt.toISOString() };
    })}
    usage={{ questions: usage._count._all, inputTokens: usage._sum.inputTokens ?? 0, outputTokens: usage._sum.outputTokens ?? 0 }}
  />;
}

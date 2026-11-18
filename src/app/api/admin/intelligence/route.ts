import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma";
import { DOC_TYPES } from "@/lib/intelligence/answer";
import { extractPdf, ExtractError, MAX_UPLOAD_BYTES } from "@/lib/intelligence/extract";
import { limitRequest, readJson, RequestError, requireSameOrigin, securityFailure } from "@/lib/security/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin: upload a PDF (multipart) or enable a project / delete a document (JSON).
// Uploaded PDFs are read in memory; only their extracted text is stored.
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    await limitRequest(request, "intelligence-admin", 60);
    if (!await getAdminSession()) return NextResponse.json({ error: "Admin authentication required." }, { status: 401 });
    const type = request.headers.get("content-type") || "";

    if (type.startsWith("multipart/form-data")) {
      const length = Number(request.headers.get("content-length") || 0);
      if (length > MAX_UPLOAD_BYTES + 64_000) throw new RequestError("PDF is larger than 20 MB.", 413);
      const form = await request.formData();
      const projectId = Number(form.get("projectId"));
      const title = String(form.get("title") || "").trim().slice(0, 160);
      const docType = String(form.get("docType") || "");
      const dateValue = String(form.get("documentDate") || "").trim();
      const source = String(form.get("source") || "").trim().slice(0, 300) || null;
      const file = form.get("file");
      if (!Number.isSafeInteger(projectId) || !await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } })) throw new RequestError("Choose a project.");
      if (!title) throw new RequestError("Enter a document title.");
      if (!(docType in DOC_TYPES)) throw new RequestError("Choose a document type.");
      if (dateValue && !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) throw new RequestError("Enter the document date as YYYY-MM-DD.");
      if (!(file instanceof File)) throw new RequestError("Attach a PDF.");
      if (file.size > MAX_UPLOAD_BYTES) throw new RequestError("PDF is larger than 20 MB.", 413);

      const extracted = await extractPdf(new Uint8Array(await file.arrayBuffer()));
      const existing = await prisma.intelligenceDocument.findUnique({ where: { projectId_sha256: { projectId, sha256: extracted.sha256 } }, select: { id: true } });
      if (existing) throw new RequestError("This exact PDF is already uploaded for this project.", 409);
      const doc = await prisma.intelligenceDocument.create({
        data: {
          projectId, title, docType, source, sha256: extracted.sha256, pages: extracted.pages, status: extracted.status,
          documentDate: dateValue ? new Date(`${dateValue}T00:00:00Z`) : null,
          chunks: { create: extracted.chunks.map(c => ({ page: c.page, text: c.text })) },
        },
        select: { id: true, status: true, pages: true },
      });
      return NextResponse.json({ ok: true, document: { ...doc, chunks: extracted.chunks.length } });
    }

    const body = await readJson(request, 4096);
    if (body.action === "enable") {
      const projectId = Number(body.projectId);
      if (!Number.isSafeInteger(projectId)) throw new RequestError("Choose a project.");
      const enabled = body.enabled === true;
      await prisma.intelligenceProject.upsert({ where: { projectId }, create: { projectId, enabled }, update: { enabled } });
      return NextResponse.json({ ok: true });
    }
    if (body.action === "delete") {
      const documentId = Number(body.documentId);
      if (!Number.isSafeInteger(documentId)) throw new RequestError("Choose a document.");
      const [, deleted] = await prisma.$transaction([
        prisma.intelligenceChunk.deleteMany({ where: { documentId } }),
        prisma.intelligenceDocument.deleteMany({ where: { id: documentId } }),
      ]);
      if (deleted.count !== 1) throw new RequestError("Document not found.", 404);
      return NextResponse.json({ ok: true });
    }
    throw new RequestError("Unknown action.");
  } catch (error) {
    if (error instanceof ExtractError) return NextResponse.json({ error: error.message }, { status: 400 });
    return securityFailure(error);
  }
}

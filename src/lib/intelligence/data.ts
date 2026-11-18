import "server-only";
import { prisma } from "@/lib/prisma";
import { displayProject, projectPlotInclude } from "@/lib/projects/data";
import type { Project } from "@/components/protocol/ProjectUI";
import { DOC_TYPES, type DocType } from "./answer";

export type IntelligenceProjectSummary = {
  slug: string; title: string; location: string; titleNumber: string; image?: string;
  status: string; statusLabel: string; stage: string; acres: string; plots: number; plotsSold: number;
  topics: Record<"title" | "access" | "comparables" | "location", number>;
};

const TOPIC_TYPES: Record<keyof IntelligenceProjectSummary["topics"], DocType[]> = {
  title: ["title_register", "title_plan", "legal_pack"],
  access: ["legal_pack", "survey", "planning"],
  comparables: ["comparables"],
  location: ["location", "planning", "survey"],
};

/** Published projects that admin has enabled for Intelligence. */
export async function intelligenceProjects(): Promise<(IntelligenceProjectSummary & { id: number })[]> {
  const enabled = await prisma.intelligenceProject.findMany({ where: { enabled: true }, select: { projectId: true } });
  if (!enabled.length) return [];
  const ids = enabled.map(e => e.projectId);
  const [projects, docs] = await Promise.all([
    prisma.project.findMany({ where: { id: { in: ids }, publishStatus: "published" }, include: projectPlotInclude, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
    prisma.intelligenceDocument.groupBy({ by: ["projectId", "docType"], where: { projectId: { in: ids }, status: "ready" }, _count: { _all: true } }),
  ]);
  return projects.map(p => {
    const d = displayProject(p);
    const count = (types: DocType[]) => docs.filter(x => x.projectId === p.id && types.includes(x.docType as DocType)).reduce((n, x) => n + x._count._all, 0);
    return {
      id: p.id, slug: d.slug, title: d.title, location: d.location, titleNumber: d.titleNumber, image: d.image,
      status: d.status, statusLabel: d.statusLabel, stage: d.stage, acres: d.acres, plots: d.plots, plotsSold: d.plotsSold ?? 0,
      topics: { title: count(TOPIC_TYPES.title), access: count(TOPIC_TYPES.access), comparables: count(TOPIC_TYPES.comparables), location: count(TOPIC_TYPES.location) },
    };
  });
}

/** The project facts already shown publicly, as plain text for the model. Financials only if published. */
export function projectRecordText(d: Project) {
  const lines = [
    `Project: ${d.title}`, `Location: ${d.location}`, d.titleNumber.trim() ? `HM Land Registry title number: ${d.titleNumber}` : "",
    `Status: ${d.statusLabel || d.status}`, `Stage: ${d.stage}`, `Site area: ${d.acres} acres`, `Plots: ${d.plots} (sold: ${d.plotsSold ?? 0})`,
    d.acquisitionDate ? `Acquisition date: ${d.acquisitionDate}` : "",
    d.presentation?.showFinancials ? `Acquisition price: ${d.acquisitionPrice}; guide value: ${d.guideValue}${d.soldValue ? `; sale value: ${d.soldValue}` : ""}` : "",
    d.plotDetails.length ? `Plot schedule: ${d.plotDetails.map(p => `${p.label} ${p.status}${d.presentation?.showFinancials && p.salePrice ? ` ${p.salePrice}` : ""}`).join("; ")}` : "",
    `Description: ${d.description}`,
  ];
  return lines.filter(Boolean).join("\n");
}

/** Loads an enabled project's record and all its ready document chunks. */
export async function intelligenceContext(slug: string) {
  const p = await prisma.project.findFirst({ where: { slug, publishStatus: "published" }, include: projectPlotInclude });
  if (!p) return null;
  const feature = await prisma.intelligenceProject.findUnique({ where: { projectId: p.id } });
  if (!feature?.enabled) return null;
  const d = displayProject(p);
  const documents = await prisma.intelligenceDocument.findMany({
    where: { projectId: p.id, status: "ready" },
    select: { id: true, title: true, docType: true, documentDate: true, chunks: { select: { id: true, page: true, text: true } } },
  });
  const chunks = documents.flatMap(doc => doc.chunks.map(c => ({
    id: String(c.id), page: c.page, text: c.text, docTitle: doc.title, docType: doc.docType,
    docDate: doc.documentDate ? doc.documentDate.toISOString().slice(0, 10) : null,
  })));
  return { projectId: p.id, title: d.title, record: projectRecordText(d), chunks };
}

export { DOC_TYPES };

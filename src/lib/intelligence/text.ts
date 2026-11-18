// Pure helpers for Arvo Intelligence: chunking, retrieval and redaction.
// No framework imports, so they can be unit-tested with plain Node.

export type Chunk = { id: string; page: number; text: string };

/** Normalises extracted PDF text: collapses whitespace, keeps paragraph breaks. */
export function normaliseText(value: string) {
  return value.replace(/\r/g, "").replace(/[ \t\f\v]+/g, " ").replace(/ *\n */g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Splits page texts into ~`size` character chunks, breaking at paragraph or
 * sentence boundaries where possible, with a small overlap so facts that span
 * a boundary remain retrievable. Every chunk keeps its 1-based page number.
 */
export function chunkPages(pages: string[], size = 1100, overlap = 150): { page: number; text: string }[] {
  const out: { page: number; text: string }[] = [];
  pages.forEach((raw, index) => {
    const text = normaliseText(raw);
    if (!text) return;
    let start = 0;
    while (start < text.length) {
      let end = Math.min(text.length, start + size);
      if (end < text.length) {
        const window = text.slice(start, end);
        const breakAt = Math.max(window.lastIndexOf("\n\n"), window.lastIndexOf(". "), window.lastIndexOf("\n"));
        if (breakAt > size * 0.5) end = start + breakAt + 1;
      }
      const piece = text.slice(start, end).trim();
      if (piece.length >= 20) out.push({ page: index + 1, text: piece });
      if (end >= text.length) break;
      start = Math.max(end - overlap, start + 1);
    }
  });
  return out;
}

const STOP = new Set("a an and are as at be by can do does for from has have how i in is it its of on or that the this to was were what when where which who will with about any there their they be been does into than then".split(" "));

export function tokens(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9£%.\- ]+/g, " ").split(/\s+/)
    .map(t => t.replace(/^[.\-]+|[.\-]+$/g, "")).filter(t => t.length > 1 && !STOP.has(t));
}

/** BM25 ranking of chunks for a query. Returns the best `limit` chunks with score > 0. */
export function rankChunks<T extends Chunk>(query: string, chunks: T[], limit = 8): (T & { score: number })[] {
  const q = [...new Set(tokens(query))];
  if (!q.length || !chunks.length) return [];
  const docs = chunks.map(c => tokens(c.text));
  const avg = docs.reduce((n, d) => n + d.length, 0) / docs.length || 1;
  const df = new Map<string, number>();
  for (const d of docs) for (const t of new Set(d)) df.set(t, (df.get(t) ?? 0) + 1);
  const k1 = 1.4, b = 0.75, N = docs.length;
  return chunks.map((chunk, i) => {
    const counts = new Map<string, number>();
    for (const t of docs[i]) counts.set(t, (counts.get(t) ?? 0) + 1);
    let score = 0;
    for (const t of q) {
      const f = counts.get(t) ?? 0;
      if (!f) continue;
      const n = df.get(t) ?? 0;
      const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
      score += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * docs[i].length / avg));
    }
    return { ...chunk, score };
  }).filter(c => c.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
}

/** Removes contact details that must never be shown (emails, phone numbers). */
export function redactContactDetails(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email removed]")
    .replace(/(?:\+44\s?|\b0)(?:\d[\s-]?){9,10}\b/g, "[phone removed]");
}

/** Escapes text placed inside the XML-like source blocks of the prompt. */
export function escapeForPrompt(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

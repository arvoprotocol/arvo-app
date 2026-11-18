import "server-only";
import { createHash } from "node:crypto";
import { chunkPages } from "./text";

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;
const MAX_PAGES = 400;

export class ExtractError extends Error {}

/**
 * Extracts per-page text from a PDF held in memory. The original file is not
 * stored anywhere. Scanned PDFs without a text layer return status "no_text".
 */
export async function extractPdf(bytes: Uint8Array) {
  if (bytes.byteLength > MAX_UPLOAD_BYTES) throw new ExtractError("PDF is larger than 20 MB.");
  if (Buffer.from(bytes.subarray(0, 5)).toString("latin1") !== "%PDF-") throw new ExtractError("File is not a PDF.");
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const { getDocumentProxy, extractText } = await import("unpdf");
  let pages: string[];
  try {
    const pdf = await getDocumentProxy(new Uint8Array(bytes));
    if (pdf.numPages > MAX_PAGES) throw new ExtractError(`PDF has more than ${MAX_PAGES} pages.`);
    const result = await extractText(pdf, { mergePages: false });
    pages = Array.isArray(result.text) ? result.text : [String(result.text)];
  } catch (error) {
    if (error instanceof ExtractError) throw error;
    throw new ExtractError("The PDF could not be read. It may be encrypted or damaged.");
  }
  const chunks = chunkPages(pages);
  return { sha256, pages: pages.length, chunks, status: chunks.length ? "ready" : "no_text" };
}

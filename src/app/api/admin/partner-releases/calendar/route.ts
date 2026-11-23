import { getAdminSession } from "@/lib/admin/session";
import { prisma } from "@/lib/prisma";
import { releaseSchedule, tgeDate } from "@/lib/partners/allocation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Calendar file of release dates (one all-day event per date, with a reminder the day before and on the day).
// Import it into your calendar; re-download if amounts or the TGE date change.
export async function GET() {
  if (!await getAdminSession()) return new Response("Admin authentication required.", { status: 401 });
  const tge = tgeDate();
  if (!tge) return new Response("TGE date is not set.", { status: 409 });
  const partners = await prisma.strategicPartner.findMany({ where: { allocationArvo: { not: null } }, orderBy: { name: "asc" } });
  const byDate = new Map<string, { name: string; amount: bigint }[]>();
  for (const p of partners) for (const t of releaseSchedule(BigInt(p.allocationArvo!), tge)) {
    const key = t.due!.slice(0, 10); byDate.set(key, [...(byDate.get(key) ?? []), { name: p.name, amount: BigInt(t.amountArvo) }]);
  }
  const esc = (v: string) => v.replace(/[\;,]/g, m => "\\" + m).replace(/\n/g, "\\n");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const events = [...byDate.entries()].sort().map(([date, rows], i) => {
    const d = date.replace(/-/g, ""), next = new Date(Date.parse(date) + 86400000).toISOString().slice(0, 10).replace(/-/g, "");
    const total = rows.reduce((a, r) => a + r.amount, 0n);
    const detail = rows.map(r => `${r.name}: ${r.amount.toLocaleString("en-GB")} ARVO`).join("\n") + `\nTotal: ${total.toLocaleString("en-GB")} ARVO\nRecord each send in Admin → Partner releases.`;
    return ["BEGIN:VEVENT", `UID:arvo-partner-release-${d}@arvoprotocol.com`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${next}`,
      `SUMMARY:${esc(`ARVO partner release ${i + 1} of ${byDate.size}: ${total.toLocaleString("en-GB")} ARVO`)}`, `DESCRIPTION:${esc(detail)}`,
      "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:ARVO partner releases due tomorrow", "TRIGGER:-PT15H", "END:VALARM",
      "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:ARVO partner releases due today", "TRIGGER:PT9H", "END:VALARM", "END:VEVENT"].join("\r\n");
  });
  const fold = (line: string) => line.length <= 74 ? line : line.match(/.{1,73}/g)!.join("\r\n ");
  const body = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Arvo//Partner releases//EN", "CALSCALE:GREGORIAN", "X-WR-CALNAME:ARVO partner releases", ...events, "END:VCALENDAR"].join("\r\n").split("\r\n").map(fold).join("\r\n") + "\r\n";
  return new Response(body, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": 'attachment; filename="arvo-partner-releases.ics"', "Cache-Control": "no-store" } });
}

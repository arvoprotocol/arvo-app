// STAGING / DEMO ONLY. Creates a separate sample project ("Sample site · demo data") with clearly-labelled,
// fictional documents so Arvo Intelligence can be tried before real legal packs are uploaded.
// Real projects are never changed unless you pass --slug on purpose.
//
//   DATABASE_URL=file:/path/to/db node scripts/seed-intelligence-demo.mjs
//   DATABASE_URL=file:/path/to/db node scripts/seed-intelligence-demo.mjs --remove
//   DATABASE_URL=file:/path/to/db node scripts/seed-intelligence-demo.mjs --remove --enable ripe   (then switch a real project on)
//
// --remove deletes the sample project and every demo document, and switches Intelligence off for any
// project left with no documents (undoing an earlier run on a real project).
// Refuses to run when NODE_ENV=production unless --allow-production is passed.
import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const flag = name => args.includes(name);
const value = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const raw = process.env.DATABASE_URL;
if (!raw || !raw.startsWith("file:")) throw new Error("Set DATABASE_URL to the SQLite file (file:/path/to/db).");
if (process.env.NODE_ENV === "production" && !flag("--allow-production")) throw new Error("Demo data is for staging. Refusing to run with NODE_ENV=production.");
const path = resolve(raw.slice(5));
if (!existsSync(path)) throw new Error(`Database not found: ${path}`);
const db = new Database(path);
for (const t of ["Project", "IntelligenceProject", "IntelligenceDocument", "IntelligenceChunk"]) {
  if (!db.prepare("select name from sqlite_master where type='table' and name=?").get(t)) throw new Error(`Table ${t} is missing. Run prisma db push first.`);
}

const DEMO_SLUG = "intelligence-sample-site";
if (flag("--remove")) {
  const docs = db.prepare("select id, projectId from IntelligenceDocument where source='demo-seed'").all();
  const touched = new Set(docs.map(d => d.projectId));
  const demo = db.prepare("select id from Project where slug=?").get(DEMO_SLUG);
  const tx = db.transaction(() => {
    for (const d of docs) { db.prepare("delete from IntelligenceChunk where documentId=?").run(d.id); db.prepare("delete from IntelligenceDocument where id=?").run(d.id); }
    for (const projectId of touched) {
      const left = db.prepare("select count(*) n from IntelligenceDocument where projectId=?").get(projectId).n;
      if (left === 0) db.prepare("update IntelligenceProject set enabled=0, updatedAt=? where projectId=?").run(new Date().toISOString().replace("Z", "+00:00"), projectId);
    }
    if (demo) { db.prepare("delete from IntelligenceProject where projectId=?").run(demo.id); db.prepare("delete from Project where id=?").run(demo.id); }
  });
  tx();
  console.log(`Removed ${docs.length} demo documents${demo ? " and the sample project" : ""}. Intelligence was switched off for any project left without documents.`);
  // --enable <slug> switches Intelligence on for a real project (no documents are added or changed).
  const enableSlug = value("--enable");
  if (enableSlug) {
    const real = db.prepare("select id, title, publishStatus from Project where slug=?").get(enableSlug);
    if (!real) throw new Error(`No project with slug "${enableSlug}".`);
    const at = new Date().toISOString().replace("Z", "+00:00");
    db.prepare("insert into IntelligenceProject (projectId, enabled, updatedAt) values (?,1,?) on conflict(projectId) do update set enabled=1, updatedAt=excluded.updatedAt").run(real.id, at);
    console.log(`Intelligence switched on for ${real.title}${real.publishStatus === "published" ? "" : " (note: this project is not published, so it will not appear until it is)"}. Upload its documents in Admin → Intelligence.`);
  }
  process.exit(0);
}

const slug = value("--slug");
let project;
if (slug) {
  project = db.prepare("select id, slug, title, location from Project where slug=?").get(slug);
  if (!project) throw new Error(`No project with slug "${slug}".`);
} else {
  project = db.prepare("select id, slug, title, location from Project where slug=?").get(DEMO_SLUG);
  if (!project) {
    const now = new Date().toISOString().replace("Z", "+00:00");
    db.prepare(`insert into Project (slug, title, location, titleNumber, status, statusLabel, stage, acres, plots, plotsSold, currency, description, publishStatus, sortOrder, publishedAt, createdAt, updatedAt)
      values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(DEMO_SLUG, "Sample site · demo data", "Ashworth, Somerset", "", "active", "Demo", "Sample data", "4.2", 8, 0, "GBP",
      "A fictional sample project used to try Arvo Intelligence on staging. None of its documents or figures are real.", "published", 9999, now, now, now);
    project = db.prepare("select id, slug, title, location from Project where slug=?").get(DEMO_SLUG);
  }
}
const place = (project.location || "the site").split(",")[0].trim();

// Fictional content. Names below are invented and exist to show that Intelligence will not repeat them.
const docs = [
  { type: "title_register", title: "Demo · Title register", date: "2026-09-12", pages: [
    `DEMO DOCUMENT · FICTIONAL SAMPLE FOR TESTING. HM Land Registry, Official copy of register of title. Title number DEMO482193. Edition date 12 September 2026.
A: Property Register. This register describes the land and estate comprised in the title. The Freehold land shown edged with red on the plan of the above title filed at the Registry and being land lying to the north of Mill Lane, ${place}. The land has the benefit of a right of way on foot and with vehicles over the track shown coloured brown on the title plan, granted by a Conveyance dated 4 March 1987, subject to contributing a fair proportion of the cost of maintenance.`,
    `B: Proprietorship Register. Title absolute. PROPRIETOR: Fernhollow Land Holdings Limited (fictional) of 1 Example Street, Sampletown. RESTRICTION: No disposition of the registered estate by the proprietor of the registered estate is to be registered without a certificate signed by a conveyancer that the provisions of clause 6 (overage) of the Transfer dated 2 May 2026 have been complied with.
C: Charges Register. 1. A Conveyance dated 4 March 1987 contains covenants that no building other than a single private dwelling house with garage shall be erected on any one plot, and that no trade or business shall be carried on. 2. There are no registered charges (mortgages) against this title.`,
  ]},
  { type: "title_plan", title: "Demo · Title plan notes", date: "2026-09-12", pages: [
    `DEMO DOCUMENT · FICTIONAL. Title plan DEMO482193. Scale 1:2500. The title is edged red and extends to approximately 4.2 acres (1.70 hectares) of rough grazing. The northern boundary follows a mature hedgerow; the eastern boundary is a post-and-wire fence. Access is from Mill Lane via the private track coloured brown, approximately 140 metres long. A public footpath (ref. FP 14) crosses the south-west corner of the site.`,
  ]},
  { type: "legal_pack", title: "Demo · Auction legal pack (special conditions)", date: "2026-10-01", pages: [
    `DEMO DOCUMENT · FICTIONAL. Special Conditions of Sale. 1. Completion shall take place 28 days after exchange of contracts. 2. A buyer's administration charge of £1,500 including VAT is payable on exchange. 3. The property is sold subject to and with the benefit of the matters contained in the register of title DEMO482193. 4. The buyer shall be deemed to have full knowledge of the overage provision referred to in the restriction on the register.`,
    `5. Overage: if planning permission for residential development is granted within 25 years of the Transfer dated 2 May 2026, 25% of the resulting uplift in value is payable to the original seller. Agricultural, equestrian and amenity uses do not trigger the overage. 6. Services: there are no mains water, electricity or drainage connections to the land. The nearest water main is understood to be in Mill Lane, approximately 140 metres from the gate. 7. A Tree Preservation Order (TPO ref. 2019/07) protects the mature oak on the northern boundary.`,
  ]},
  { type: "planning", title: "Demo · Local authority planning search", date: "2026-09-20", pages: [
    `DEMO DOCUMENT · FICTIONAL. Local Land Charges and planning search results. Planning history: no planning applications are recorded for the land. Designations: the land lies outside the defined settlement boundary of ${place}; it is not within a Conservation Area, Area of Outstanding Natural Beauty or Green Belt. Agricultural Land Classification: Grade 3. Flood risk: Environment Agency Flood Zone 1 (low probability). The land is not registered as common land or a town or village green. Highways: Mill Lane is an adopted highway; the access track is private and unadopted.`,
  ]},
  { type: "comparables", title: "Demo · Comparable plot sales", date: "2026-10-15", pages: [
    `DEMO DOCUMENT · FICTIONAL FIGURES FOR TESTING. Comparable sales of small amenity and grazing plots within 8 miles, auction and private treaty, last 18 months.
Plot A, 0.5 acres grazing with roadside access, sold at auction March 2026 for £18,500 (£37,000 per acre).
Plot B, 1.0 acre paddock with water trough, private treaty June 2026, £29,000 (£29,000 per acre).
Plot C, 0.75 acres woodland edge, no services, auction August 2026, £21,000 (£28,000 per acre).
Plot D, 2.1 acres rough grazing via shared track, auction September 2026, £44,000 (£20,950 per acre).
Smaller lots consistently achieved a higher price per acre than larger lots.`,
  ]},
  { type: "location", title: "Demo · Location summary", date: "2026-10-15", pages: [
    `DEMO DOCUMENT · FICTIONAL. Location: the land sits on the northern edge of ${place}. Approximate distances: village shop and pub 0.6 miles; nearest market town 7 miles; A-road junction 2.4 miles; mainline railway station 9 miles. Mobile coverage is good on the main networks. The surrounding area is mixed farmland and small paddocks, with several equestrian holdings nearby, which supports demand for small grazing and amenity plots.`,
  ]},
];

const now = new Date().toISOString().replace("Z", "+00:00");
let added = 0;
const tx = db.transaction(() => {
  const existing = db.prepare("select id from IntelligenceProject where projectId=?").get(project.id);
  if (existing) db.prepare("update IntelligenceProject set enabled=1, updatedAt=? where projectId=?").run(now, project.id);
  else db.prepare("insert into IntelligenceProject (projectId, enabled, updatedAt) values (?, 1, ?)").run(project.id, now);
  for (const d of docs) {
    const sha = createHash("sha256").update(`demo-seed:${d.title}:${d.pages.join("\n")}`).digest("hex");
    if (db.prepare("select id from IntelligenceDocument where projectId=? and sha256=?").get(project.id, sha)) continue;
    const info = db.prepare("insert into IntelligenceDocument (projectId, title, docType, documentDate, source, pages, status, sha256, createdAt) values (?,?,?,?,?,?,?,?,?)")
      .run(project.id, d.title, d.type, new Date(`${d.date}T00:00:00Z`).toISOString(), "demo-seed", d.pages.length, "ready", sha, now);
    d.pages.forEach((text, i) => db.prepare("insert into IntelligenceChunk (documentId, page, text) values (?,?,?)").run(info.lastInsertRowid, i + 1, text.replace(/\s+/g, " ").trim()));
    added++;
  }
});
tx();
console.log(`Intelligence demo ready on "${project.title}" (/app/intelligence, slug ${project.slug}). ${added} demo documents added (${docs.length - added} already present).`);
console.log("Remove later with: node scripts/seed-intelligence-demo.mjs --remove");

// LAUNCH ONE-OFF. Copies the CONTENT you edited on staging (projects, plots, vault drafts, the
// Intelligence on/off switch per project) into the production database, and optionally the partner
// allocation amounts. People data (partners' wallets and status, waitlist signups, invite codes, emails
// sent, support tickets) is never copied: production is the real record for those.
//
// Run as the site user (arvoprotocol), never as root, so SQLite's side files keep the right owner.
//
//   DATABASE_URL=file:/path/to/production.db node scripts/copy-content-to-production.mjs \
//     --from /path/to/staging-copy.db [--images-from DIR --images-to DIR] [--partner-allocations]      (report only)
//   ... same with --apply                                                                              (copies)
//
// What --apply does, in one transaction, after backing the production database up next to itself:
//   · Project, ProjectPlot, IntelligenceProject, StakingVaultDraft: production rows are replaced by staging's,
//     keeping staging's ids (vault drafts and Intelligence refer to projects by id/slug).
//   · Vault drafts linked to a pool on another chain (testnet) are unlinked, so they show as "opening soon"
//     on mainnet until you link them to the real mainnet pool.
//   · --partner-allocations: for partners that exist in BOTH databases (matched on email), copies
//     allocationUsd / allocationArvo / allocationPrice, only where production has no releases recorded.
//     The staging test partner is always skipped.
//   · Image files referenced by the copied projects are copied into --images-to if missing there.
import Database from "better-sqlite3";
import { copyFileSync, existsSync, readdirSync, realpathSync } from "node:fs";
import { join, resolve } from "node:path";

const MAINNET = 4663;
const TEST_PARTNER = "staging-test-partner@arvoprotocol.invalid";
const args = process.argv.slice(2);
const flag = n => args.includes(n), arg = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const apply = flag("--apply"), withAllocations = flag("--partner-allocations");
const from = arg("--from"), imagesFrom = arg("--images-from"), imagesTo = arg("--images-to");
const raw = process.env.DATABASE_URL;
if (!from) throw new Error("Pass --from <copy of the staging database>.");
if (!raw || !raw.startsWith("file:")) throw new Error("Set DATABASE_URL to the production SQLite file (file:/path/to/db).");
if (process.getuid?.() === 0) throw new Error("Run this as the site user (arvoprotocol), not root.");
const source = resolve(from), target = resolve(raw.slice(5));
for (const [name, file] of [["Staging copy", source], ["Production database", target]]) if (!existsSync(file)) throw new Error(`${name} not found: ${file}`);
if (realpathSync(source) === realpathSync(target)) throw new Error("Source and target are the same file.");
if (/\/htdocs\/staging\./.test(realpathSync(source))) throw new Error("Pass a COPY of the staging database, not the live staging file.");
if (/staging/i.test(realpathSync(target))) throw new Error(`Target ${target} looks like staging. This copies INTO production.`);

const src = new Database(source, { readonly: true, fileMustExist: true });
const dst = new Database(target, { fileMustExist: true });
const has = (db, t) => Boolean(db.prepare("select name from sqlite_master where type='table' and name=?").get(t));
const cols = (db, t) => db.prepare("select name from pragma_table_info(?)").all(t).map(c => c.name);
const count = (db, t) => has(db, t) ? db.prepare(`select count(*) n from "${t}"`).get().n : "–";

// ── Report ────────────────────────────────────────────────────────────────────────────────
console.log("\nCONTENT (staging replaces production)");
const content = ["Project", "ProjectPlot", "IntelligenceProject", "StakingVaultDraft"];
for (const t of content) {
  if (!has(src, t) || !has(dst, t)) throw new Error(`Table ${t} missing in ${has(src, t) ? "production" : "staging copy"}.`);
  console.log(`  ${t.padEnd(20)} production ${String(count(dst, t)).padStart(3)}  →  staging ${String(count(src, t)).padStart(3)}`);
}
const titles = db => db.prepare("select slug, title, publishStatus from Project order by sortOrder, id").all();
console.log("  Projects on staging:   " + titles(src).map(p => `${p.title} (${p.publishStatus})`).join(", "));
console.log("  Projects on production: " + (titles(dst).map(p => `${p.title} (${p.publishStatus})`).join(", ") || "none"));
const drafts = src.prepare("select id, title, visibility, sortOrder, linkedChainId, linkedPoolId from StakingVaultDraft order by sortOrder, id").all();
console.log("  Vault drafts on staging:");
for (const d of drafts) console.log(`    #${d.id} ${d.title} · ${d.visibility} · order ${d.sortOrder}${d.linkedPoolId !== null ? ` · linked to pool ${d.linkedPoolId} on chain ${d.linkedChainId}${d.linkedChainId !== MAINNET ? " → will be UNLINKED (not mainnet)" : ""}` : ""}`);

console.log("\nPEOPLE (production kept as it is; shown for comparison only)");
for (const t of ["StrategicPartner", "PlatformSignup", "InvitationCode", "AdminBroadcastEmail", "SupportTicket", "PartnerRelease", "IntelligenceDocument"])
  console.log(`  ${t.padEnd(20)} production ${String(count(dst, t)).padStart(3)}   staging ${String(count(src, t)).padStart(3)}`);

const partnerRows = db => db.prepare("select id, name, email, status, registeredWallet, allocationUsd, allocationArvo, allocationPrice from StrategicPartner").all();
const prodPartners = new Map(partnerRows(dst).map(p => [p.email.toLowerCase(), p]));
const releasesFor = dst.prepare("select count(*) n from PartnerRelease where partnerId = ?");
const allocationPlan = [];
console.log("\nPARTNER DIFFERENCES (matched on email)");
let anyDiff = false;
for (const s of partnerRows(src)) {
  if (s.email.toLowerCase() === TEST_PARTNER) continue;
  const p = prodPartners.get(s.email.toLowerCase());
  if (!p) { anyDiff = true; console.log(`  only on staging: ${s.name} <${s.email}> (not copied — add on production if real)`); continue; }
  const diffs = ["status", "registeredWallet", "allocationUsd", "allocationArvo", "allocationPrice"].filter(k => (s[k] ?? "") !== (p[k] ?? ""));
  if (!diffs.length) continue;
  anyDiff = true;
  console.log(`  ${s.name}: ` + diffs.map(k => `${k} production "${p[k] ?? ""}" / staging "${s[k] ?? ""}"`).join("; "));
  if (s.allocationArvo && (s.allocationArvo !== p.allocationArvo || s.allocationUsd !== p.allocationUsd || s.allocationPrice !== p.allocationPrice)) {
    if (releasesFor.get(p.id).n > 0) console.log("    allocation NOT copied: production already has releases for this partner");
    else allocationPlan.push({ id: p.id, name: s.name, usd: s.allocationUsd, arvo: s.allocationArvo, price: s.allocationPrice });
  }
}
for (const p of prodPartners.values()) if (!partnerRows(src).some(s => s.email.toLowerCase() === p.email.toLowerCase())) { anyDiff = true; console.log(`  only on production: ${p.name} (kept)`); }
if (!anyDiff) console.log("  none");
if (allocationPlan.length) console.log(`  ${withAllocations ? "WILL copy" : "Would copy with --partner-allocations"} allocation for: ${allocationPlan.map(a => `${a.name} ${a.arvo} ARVO`).join(", ")}`);

// Images referenced by staging projects.
const imageNames = new Set();
for (const p of src.prepare("select image, displayJson from Project").all())
  for (const m of `${p.image ?? ""} ${p.displayJson ?? ""}`.matchAll(/\/api\/project-images\/([A-Za-z0-9-]+\.(?:jpg|png|webp))/g)) imageNames.add(m[1]);
let imagesToCopy = [];
console.log(`\nIMAGES: ${imageNames.size} referenced by staging projects`);
if (imagesFrom && imagesTo) {
  const have = new Set(existsSync(imagesTo) ? readdirSync(imagesTo) : []);
  const available = new Set(readdirSync(imagesFrom));
  const missingInSource = [...imageNames].filter(n => !available.has(n));
  imagesToCopy = [...imageNames].filter(n => !have.has(n) && available.has(n));
  console.log(`  ${imagesToCopy.length} to copy into ${imagesTo}${missingInSource.length ? `; ${missingInSource.length} NOT FOUND in ${imagesFrom}: ${missingInSource.join(", ")}` : ""}`);
} else console.log("  pass --images-from and --images-to to check and copy them");

if (!apply) { console.log("\nNothing written. Run again with --apply to copy."); process.exit(0); }

// ── Apply ─────────────────────────────────────────────────────────────────────────────────
dst.pragma("wal_checkpoint(TRUNCATE)");
const backup = `${target}.before-content-copy-${new Date().toISOString().replace(/[:.]/g, "-")}`;
copyFileSync(target, backup);
console.log(`\nBacked up production database to ${backup}`);

dst.pragma("foreign_keys = OFF");
dst.transaction(() => {
  for (const t of ["ProjectPlot", "IntelligenceProject", "StakingVaultDraft", "Project"]) dst.prepare(`delete from "${t}"`).run();
  for (const t of ["Project", "ProjectPlot", "IntelligenceProject", "StakingVaultDraft"]) {
    const shared = cols(src, t).filter(c => cols(dst, t).includes(c));
    const insert = dst.prepare(`insert into "${t}" (${shared.map(c => `"${c}"`).join(",")}) values (${shared.map(() => "?").join(",")})`);
    for (const r of src.prepare(`select ${shared.map(c => `"${c}"`).join(",")} from "${t}"`).all()) {
      if (t === "StakingVaultDraft" && r.linkedChainId !== null && r.linkedChainId !== MAINNET) { r.linkedChainId = null; r.linkedProxy = null; r.linkedPoolId = null; }
      insert.run(...shared.map(c => r[c]));
    }
    // Keep autoincrement counters ahead of the copied ids.
    dst.prepare("delete from sqlite_sequence where name = ?").run(t);
    const max = dst.prepare(`select max(id) m from "${t}"`).get().m;
    if (max !== null) dst.prepare("insert into sqlite_sequence (name, seq) values (?, ?)").run(t, max);
  }
  if (withAllocations) {
    const upd = dst.prepare("update StrategicPartner set allocationUsd = ?, allocationArvo = ?, allocationPrice = ?, updatedAt = ? where id = ?");
    const now = new Date().toISOString().replace("Z", "+00:00");
    for (const a of allocationPlan) upd.run(a.usd, a.arvo, a.price, now, a.id);
  }
})();
dst.pragma("foreign_keys = ON");
const problems = dst.prepare("pragma foreign_key_check").all();
if (problems.length) console.log(`WARNING: ${problems.length} foreign-key problems: ${JSON.stringify(problems.slice(0, 5))}`);
for (const n of imagesToCopy) copyFileSync(join(imagesFrom, n), join(imagesTo, n));
console.log(`Copied content${withAllocations ? ` and ${allocationPlan.length} partner allocation(s)` : ""}${imagesToCopy.length ? ` and ${imagesToCopy.length} image(s)` : ""}.`);
for (const t of content) console.log(`  ${t.padEnd(20)} now ${count(dst, t)}`);
console.log("Restart the app (pm2 restart arvo) and check Projects and Admin → Vaults.");

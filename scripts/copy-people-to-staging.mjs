// STAGING ONLY. Copies partners, waitlist signups and email history from a COPY of the production
// database into the staging database. The live production database is never opened, only a copy of it.
//
//   DATABASE_URL=file:/path/to/staging.db node scripts/copy-people-to-staging.mjs --from /path/to/prod-copy.db           (shows counts)
//   DATABASE_URL=file:/path/to/staging.db node scripts/copy-people-to-staging.mjs --from /path/to/prod-copy.db --apply   (copies)
//
// Existing staging rows are kept: partners match on email, signups on type + contact, emails on subject + send time.
// The staging database is backed up next to itself before anything is written.
// Refuses to write to a database whose path does not contain "staging" unless --force is passed.
import Database from "better-sqlite3";
import { copyFileSync, existsSync, realpathSync } from "node:fs";
import { resolve } from "node:path";

const args = process.argv.slice(2);
const apply = args.includes("--apply"), force = args.includes("--force");
const fromAt = args.indexOf("--from"), from = fromAt >= 0 ? args[fromAt + 1] : undefined;
const raw = process.env.DATABASE_URL;
if (!from) throw new Error("Pass --from <copy of the production database>.");
if (!raw || !raw.startsWith("file:")) throw new Error("Set DATABASE_URL to the staging SQLite file (file:/path/to/db).");
const source = resolve(from), target = resolve(raw.slice(5));
for (const [name, file] of [["Source", source], ["Staging database", target]]) if (!existsSync(file)) throw new Error(`${name} not found: ${file}`);
if (realpathSync(source) === realpathSync(target)) throw new Error("Source and staging database are the same file.");
if (!force && !/staging/i.test(target)) throw new Error(`Refusing to write to ${target}: the path does not look like staging. Pass --force only if you are sure.`);

// Work on a copy only: never point this at the live production folder.
if (/\/htdocs\/arvoprotocol\.com\//.test(realpathSync(source))) throw new Error("That is the live production database. Copy it first (see the steps) and pass the copy.");
const src = new Database(source, { fileMustExist: true }); // a copy, so SQLite may finish any pending write-ahead log in it
const dst = new Database(target);

// Table → columns that identify the same record, so re-running never duplicates.
const tables = [
  { name: "StrategicPartner", key: ["email"], label: "partners" },
  { name: "PlatformSignup", key: ["type", "normalized"], label: "waitlist signups" },
  { name: "AdminBroadcastEmail", key: ["subject", "sentAt"], label: "sent emails" },
];
const columns = (db, table) => db.prepare(`select name from pragma_table_info(?)`).all(table).map(c => c.name);
const exists = (db, table) => Boolean(db.prepare("select name from sqlite_master where type='table' and name=?").get(table));

// Older app versions may store dates as numbers; staging stores ISO text.
function value(column, v) {
  if (v === null || v === undefined) return null;
  if (/At$/.test(column) && typeof v === "number") return new Date(v).toISOString().replace("Z", "+00:00");
  if (/At$/.test(column) && typeof v === "string" && /^\d{12,}$/.test(v)) return new Date(Number(v)).toISOString().replace("Z", "+00:00");
  if (/At$/.test(column) && typeof v === "string" && /T.*Z$/.test(v)) return v.replace(/Z$/, "+00:00");
  return v;
}

const plan = [];
for (const t of tables) {
  if (!exists(src, t.name)) { console.log(`· ${t.label}: not in the source database (skipped)`); continue; }
  if (!exists(dst, t.name)) throw new Error(`Staging is missing table ${t.name}. Run prisma db push first.`);
  const shared = columns(src, t.name).filter(c => c !== "id" && columns(dst, t.name).includes(c));
  const missing = columns(dst, t.name).filter(c => c !== "id" && !shared.includes(c));
  const rows = src.prepare(`select ${shared.map(c => `"${c}"`).join(",")} from "${t.name}"`).all();
  const find = dst.prepare(`select 1 from "${t.name}" where ${t.key.map(k => `"${k}" = ?`).join(" and ")} limit 1`);
  const fresh = rows.filter(r => !find.get(...t.key.map(k => value(k, r[k]))));
  plan.push({ t, shared, rows, fresh });
  console.log(`${apply ? "✓" : "→"} ${t.label}: ${rows.length} in production copy, ${fresh.length} new to staging${missing.length ? ` (staging-only columns left at their defaults: ${missing.join(", ")})` : ""}`);
}

if (!apply) { console.log("Nothing written. Run again with --apply to copy."); process.exit(0); }

const backup = `${target}.before-people-copy-${new Date().toISOString().replace(/[:.]/g, "-")}`;
dst.pragma("wal_checkpoint(TRUNCATE)");
copyFileSync(target, backup);
console.log(`Backed up staging database to ${backup}`);

dst.transaction(() => {
  for (const { t, shared, fresh } of plan) {
    const insert = dst.prepare(`insert or ignore into "${t.name}" (${shared.map(c => `"${c}"`).join(",")}) values (${shared.map(() => "?").join(",")})`);
    for (const r of fresh) insert.run(...shared.map(c => value(c, r[c])));
  }
})();
console.log("Copied. Delete the production copy now that it is no longer needed.");

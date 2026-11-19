// Sets the "Explore linked vaults" note on a project (shown when no vault for it is open or planned yet).
// Project record only; nothing goes to the chain. Edit the note later in Admin → Projects → Presentation.
//
//   DATABASE_URL=file:/path/to/db node scripts/set-project-vault-note.mjs                      (Barbados, shows what would change)
//   DATABASE_URL=file:/path/to/db node scripts/set-project-vault-note.mjs --apply
//   DATABASE_URL=file:/path/to/db node scripts/set-project-vault-note.mjs --slug <slug> --apply
//
// An existing note is kept unless you pass --force.
import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

export const BARBADOS_NOTE = [
  "We intend to open a vault linked to this project, built around rental yield.",
  "Once the property is complete and earning, a share of its rental income will flow into the vault’s rewards. That gives stakers returns tied to real, recurring income from a finished asset, not just one-off sales.",
  "The reward rate, terms and opening date will be published here before it opens.",
].join("\n\n");

const args = process.argv.slice(2);
const apply = args.includes("--apply"), force = args.includes("--force");
const slugAt = args.indexOf("--slug"), slug = slugAt >= 0 ? args[slugAt + 1] : undefined;
const raw = process.env.DATABASE_URL;
if (!raw || !raw.startsWith("file:")) throw new Error("Set DATABASE_URL to the SQLite file (file:/path/to/db).");
const path = resolve(raw.slice(5));
if (!existsSync(path)) throw new Error(`Database not found: ${path}`);
const db = new Database(path);

const project = slug
  ? db.prepare("select id, slug, title, displayJson from Project where slug=?").get(slug)
  : db.prepare("select id, slug, title, displayJson from Project where lower(title) like '%barbados%' or lower(location) like '%barbados%' or lower(slug) like '%barbados%' order by (publishStatus='published') desc, sortOrder asc limit 1").get();
if (!project) { console.log(`No ${slug ? `project "${slug}"` : "Barbados project"} found. Pass --slug <slug>.`); process.exit(1); }

const display = project.displayJson ? JSON.parse(project.displayJson) : { kind: "plots", showFinancials: true, showMilestones: false, gallery: [], videoUrl: "", metrics: [], milestones: [] };
if (display.vaultNote && !force) { console.log(`· ${project.title} already has a note (kept). Pass --force to replace it.`); process.exit(0); }
console.log(`${apply ? "✓" : "→"} ${project.title} (${project.slug}): linked vault note\n\n${BARBADOS_NOTE}\n`);
if (apply) db.prepare("update Project set displayJson=?, updatedAt=? where id=?").run(JSON.stringify({ ...display, vaultNote: BARBADOS_NOTE }), new Date().toISOString(), project.id);
else console.log("Run again with --apply to save it.");

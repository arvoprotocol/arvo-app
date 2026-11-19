// Puts the launch vaults in order and applies the agreed card terms. Admin vault DRAFTS only; nothing goes to the chain.
//
//   DATABASE_URL=file:/path/to/db node scripts/arrange-launch-vaults.mjs           (shows what would change)
//   DATABASE_URL=file:/path/to/db node scripts/arrange-launch-vaults.mjs --apply   (makes the changes)
//
// Vaults already linked to a live pool keep their terms (they are fixed on-chain); only their order and name change.
import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const apply = process.argv.includes("--apply");
const raw = process.env.DATABASE_URL;
if (!raw || !raw.startsWith("file:")) throw new Error("Set DATABASE_URL to the SQLite file (file:/path/to/db).");
const path = resolve(raw.slice(5));
if (!existsSync(path)) throw new Error(`Database not found: ${path}`);
const db = new Database(path);

// Standard vaults: same 1.5M ARVO entry as First Edition (so stakers can roll over), 100M ARVO size each,
// no fixed dates yet (they show "Opening date: to be announced" until scheduled in admin).
const standard = { minArvo: "1500000", minArvoUsdc: "1500000", maxArvo: "100000000", opens: "", closes: "" };
const plan = [
  // Hidden for launch (kept in admin, can be shown again by setting it back to "Opening soon").
  { match: ["community welcome"], order: 1, hide: true },
  { match: ["first edition"], order: 2, values: { bonusPct: "5" } },
  // First Edition deposits close 29 Nov and each stake unlocks 60 days after it was made (23 to 28 Jan).
  // Genesis opens as the first ones unlock and stays open 5 days past the last, so everyone can move across.
  // Planned dates only:
  // Genesis opens for real only once the plot-sale contribution has funded its rewards.
  // Size: the 3,000 USDG base reserve at 5% covers $60,000 of stake. At ~$0.0003 per ARVO that is
  // ~200M ARVO. Re-check against the reference price fixed just before Genesis opens.
  { match: ["genesis pilot"], order: 3, values: { bonusPct: "5", opens: "2027-01-23T12:00", closes: "2027-02-02T12:00", maxArvo: "200000000", explainer: "plotSale" }, linkProject: true },
  { match: ["usdg 12-month vault", "whole site finance", "full site land acquisition"], order: 4, title: "Full Site Land Acquisition", values: { usdcRate: "14", minUsdc: "10000", explainer: "fullSite" } },
  { match: ["build"], order: 5, values: standard },
  { match: ["advance"], order: 6, values: standard, hide: true },
  { match: ["compound"], order: 7, values: standard },
  { match: ["foundation"], order: 8, values: standard, hide: true },
];

const rows = db.prepare("select id, title, valuesJson, sortOrder, linkedPoolId, revision, visibility from StakingVaultDraft").all();
// Genesis is backed by a plot sale from the Ripe project. Override with --genesis-project <slug>.
const argIndex = process.argv.indexOf("--genesis-project");
const genesisSlug = argIndex >= 0 ? process.argv[argIndex + 1] : undefined;
const genesisProject = genesisSlug
  ? db.prepare("select slug, title from Project where slug=?").get(genesisSlug)
  : db.prepare("select slug, title from Project where lower(title) like '%ripe%' or lower(slug) like '%ripe%' order by (publishStatus='published') desc, sortOrder asc limit 1").get();
if (!genesisProject) console.log(`! No ${genesisSlug ? `project "${genesisSlug}"` : "Ripe project"} found: Genesis Pilot keeps its current project link.`);
const now = new Date().toISOString().replace("Z", "+00:00");
let changes = 0;
const tx = db.transaction(() => {
  for (const step of plan) {
    const matches = rows.filter(r => step.match.includes(r.title.trim().toLowerCase()));
    if (!matches.length) { console.log(`· ${step.match[0]}: no draft found (skipped)`); continue; }
    for (const row of matches) {
      const values = JSON.parse(row.valuesJson);
      const before = JSON.stringify(values);
      const live = row.linkedPoolId !== null;
      if (step.values && !live) Object.assign(values, step.values);
      if (step.values?.bonusPct && live) values.bonusPct = step.values.bonusPct; // display-only, safe on live vaults
      if (step.values?.explainer && live) values.explainer = step.values.explainer; // display-only, safe on live vaults
      const visibility = step.hide ? "hidden" : row.visibility;
      if (step.hide && live) { values.appHidden = "1"; console.log(`· ${row.title} is a live vault: hidden in the app only (display). The contract is unchanged; hide it onchain later through the Safe.`); }
      if (step.linkProject && genesisProject) values.projectSlug = genesisProject.slug;
      const title = step.title ?? row.title;
      const changed = JSON.stringify(values) !== before || title !== row.title || row.sortOrder !== step.order || visibility !== row.visibility;
      if (!changed) { console.log(`· ${row.title}: already arranged`); continue; }
      console.log(`${apply ? "✓" : "→"} ${row.title}${title !== row.title ? ` → "${title}"` : ""}: position ${step.order}${visibility !== row.visibility ? ", hidden" : ""}${live ? " (live vault: order, name and bonus strip only)" : ""}${step.linkProject && values.projectSlug ? `, project ${values.projectSlug}${genesisProject ? ` (${genesisProject.title})` : ""}` : ""}`);
      if (apply) db.prepare("update StakingVaultDraft set title=?, valuesJson=?, sortOrder=?, visibility=?, revision=revision+1, updatedAt=? where id=?").run(title, JSON.stringify(values), step.order, visibility, now, row.id);
      changes++;
    }
  }
});
tx();
console.log(apply ? `${changes} vault(s) updated.` : `${changes} change(s) shown. Run again with --apply to make them.`);

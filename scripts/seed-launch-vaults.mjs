// Creates the agreed launch vaults as admin vault DRAFTS (the same records Admin → Vaults → Create saves).
// Drafts are previews only: nothing is sent to the chain. Edit them in admin, then create the real pool from there.
//
//   DATABASE_URL=file:/path/to/db node scripts/seed-launch-vaults.mjs
//
// Safe to re-run: each draft has a seed key and is skipped if it already exists (your edits are kept).
import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const raw = process.env.DATABASE_URL;
if (!raw || !raw.startsWith("file:")) throw new Error("Set DATABASE_URL to the SQLite file (file:/path/to/db).");
const path = resolve(raw.slice(5));
if (!existsSync(path)) throw new Error(`Database not found: ${path}`);
const db = new Database(path);

// Every key the admin form stores, so drafts open and validate in the editor exactly like hand-made ones.
const base = { duration: "60", arvoRate: "0", usdcRate: "0", dualBoost: "10", boostCap: "15", minArvo: "", minArvoUsdc: "", minUsdc: "1000", opens: "", closes: "", maxArvo: "0", maxUsdc: "0", mixedShare: "50", committedUsdc: "0" };
const none = { arvoArvo: false, arvoUsdc: false, usdcUsdc: false, dualArvo: false, dualUsdc: false, dualMixed: false };

const drafts = [
  { seedKey: "launch-first-edition", title: "First Edition", sortOrder: 1,
    // Agreed: 60 days, 10% ARVO, 1.5M minimum, 100M cap, window 24 → 29 Nov (12:00 UTC proposed).
    values: { ...base, duration: "60", arvoRate: "10", minArvo: "1500000", maxArvo: "100000000", opens: "2026-11-24T12:00", closes: "2026-11-29T12:00" },
    products: { ...none, arvoArvo: true } },
  { seedKey: "launch-usdg-12-month", title: "USDG 12-Month Vault", sortOrder: 2,
    // Agreed: USDG in, USDG out, 12 months, 250k cap with 200k committed outside the app.
    // NOT YET AGREED: rate (10% placeholder), minimum (1,000 placeholder), opening date, final name.
    values: { ...base, duration: "365", usdcRate: "10", minUsdc: "1000", maxUsdc: "250000", committedUsdc: "200000" },
    products: { ...none, usdcUsdc: true } },
  { seedKey: "launch-genesis-pilot", title: "Genesis Pilot", sortOrder: 3,
    // Working spec: 60 days, ARVO in, 5% USDG base (plus a separate shared USDG bonus), minimum matches First Edition.
    // Preview only until the land-sale contribution is funded. Capacity is set once the reference price is fixed.
    values: { ...base, duration: "60", usdcRate: "5", minArvo: "1500000", minArvoUsdc: "1500000" },
    products: { ...none, arvoUsdc: true } },
];

const now = new Date().toISOString();
let added = 0;
for (const d of drafts) {
  if (db.prepare("select id from StakingVaultDraft where seedKey=?").get(d.seedKey)) { console.log(`· ${d.title}: already there, left unchanged`); continue; }
  db.prepare("insert into StakingVaultDraft (title, poolType, standardKind, valuesJson, productsJson, visibility, sortOrder, seedKey, revision, createdAt, updatedAt) values (?,?,?,?,?,?,?,?,1,?,?)")
    .run(d.title, "custom", "BUILD", JSON.stringify(d.values), JSON.stringify(d.products), "openingSoon", d.sortOrder, d.seedKey, now, now);
  console.log(`+ ${d.title}: added as an "Opening soon" draft`);
  added++;
}
console.log(`${added} draft(s) added. Review and edit them in Admin → Vaults.`);

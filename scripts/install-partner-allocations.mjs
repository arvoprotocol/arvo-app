// Adds Strategic Partner allocation storage: StrategicPartner.allocationUsd and the PartnerRelease table.
// Run once per database:  node scripts/install-partner-allocations.mjs
// Backs the database up first. Safe to run again: it stops without changes if already installed.
import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
const raw = process.env.DATABASE_URL;
if (!raw || !raw.startsWith("file:") || raw.includes("?") || raw.includes("#") || raw === "file::memory:") throw new Error("Set DATABASE_URL to the existing SQLite file. Stopped without creating a database.");
const path = resolve(raw.slice(5)); if (!existsSync(path)) throw new Error("Existing database not found. Stopped without changes.");
const db = new Database(path, { fileMustExist: true });
const info = table => db.prepare(`PRAGMA table_info('${table}')`).all();
try {
  if (!info("StrategicPartner").length) throw new Error("StrategicPartner table missing. Stopped without changes.");
  const columns = ["allocationUsd", "allocationArvo", "allocationPrice"].filter(name => !info("StrategicPartner").some(c => c.name === name));
  const needsTable = info("PartnerRelease").length === 0;
  if (!columns.length && !needsTable) { console.log("Partner allocations already installed. No database changes."); }
  else {
    const folder = resolve(dirname(path), "backups"); mkdirSync(folder, { recursive: true, mode: 0o700 });
    const backup = resolve(folder, basename(path) + ".before-partner-allocations-" + new Date().toISOString().replace(/[:.]/g, "-"));
    await db.backup(backup); console.log("Backup:", backup);
    db.transaction(() => {
      for (const name of columns) db.exec(`ALTER TABLE "StrategicPartner" ADD COLUMN "${name}" TEXT;`);
      if (needsTable) db.exec(`CREATE TABLE "PartnerRelease" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "partnerId" INTEGER NOT NULL, "tranche" INTEGER NOT NULL, "amountArvo" TEXT NOT NULL, "txHash" TEXT, "sentAt" DATETIME NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PartnerRelease_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "StrategicPartner" ("id") ON DELETE CASCADE ON UPDATE CASCADE);
CREATE UNIQUE INDEX "PartnerRelease_partnerId_tranche_key" ON "PartnerRelease"("partnerId", "tranche");`);
    })();
    console.log(`Partner allocations installed (${[...columns, ...(needsTable ? ["PartnerRelease table"] : [])].join(", ")}). Existing partners unchanged.`);
  }
} finally { db.close(); }

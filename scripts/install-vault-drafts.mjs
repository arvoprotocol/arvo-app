import Database from "better-sqlite3";
import { existsSync, mkdirSync, chmodSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";

const raw = process.env.DATABASE_URL;
if (!raw || !raw.startsWith("file:") || raw.includes("?") || raw.includes("#") || raw === "file::memory:") throw new Error("Set DATABASE_URL to the existing SQLite file before running this script.");
const path = resolve(raw.slice(5));
if (!existsSync(path)) throw new Error("Existing database not found: " + path + ". Stopped without creating a database.");
const db = new Database(path, { fileMustExist: true });
const columns = { id:"INTEGER", title:"TEXT", poolType:"TEXT", standardKind:"TEXT", valuesJson:"TEXT", productsJson:"TEXT", visibility:"TEXT", sortOrder:"INTEGER", seedKey:"TEXT", revision:"INTEGER", linkedChainId:"INTEGER", linkedProxy:"TEXT", linkedPoolId:"INTEGER", createdAt:"DATETIME", updatedAt:"DATETIME" };
const existing = db.prepare("PRAGMA table_info('StakingVaultDraft')").all();
function verify() {
  const actual = db.prepare("PRAGMA table_info('StakingVaultDraft')").all();
  if (actual.length !== Object.keys(columns).length || actual.some(c => columns[c.name] !== c.type.toUpperCase()) || actual.find(c=>c.name === "id")?.pk !== 1) throw new Error("Unexpected draft table schema. Stopped; review it before making changes.");
  const indexes = db.prepare("PRAGMA index_list('StakingVaultDraft')").all();
  for (const [name, unique, fields] of [["StakingVaultDraft_seedKey_key",1,["seedKey"]],["StakingVaultDraft_linkedChainId_linkedProxy_linkedPoolId_key",1,["linkedChainId","linkedProxy","linkedPoolId"]],["StakingVaultDraft_visibility_sortOrder_idx",0,["visibility","sortOrder"]]]) {
    const index = indexes.find(i=>i.name === name);
    if (!index || index.unique !== unique || JSON.stringify(db.prepare(`PRAGMA index_info('${name}')`).all().map(i=>i.name)) !== JSON.stringify(fields)) throw new Error("Unexpected draft indexes. Stopped without modifying the table.");
  }
}
try {
  if (existing.length) { verify(); console.log("Vault draft storage already installed. No database changes."); }
  else {
    const directory = resolve(dirname(path), "backups"); mkdirSync(directory, { recursive:true, mode:0o700 });
    const backup = resolve(directory, basename(path) + ".before-vault-drafts-" + new Date().toISOString().replace(/[:.]/g,"-") + "-" + process.pid);
    await db.backup(backup);
    const snapshot = new Database(backup, { fileMustExist:true });
    try { snapshot.pragma("journal_mode = DELETE"); } finally { snapshot.close(); }
    chmodSync(backup, 0o600); console.log("Database backup: " + backup);
    db.transaction(()=> {
      db.exec(`CREATE TABLE "StakingVaultDraft" (
        "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        "title" TEXT NOT NULL, "poolType" TEXT NOT NULL, "standardKind" TEXT NOT NULL,
        "valuesJson" TEXT NOT NULL, "productsJson" TEXT NOT NULL,
        "visibility" TEXT NOT NULL DEFAULT 'hidden', "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "seedKey" TEXT, "revision" INTEGER NOT NULL DEFAULT 1,
        "linkedChainId" INTEGER, "linkedProxy" TEXT, "linkedPoolId" INTEGER,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL);
        CREATE UNIQUE INDEX "StakingVaultDraft_seedKey_key" ON "StakingVaultDraft"("seedKey");
        CREATE UNIQUE INDEX "StakingVaultDraft_linkedChainId_linkedProxy_linkedPoolId_key" ON "StakingVaultDraft"("linkedChainId","linkedProxy","linkedPoolId");
        CREATE INDEX "StakingVaultDraft_visibility_sortOrder_idx" ON "StakingVaultDraft"("visibility","sortOrder");`);
      verify();
    })();
    console.log("Vault draft table added. Existing tables and records preserved.");
  }
} finally { db.close(); }

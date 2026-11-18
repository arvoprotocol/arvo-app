import Database from "better-sqlite3";
import {existsSync,mkdirSync,chmodSync} from "node:fs";
import {resolve,dirname,basename} from "node:path";
// Adds the maturity reminder tables. Backs up the database first.
// Existing tables are not modified. Safe to re-run: no change if installed.
const raw=process.env.DATABASE_URL;
if(!raw||!raw.startsWith("file:")||raw.includes("?")||raw.includes("#")||raw==="file::memory:")throw new Error("Set DATABASE_URL to the existing SQLite file.");
const path=resolve(raw.slice(5));if(!existsSync(path))throw new Error("Existing database not found. No database created.");
const TABLES=["ReminderSubscription","ReminderSent"];
const SQL=`
CREATE TABLE "ReminderSubscription" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "email" TEXT NOT NULL, "wallet" TEXT NOT NULL, "confirmedAt" DATETIME, "stoppedAt" DATETIME, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX "ReminderSubscription_email_wallet_key" ON "ReminderSubscription"("email", "wallet");
CREATE INDEX "ReminderSubscription_wallet_idx" ON "ReminderSubscription"("wallet");
CREATE TABLE "ReminderSent" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "subscriptionId" INTEGER NOT NULL, "positionId" TEXT NOT NULL, "kind" TEXT NOT NULL, "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ReminderSent_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "ReminderSubscription" ("id") ON DELETE CASCADE ON UPDATE CASCADE);
CREATE UNIQUE INDEX "ReminderSent_subscriptionId_positionId_kind_key" ON "ReminderSent"("subscriptionId", "positionId", "kind");
`;
const db=new Database(path,{fileMustExist:true});
try {
 if(!db.prepare("PRAGMA table_info('Project')").all().some(c=>c.name==="id"&&c.pk===1))throw new Error("Unexpected database: Project table missing. Stopped without changes.");
 const present=TABLES.filter(t=>db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(t));
 if(present.length===TABLES.length){console.log("Maturity reminders already installed. No database changes.");}
 else if(present.length){throw new Error("Partial reminders install found ("+present.join(", ")+"). Stopped without changes.");}
 else {
  const directory=resolve(dirname(path),"backups");mkdirSync(directory,{recursive:true,mode:0o700});
  const backup=resolve(directory,basename(path)+".before-reminders-"+new Date().toISOString().replace(/[:.]/g,"-")+"-"+process.pid);
  await db.backup(backup);const snapshot=new Database(backup,{fileMustExist:true});try{snapshot.pragma("journal_mode = DELETE");}finally{snapshot.close();}chmodSync(backup,0o600);console.log("Database backup: "+backup);
  db.transaction(()=>db.exec(SQL))();
  console.log("Maturity reminder tables added. Existing tables unchanged.");
 }
}finally{db.close();}

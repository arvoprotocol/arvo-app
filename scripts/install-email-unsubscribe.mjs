import Database from "better-sqlite3";
import {existsSync,mkdirSync,chmodSync} from "node:fs";
import {resolve,dirname,basename} from "node:path";
// Adds PlatformSignup.unsubscribedAt for waitlist email unsubscribe links.
// Backs up the database first. Safe to re-run: no change if already installed.
const raw=process.env.DATABASE_URL;
if(!raw||!raw.startsWith("file:")||raw.includes("?")||raw.includes("#")||raw==="file::memory:")throw new Error("Set DATABASE_URL to the existing SQLite file.");
const path=resolve(raw.slice(5));if(!existsSync(path))throw new Error("Existing database not found. No database created.");
const db=new Database(path,{fileMustExist:true});
try {
 const columns=db.prepare("PRAGMA table_info('PlatformSignup')").all();
 if(!columns.some(c=>c.name==="normalized")||!columns.some(c=>c.name==="notifiedAt"))throw new Error("Unexpected PlatformSignup schema. Stopped without changes.");
 const existing=columns.find(c=>c.name==="unsubscribedAt");
 if(existing){if(existing.type.toUpperCase()!=="DATETIME"||existing.notnull)throw new Error("Unexpected unsubscribedAt column. Stopped.");console.log("Email unsubscribe already installed. No database changes.");}
 else {
  const directory=resolve(dirname(path),"backups");mkdirSync(directory,{recursive:true,mode:0o700});
  const backup=resolve(directory,basename(path)+".before-email-unsubscribe-"+new Date().toISOString().replace(/[:.]/g,"-")+"-"+process.pid);
  await db.backup(backup);const snapshot=new Database(backup,{fileMustExist:true});try{snapshot.pragma("journal_mode = DELETE");}finally{snapshot.close();}chmodSync(backup,0o600);console.log("Database backup: "+backup);
  db.transaction(()=>{const current=db.prepare("PRAGMA table_info('PlatformSignup')").all().find(c=>c.name==="unsubscribedAt");if(!current)db.exec('ALTER TABLE "PlatformSignup" ADD COLUMN "unsubscribedAt" DATETIME');})();
  console.log("PlatformSignup.unsubscribedAt added. Existing signups preserved.");
 }
}finally{db.close();}

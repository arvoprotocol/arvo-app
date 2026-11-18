import Database from "better-sqlite3";
import {existsSync,mkdirSync,chmodSync} from "node:fs";
import {resolve,dirname,basename} from "node:path";
// Adds the Arvo Intelligence beta tables. Backs up the database first.
// Existing tables are not modified. Safe to re-run: no change if installed.
const raw=process.env.DATABASE_URL;
if(!raw||!raw.startsWith("file:")||raw.includes("?")||raw.includes("#")||raw==="file::memory:")throw new Error("Set DATABASE_URL to the existing SQLite file.");
const path=resolve(raw.slice(5));if(!existsSync(path))throw new Error("Existing database not found. No database created.");
const TABLES=["IntelligenceProject","IntelligenceDocument","IntelligenceChunk","IntelligenceQuestion"];
const SQL=`
CREATE TABLE "IntelligenceProject" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "projectId" INTEGER NOT NULL, "enabled" BOOLEAN NOT NULL DEFAULT false, "updatedAt" DATETIME NOT NULL);
CREATE UNIQUE INDEX "IntelligenceProject_projectId_key" ON "IntelligenceProject"("projectId");
CREATE TABLE "IntelligenceDocument" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "projectId" INTEGER NOT NULL, "title" TEXT NOT NULL, "docType" TEXT NOT NULL, "documentDate" DATETIME, "source" TEXT, "pages" INTEGER NOT NULL DEFAULT 0, "status" TEXT NOT NULL, "sha256" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "IntelligenceDocument_projectId_idx" ON "IntelligenceDocument"("projectId");
CREATE UNIQUE INDEX "IntelligenceDocument_projectId_sha256_key" ON "IntelligenceDocument"("projectId", "sha256");
CREATE TABLE "IntelligenceChunk" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "documentId" INTEGER NOT NULL, "page" INTEGER NOT NULL, "text" TEXT NOT NULL, CONSTRAINT "IntelligenceChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "IntelligenceDocument" ("id") ON DELETE CASCADE ON UPDATE CASCADE);
CREATE INDEX "IntelligenceChunk_documentId_idx" ON "IntelligenceChunk"("documentId");
CREATE TABLE "IntelligenceQuestion" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, "projectId" INTEGER NOT NULL, "actorHash" TEXT NOT NULL, "question" TEXT NOT NULL, "answerJson" TEXT NOT NULL, "model" TEXT NOT NULL, "inputTokens" INTEGER NOT NULL DEFAULT 0, "outputTokens" INTEGER NOT NULL DEFAULT 0, "rating" INTEGER, "feedback" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "IntelligenceQuestion_projectId_createdAt_idx" ON "IntelligenceQuestion"("projectId", "createdAt");
CREATE INDEX "IntelligenceQuestion_createdAt_idx" ON "IntelligenceQuestion"("createdAt");
`;
const db=new Database(path,{fileMustExist:true});
try {
 if(!db.prepare("PRAGMA table_info('Project')").all().some(c=>c.name==="id"&&c.pk===1))throw new Error("Unexpected database: Project table missing. Stopped without changes.");
 const present=TABLES.filter(t=>db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(t));
 if(present.length===TABLES.length){console.log("Arvo Intelligence already installed. No database changes.");}
 else if(present.length){throw new Error("Partial Intelligence install found ("+present.join(", ")+"). Stopped without changes.");}
 else {
  const directory=resolve(dirname(path),"backups");mkdirSync(directory,{recursive:true,mode:0o700});
  const backup=resolve(directory,basename(path)+".before-intelligence-"+new Date().toISOString().replace(/[:.]/g,"-")+"-"+process.pid);
  await db.backup(backup);const snapshot=new Database(backup,{fileMustExist:true});try{snapshot.pragma("journal_mode = DELETE");}finally{snapshot.close();}chmodSync(backup,0o600);console.log("Database backup: "+backup);
  db.transaction(()=>db.exec(SQL))();
  console.log("Arvo Intelligence tables added. Existing tables unchanged.");
 }
}finally{db.close();}

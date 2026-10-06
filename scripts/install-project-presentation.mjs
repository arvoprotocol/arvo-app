import Database from "better-sqlite3";
import {existsSync,mkdirSync,chmodSync} from "node:fs";
import {resolve,dirname,basename} from "node:path";
const raw=process.env.DATABASE_URL;
if(!raw||!raw.startsWith("file:")||raw.includes("?")||raw.includes("#")||raw==="file::memory:")throw new Error("Set DATABASE_URL to the existing SQLite file.");
const path=resolve(raw.slice(5));if(!existsSync(path))throw new Error("Existing database not found. No database created.");
const db=new Database(path,{fileMustExist:true});
try {
 const columns=db.prepare("PRAGMA table_info('Project')").all();
 if(!columns.some(c=>c.name==="id"&&c.pk===1)||!columns.some(c=>c.name==="trackPlots"))throw new Error("Unexpected Project schema. Stopped without changes.");
 const existing=columns.find(c=>c.name==="displayJson");
 if(existing){if(existing.type.toUpperCase()!=="TEXT"||existing.notnull)throw new Error("Unexpected displayJson column. Stopped.");console.log("Project presentation already installed. No database changes.");}
 else {
 const directory=resolve(dirname(path),"backups");mkdirSync(directory,{recursive:true,mode:0o700});
 const backup=resolve(directory,basename(path)+".before-project-presentation-"+new Date().toISOString().replace(/[:.]/g,"-")+"-"+process.pid);
 await db.backup(backup);const snapshot=new Database(backup,{fileMustExist:true});try{snapshot.pragma("journal_mode = DELETE");}finally{snapshot.close();}chmodSync(backup,0o600);console.log("Database backup: "+backup);
 db.transaction(()=>{const current=db.prepare("PRAGMA table_info('Project')").all().find(c=>c.name==="displayJson");if(current){if(current.type.toUpperCase()!=="TEXT"||current.notnull)throw new Error("Unexpected displayJson column.");}else db.exec('ALTER TABLE "Project" ADD COLUMN "displayJson" TEXT');})();
 console.log("Optional project presentation column added. Existing records and tables preserved.");
 }
}finally{db.close();}

import Database from "better-sqlite3";
import {existsSync,mkdirSync,chmodSync} from "node:fs";
import {resolve,dirname,basename} from "node:path";
const raw=process.env.DATABASE_URL;
if(!raw||!raw.startsWith("file:")||raw.includes("?")||raw.includes("#")||raw==="file::memory:")throw new Error("Set DATABASE_URL to the existing SQLite file. No database was created.");
const path=resolve(raw.slice(5));if(!existsSync(path))throw new Error("Existing database not found. Stopped without creating a database.");
const db=new Database(path,{fileMustExist:true});
const tables={
 SupportTicket:{id:"TEXT",accessHash:"TEXT",name:"TEXT",email:"TEXT",wallet:"TEXT",category:"TEXT",subject:"TEXT",status:"TEXT",revision:"INTEGER",createdAt:"DATETIME",updatedAt:"DATETIME"},
 SupportMessage:{id:"INTEGER",ticketId:"TEXT",author:"TEXT",adminAddress:"TEXT",body:"TEXT",createdAt:"DATETIME"},
 SupportRateLimit:{key:"TEXT",count:"INTEGER",windowStart:"DATETIME"},
};
const indexes=[['SupportTicket','SupportTicket_accessHash_key',1,['accessHash']],['SupportTicket','SupportTicket_status_updatedAt_idx',0,['status','updatedAt']],['SupportMessage','SupportMessage_ticketId_id_idx',0,['ticketId','id']],['SupportRateLimit','SupportRateLimit_windowStart_idx',0,['windowStart']]];
function verify(){for(const [table,columns] of Object.entries(tables)){const actual=db.prepare(`PRAGMA table_info('${table}')`).all();if(actual.length!==Object.keys(columns).length||actual.some(c=>columns[c.name]!==c.type.toUpperCase())||actual.find(c=>c.name===(table==='SupportRateLimit'?'key':'id'))?.pk!==1)throw new Error('Unexpected support schema: '+table+'. Stopped without modifying existing tables.');}for(const [table,name,unique,fields] of indexes){const index=db.prepare(`PRAGMA index_list('${table}')`).all().find(i=>i.name===name);if(!index||index.unique!==unique||JSON.stringify(db.prepare(`PRAGMA index_info('${name}')`).all().map(i=>i.name))!==JSON.stringify(fields))throw new Error('Unexpected support index. Stopped.');}const foreign=db.prepare("PRAGMA foreign_key_list('SupportMessage')").all();if(!foreign.some(f=>f.table==='SupportTicket'&&f.from==='ticketId'&&f.to==='id'&&f.on_delete==='CASCADE'))throw new Error('Unexpected support message relation. Stopped.');}
try{for(const name of ["Project","StakingVaultDraft"]){if(!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(name))throw new Error("This is not the reviewed Arvo database. Missing "+name+". Stopped without changes.");}const installed=Object.keys(tables).filter(table=>db.prepare(`PRAGMA table_info('${table}')`).all().length);
 if(installed.length===3){verify();console.log('Support storage already installed. No database changes.');}
 else if(installed.length)throw new Error('Partial support storage found. Stopped without changes.');
 else{const folder=resolve(dirname(path),'backups');mkdirSync(folder,{recursive:true,mode:0o700});const backup=resolve(folder,basename(path)+'.before-support-'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+process.pid);await db.backup(backup);const snapshot=new Database(backup,{fileMustExist:true});try{snapshot.pragma('journal_mode = DELETE');}finally{snapshot.close();}chmodSync(backup,0o600);console.log('Database backup: '+backup);
 db.transaction(()=>{db.exec(`CREATE TABLE "SupportTicket" (
 "id" TEXT NOT NULL PRIMARY KEY,"accessHash" TEXT NOT NULL,"name" TEXT NOT NULL,"email" TEXT,"wallet" TEXT,"category" TEXT NOT NULL,"subject" TEXT NOT NULL,"status" TEXT NOT NULL DEFAULT 'open',"revision" INTEGER NOT NULL DEFAULT 1,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" DATETIME NOT NULL);
 CREATE TABLE "SupportMessage" ("id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,"ticketId" TEXT NOT NULL,"author" TEXT NOT NULL,"adminAddress" TEXT,"body" TEXT NOT NULL,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,CONSTRAINT "SupportMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE);
 CREATE TABLE "SupportRateLimit" ("key" TEXT NOT NULL PRIMARY KEY,"count" INTEGER NOT NULL DEFAULT 0,"windowStart" DATETIME NOT NULL);
 CREATE UNIQUE INDEX "SupportTicket_accessHash_key" ON "SupportTicket"("accessHash");
 CREATE INDEX "SupportTicket_status_updatedAt_idx" ON "SupportTicket"("status","updatedAt");
 CREATE INDEX "SupportMessage_ticketId_id_idx" ON "SupportMessage"("ticketId","id");
 CREATE INDEX "SupportRateLimit_windowStart_idx" ON "SupportRateLimit"("windowStart");`);verify();})();console.log('Support tables added. Existing tables and records preserved.');}
}finally{db.close();}

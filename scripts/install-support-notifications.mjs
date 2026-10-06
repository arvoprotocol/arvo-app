import Database from "better-sqlite3";
import {existsSync,mkdirSync,chmodSync} from "node:fs";
import {resolve,dirname,basename} from "node:path";
const raw=process.env.DATABASE_URL;
if(!raw||!raw.startsWith("file:")||raw.includes("?")||raw.includes("#")||raw==="file::memory:")throw new Error("Set DATABASE_URL to the existing SQLite file. Stopped without creating a database.");
const path=resolve(raw.slice(5));if(!existsSync(path))throw new Error("Existing database not found. Stopped without changes.");const db=new Database(path,{fileMustExist:true});
const columns=table=>db.prepare(`PRAGMA table_info('${table}')`).all();
const baseline=['id','accessHash','ownerWallet','name','email','wallet','category','subject','status','revision','createdAt','updatedAt'];
const added=['lastAdminMessageId','lastReadAdminMessageId'];
const spec={id:'TEXT',ticketId:'TEXT',messageId:'INTEGER',kind:'TEXT',attempts:'INTEGER',nextAttemptAt:'DATETIME',lockedAt:'DATETIME',lockToken:'TEXT',sentAt:'DATETIME',lastError:'TEXT',createdAt:'DATETIME'};
function checkIndex(name,expected,unique){const rows=db.prepare(`PRAGMA index_info('${name}')`).all();const indexes=db.prepare(`PRAGMA index_list('SupportNotification')`).all();if(JSON.stringify(rows.map(r=>r.name))!==JSON.stringify(expected)||indexes.find(r=>r.name===name)?.unique!==unique)throw new Error('Unexpected notification index. Stopped.');}
function verify(){const rows=columns('SupportNotification');if(rows.length!==Object.keys(spec).length||rows.some(c=>spec[c.name]!==c.type.toUpperCase())||rows.find(c=>c.name==='id')?.pk!==1)throw new Error('Unexpected notification table. Stopped.');for(const name of added)if(!columns('SupportTicket').some(c=>c.name===name&&c.type==='INTEGER'&&c.notnull===1&&String(c.dflt_value)==='0'))throw new Error('Unexpected read tracking. Stopped.');checkIndex('SupportNotification_messageId_key',['messageId'],1);checkIndex('SupportNotification_sentAt_nextAttemptAt_idx',['sentAt','nextAttemptAt'],0);}
try{
 for(const table of ['SupportTicket','SupportMessage','SupportRateLimit','WalletSession'])if(!columns(table).length)throw new Error(`Missing ${table}. Install wallet support first. No changes made.`);
 const existing=columns('SupportTicket');if(baseline.some(name=>!existing.some(c=>c.name===name))||existing.some(c=>!baseline.includes(c.name)&&!added.includes(c.name)))throw new Error('Support schema differs from the reviewed version. Stopped.');
 const found=added.filter(name=>existing.some(c=>c.name===name)),hasTable=columns('SupportNotification').length>0;
 if(found.length===2&&hasTable){verify();console.log('Support notification storage already installed. No database changes.');}
 else if(found.length||hasTable)throw new Error('Partial support notification installation found. Stopped without changes.');
 else{
  const folder=resolve(dirname(path),'backups');mkdirSync(folder,{recursive:true,mode:0o700});const backup=resolve(folder,basename(path)+'.before-support-notifications-'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+process.pid);
  await db.backup(backup);const snapshot=new Database(backup,{fileMustExist:true});try{snapshot.pragma('journal_mode = DELETE');}finally{snapshot.close();}chmodSync(backup,0o600);console.log('Database backup: '+backup);
  db.transaction(()=>{db.exec(`ALTER TABLE "SupportTicket" ADD COLUMN "lastAdminMessageId" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "SupportTicket" ADD COLUMN "lastReadAdminMessageId" INTEGER NOT NULL DEFAULT 0;
UPDATE "SupportTicket" SET "lastAdminMessageId" = COALESCE((SELECT MAX("id") FROM "SupportMessage" WHERE "SupportMessage"."ticketId" = "SupportTicket"."id" AND "author" = 'admin'),0);
CREATE TABLE "SupportNotification" ("id" TEXT NOT NULL PRIMARY KEY,"ticketId" TEXT NOT NULL,"messageId" INTEGER NOT NULL,"kind" TEXT NOT NULL,"attempts" INTEGER NOT NULL DEFAULT 0,"nextAttemptAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,"lockedAt" DATETIME,"lockToken" TEXT,"sentAt" DATETIME,"lastError" TEXT,"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX "SupportNotification_messageId_key" ON "SupportNotification"("messageId");
CREATE INDEX "SupportNotification_sentAt_nextAttemptAt_idx" ON "SupportNotification"("sentAt","nextAttemptAt");`);verify();})();
  console.log('Notification storage added. Existing records preserved. Historical replies are unread until opened; historical emails were not queued.');
 }
}finally{db.close();}

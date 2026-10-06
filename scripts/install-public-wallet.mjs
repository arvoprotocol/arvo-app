import Database from "better-sqlite3";
import {existsSync,mkdirSync,chmodSync} from "node:fs";
import {resolve,dirname,basename} from "node:path";
const raw=process.env.DATABASE_URL;
if(!raw||!raw.startsWith("file:")||raw.includes("?")||raw.includes("#")||raw==="file::memory:")throw new Error("Set DATABASE_URL to the existing SQLite file. Stopped without creating a database.");
const path=resolve(raw.slice(5));if(!existsSync(path))throw new Error("Existing database not found. Stopped without changes.");const db=new Database(path,{fileMustExist:true});
const specs={WalletChallenge:{id:"TEXT",address:"TEXT",chainId:"INTEGER",message:"TEXT",expiresAt:"DATETIME"},WalletSession:{id:"TEXT",address:"TEXT",chainId:"INTEGER",expiresAt:"DATETIME"}};
function info(table){return db.prepare(`PRAGMA table_info('${table}')`).all();}
function index(table,name,columns){const found=db.prepare(`PRAGMA index_list('${table}')`).all().find(row=>row.name===name);return found&&found.unique===0&&JSON.stringify(db.prepare(`PRAGMA index_info('${name}')`).all().map(row=>row.name))===JSON.stringify(columns);}
function verify(){for(const [table,columns] of Object.entries(specs)){const rows=info(table);if(rows.length!==Object.keys(columns).length||rows.some(c=>columns[c.name]!==c.type.toUpperCase())||rows.find(c=>c.name==='id')?.pk!==1||!index(table,`${table}_expiresAt_idx`,['expiresAt']))throw new Error('Unexpected wallet storage. Stopped.');}if(info('SupportTicket').find(c=>c.name==='ownerWallet')?.type!=='TEXT'||!index('SupportTicket','SupportTicket_ownerWallet_updatedAt_idx',['ownerWallet','updatedAt']))throw new Error('Unexpected ticket ownership storage. Stopped.');}
try{
 for(const table of ['Project','StakingVaultDraft','SupportTicket','SupportMessage','SupportRateLimit'])if(!info(table).length)throw new Error(`Missing ${table}. Install the support-header patch first. No changes made.`);
 const columns=info('SupportTicket'),base=['id','accessHash','name','email','wallet','category','subject','status','revision','createdAt','updatedAt'];
 if(columns.some(c=>!base.includes(c.name)&&c.name!=='ownerWallet')||base.some(name=>!columns.some(c=>c.name===name)))throw new Error('Support ticket schema differs from the reviewed version. Stopped.');
 const hasOwner=columns.some(c=>c.name==='ownerWallet'),hasTables=Object.keys(specs).filter(table=>info(table).length);
 if(hasOwner&&hasTables.length===2){verify();console.log('Wallet login and ticket ownership already installed. No database changes.');}
 else if(hasOwner||hasTables.length)throw new Error('Partial wallet installation found. Stopped without changes.');
 else{const folder=resolve(dirname(path),'backups');mkdirSync(folder,{recursive:true,mode:0o700});const backup=resolve(folder,basename(path)+'.before-public-wallet-'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+process.pid);await db.backup(backup);const snapshot=new Database(backup,{fileMustExist:true});try{snapshot.pragma('journal_mode = DELETE');}finally{snapshot.close();}chmodSync(backup,0o600);console.log('Database backup: '+backup);
 db.transaction(()=>{db.exec(`ALTER TABLE "SupportTicket" ADD COLUMN "ownerWallet" TEXT;
 CREATE INDEX "SupportTicket_ownerWallet_updatedAt_idx" ON "SupportTicket"("ownerWallet","updatedAt");
 CREATE TABLE "WalletChallenge" ("id" TEXT NOT NULL PRIMARY KEY,"address" TEXT NOT NULL,"chainId" INTEGER NOT NULL,"message" TEXT NOT NULL,"expiresAt" DATETIME NOT NULL);
 CREATE INDEX "WalletChallenge_expiresAt_idx" ON "WalletChallenge"("expiresAt");
 CREATE TABLE "WalletSession" ("id" TEXT NOT NULL PRIMARY KEY,"address" TEXT NOT NULL,"chainId" INTEGER NOT NULL,"expiresAt" DATETIME NOT NULL);
 CREATE INDEX "WalletSession_expiresAt_idx" ON "WalletSession"("expiresAt");`);verify();})();console.log('Wallet storage added. Existing tickets preserved; unverified wallet fields were not assigned ownership.');}
}finally{db.close();}

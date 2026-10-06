import {PrismaClient} from "@prisma/client";
import {PrismaBetterSqlite3} from "@prisma/adapter-better-sqlite3";
import {drainSupportMail,supportMailSettings} from "../src/lib/support/mail-worker.mjs";
import {existsSync} from "node:fs";
import {resolve} from "node:path";
import {setTimeout as delay} from "node:timers/promises";
const raw=process.env.DATABASE_URL;
if(!raw||!raw.startsWith("file:")||raw.includes("?")||raw.includes("#")||!existsSync(resolve(raw.slice(5))))throw new Error("Existing DATABASE_URL is required. No database was created.");
supportMailSettings();
const prisma=new PrismaClient({adapter:new PrismaBetterSqlite3({url:raw})});
const controller=new AbortController();for(const event of ["SIGINT","SIGTERM"])process.on(event,()=>controller.abort());
try{
 if(process.argv.includes("--status")){
  const pending=await prisma.supportNotification.count({where:{sentAt:null}}),failed=await prisma.supportNotification.count({where:{sentAt:null,lastError:{not:null}}});
  console.log({pending,awaitingRetry:failed});
 }else{
  const watch=process.argv.includes("--watch");
  do{
   try{const result=await drainSupportMail(prisma,{limit:20});if(result.sent||result.failed||!watch)console.log(result);if(result.failed&&!watch)process.exitCode=1;}
   catch{console.error("Support mail worker failed. Tickets remain saved; check notification storage and configuration.");if(!watch)process.exitCode=1;}
   if(!watch||controller.signal.aborted)break;
   try{await delay(60000,undefined,{signal:controller.signal});}catch{break;}
  }while(!controller.signal.aborted);
 }
}finally{await prisma.$disconnect();}

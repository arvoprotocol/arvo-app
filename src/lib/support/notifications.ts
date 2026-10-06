import "server-only";
import {randomBytes} from "node:crypto";
import type {Prisma} from "@prisma/client";
import {prisma} from "@/lib/prisma";
import {drainSupportMail} from "./mail-worker.mjs";
export function queueSupportEmail(tx:Prisma.TransactionClient,ticketId:string,messageId:number,kind:"created"|"reply"|"user-reply"){
 return tx.supportNotification.create({data:{id:randomBytes(16).toString("hex"),ticketId,messageId,kind}});
}
export async function dispatchSupportEmails(){try{const result=await drainSupportMail(prisma,{limit:2});if(result.failed)console.error("Support email queued for retry. Check support mail configuration.");}catch{console.error("Support email worker unavailable. Tickets remain saved; run the notification retry worker.");}}
export async function markSupportRead(address:string,id:string,messageId:number){
 if(messageId>0)await prisma.$executeRaw`UPDATE "SupportTicket" SET "lastReadAdminMessageId" = ${messageId} WHERE "id" = ${id} AND "ownerWallet" = ${address} AND "lastReadAdminMessageId" < ${messageId}`;
}

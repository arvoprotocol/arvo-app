import {requireSameOrigin,RequestError,readJson,validEmail,limitRequest} from "@/lib/security/request";
import "server-only";
import {createHash,createHmac} from "node:crypto";
import {NextResponse} from "next/server";
import {isAddress,type Address} from "viem";
import type {Prisma} from "@prisma/client";
import {prisma} from "@/lib/prisma";
import {getAdminSession} from "@/lib/admin/session";
import {hasAppAccess} from "@/lib/app-access/session";
import {categories,statuses} from "./types";
export class SupportError extends RequestError{}
export function response(value:unknown,status=200){return NextResponse.json(value,{status,headers:{"Cache-Control":"no-store","Referrer-Policy":"no-referrer","X-Content-Type-Options":"nosniff"}});}
export function failure(error:unknown){if(error instanceof RequestError)return response({error:error.message},error.status);return response({error:"Support is temporarily unavailable. Please try again."},503);}
export function accessHash(token:string){return createHash("sha256").update(token).digest("hex");}
export async function access(request:Request,admin=false,mutation=true){
 if(admin){if(!await getAdminSession())throw new SupportError("Admin login required.",401);}else if(!await hasAppAccess())throw new SupportError("Open Support through the Arvo app.",401);
 if(mutation)requireSameOrigin(request);
}
export async function body(request:Request){return readJson(request);}
export function text(value:unknown,label:string,max:number,required=true){if(value===undefined||value===null||value===""){if(required)throw new SupportError(`${label} is required.`);return "";}if(typeof value!=="string")throw new SupportError(`Invalid ${label.toLowerCase()}.`);const result=value.trim();if((required&&!result)||result.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(result))throw new SupportError(`Enter a valid ${label.toLowerCase()} (up to ${max.toLocaleString()} characters).`);return result;}
export function createFields(value:Record<string,unknown>){
 const name=text(value.name,"Name",80),email=text(value.email,"Email",254,false),wallet=text(value.wallet,"Wallet address",42,false),category=text(value.category,"Category",40),subject=text(value.subject,"Subject",150),message=text(value.message,"Message",5000);
 if(email&&!validEmail(email))throw new SupportError("Enter a valid email address.");if(wallet&&!isAddress(wallet as Address))throw new SupportError("Enter a valid wallet address.");if(!categories.includes(category as typeof categories[number]))throw new SupportError("Choose a support category.");return{name,email:email||null,wallet:wallet||null,category,subject,message};
}
export function ticketId(value:unknown){const id=text(value,"Ticket reference",32);if(!/^[a-f0-9]{32}$/.test(id))throw new SupportError("Invalid ticket reference.");return id;}
export function credentials(value:Record<string,unknown>){const id=ticketId(value.id),token=text(value.token,"Private access key",64);if(!/^[a-f0-9]{64}$/.test(token))throw new SupportError("Invalid private access key.");return{id,hash:accessHash(token)};}
export function revision(value:unknown){if(typeof value!=="number"||!Number.isSafeInteger(value)||value<1)throw new SupportError("Refresh this ticket before replying.");return value;}
export function status(value:unknown){if(typeof value!=="string"||!statuses.includes(value as typeof statuses[number]))throw new SupportError("Choose a valid ticket status.");return value;}
export function rateIdentity(request:Request){const secret=process.env.ADMIN_SESSION_SECRET;if(!secret||secret.length<32)throw new SupportError("Support is temporarily unavailable.",503);const ip=(request.headers.get("cf-connecting-ip")||request.headers.get("x-forwarded-for")?.split(",")[0]||"unknown").slice(0,120);return createHmac("sha256",secret).update(ip).digest("hex");}
export async function limit(tx:Prisma.TransactionClient,key:string,max:number,milliseconds:number){
 const start=new Date(Math.floor(Date.now()/milliseconds)*milliseconds),bucket=`${key}:${start.getTime()}`;
 const row=await tx.supportRateLimit.upsert({where:{key:bucket},create:{key:bucket,count:1,windowStart:start},update:{count:{increment:1}}});
 if(row.count>max)throw new SupportError("Too many requests. Please try again later.",429);
}
export const ticketInclude={messages:{orderBy:{id:"desc" as const},take:100},_count:{select:{messages:true}}};
type TicketRecord=Prisma.SupportTicketGetPayload<{include:typeof ticketInclude}>;
export function view(row:TicketRecord,admin=false){const ticket={id:row.id,subject:row.subject,category:row.category,status:row.status,revision:row.revision,createdAt:row.createdAt.toISOString(),updatedAt:row.updatedAt.toISOString(),messageCount:row._count.messages,unread:row.lastAdminMessageId>row.lastReadAdminMessageId,messages:[...row.messages].reverse().map(m=>({id:m.id,author:m.author,body:m.body,createdAt:m.createdAt.toISOString()}))};return admin?{...ticket,name:row.name,email:row.email,wallet:row.wallet}:ticket;}
export async function publicRate(request:Request){await limitRequest(request,"support-request",120,60000);}

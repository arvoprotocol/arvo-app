import {supportEmailHtml} from "./mail-template.mjs";
import nodemailer from "nodemailer";
import {randomBytes} from "node:crypto";

function appSupportUrl(env, user, id) {
 const base = env.NEXT_PUBLIC_APP_URL || "https://arvoprotocol.com";
 const url = new URL(base);
 if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("Support app origin is invalid.");
 url.pathname = `${env.NEXT_PUBLIC_APP_URL ? "" : "/app"}/${user ? "" : "admin/"}support`;
 url.searchParams.set("ticket", id); return url.toString();
}
const emailPattern=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
export function supportMailSettings(env=process.env){
 const host=env.SMTP_HOST,port=Number(env.SMTP_PORT||"465"),user=env.SMTP_USER,pass=env.SMTP_PASS;
 const recipient=env.SUPPORT_TEAM_ADDRESS||"team@arvoprotocol.com";
 const from=env.MAIL_FROM_ADDRESS||env.SMTP_USER;
 if(!host||!user||!pass||!Number.isInteger(port)||port<1||port>65535||!recipient||!emailPattern.test(recipient)||!from||!emailPattern.test(from))throw new Error("Support mail configuration is incomplete. Set SMTP settings, MAIL_FROM_ADDRESS and SUPPORT_TEAM_ADDRESS.");
 return {recipient,from:{name:env.MAIL_FROM_NAME||"Arvo Protocol",address:from},transport:{host,port,secure:env.SMTP_SECURE?env.SMTP_SECURE==="true":port===465,auth:{user,pass},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:20000}};
}
export async function drainSupportMail(db,{limit=5,transport,env=process.env,now=()=>new Date()}={}){
 const result={sent:0,failed:0};let mailer=transport,settings;
 for(let i=0;i<limit;i++){
  const time=now(),expired=new Date(time.getTime()-120000);
  const due={sentAt:null,nextAttemptAt:{lte:time},OR:[{lockedAt:null},{lockedAt:{lt:expired}}]};
  const row=await db.supportNotification.findFirst({where:due,orderBy:[{createdAt:"asc"},{id:"asc"}]});if(!row)break;
  const token=randomBytes(16).toString("hex");
  const claimed=await db.supportNotification.updateMany({where:{id:row.id,...due},data:{lockedAt:time,lockToken:token,attempts:{increment:1}}});if(claimed.count!==1)continue;
  try{
   settings??=supportMailSettings(env);mailer??=nodemailer.createTransport(settings.transport);
   const userReply=row.kind==="user-reply";
   if(!["created","reply","user-reply"].includes(row.kind))throw new Error("Unknown support notification kind.");
   const ticket=await db.supportTicket.findUnique({where:{id:row.ticketId}}),message=await db.supportMessage.findFirst({where:{id:row.messageId,ticketId:row.ticketId,author:userReply?"admin":"user"}});
   if(!ticket||!message)throw new Error("Support notification references a missing conversation.");
   if(userReply&&(!ticket.email||!emailPattern.test(ticket.email)||/[,;\r\n]/.test(ticket.email)))throw new Error("Support recipient is invalid.");
   const reference=ticket.id.slice(0,8).toUpperCase(),link=appSupportUrl(env,userReply,ticket.id);
   const title=userReply?"You have a new reply.":row.kind==="created"?"New support ticket.":"New message from a user.";
   const text=userReply
    ? ["The Arvo team has replied to your support ticket.","",`Reference: #${reference}`,"Sign in with the wallet used to create the ticket to read the reply.","",link,"","Reply through your ticket in the Arvo app. This email does not grant access to the conversation.","Arvo will never ask for your recovery phrase, private key or wallet password."].join("\n")
    : [title,"",`Reference: #${reference}`,`Subject: ${ticket.subject}`,`Category: ${ticket.category}`,`Name: ${ticket.name}`,`Wallet: ${ticket.ownerWallet||ticket.wallet||"Not provided"}`,`Email: ${ticket.email||"Not provided"}`,"",message.body,"",`Open the admin inbox: ${link}`,"Reply through the admin inbox so the user can see the conversation."].join("\n");
   await mailer.sendMail({from:settings.from,to:{address:userReply?ticket.email:settings.recipient},subject:userReply?`Arvo support: new reply #${reference}`:`Arvo support: ${title} #${reference}`,messageId:`<arvo-support-${row.id}@arvoprotocol.com>`,text,html:supportEmailHtml({title,reference,ticket,message,link,user:userReply})});
   await db.supportNotification.updateMany({where:{id:row.id,lockToken:token},data:{sentAt:now(),lockedAt:null,lockToken:null,lastError:null}});result.sent++;
  }catch{
   const attempts=row.attempts+1,delay=Math.min(3600000,60000*2**Math.min(attempts-1,6));
   await db.supportNotification.updateMany({where:{id:row.id,lockToken:token},data:{lockedAt:null,lockToken:null,nextAttemptAt:new Date(now().getTime()+delay),lastError:"Email delivery failed. Check support recipient and SMTP configuration, then retry."}});result.failed++;
  }
 }
 return result;
}

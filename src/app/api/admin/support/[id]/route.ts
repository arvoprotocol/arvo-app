import {queueSupportEmail,dispatchSupportEmails} from "@/lib/support/notifications";
import {prisma} from "@/lib/prisma";
import {getAdminSession} from "@/lib/admin/session";
import {access,body,failure,response,revision,status,SupportError,text,ticketId,ticketInclude,view} from "@/lib/support/server";
export const dynamic="force-dynamic";
type Context={params:Promise<{id:string}>};
export async function GET(request:Request,context:Context){try{await access(request,true,false);const id=ticketId((await context.params).id),row=await prisma.supportTicket.findUnique({where:{id},include:ticketInclude});if(!row)throw new SupportError("Ticket not found.",404);return response({ticket:view(row,true)});}catch(error){return failure(error);}}
export async function PATCH(request:Request,context:Context){try{
 await access(request,true);const session=await getAdminSession();if(!session)throw new SupportError("Admin login required.",401);const id=ticketId((await context.params).id),value=await body(request),expected=revision(value.revision),next=status(value.status),message=text(value.message,"Reply",5000,false);
 const row=await prisma.$transaction(async tx=>{const existing=await tx.supportTicket.findUnique({where:{id},include:{_count:{select:{messages:true}}}});if(!existing)throw new SupportError("Ticket not found.",404);if(message&&existing._count.messages>=500)throw new SupportError("This conversation is full.",409);const changed=await tx.supportTicket.updateMany({where:{id,revision:expected},data:{status:next,revision:{increment:1}}});if(changed.count!==1)throw new SupportError("This ticket changed. Refresh before saving.",409);if(message){const sent=await tx.supportMessage.create({data:{ticketId:id,author:"admin",adminAddress:session.address,body:message}});await tx.supportTicket.update({where:{id},data:{lastAdminMessageId:sent.id}});if(existing.email)await queueSupportEmail(tx,id,sent.id,"user-reply");}return tx.supportTicket.findUniqueOrThrow({where:{id},include:ticketInclude});});if(message&&row.email)await dispatchSupportEmails();return response({ticket:view(row,true)});
 }catch(error){return failure(error);}}

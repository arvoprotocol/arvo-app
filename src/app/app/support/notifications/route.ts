import {prisma} from "@/lib/prisma";
import {access,failure,response,publicRate,SupportError} from "@/lib/support/server";
import {requireWalletSession} from "@/lib/wallet/session";
export const dynamic="force-dynamic";
export async function GET(request:Request){try{
 await access(request,false,false);const session=await requireWalletSession(request);
 if(Number(request.headers.get("x-arvo-chain"))!==session.chainId)throw new SupportError("Sign in with your connected wallet and network.",401);
 await publicRate(request);
 const where={ownerWallet:session.address,lastAdminMessageId:{gt:prisma.supportTicket.fields.lastReadAdminMessageId}};
 const [total,tickets]=await prisma.$transaction([prisma.supportTicket.count({where}),prisma.supportTicket.findMany({where,orderBy:[{updatedAt:"desc"},{id:"desc"}],take:5,select:{id:true,subject:true,updatedAt:true}})]);
 return response({total,tickets});
 }catch(error){return failure(error);}}

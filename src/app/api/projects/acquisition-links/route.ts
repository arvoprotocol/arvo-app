import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {projectHash} from "@/lib/staking/acquisition-math";
import {hasAppAccess} from "@/lib/app-access/session";
import {getAdminSession} from "@/lib/admin/session";
export const dynamic="force-dynamic";
export async function GET(){
 try{
  if(!await hasAppAccess()&&!await getAdminSession())return NextResponse.json({error:"Sign in to view project vault links."},{status:401,headers:{"Cache-Control":"no-store"}});
  const projects=await prisma.project.findMany({where:{publishStatus:"published"},select:{id:true,title:true,slug:true},orderBy:{id:"asc"}});
  return NextResponse.json({projects:projects.map(p=>({...p,hash:projectHash(p.id)}))},{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json({error:"Project vault links are temporarily unavailable."},{status:503,headers:{"Cache-Control":"no-store"}});}
}

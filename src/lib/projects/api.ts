import {requireSameOrigin,readJson,RequestError,securityFailure} from "@/lib/security/request";
import "server-only";
import {NextResponse} from "next/server";
import {Prisma} from "@prisma/client";
import {getAdminSession} from "@/lib/admin/session";
import {prisma} from "@/lib/prisma";
import {projectInput,ProjectValidationError} from "./form";
import {editorProject,projectPlotInclude} from "./data";
import {revalidatePath} from "next/cache";
class ProjectConflict extends Error {}
export async function authorizeProjectWrite(request:Request){
 if(!await getAdminSession())return NextResponse.json({error:"Admin login required."},{status:401});
 try{requireSameOrigin(request);}catch(error){return securityFailure(error);}
 return null;
}
export async function saveProject(request:Request,id?:number){
 const denied=await authorizeProjectWrite(request);if(denied)return denied;
 try{
  if(!request.headers.get("content-type")?.includes("application/json"))return NextResponse.json({error:"JSON project details required."},{status:415});
  const body=await readJson(request,250000);if(typeof body.intent!=="string"||!["save","publish","unpublish"].includes(body.intent))throw new ProjectValidationError("Choose a valid save action.");
  const existing=id===undefined?null:await prisma.project.findUnique({where:{id},include:projectPlotInclude});if(id!==undefined&&!existing)return NextResponse.json({error:"Project not found."},{status:404});
  const publishStatus=body.intent==="publish"?"published":body.intent==="unpublish"?"draft":existing?.publishStatus??"draft";
  const {plotDetails,...project}=projectInput(body.project,publishStatus==="published",existing?.image??null);
  const knownIds=new Set(existing?.plotDetails.map(p=>p.id)??[]);
  if(plotDetails.some(p=>p.id!==undefined&&!knownIds.has(p.id)))throw new ProjectValidationError("A plot record does not belong to this project. Reload and try again.");
  const sales=plotDetails.filter(p=>p.status==="sold"||p.status==="completed");
  const sum=sales.reduce((value,p)=>value.plus(p.salePrice??0),new Prisma.Decimal(0));
  const fields={...project,...(project.trackPlots?{plotsSold:sales.length,soldValue:sales.length?sum:null}:{}),publishStatus:publishStatus as "draft"|"published",publishedAt:publishStatus==="published"?(existing?.publishedAt??new Date()):null};
  const saved=await prisma.$transaction(async tx=>{
   let projectId:number;
   if(existing){
    if(body.updatedAt!==existing.updatedAt.toISOString())throw new ProjectConflict("This project changed in another session. Reload before saving.");
    const result=await tx.project.updateMany({where:{id:existing.id,updatedAt:existing.updatedAt},data:fields});if(!result.count)throw new ProjectConflict("This project changed in another session. Reload before saving.");projectId=existing.id;
   }else projectId=(await tx.project.create({data:fields})).id;
   const retained=plotDetails.flatMap(p=>p.id===undefined?[]:[p.id]);
   await tx.projectPlot.deleteMany({where:{projectId,...(retained.length?{id:{notIn:retained}}:{})}});
   // Free labels within this transaction so an admin can rename or swap plot labels.
   for(const plot of plotDetails){if(plot.id!==undefined)await tx.projectPlot.update({where:{id:plot.id},data:{label:`__arvo_edit_${projectId}_${plot.id}`}});}
   for(const plot of plotDetails){const {id:plotId,...data}=plot;if(plotId!==undefined)await tx.projectPlot.update({where:{id:plotId},data});else await tx.projectPlot.create({data:{...data,projectId}});}
   return tx.project.findUniqueOrThrow({where:{id:projectId},include:projectPlotInclude});
  },{timeout:30000});
  for(const path of ["/app","/app/projects","/app/admin/projects",`/app/projects/${saved.slug}`,...(existing?[`/app/projects/${existing.slug}`]:[])])revalidatePath(path);
  return NextResponse.json({id:saved.id,project:editorProject(saved),publishStatus:saved.publishStatus,updatedAt:saved.updatedAt.toISOString()},{status:existing?200:201});
 }catch(error){
  if(error instanceof RequestError)return securityFailure(error);
  if(error instanceof ProjectConflict)return NextResponse.json({error:error.message},{status:409});
  if(error&&typeof error==="object"&&"code"in error&&error.code==="P2002")return NextResponse.json({error:"That project slug or plot name is already in use."},{status:409});
  if(error instanceof SyntaxError)return NextResponse.json({error:"Invalid project request."},{status:400});
  if(error instanceof ProjectValidationError)return NextResponse.json({error:error.message},{status:400});
  console.error("Project save failed",error);return NextResponse.json({error:"Unable to save the project. Please try again."},{status:500});
 }
}

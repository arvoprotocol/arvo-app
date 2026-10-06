import {NextResponse} from "next/server";
import {readFile} from "node:fs/promises";
import {join} from "node:path";
import {prisma} from "@/lib/prisma";
import {getAdminSession} from "@/lib/admin/session";
import {projectUploadDirectory} from "@/lib/projects/images";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(_request:Request,{params}:{params:Promise<{filename:string}>}){
 const {filename}=await params;if(!/^[0-9a-f-]{36}\.(jpg|png|webp)$/.test(filename))return new NextResponse(null,{status:404});
 const imageUrl=`/api/project-images/${filename}`;
 let published=Boolean(await prisma.project.findFirst({where:{image:`/api/project-images/${filename}`,publishStatus:"published"},select:{id:true}}));
 if(!published){const candidates=await prisma.project.findMany({where:{publishStatus:"published",displayJson:{contains:imageUrl}},select:{displayJson:true}});published=candidates.some(project=>{try{const gallery=JSON.parse(project.displayJson??"{}").gallery;return Array.isArray(gallery)&&gallery.includes(imageUrl);}catch{return false;}});}
 if(!published&&!await getAdminSession())return new NextResponse(null,{status:404});
 try{const bytes=await readFile(join(projectUploadDirectory,filename));return new NextResponse(new Uint8Array(bytes),{headers:{"Content-Type":filename.endsWith(".jpg")?"image/jpeg":filename.endsWith(".png")?"image/png":"image/webp","X-Content-Type-Options":"nosniff","Cache-Control":"no-store"}});}catch{return new NextResponse(null,{status:404});}
}

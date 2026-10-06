import sharp from "sharp";
import {readBytes,limitRequest,RequestError,securityFailure} from "@/lib/security/request";
import {NextResponse} from "next/server";
import {randomUUID} from "node:crypto";
import {mkdir,writeFile} from "node:fs/promises";
import {join} from "node:path";
import {authorizeProjectWrite} from "@/lib/projects/api";
import {imageExtension,maxProjectImageBytes,projectUploadDirectory} from "@/lib/projects/images";
export const runtime="nodejs";
export async function POST(request:Request){
 const denied=await authorizeProjectWrite(request);if(denied)return denied;
 if(Number(request.headers.get("content-length")??0)>maxProjectImageBytes+100000)return NextResponse.json({error:"Images must be 5 MB or smaller."},{status:413});
 try{
  await limitRequest(request,"project-upload",60,3600000);
  const raw=await readBytes(request,maxProjectImageBytes+100000);const bounded=new Request(request.url,{method:"POST",headers:{"content-type":request.headers.get("content-type")||""},body:raw});const data=await bounded.formData(),file=data.get("image");if(!(file instanceof File)||!file.size||file.size>maxProjectImageBytes)return NextResponse.json({error:"Choose a JPG, PNG or WebP image up to 5 MB."},{status:400});
  const bytes=Buffer.from(await file.arrayBuffer()),ext=imageExtension(bytes);if(!ext)return NextResponse.json({error:"Only JPG, PNG and WebP images are supported."},{status:400});
  let clean:Buffer;
  try{const image=sharp(bytes,{limitInputPixels:20000000,animated:false});const metadata=await image.metadata();if(!metadata.width||!metadata.height||(metadata.pages??1)>1||metadata.width>10000||metadata.height>10000||!["jpeg","png","webp"].includes(metadata.format??""))return NextResponse.json({error:"Choose a valid static image up to 20 megapixels."},{status:400});clean=await image.rotate().toFormat(ext==="jpg"?"jpeg":ext).toBuffer();if(clean.length>maxProjectImageBytes)return NextResponse.json({error:"Processed image exceeds 5 MB."},{status:413});}catch{return NextResponse.json({error:"Unable to decode this image. Choose a valid JPG, PNG or WebP."},{status:400});}
  await mkdir(projectUploadDirectory,{recursive:true,mode:0o750});const filename=`${randomUUID()}.${ext}`;await writeFile(join(projectUploadDirectory,filename),clean,{flag:"wx",mode:0o640});return NextResponse.json({image:`/api/project-images/${filename}`},{status:201});
 }catch(error){if(error instanceof RequestError)return securityFailure(error);console.error("Project image upload failed",error);return NextResponse.json({error:"Unable to upload the image. Check the file and try again."},{status:500});}
}

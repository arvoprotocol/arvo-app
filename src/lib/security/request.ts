import "server-only";
import {appOrigin, appSubdomainEnabled} from "@/lib/protocol/app-url";
import {createHmac} from "node:crypto";
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
export class RequestError extends Error {constructor(message:string,public status=400){super(message);}}
export function securityFailure(error:unknown){return NextResponse.json({error:error instanceof RequestError?error.message:"Unable to process this request."},{status:error instanceof RequestError?error.status:503,headers:{"Cache-Control":"no-store"}});}
export function siteOrigin(){
 const url=new URL(process.env.NEXT_PUBLIC_SITE_URL||"https://arvoprotocol.com");
 if(url.username||url.password||!["https:","http:"].includes(url.protocol)||(process.env.NODE_ENV==="production"&&url.protocol!=="https:"))throw new RequestError("Site origin is not configured securely.",503);
 return url.origin;
}
export function requireSameOrigin(request:Request){
 let supplied:URL;try{supplied=new URL(request.headers.get("origin")||"");}catch{throw new RequestError("Open this form on the Arvo website.",403);}
 const configured = [siteOrigin(), ...(appSubdomainEnabled() ? [appOrigin()] : [])];
 // Browser Origin allowlist is authoritative. Never trust forwarded host headers
 // inside a security decision; the reverse proxy may use an internal request URL.
 // Admin mutations are bound to the configured app origin, even when the
 // marketing origin is also allowed for public forms.
 const adminPath=new URL(request.url).pathname.startsWith("/api/admin/");
 let allowed=configured.includes(supplied.origin) && (!adminPath || supplied.origin===appOrigin());
 if(process.env.NODE_ENV!=="production"){
  const target=new URL(request.url);
  if(["localhost","127.0.0.1","[::1]"].includes(target.hostname)&&supplied.origin===target.origin)allowed=true;
 }
 if(!allowed||supplied.username||supplied.password||request.headers.get("sec-fetch-site")==="cross-site")throw new RequestError("Open this form on the Arvo website.",403);
}
export async function readBytes(request:Request,max:number){
 const length=request.headers.get("content-length");if(length&&(!/^\d+$/.test(length)||Number(length)>max))throw new RequestError("Request is too large.",413);
 const reader=request.body?.getReader();if(!reader)throw new RequestError("Empty request.");
 const chunks:Uint8Array[]=[];let size=0;
 try{for(;;){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>max){await reader.cancel();throw new RequestError("Request is too large.",413);}chunks.push(part.value);}}finally{reader.releaseLock();}
 const data=new Uint8Array(size);let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.length;}return data;
}
export async function readJson(request:Request,max=32768):Promise<Record<string,unknown>>{
 if(request.headers.get("content-type")?.split(";",1)[0].trim().toLowerCase()!=="application/json")throw new RequestError("JSON request required.",415);
 let value:unknown;try{value=JSON.parse(new TextDecoder().decode(await readBytes(request,max)));}catch(error){if(error instanceof RequestError)throw error;throw new RequestError("Invalid JSON request.");}
 if(!value||typeof value!=="object"||Array.isArray(value))throw new RequestError("Invalid request.");return value as Record<string,unknown>;
}
export function validEmail(value:string){return value.length<=254&&/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(value);}
export function privateKey(value:string){const secret=process.env.ADMIN_SESSION_SECRET;if(!secret||secret.length<32)throw new RequestError("Request protection is unavailable.",503);return createHmac("sha256",secret).update(value).digest("hex");}
export async function limitRequest(request:Request,scope:string,max:number,period=600000){
 const raw=(request.headers.get("cf-connecting-ip")||request.headers.get("x-forwarded-for")?.split(",")[0]||"unknown").trim().slice(0,120);
 const keys=[`security:${scope}:ip:${privateKey(raw)}`,`security:${scope}:global`];
 const start=new Date(Math.floor(Date.now()/period)*period);
 await prisma.$transaction(async tx=>{
  for(let i=0;i<keys.length;i++){
   const row=await tx.supportRateLimit.upsert({where:{key:`${keys[i]}:${start.getTime()}`},create:{key:`${keys[i]}:${start.getTime()}`,count:1,windowStart:start},update:{count:{increment:1}}});
   if(row.count>(i===0?max:Math.max(max*20,300)))throw new RequestError("Too many requests. Please try again later.",429);
  }
  // Keep expired protection buckets from accumulating indefinitely.
  await tx.supportRateLimit.deleteMany({where:{windowStart:{lt:new Date(Date.now()-86400000)}}});
 });
}

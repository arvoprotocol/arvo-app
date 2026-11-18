import {appUrl,appCookiePath} from "@/lib/protocol/app-url";
import {NextResponse} from "next/server";
import {createHash,timingSafeEqual} from "node:crypto";
import {grantAppAccess} from "@/lib/app-access/session";
import {requireSameOrigin,readBytes,limitRequest,RequestError,securityFailure,siteOrigin} from "@/lib/security/request";
import {prisma} from "@/lib/prisma";
// Early access: the shared app password OR an active invitation code.
// Codes are not consumed here (they are personal keys); deactivate a code in
// admin to stop new sign-ins with it. Existing sessions expire after 7 days.
async function validInvitation(value:string){
 const code=value.trim().toUpperCase().replace(/\s+/g,"");
 if(!code||code.length>64)return false;
 const row=await prisma.invitationCode.findUnique({where:{code},select:{id:true,isActive:true,accessAt:true}});
 if(!row||!row.isActive)return false;
 if(!row.accessAt)await prisma.invitationCode.update({where:{id:row.id},data:{accessAt:new Date()}});
 return true;
}
export async function POST(request:Request){try{
 requireSameOrigin(request);await limitRequest(request,"app-password",20,900000);
 const data=await readBytes(request,8192);
 const bounded=new Request(request.url,{method:"POST",headers:{"content-type":request.headers.get("content-type")||""},body:data});
 const password=String((await bounded.formData()).get("password")||""),expected=process.env.APP_ACCESS_PASSWORD;
 const valid=Boolean(expected&&timingSafeEqual(createHash("sha256").update(password).digest(),createHash("sha256").update(expected).digest()))||await validInvitation(password);
 const response=NextResponse.redirect(new URL(appUrl()),303);
 if(!valid){response.cookies.set("arvo_app_access_error","1",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:appCookiePath(),maxAge:10});return response;}
 await grantAppAccess();return response;
}catch(error){return error instanceof RequestError?securityFailure(error):NextResponse.json({error:"Unable to check app access."},{status:503});}}

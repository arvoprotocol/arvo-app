import {appUrl,appCookiePath} from "@/lib/protocol/app-url";
import {NextResponse} from "next/server";
import {createHash,timingSafeEqual} from "node:crypto";
import {grantAppAccess} from "@/lib/app-access/session";
import {requireSameOrigin,readBytes,limitRequest,RequestError,securityFailure,siteOrigin} from "@/lib/security/request";
export async function POST(request:Request){try{
 requireSameOrigin(request);await limitRequest(request,"app-password",20,900000);
 const data=await readBytes(request,8192);
 const bounded=new Request(request.url,{method:"POST",headers:{"content-type":request.headers.get("content-type")||""},body:data});
 const password=String((await bounded.formData()).get("password")||""),expected=process.env.APP_ACCESS_PASSWORD;
 const valid=Boolean(expected&&timingSafeEqual(createHash("sha256").update(password).digest(),createHash("sha256").update(expected).digest()));
 const response=NextResponse.redirect(new URL(appUrl()),303);
 if(!valid){response.cookies.set("arvo_app_access_error","1",{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:appCookiePath(),maxAge:10});return response;}
 await grantAppAccess();return response;
}catch(error){return error instanceof RequestError?securityFailure(error):NextResponse.json({error:"Unable to check app access."},{status:503});}}

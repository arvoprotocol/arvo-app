import {NextResponse} from "next/server";
import {clearAdminSession} from "@/lib/admin/session";
import {requireSameOrigin,securityFailure} from "@/lib/security/request";
export async function DELETE(request:Request){try{requireSameOrigin(request);await clearAdminSession();return NextResponse.json({signedOut:true},{headers:{"Cache-Control":"no-store"}});}catch(error){return securityFailure(error);}}

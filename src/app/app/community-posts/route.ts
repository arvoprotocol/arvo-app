import {NextResponse} from "next/server";
import {hasAppAccess} from "@/lib/app-access/session";
import {getAdminSession} from "@/lib/admin/session";
export const dynamic="force-dynamic";
export async function GET(){if(!await hasAppAccess()&&!await getAdminSession())return NextResponse.json({error:"Sign in to the app."},{status:401});return NextResponse.json({state:"embed_only"},{headers:{"Cache-Control":"no-store"}});}

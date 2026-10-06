import {NextResponse} from "next/server";
import {hasAppAccess} from "@/lib/app-access/session";
import {getAdminSession} from "@/lib/admin/session";
import {communityStats} from "@/lib/community/stats";
export const dynamic="force-dynamic";
export async function GET(){if(!await hasAppAccess()&&!await getAdminSession())return NextResponse.json({error:"Sign in to the app."},{status:401});try{return NextResponse.json(await communityStats(),{headers:{"Cache-Control":"no-store"}});}catch{return NextResponse.json({error:"Staking statistics are temporarily unavailable."},{status:503,headers:{"Cache-Control":"no-store"}});}}

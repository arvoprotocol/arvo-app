import {NextResponse} from "next/server";
import {saveProject} from "@/lib/projects/api";
export const runtime="nodejs";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;if(!/^[1-9]\d*$/.test(id)||Number(id)>2147483647)return NextResponse.json({error:"Project not found."},{status:404});return saveProject(request,Number(id));}

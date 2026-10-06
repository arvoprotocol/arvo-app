import {saveProject} from "@/lib/projects/api";
export const runtime="nodejs";
export async function POST(request:Request){return saveProject(request);}

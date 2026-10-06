import {notFound} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {getAdminSession} from "@/lib/admin/session";
import {editorProject,projectPlotInclude} from "@/lib/projects/data";
import {ProjectEditor} from "@/components/admin/ProjectEditor";
export const dynamic="force-dynamic";
export default async function EditProjectPage({params}:{params:Promise<{id:string}>}){if(!await getAdminSession())return null;const {id}=await params;if(!/^[1-9]\d*$/.test(id)||Number(id)>2147483647)notFound();const project=await prisma.project.findUnique({where:{id:Number(id)},include:projectPlotInclude});if(!project)notFound();return <ProjectEditor id={project.id} initial={editorProject(project)} initialStatus={project.publishStatus} initialUpdatedAt={project.updatedAt.toISOString()}/>;}

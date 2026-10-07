import {prisma} from "@/lib/prisma";
import {AcquisitionControls} from "@/components/protocol/AcquisitionControls";
import AdminPageContent from "./AdminPageContent";
import { getAdminSession } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!await getAdminSession()) return null;
  const projects=await prisma.project.findMany({select:{id:true,title:true,publishStatus:true},orderBy:{id:"asc"}});
  return <><AdminPageContent /><AcquisitionControls projects={projects}/></>;
}

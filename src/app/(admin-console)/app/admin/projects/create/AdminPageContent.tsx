import {ProjectEditor} from "@/components/admin/ProjectEditor";
import {getAdminSession} from "@/lib/admin/session";
export default async function CreateProjectPage(){if(!await getAdminSession())return null;return <ProjectEditor/>;}

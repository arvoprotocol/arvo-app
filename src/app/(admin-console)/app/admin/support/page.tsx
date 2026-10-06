import {getAdminSession} from "@/lib/admin/session";
import {PageTitle} from "@/components/protocol/ProtocolUI";
import {AdminSupportDesk} from "@/components/protocol/AdminSupportDesk";
export const dynamic="force-dynamic";
export default async function AdminSupportPage(){if(!await getAdminSession())return null;return <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11"><PageTitle eyebrow="Admin support" title="Support inbox." copy="Read private tickets, reply and manage their status."/><AdminSupportDesk/></div>;}

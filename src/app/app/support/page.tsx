import Link from "next/link";
import {PageTitle} from "@/components/protocol/ProtocolUI";
import {SupportDesk} from "@/components/protocol/SupportDesk";
import {getAdminSession} from "@/lib/admin/session";
export const dynamic="force-dynamic";
export const metadata={title:"Support | Arvo",referrer:"no-referrer" as const};
export default async function SupportPage(){const admin=await getAdminSession();return <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11"><PageTitle eyebrow="Support" title="We’re here to help." copy="Ask a question, follow a ticket and speak to the Arvo team."/>{admin&&<Link href="/app/admin/support" className="mt-4 inline-block text-sm font-semibold text-[#ad7058]">Open admin support inbox →</Link>}<SupportDesk/></div>;}

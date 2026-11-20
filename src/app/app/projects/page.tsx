import {PageTitle} from "@/components/protocol/ProtocolUI";
import {ProjectCard} from "@/components/protocol/ProjectUI";
import {getPublishedProjects} from "@/lib/projects/data";
import {SubmitProjectTile} from "@/components/protocol/SubmitProject";
export const dynamic="force-dynamic";
export default async function ProjectsPage(){
 const projects=await getPublishedProjects();
 return <div className="px-6 py-10 sm:px-8 lg:px-12 lg:py-12"><div className="mx-auto max-w-[1720px] space-y-9 lg:space-y-11">
 <PageTitle eyebrow="Operating activity" title="Projects" copy="Explore upcoming opportunities, follow active projects and review completed work. Each project’s badge shows its current status."/>
 {projects.length>0?<div className="grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">{projects.map(project=><ProjectCard key={project.slug} project={project}/>)}</div>:<div className="rounded-[22px] border border-dashed border-black/15 px-6 py-14 text-center"><h2 className="text-xl font-semibold">Project updates coming soon.</h2><p className="mt-3 text-sm leading-6 text-black/50">Published project information will appear here as it becomes available.</p></div>}
 <SubmitProjectTile/>
 <div className="rounded-[22px] bg-[#07090b] p-6 text-white md:p-8"><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#e2a98e]">Transparency</p><h3 className="mt-3 text-xl font-semibold tracking-[-.02em]">Follow the work. Review the results.</h3><p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">Upcoming opportunities remain under review unless confirmed. Historical team projects demonstrate the operating team’s experience and did not contribute to the Arvo Treasury. Staking does not represent ownership of, or investment into, an individual project or underlying asset.</p></div>
 </div></div>;
}

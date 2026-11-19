import {ProjectGallery} from "@/components/protocol/ProjectGallery";
import {ProjectVideo} from "@/components/protocol/ProjectVideo";
import {defaultPresentation} from "@/lib/projects/presentation";
import {plotStatuses} from "@/lib/projects/plots";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  MapPin,
} from "lucide-react";

import {
  ProjectMetric,
  ProjectTitleBadge,
  ProjectMilestones,
  projectCardMetrics,
  ProjectOriginNote,
  ProjectVisual,
} from "@/components/protocol/ProjectUI";

import {getPublishedProject} from "@/lib/projects/data";
export const dynamic="force-dynamic";
export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await getPublishedProject(slug);

  if (!project) notFound();

  const presentation=project.presentation??defaultPresentation;
  const isPlots=presentation.kind==="plots";
  const sold = project.plotsSold ?? 0;
  const progress = project.plots ? Math.round((sold / project.plots) * 100) : 0;

  return (
    <div className="px-6 py-10 sm:px-8 lg:px-12 lg:py-12">

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/app/projects" className="inline-flex items-center gap-2 rounded-xl py-3 text-sm font-semibold text-black/55 hover:text-[#07090b]"><ArrowLeft size={15}/>All projects</Link>
        {project.acquisitionProjectHash&&<div className="flex items-center gap-3">
          <Link href={`/app/stake?project=${project.acquisitionProjectHash}`} className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(110deg,#c9846a,#f0d2b0,#bba0ce)] px-5 py-3 text-sm font-semibold text-[#07090b] shadow-sm focus-visible:outline-2 focus-visible:outline-offset-4">Explore linked project vaults →</Link>
          <details className="group relative"><summary aria-label="About project vaults" className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-full border border-black/15 text-sm font-semibold text-black/60 [&::-webkit-details-marker]:hidden">i</summary><p className="absolute right-0 top-10 z-20 w-64 rounded-2xl border border-black/10 bg-white p-4 text-xs leading-5 shadow-lg">Stake in a published vault linked to this project, when available. Each vault has its own deposit terms and rewards. This does not grant ownership of the project. Projects without a published vault cannot accept stakes yet.</p></details>
        </div>}
      </div>

      {/* Heading */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.14em] text-[#b9775d]">
          {project.statusLabel}
        </div>

        <h1 className="max-w-4xl text-4xl font-semibold tracking-[-.045em] text-[#07090b] md:text-5xl">
          {project.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-black/45">
          <MapPin size={14} />
          {project.location}
        </div>
        {project.titleNumber.trim()&&<div className="mt-2"><ProjectTitleBadge titleNumber={project.titleNumber}/></div>}

        <ProjectOriginNote project={project}/>
      </div>

      {/* Main project area */}
      <div className="grid items-start gap-6 xl:items-stretch xl:grid-cols-[1.45fr_.55fr]">

        {/* Project image */}
        <div className="relative min-w-0">
          <ProjectGallery key={project.slug} project={project} />
        </div>

        {/* Project information */}
        <div className="rounded-[22px] border border-black/[.07] bg-white p-6 shadow-[0_18px_55px_rgba(7,9,11,.055)] md:p-7">

          <div className="border-b border-black/[.07] pb-6">
            <div className="text-[10px] font-semibold uppercase tracking-[.14em] text-black/35">
              Current status
            </div>

            <div className="mt-2 text-2xl font-semibold tracking-[-.025em] text-[#07090b]">
              {project.statusLabel}
            </div>

            <div className="mt-1 text-sm text-black/45">
              {project.stage}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-7 py-7">
            {projectCardMetrics(project).map((m,index)=><ProjectMetric key={index} {...m}/>)}
            {isPlots&&project.plots>0&&<ProjectMetric label="Plots sold" value={`${sold.toLocaleString("en-GB")} / ${project.plots.toLocaleString("en-GB")}`}/>}
            {presentation.showFinancials&&<>
              <ProjectMetric label={project.status==="upcoming"?"Indicative acquisition":"Acquisition"} value={project.acquisitionPrice}/>
              <ProjectMetric label={project.soldValue?(project.trackPlots?"Agreed sale value":"Total sale proceeds"):"Guide value"} value={project.soldValue??project.guideValue}/>
            </>}

          </div>

          {project.acquisitionDate && (
            <div className="border-t border-black/[.07] pt-6">
              <div className="flex items-center gap-3 rounded-[14px] bg-[#fbf4ef] p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#c9846a]/10 text-[#b9775d]">
                  <CalendarDays size={17} />
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[.12em] text-black/35">
                    Acquisition date
                  </div>

                  <div className="mt-1 text-sm font-semibold text-[#07090b]">
                    {project.acquisitionDate}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {project.description.trim()&&<section className="mt-6 rounded-[24px] border border-black/[.07] bg-white p-6 md:p-8"><p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#b9775d]">Project overview</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.03em]">About this project</h2><p className="mt-4 max-w-4xl whitespace-pre-line break-words text-sm leading-7 text-black/60">{project.description}</p></section>}

      {presentation.videoUrl&&<ProjectVideo key={presentation.videoUrl} url={presentation.videoUrl} title={project.title} poster={project.image}/>}

      {/* Plot sales */}
      {isPlots&&project.plots>0&&<section className="mt-6 rounded-[24px] border border-black/[.07] bg-white p-6 shadow-[0_18px_55px_rgba(7,9,11,.04)] md:p-8">

        <div className="mb-8">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[.14em] text-[#b9775d]">
            Disposal progress
          </div>

          <h2 className="text-2xl font-semibold tracking-[-.03em] text-[#07090b]">
            Plot sales
          </h2>
        </div>

        <div className="mb-4 flex items-end justify-between">
          <div>
            <span className="text-4xl font-semibold tracking-[-.04em] text-[#07090b]">
              {sold.toLocaleString("en-GB")}
            </span>

            <span className="ml-2 text-sm text-black/40">
              of {project.plots.toLocaleString("en-GB")} plots sold
            </span>
          </div>

          <div className="text-sm font-semibold text-[#07090b]">
            {progress}%
          </div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-black/[.06]">
          <div
            className="h-full rounded-full bg-[#c9846a]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {project.trackPlots ? <>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ProjectMetric label="Plots completed" value={`${(project.plotsCompleted??0).toLocaleString("en-GB")} / ${project.plots.toLocaleString("en-GB")}`}/>
            <ProjectMetric label="Completed sale value" value={project.completedSaleValue??"–"}/>
          </div>
          <p className="mt-4 text-xs leading-5 text-black/50">Sold includes agreed sales awaiting completion and completed sales. These are gross sale values, not recorded contributions to the Arvo Treasury.</p>
          <div className="mt-6 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-black/10 text-xs text-black/50"><tr><th className="p-3">Plot</th><th className="p-3">Status</th><th className="p-3 text-right">Agreed sale price</th></tr></thead><tbody>{project.plotDetails.map(plot=><tr key={plot.label} className="border-b border-black/5"><td className="p-3 font-semibold">{plot.label}</td><td className="p-3">{plotStatuses[plot.status]}</td><td className="p-3 text-right">{plot.salePrice??"–"}</td></tr>)}</tbody></table></div>
        </> : <p className="mt-5 text-sm leading-6 text-black/50">{project.projectOrigin==="team_track_record"?"Historical project totals are shown above. Individual auction and completion records are not published.":"Project-level totals are shown above. Individual plot records will appear when added."}</p>}
      </section>}
      {presentation.showMilestones&&presentation.milestones.length>0&&<section className="mt-6 rounded-[24px] border border-black/[.07] bg-white p-6 md:p-8"><p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#b9775d]">Project progress</p><h2 className="mb-6 mt-2 text-2xl font-semibold tracking-[-.03em]">Project timeline</h2><ProjectMilestones project={project}/></section>}

      {/* Disclaimer */}
      <div className="mt-6 rounded-[16px] border border-black/[.06] bg-black/[.025] px-5 py-4">
        <p className="text-[11px] leading-5 text-black/40">
          Project information is provided for transparency into Arvo operating
          activity. Figures may include guides or estimates where expressly
          labelled. Staking does not represent ownership of, or investment into,
          an individual project or underlying asset.
        </p>
      </div>

    </div>
  );
}

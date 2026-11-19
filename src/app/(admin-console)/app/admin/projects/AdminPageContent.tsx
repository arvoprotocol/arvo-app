import {readPresentation} from "@/lib/projects/presentation";
import {ProjectTitleBadge} from "@/components/protocol/ProjectUI";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  FolderKanban,
  MapPin,
  Plus,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import {
  PageTitle,
  Panel,
  PanelHeader,
  StatCard,
  StatusPill,
} from "@/components/protocol/ProtocolUI";

export const dynamic = "force-dynamic";

import {getAdminSession} from "@/lib/admin/session";
export default async function AdminProjectsPage() {
  if(!await getAdminSession())return null;
  const projects = await prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const drafts = projects.filter(
    (project) => project.publishStatus === "draft"
  ).length;

  const published = projects.filter(
    (project) => project.publishStatus === "published"
  ).length;

  const active = projects.filter(
    (project) =>
      project.status === "active" || project.status === "auction"
  ).length;

  return (
    <div className="px-4 py-8 md:px-7 md:py-10 lg:px-9 xl:px-11">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <PageTitle
          eyebrow="Operating activity"
          title="Projects."
          copy="Create, manage and publish the projects shown across the Arvo user experience."
        />

        <Link
          href="/app/admin/projects/create"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#07090b] px-4 py-3 text-xs font-semibold text-white transition hover:bg-black/80"
        >
          <Plus size={14} />
          Create project
        </Link>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Projects"
          value={`${projects.length}`}
          detail="Total records"
          icon={<FolderKanban size={16} />}
        />

        <StatCard
          label="Published"
          value={`${published}`}
          detail="Visible to users"
          icon={<CheckCircle2 size={16} />}
        />

        <StatCard
          label="Drafts"
          value={`${drafts}`}
          detail="Not publicly visible"
          icon={<CircleDashed size={16} />}
        />

        <StatCard
          label="Active"
          value={`${active}`}
          detail="Active or at auction"
          icon={<MapPin size={16} />}
        />
      </section>

      <section className="mt-8">
        <Panel>
          <PanelHeader
            eyebrow="Project management"
            title="All projects"
            action={<StatusPill>{projects.length} records</StatusPill>}
          />

          {projects.length === 0 ? (
            <div className="p-5 md:p-6">
              <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.12] bg-black/[0.018] px-6 text-center">
                <FolderKanban size={22} className="text-black/50" />

                <p className="mt-4 text-sm font-semibold">
                  No projects yet.
                </p>

                <p className="mt-1.5 max-w-md text-xs leading-5 text-black/38">
                  Create the first project to begin managing operating activity
                  through the admin console.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.06]">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="grid gap-5 p-5 md:p-6 xl:grid-cols-[1.3fr_.65fr_.65fr_auto] xl:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <PublishBadge status={project.publishStatus} />
                      <span className="text-xs text-black/50">{project.projectOrigin==="team_track_record"?"Team track record":"Arvo project"}</span>
                      <OperationalBadge status={project.status} />
                    </div>

                    <h3 className="mt-3 truncate text-base font-semibold tracking-[-.02em]">
                      {project.title}
                    </h3>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-black/55">
                      <span>{project.location}</span>
                      <ProjectTitleBadge titleNumber={project.titleNumber}/>
                    </div>
                  </div>

                  <ProjectDatum
                    label="Stage"
                    value={project.stage}
                  />

                  <ProjectDatum
                    label={readPresentation(project.displayJson).kind==="plots"?"Subdivision":"Project format"}
                    value={readPresentation(project.displayJson).kind==="plots"?`${project.plotsSold.toLocaleString("en-GB")} / ${project.plots.toLocaleString("en-GB")} sold`:readPresentation(project.displayJson).kind==="development"?"Resort / development":"Other operating project"}
                  />

                  <Link
                    href={`/app/admin/projects/${project.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/[0.08] bg-white px-4 py-2.5 text-xs font-semibold transition hover:border-black/15"
                  >
                    Manage
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </section>

      <section className="mt-8">
        <Panel>
          <PanelHeader
            eyebrow="Publishing model"
            title="Admin to frontend"
          />

          <div className="grid gap-px bg-black/[0.06] md:grid-cols-3">
            <FlowStep
              number="01"
              title="Create & edit"
              copy="Project details and imagery are managed here without changing the staking contract."
            />

            <FlowStep
              number="02"
              title="Review & publish"
              copy="Draft projects remain private until they are explicitly published."
            />

            <FlowStep
              number="03"
              title="User experience"
              copy="Published records feed the Projects area of the Arvo app from the same data source."
            />
          </div>
        </Panel>
      </section>
    </div>
  );
}

function PublishBadge({
  status,
}: {
  status: string;
}) {
  const published = status === "published";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
        published
          ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-700"
          : "border-black/[0.08] bg-black/[0.035] text-black/55"
      }`}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

function OperationalBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span className="inline-flex rounded-full border border-[#c9846a]/15 bg-[#c9846a]/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#a9654f]">
      {status}
    </span>
  );
}

function ProjectDatum({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/28">
        {label}
      </p>
      <p className="mt-1.5 text-xs font-semibold">{value}</p>
    </div>
  );
}

function FlowStep({
  number,
  title,
  copy,
}: {
  number: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="bg-white/70 p-5 md:p-6">
      <p className="font-mono text-[10px] font-semibold text-[#b9775d]">
        {number}
      </p>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1.5 text-xs leading-5 text-black/55">{copy}</p>
    </div>
  );
}

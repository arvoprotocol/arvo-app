import {projectHash} from "@/lib/staking/acquisition-math";
import {readPresentation} from "./presentation";
import "server-only";
import {Prisma} from "@prisma/client";
import type {Project as RecordProject,ProjectPlot} from "@prisma/client";
import type {Project} from "@/components/protocol/ProjectUI";
import {prisma} from "@/lib/prisma";
import type {ProjectForm} from "./form";
import type {PlotStatus} from "./plots";
type RecordWithPlots=RecordProject&{plotDetails:ProjectPlot[]};
export const projectPlotInclude={plotDetails:{orderBy:{sortOrder:"asc" as const}}};
export function editorProject(p:RecordWithPlots):ProjectForm {
 return {presentation:readPresentation(p.displayJson),projectOrigin:p.projectOrigin as ProjectForm["projectOrigin"],title:p.title,slug:p.slug,location:p.location,titleNumber:p.titleNumber,description:p.description,status:p.status,statusLabel:p.statusLabel,stage:p.stage,acres:p.acres,plots:String(p.plots),plotsSold:String(p.plotsSold),currency:p.currency,acquisitionPrice:p.acquisitionPrice?.toString()??"",guideValue:p.guideValue?.toString()??"",soldValue:p.soldValue?.toString()??"",acquisitionDate:p.acquisitionDate?.toISOString().slice(0,10)??"",trackPlots:p.trackPlots,plotDetails:p.plotDetails.map(row=>({id:row.id,label:row.label,status:row.status as PlotStatus,salePrice:row.salePrice?.toString()??"",completionDate:row.completionDate?.toISOString().slice(0,10)??""})),image:p.image??"",sortOrder:String(p.sortOrder)};
}
export function displayProject(p:RecordWithPlots):Project {
 const money=(v:Prisma.Decimal|null)=>v===null?"–":new Intl.NumberFormat("en-GB",{style:"currency",currency:["GBP","USD","EUR"].includes(p.currency)?p.currency:"GBP",minimumFractionDigits:0,maximumFractionDigits:2}).format(Number(v.toString()));
 const completed=p.trackPlots?p.plotDetails.filter(row=>row.status==="completed"):[];
 const completeValue=completed.reduce((total,row)=>total.plus(row.salePrice??0),new Prisma.Decimal(0));
 return {acquisitionProjectHash:projectHash(p.id),presentation:readPresentation(p.displayJson),projectOrigin:p.projectOrigin as ProjectForm["projectOrigin"],slug:p.slug,title:p.title,location:p.location,titleNumber:p.titleNumber,image:p.image??undefined,status:p.status,statusLabel:p.statusLabel,stage:p.stage||"–",acres:p.acres||"–",plots:p.plots,plotsSold:p.plotsSold,acquisitionPrice:money(p.acquisitionPrice),guideValue:money(p.guideValue),soldValue:p.soldValue===null?undefined:money(p.soldValue),acquisitionDate:p.acquisitionDate?.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}),trackPlots:p.trackPlots,plotsCompleted:p.trackPlots?completed.length:undefined,completedSaleValue:p.trackPlots?money(completeValue):undefined,plotDetails:p.trackPlots?p.plotDetails.map(row=>({label:row.label,status:row.status as PlotStatus,salePrice:row.salePrice===null?undefined:money(row.salePrice)})):[],description:p.description};
}
export async function getPublishedProjects(){return (await prisma.project.findMany({where:{publishStatus:"published"},include:projectPlotInclude,orderBy:[{sortOrder:"asc"},{createdAt:"desc"}]})).map(displayProject);}
export async function getPublishedProject(slug:string){const p=await prisma.project.findFirst({where:{slug,publishStatus:"published"},include:projectPlotInclude});return p?displayProject(p):null;}

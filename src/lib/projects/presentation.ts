import {galleryInput,projectVideoSource} from "./media";
export type ProjectPresentation = {
 kind:"plots"|"development"|"other";
 showFinancials:boolean;
 showMilestones:boolean;
 gallery:string[];
 videoUrl:string;
 /** Optional second video, shown beside the first on wider screens. */
 videoUrl2?:string;
 /** Optional cover frame, in seconds, for each self-hosted video. Empty = a fifth of the way through. */
 videoCover?:number;
 videoCover2?:number;
 metrics:{label:string;value:string}[];
 milestones:{label:string;status:"planned"|"in_progress"|"completed";date?:string;note?:string}[];
 /** Shown when someone explores linked vaults and none are published yet, e.g. a planned rental-yield vault. */
 vaultNote?:string;
};
export const defaultPresentation:ProjectPresentation={kind:"plots",showFinancials:true,showMilestones:false,gallery:[],videoUrl:"",metrics:[],milestones:[]};
export function presentationInput(value:unknown):ProjectPresentation {
 if(!value||typeof value!=="object"||Array.isArray(value))throw new Error("Choose project presentation settings.");
 const v=value as Record<string,unknown>;
 if(!["plots","development","other"].includes(String(v.kind))||typeof v.showFinancials!=="boolean")throw new Error("Choose a valid project format and financial visibility.");
 if(!Array.isArray(v.metrics)||v.metrics.length>3||!Array.isArray(v.milestones)||v.milestones.length>12)throw new Error("Use up to three project details and twelve milestones.");
 if(v.showMilestones!==undefined&&typeof v.showMilestones!=="boolean")throw new Error("Choose whether milestones are shown publicly.");
 const gallery=galleryInput(v.gallery);
 if(v.videoUrl!==undefined&&(typeof v.videoUrl!=="string"||v.videoUrl.length>1000))throw new Error("Enter a video URL up to 1,000 characters.");
 const videoUrl=(v.videoUrl as string|undefined)?.trim()??"";projectVideoSource(videoUrl);
 if(v.videoUrl2!==undefined&&(typeof v.videoUrl2!=="string"||v.videoUrl2.length>1000))throw new Error("Enter a second video URL up to 1,000 characters.");
 const videoUrl2=(v.videoUrl2 as string|undefined)?.trim()??"";projectVideoSource(videoUrl2);
 const cover=(value:unknown,which:string)=>{if(value===undefined||value===null||value==="")return undefined;const n=Number(value);if(!Number.isFinite(n)||n<0||n>36000)throw new Error(`The ${which} cover frame must be a number of seconds.`);return Math.round(n*10)/10;};
 const videoCover=cover(v.videoCover,"first video"),videoCover2=cover(v.videoCover2,"second video");
 if(v.vaultNote!==undefined&&(typeof v.vaultNote!=="string"||v.vaultNote.length>700))throw new Error("The linked vault note must be 700 characters or fewer.");
 const vaultNote=typeof v.vaultNote==="string"?v.vaultNote.trim():"";
 const metrics=v.metrics.map((row:unknown)=>{
  if(!row||typeof row!=="object")throw new Error("Invalid project detail.");
  const r=row as Record<string,unknown>;
  if(typeof r.label!=="string"||typeof r.value!=="string"||r.label.length>40||r.value.length>100)throw new Error("Project details need a label (up to 40 characters) and value (up to 100).");
  const label=r.label.trim(),value=r.value.trim();if(!label||!value)throw new Error("Complete both the label and value, or remove the project detail.");return {label,value};
 });
 const milestones=v.milestones.map((row:unknown)=>{
  if(!row||typeof row!=="object")throw new Error("Invalid milestone.");const r=row as Record<string,unknown>;
  if(typeof r.label!=="string"||!r.label.trim()||r.label.length>120||!["planned","in_progress","completed"].includes(String(r.status)))throw new Error("Each milestone needs a name and valid status.");
  if(r.date!==undefined&&r.date!==""&&(typeof r.date!=="string"||!/^\d{4}-\d{2}(-\d{2})?$/.test(r.date)))throw new Error("Milestone dates must be YYYY-MM or YYYY-MM-DD.");
  if(r.note!==undefined&&(typeof r.note!=="string"||r.note.length>280))throw new Error("Milestone updates must be 280 characters or fewer.");
  return {label:r.label.trim(),status:r.status as ProjectPresentation["milestones"][number]["status"],...(typeof r.date==="string"&&r.date?{date:r.date}:{}),...(typeof r.note==="string"&&r.note.trim()?{note:r.note.trim()}:{})};
 });
 return {kind:v.kind as ProjectPresentation["kind"],showFinancials:v.showFinancials,showMilestones:v.showMilestones===undefined?milestones.length>0:v.showMilestones,gallery,videoUrl,...(videoUrl2?{videoUrl2}:{}),...(videoCover!==undefined?{videoCover}:{}),...(videoCover2!==undefined?{videoCover2}:{}),metrics,milestones,...(vaultNote?{vaultNote}:{})};
}
export function readPresentation(json:string|null|undefined):ProjectPresentation {
 if(!json)return {...defaultPresentation,metrics:[],milestones:[]};
 return presentationInput(JSON.parse(json));
}
export const milestoneLabels={planned:"Planned",in_progress:"In progress",completed:"Completed"};

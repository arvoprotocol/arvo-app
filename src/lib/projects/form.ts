import {defaultPresentation,presentationInput,type ProjectPresentation} from "./presentation";
import {dateOnly,plotInputs,type PlotForm} from "./plots";
export type ProjectForm = {
 presentation:ProjectPresentation;
 projectOrigin:"arvo"|"team_track_record"; title:string; slug:string; location:string; titleNumber:string; description:string;
 status:"upcoming"|"active"|"auction"|"completed"; statusLabel:string; stage:string; acres:string;
 plots:string; plotsSold:string; currency:string; acquisitionPrice:string; guideValue:string;
 soldValue:string; acquisitionDate:string; trackPlots:boolean; plotDetails:PlotForm[]; image:string; sortOrder:string;
};
export const blankProject:ProjectForm={presentation:defaultPresentation,projectOrigin:"arvo",title:"",slug:"",location:"",titleNumber:"",description:"",status:"upcoming",statusLabel:"Upcoming",stage:"",acres:"",plots:"0",plotsSold:"0",currency:"GBP",acquisitionPrice:"",guideValue:"",soldValue:"",acquisitionDate:"",trackPlots:false,plotDetails:[],image:"",sortOrder:"0"};
export class ProjectValidationError extends Error {}
export function projectInput(value:unknown,publishing:boolean,existingImage:string|null=null){
 if(!value || typeof value!=="object" || Array.isArray(value))throw new ProjectValidationError("Invalid project details.");
 const v=value as Record<string,unknown>;
 function text(key:string,max=200){if(typeof v[key]!=="string")throw new ProjectValidationError(`Invalid ${key}.`);const result=(v[key] as string).trim();if(result.length>max)throw new ProjectValidationError(`${key} is too long.`);return result;}
 function integer(key:string){const s=text(key,12);if(!/^\d+$/.test(s)||Number(s)>2147483647)throw new ProjectValidationError(`${key} must be a non-negative whole number.`);return Number(s);}
 function money(key:string){const s=text(key,30);if(!s)return null;if(!/^\d{1,14}(?:\.\d{1,2})?$/.test(s))throw new ProjectValidationError(`${key} must be a non-negative amount with up to two decimal places.`);return s;}
 const projectOrigin=text("projectOrigin",30);
 if(!["arvo","team_track_record"].includes(projectOrigin))throw new ProjectValidationError("Choose a project category.");
 const title=text("title"),slug=text("slug",120),location=text("location"),description=text("description",20000),status=text("status"),currency=text("currency",3);
 if(!title)throw new ProjectValidationError("Enter a project title.");if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw new ProjectValidationError("Use lowercase letters, numbers and single hyphens for the slug.");
 if(!["upcoming","active","auction","completed"].includes(status))throw new ProjectValidationError("Choose a valid status.");if(!["GBP","USD","EUR"].includes(currency))throw new ProjectValidationError("Choose a supported currency.");
 if(publishing&&(!location||!description))throw new ProjectValidationError("Add a location and description before publishing.");
 if(projectOrigin==="team_track_record"&&status!=="completed")throw new ProjectValidationError("Team track record projects must have Completed status.");
 let presentation:ProjectPresentation;
 try{presentation=presentationInput(v.presentation??defaultPresentation);}catch(e){throw new ProjectValidationError(e instanceof Error?e.message:"Invalid project presentation.");}
 if(presentation.kind!=="plots"&&v.trackPlots)throw new ProjectValidationError("Development and other projects use milestones rather than individual plot tracking. Turn off plot tracking first.");
 const plots=integer("plots"),plotsSold=integer("plotsSold");if(plotsSold>plots)throw new ProjectValidationError("Plots sold cannot exceed total plots.");
 const image=text("image",500);if(image&&image!==existingImage&&!/^\/api\/project-images\/[0-9a-f-]{36}\.(?:jpg|png|webp)$/.test(image))throw new ProjectValidationError("Upload an image using the project editor.");
 let acquisitionDate:Date|null,plotDetails:ReturnType<typeof plotInputs>;
 if(typeof v.trackPlots!=="boolean")throw new ProjectValidationError("Choose a plot tracking mode.");
 const trackPlots=v.trackPlots;
 if(projectOrigin==="team_track_record"&&trackPlots)throw new ProjectValidationError("Use summary totals for historical team projects.");
 try{acquisitionDate=dateOnly(text("acquisitionDate",10),"Acquisition date");plotDetails=plotInputs(v.plotDetails,trackPlots,plots,publishing);}catch(e){throw new ProjectValidationError(e instanceof Error?e.message:"Invalid plot details.");}
 if(publishing&&trackPlots&&status==="completed"&&plotDetails.some(p=>p.status!=="completed"))throw new ProjectValidationError("Complete every plot before publishing this project as Completed.");
 return {displayJson:JSON.stringify(presentation),projectOrigin,title,slug,location,description,titleNumber:text("titleNumber"),status:status as ProjectForm["status"],statusLabel:text("statusLabel")||status,stage:text("stage"),acres:text("acres"),plots,plotsSold,currency,acquisitionPrice:money("acquisitionPrice"),guideValue:money("guideValue"),soldValue:money("soldValue"),acquisitionDate,trackPlots,plotDetails,image:image||null,sortOrder:integer("sortOrder")};
}

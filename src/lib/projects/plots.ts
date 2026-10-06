export const plotStatuses={available:"Available",auction:"At auction",sold:"Sold — awaiting completion",completed:"Completed"} as const;
export type PlotStatus=keyof typeof plotStatuses;
export type PlotForm={id?:number;label:string;status:PlotStatus;salePrice:string;completionDate:string;};
export function dateOnly(value:string,label:string){
 if(!value)return null;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))throw new Error(`${label} must be a valid date.`);
 const d=new Date(value+"T00:00:00.000Z");if(!Number.isFinite(d.getTime())||d.toISOString().slice(0,10)!==value)throw new Error(`${label} must be a valid date.`);
 if(value>new Date().toISOString().slice(0,10))throw new Error(`${label} must be an actual date, not a future estimate.`);
 return d;
}
export function plotInputs(value:unknown,tracking:boolean,total:number,publishing:boolean){
 if(!Array.isArray(value)||value.length>500)throw new Error("A project can contain up to 500 plot records.");
 if(!tracking){if(value.length)throw new Error("Remove plot records before switching to summary totals.");return [];}
 if(value.length!==total||total<1)throw new Error("Create one record for each plot. The plot count must match the list.");
 const labels=new Set<string>(),ids=new Set<number>();
 return value.map((row:unknown,index:number)=>{
  if(!row||typeof row!=="object"||Array.isArray(row))throw new Error("Invalid plot record.");const p=row as Record<string,unknown>;
  if(typeof p.label!=="string"||!p.label.trim()||p.label.trim().length>80||p.label.trim().startsWith("__arvo_edit_"))throw new Error("Give each plot a name or number (up to 80 characters).");
  const label=p.label.trim(),key=label.toLowerCase();if(labels.has(key))throw new Error("Plot names must be unique within the project.");labels.add(key);
  if(typeof p.status!=="string"||!(p.status in plotStatuses)||!Object.prototype.hasOwnProperty.call(plotStatuses,p.status))throw new Error(`Choose a valid status for ${label}.`);
  if(typeof p.salePrice!=="string"||typeof p.completionDate!=="string")throw new Error(`Invalid details for ${label}.`);
  const price=p.salePrice.trim();if(price&&!/^\d{1,14}(?:\.\d{1,2})?$/.test(price))throw new Error(`Enter a non-negative sale price with up to two decimals for ${label}.`);
  const sold=p.status==="sold"||p.status==="completed";
  if(!sold&&(price||p.completionDate))throw new Error(`${label}: sale prices belong to sold or completed plots.`);
  if(publishing&&sold&&!price)throw new Error(`Enter the agreed sale price for ${label} before publishing.`);
  if(p.completionDate&&p.status!=="completed")throw new Error(`${label}: completion dates are only recorded after completion.`);
  const completionDate=dateOnly(p.completionDate,`${label} completion date`);
  const id=p.id;if(id!==undefined){if(typeof id!=="number"||!Number.isInteger(id)||id<1||id>2147483647||ids.has(id))throw new Error("Invalid plot ID.");ids.add(id);}
  return {id:id as number|undefined,label,status:p.status as PlotStatus,salePrice:price||null,completionDate,sortOrder:index};
 });
}

export function livePlotSummary(rows:PlotForm[]) {
 const sales=rows.filter(p=>p.status==="sold"||p.status==="completed");
 const cents=sales.reduce((total,p)=>{if(!/^\d{1,14}(?:\.\d{1,2})?$/.test(p.salePrice))return total;const [whole,fraction=""]=p.salePrice.split(".");return total+BigInt(whole)*BigInt(100)+BigInt(fraction.padEnd(2,"0"));},BigInt(0));
 return {plotsSold:String(sales.length),soldValue:sales.length?`${cents/BigInt(100)}.${String(cents%BigInt(100)).padStart(2,"0")}`:""};
}

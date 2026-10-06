export type PoolType = "standard" | "custom";
export type StandardKind = "BUILD" | "ADVANCE" | "COMPOUND" | "FOUNDATION";
export const standardPools = [
  {kind:"BUILD",name:"Build",days:60,arvo:"3",usdc:"2"},
  {kind:"ADVANCE",name:"Advance",days:90,arvo:"4",usdc:"3"},
  {kind:"COMPOUND",name:"Compound",days:180,arvo:"10",usdc:"6.5"},
  {kind:"FOUNDATION",name:"Foundation",days:365,arvo:"22",usdc:"14"},
] as const;
export const initialValues = {duration:"120",arvoRate:"0",usdcRate:"0",dualBoost:"10",boostCap:"15",minArvo:"",minArvoUsdc:"",minUsdc:"1000",opens:"",closes:"",maxArvo:"0",maxUsdc:"0"};
export type FormValues = typeof initialValues;
export const initialProducts = {arvoArvo:true,arvoUsdc:false,usdcUsdc:false,dualArvo:false,dualUsdc:false};
export type Products = typeof initialProducts;
export const productLabels: Record<keyof Products,string> = {arvoArvo:"Deposit ARVO · earn ARVO",arvoUsdc:"Deposit ARVO · earn USDC",usdcUsdc:"Deposit USDC · earn USDC",dualArvo:"Deposit ARVO + USDC · earn ARVO",dualUsdc:"Deposit ARVO + USDC · earn USDC"};
export type PreparedPool = {functionName:"createProductPool";args:readonly unknown[];summary:[string,string][]};
const MAX = (BigInt(1)<<BigInt(256))-BigInt(1);
export function tokenAmount(raw:string,decimals:number,label:string):bigint {
 const v=raw.trim(); if(!/^\d+(?:\.\d+)?$/.test(v))throw new Error(`${label}: enter a non-negative number without commas.`);
 const [w,f=""]=v.split("."); if(f.length>decimals)throw new Error(`${label}: maximum ${decimals} decimal places.`);
 const n=BigInt(w)*BigInt(10)**BigInt(decimals)+BigInt(f.padEnd(decimals,"0"));if(n>MAX)throw new Error(`${label}: amount is too large.`);return n;
}
function bps(raw:string,max:number,label:string){const n=tokenAmount(raw,2,label);if(n>BigInt(max*100))throw new Error(`${label}: maximum ${max}%.`);return Number(n);}
export function poolDateSeconds(raw: string): number {
 if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(raw)) return NaN;
 const date = new Date(`${raw}Z`);
 if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, raw.length) !== raw) return NaN;
 return Math.floor(date.getTime()/1000);
}
export function preparePool(type:PoolType,kind:StandardKind,v:FormValues,p:Products,now=Date.now()):PreparedPool {
 const opens=poolDateSeconds(v.opens),closes=v.closes?poolDateSeconds(v.closes):0;
 if(!Number.isSafeInteger(opens)||opens<=Math.floor(now/1000))throw new Error("Choose a future opening time, allowing time to fund rewards.");
 if(!Number.isSafeInteger(closes)||closes<0||(closes!==0&&closes<=opens))throw new Error("Closing time must be after opening time or empty.");
 const mask=Object.values(p).reduce((m,x,i)=>m+(x?2**i:0),0);if(!mask)throw new Error("Enable at least one deposit/reward product.");
 const preset=standardPools.find(x=>x.kind===kind)!;
 const days=type==="custom"?Number(v.duration):preset.days;
 if(type==="custom"&&(!/^\d+$/.test(v.duration)||!Number.isSafeInteger(days)||days<1||days*86400>4294967295))throw new Error("Duration must be 1–49,710 whole days.");
 const arvoRewardBps=bps(type==="custom"?v.arvoRate:preset.arvo,100,"ARVO cycle reward"),usdcRewardBps=bps(type==="custom"?v.usdcRate:preset.usdc,100,"USDC cycle reward");
 const dualBoostBps=bps(type==="custom"?v.dualBoost:"10",50,"Dual boost"),combinedBoostCapBps=bps(type==="custom"?v.boostCap:"15",50,"Boost cap");
 if(dualBoostBps>combinedBoostCapBps)throw new Error("Combined boost cap must cover the dual boost.");
 if((p.arvoArvo||p.dualArvo)&&arvoRewardBps===0)throw new Error("Enabled ARVO reward products need a positive rate.");
 if((p.arvoUsdc||p.usdcUsdc||p.dualUsdc)&&usdcRewardBps===0)throw new Error("Enabled USDC reward products need a positive rate.");
 const minArvo=tokenAmount(v.minArvo,18,"Minimum ARVO"),minUsdc=tokenAmount(v.minUsdc,6,"Minimum USDC"),crossMinimum=tokenAmount(v.minArvoUsdc,18,"ARVO minimum for USDC rewards");
 if((p.arvoArvo||p.arvoUsdc||p.dualArvo||p.dualUsdc)&&minArvo===BigInt(0))throw new Error("Minimum ARVO must be positive.");
 if((p.usdcUsdc||p.dualArvo||p.dualUsdc)&&minUsdc===BigInt(0))throw new Error("Minimum USDC must be positive.");
 if(p.arvoUsdc&&(crossMinimum===BigInt(0)||crossMinimum<minArvo))throw new Error("ARVO minimum for USDC rewards must cover the base ARVO minimum.");
 const maxArvo=tokenAmount(v.maxArvo,18,"ARVO capacity"),maxUsdc=tokenAmount(v.maxUsdc,6,"USDC capacity");
 if((p.arvoArvo||p.arvoUsdc||p.dualArvo||p.dualUsdc)&&maxArvo!==BigInt(0)&&(maxArvo<minArvo||(p.arvoUsdc&&maxArvo<crossMinimum)))throw new Error("ARVO capacity must cover each enabled product's minimum or be uncapped.");
 if((p.usdcUsdc||p.dualArvo||p.dualUsdc)&&maxUsdc!==BigInt(0)&&maxUsdc<minUsdc)throw new Error("USDC capacity must cover its minimum or be uncapped.");
 const config={duration:days*86400,arvoRewardBps,usdcRewardBps,dualBoostBps,combinedBoostCapBps,mixedArvoShareBps:5000,minArvo,minUsdc,arvoStakeEnabled:p.arvoArvo||p.arvoUsdc,usdcStakeEnabled:p.usdcUsdc,dualStakeEnabled:p.dualArvo||p.dualUsdc,arvoRewardEnabled:p.arvoArvo||p.dualArvo,usdcRewardEnabled:p.arvoUsdc||p.usdcUsdc||p.dualUsdc,mixedRewardEnabled:false};
 return {functionName:"createProductPool",args:[4,config,BigInt(opens),BigInt(closes),maxArvo,maxUsdc,mask,p.arvoUsdc?crossMinimum:BigInt(0)],summary:[
 ["Type",type==="custom"?"Custom":`${preset.name} preset`],["Contract pool type","Custom (fixed terms at creation)"],["Duration",`${days} days`],["ARVO cycle reward",`${arvoRewardBps/100}%`],["USDC cycle reward",`${usdcRewardBps/100}%`],
 ["Minimum ARVO",v.minArvo],["ARVO minimum for USDC rewards",v.minArvoUsdc],["Minimum USDC",v.minUsdc],
 ["Opens (UTC)",new Date(opens*1000).toISOString()],["Closes (UTC)",closes?new Date(closes*1000).toISOString():"Open-ended"],
 ["ARVO capacity",maxArvo===BigInt(0)?"Uncapped":v.maxArvo],["USDC capacity",maxUsdc===BigInt(0)?"Uncapped":v.maxUsdc],
 ...Object.entries(p).map(([k,x]):[string,string]=>[productLabels[k as keyof Products],x?"Enabled":"Disabled"]),["Visibility","Hidden until published"],["Reward budget","Fund and reserve separately"],["ARVO → USDC","Unavailable until validated price oracle configured"]]};
}

export function formatTokenAmount(value: bigint, decimals = 18): string {
 const scale = BigInt(10) ** BigInt(decimals);
 const fraction = (value % scale).toString().padStart(decimals, "0").replace(/0+$/, "");
 return `${value / scale}${fraction ? `.${fraction}` : ""}`;
}
export function launchMinimums(referencePrice: string): { minArvo: string; minArvoUsdc: string } {
 const price = tokenAmount(referencePrice, 18, "Reference ARVO price in USD");
 if (price === BigInt(0)) throw new Error("Reference price must be positive.");
 // Round $500 / price upwards to a multiple of 10 whole ARVO.
 // This makes the introductory 10% reward and the next minimum exact whole tokens.
 const tenTokenUnits = (BigInt(500) * BigInt(10) ** BigInt(18) + price * BigInt(10) - BigInt(1)) / (price * BigInt(10));
 const base = tenTokenUnits * BigInt(10) * BigInt(10) ** BigInt(18);
 const cross = base + base / BigInt(10);
 if (cross > MAX) throw new Error("Reference price produces a minimum that is too large.");
 return { minArvo: formatTokenAmount(base), minArvoUsdc: formatTokenAmount(cross) };
}

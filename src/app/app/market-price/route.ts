import {NextResponse} from "next/server";
import {ARVO_PAIR} from "@/lib/protocol/links";
import {parseMarketPrice,type MarketPrice} from "@/lib/protocol/price";
export const dynamic="force-dynamic";
let cached:MarketPrice|null=null,inflight:Promise<MarketPrice>|null=null;
export async function GET(){try{
 if(!cached||Date.now()-cached.fetchedAt>30000){if(!inflight)inflight=(async()=>{const r=await fetch(`https://api.dexscreener.com/latest/dex/pairs/robinhood/${ARVO_PAIR}`,{cache:"no-store",signal:AbortSignal.timeout(5000)});if(!r.ok)throw new Error("Price unavailable");return parseMarketPrice(await r.json());})();try{cached=await inflight;}finally{inflight=null;}}
 return NextResponse.json(cached,{headers:{"Cache-Control":"public, max-age=15"}});
 }catch{return NextResponse.json({error:"Market price unavailable."},{status:503,headers:{"Cache-Control":"no-store"}});}}

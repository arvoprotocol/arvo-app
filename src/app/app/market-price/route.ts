import {NextResponse} from "next/server";
import {ARVO_PAIR,ARVO_TOKEN} from "@/lib/protocol/links";
import {parseMarketPrice,type MarketPrice} from "@/lib/protocol/price";
export const dynamic="force-dynamic";
let cached:MarketPrice|null=null,inflight:Promise<MarketPrice>|null=null,lastError="";
async function load(url:string){const r=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(5000),headers:{accept:"application/json"}});if(!r.ok)throw new Error(`Dexscreener ${r.status}`);return parseMarketPrice(await r.json());}
// Tries the published pair first, then any Robinhood Chain pair for the ARVO token.
async function fetchPrice(){try{return await load(`https://api.dexscreener.com/latest/dex/pairs/robinhood/${ARVO_PAIR}`);}catch(first){try{return await load(`https://api.dexscreener.com/latest/dex/tokens/${ARVO_TOKEN}`);}catch(second){throw new Error(`${(first as Error).message}; ${(second as Error).message}`);}}}
export async function GET(){
 try{
  if(!cached||Date.now()-cached.fetchedAt>30000){if(!inflight)inflight=fetchPrice();try{cached=await inflight;lastError="";}finally{inflight=null;}}
  return NextResponse.json(cached,{headers:{"Cache-Control":"public, max-age=15"}});
 }catch(error){
  lastError=error instanceof Error?error.message.slice(0,200):"unknown";
  console.error("ARVO market price unavailable:",lastError);
  // Serve the last good price for up to 10 minutes rather than flicking to "—".
  if(cached&&Date.now()-cached.fetchedAt<600000)return NextResponse.json({...cached,stale:true},{headers:{"Cache-Control":"no-store"}});
  return NextResponse.json({error:"Market price unavailable."},{status:503,headers:{"Cache-Control":"no-store"}});
 }
}

import {NextResponse} from "next/server";
import {ARVO_PAIR,ARVO_TOKEN} from "@/lib/protocol/links";
import {parseGeckoPool,parseMarketPrice,type MarketPrice} from "@/lib/protocol/price";
export const dynamic="force-dynamic";
// Free price APIs rate-limit hard: refresh at most once a minute, back off after a failure,
// and keep serving the last good price meanwhile.
const FRESH_MS=60_000,BACKOFF_MS=90_000,STALE_MS=30*60_000;
let cached:MarketPrice|null=null,inflight:Promise<MarketPrice>|null=null,lastError="",retryAfter=0;
async function load(url:string,parse:(v:unknown)=>MarketPrice=parseMarketPrice){const r=await fetch(url,{cache:"no-store",signal:AbortSignal.timeout(5000),headers:{accept:"application/json"}});if(!r.ok)throw new Error(`${new URL(url).hostname} ${r.status}`);return parse(await r.json());}
// Primary: the published ARVO/VIRTUAL pool on GeckoTerminal (covers Robinhood Chain today).
// Backups: Dexscreener pair, token and search endpoints. Every source is checked to be the ARVO contract.
async function fetchPrice(){
 const errors:string[]=[];
 const sources:[string,(v:unknown)=>MarketPrice][]=[
  [`https://api.geckoterminal.com/api/v2/networks/robinhood/pools/${ARVO_PAIR.toLowerCase()}`,parseGeckoPool],
  [`https://api.dexscreener.com/latest/dex/pairs/robinhood/${ARVO_PAIR}`,parseMarketPrice],
  [`https://api.dexscreener.com/latest/dex/tokens/${ARVO_TOKEN}`,parseMarketPrice],
  [`https://api.dexscreener.com/latest/dex/search?q=${ARVO_TOKEN}`,parseMarketPrice],
 ];
 for(const [url,parse] of sources){try{return await load(url,parse);}catch(e){errors.push((e as Error).message);}}
 throw new Error(errors.join("; "));
}
export async function GET(){
 try{
  const now=Date.now();
  if((!cached||now-cached.fetchedAt>FRESH_MS)&&now>=retryAfter){if(!inflight)inflight=fetchPrice();try{cached=await inflight;lastError="";}catch(error){retryAfter=Date.now()+BACKOFF_MS;throw error;}finally{inflight=null;}}
  if(!cached)return NextResponse.json({error:"Market price unavailable."},{status:503,headers:{"Cache-Control":"no-store"}});
  return NextResponse.json(Date.now()-cached.fetchedAt>FRESH_MS?{...cached,stale:true}:cached,{headers:{"Cache-Control":"public, max-age=30"}});
 }catch(error){
  lastError=error instanceof Error?error.message.slice(0,200):"unknown";
  console.error("ARVO market price unavailable:",lastError);
  // Serve the last good price for up to 30 minutes rather than flicking to "—".
  if(cached&&Date.now()-cached.fetchedAt<STALE_MS)return NextResponse.json({...cached,stale:true},{headers:{"Cache-Control":"no-store"}});
  return NextResponse.json({error:"Market price unavailable."},{status:503,headers:{"Cache-Control":"no-store"}});
 }
}

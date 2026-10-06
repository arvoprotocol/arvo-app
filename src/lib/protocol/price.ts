import {ARVO_TOKEN,ARVO_PAIR} from "./links";
export type MarketPrice={priceUsd:string;change24h:number|null;fetchedAt:number;source:"Dexscreener"};
export function parseMarketPrice(value:unknown,now=Date.now()):MarketPrice{
 if(!value||typeof value!=="object"||!("pairs" in value)||!Array.isArray(value.pairs))throw new Error("Market price unavailable.");
 const pair=value.pairs.find((p:unknown)=>{if(!p||typeof p!=="object")return false;const row=p as Record<string,unknown>;return row.chainId==="robinhood"&&typeof row.pairAddress==="string"&&row.pairAddress.toLowerCase()===ARVO_PAIR.toLowerCase();});
 if(!pair||pair.baseToken?.address?.toLowerCase()!==ARVO_TOKEN.toLowerCase()||typeof pair.priceUsd!=="string"||!/^\d+(?:\.\d+)?$/.test(pair.priceUsd)||!Number.isFinite(Number(pair.priceUsd))||Number(pair.priceUsd)<=0)throw new Error("Market price unavailable.");
 const change=pair.priceChange?.h24;
 return{priceUsd:pair.priceUsd,change24h:typeof change==="number"&&Number.isFinite(change)?change:null,fetchedAt:now,source:"Dexscreener"};
}

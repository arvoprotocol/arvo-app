import {ARVO_TOKEN,ARVO_PAIR} from "./links";
export type MarketPrice={priceUsd:string;change24h:number|null;fetchedAt:number;source:"Dexscreener"|"GeckoTerminal";pair?:string;liquidityUsd?:number|null};
type Pair=Record<string,unknown>&{chainId?:unknown;pairAddress?:unknown;priceUsd?:unknown;baseToken?:{address?:string};priceChange?:{h24?:unknown};liquidity?:{usd?:unknown}};
/**
 * Picks ARVO's price from a Dexscreener response (pairs or tokens endpoint).
 * Prefers the published ARVO pair; otherwise the most liquid Robinhood Chain pair where ARVO is the base token.
 */
export function parseMarketPrice(value:unknown,now=Date.now()):MarketPrice{
 const pairs:Pair[]=value&&typeof value==="object"&&"pairs" in value&&Array.isArray((value as {pairs:unknown}).pairs)?(value as {pairs:Pair[]}).pairs:Array.isArray(value)?value as Pair[]:[];
 const valid=pairs.filter(p=>p&&typeof p==="object"&&typeof p.chainId==="string"&&p.chainId.toLowerCase().includes("robinhood")&&p.baseToken?.address?.toLowerCase()===ARVO_TOKEN.toLowerCase()&&typeof p.priceUsd==="string"&&/^\d+(?:\.\d+)?$/.test(p.priceUsd)&&Number(p.priceUsd)>0&&Number.isFinite(Number(p.priceUsd)));
 const liquidity=(p:Pair)=>typeof p.liquidity?.usd==="number"&&Number.isFinite(p.liquidity.usd)?p.liquidity.usd:0;
 const pair=valid.find(p=>typeof p.pairAddress==="string"&&p.pairAddress.toLowerCase()===ARVO_PAIR.toLowerCase())??[...valid].sort((a,b)=>liquidity(b)-liquidity(a))[0];
 if(!pair)throw new Error("Market price unavailable.");
 const change=pair.priceChange?.h24;
 return{priceUsd:pair.priceUsd as string,change24h:typeof change==="number"&&Number.isFinite(change)?change:null,fetchedAt:now,source:"Dexscreener",pair:typeof pair.pairAddress==="string"?pair.pairAddress:undefined,liquidityUsd:liquidity(pair)||null};
}

/**
 * GeckoTerminal pool response (/networks/robinhood/pools/{pool}). Accepts it only when the pool's
 * base token is the ARVO contract on Robinhood Chain, so the price is always ARVO's in USD.
 */
export function parseGeckoPool(value:unknown,now=Date.now()):MarketPrice{
 const data=(value as {data?:{id?:unknown;attributes?:Record<string,unknown>;relationships?:{base_token?:{data?:{id?:unknown}}}}})?.data;
 const base=data?.relationships?.base_token?.data?.id;
 if(typeof base!=="string"||base.toLowerCase()!==`robinhood_${ARVO_TOKEN.toLowerCase()}`)throw new Error("Market price unavailable.");
 const a=data?.attributes??{},price=a.base_token_price_usd;
 if(typeof price!=="string"||!/^\d+(?:\.\d+)?$/.test(price)||!(Number(price)>0))throw new Error("Market price unavailable.");
 const changes=a.price_change_percentage as Record<string,unknown>|undefined,change=Number(changes?.h24);
 const reserve=Number(a.reserve_in_usd);
 return{priceUsd:price,change24h:changes&&changes.h24!==undefined&&Number.isFinite(change)?change:null,fetchedAt:now,source:"GeckoTerminal",pair:typeof a.address==="string"?a.address:ARVO_PAIR,liquidityUsd:Number.isFinite(reserve)&&reserve>0?reserve:null};
}

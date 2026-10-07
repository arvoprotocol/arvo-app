import {AnnualReward} from "./AnnualReward";
export function MixedRewardRates({arvoRate,usdcRate,share,days,dark=false}:{arvoRate:number;usdcRate:number;share:number;days:number;dark?:boolean}){
 return <div className="space-y-3"><p className="text-xs">ARVO reward on your ARVO deposit</p><AnnualReward percent={arvoRate*share/100} days={days} dark={dark} prominent/><p className="text-xs">USDC reward on your USDC deposit</p><AnnualReward percent={usdcRate*(100-share)/100} days={days} dark={dark} prominent/><p className="text-xs opacity-60">{share}% ARVO / {100-share}% USDC reward weighting · before dual uplift. Each reward uses its own deposited asset.</p></div>;
}

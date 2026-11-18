// Shows a vault's reward for its full term. Rewards are fixed percentages of
// principal over the stated cycle; they are not annual rates, so no APY or
// annualised figure is shown. (Component name kept for import compatibility.)
export function termRewardLabel(percent:number,days:number){
 if(!Number.isFinite(percent)||!Number.isFinite(days)||percent<0||days<=0)return null;
 return `${Number(percent.toFixed(4))}% over ${days} days`;
}
export function AnnualReward({percent,days,dark=false,prominent=false}:{percent:number;days:number;dark?:boolean;prominent?:boolean}){
 const label=termRewardLabel(percent,days);
 if(!label)return null;
 const shown=Number(percent.toFixed(4));
 return <div className={`mt-2 ${dark?"text-white/60":"text-black/50"}`}>
  <p className="flex flex-wrap items-baseline gap-x-2">
   <span className={prominent?`text-4xl font-semibold tracking-tight tabular-nums ${dark?"text-white":"text-[#07090b]"}`:"text-sm font-semibold tabular-nums"}>{shown}%</span>
   <span className={prominent?`text-base font-semibold ${dark?"text-[#e2a98e]":"text-[#ad7058]"}`:"text-xs"}>over {days} days</span>
  </p>
  <p className="mt-1 text-[11px] leading-5">Term reward on your deposit. Not an annual rate.</p>
 </div>;
}

import { InfoTip } from "./InfoTip";
import { termLabel } from "@/lib/staking/presentation";
export function annualRates(percent:number,days:number){if(!Number.isFinite(percent)||!Number.isFinite(days)||percent<0||days<=0)return null;return {apr:percent*365/days,apy:(Math.pow(1+percent/100,365/days)-1)*100};}
/** Headline APY with a plain explanation of what it does and doesn't mean. */
export function AnnualReward({percent,days,dark=false,prominent=false}:{percent:number;days:number;dark?:boolean;prominent?:boolean}){
 const rates=annualRates(percent,days);if(!rates||!Number.isFinite(rates.apy))return null;
 const oneYear=days>=360&&days<=366;
 return <div className={`mt-2 flex items-baseline gap-2 ${dark?"text-white":"text-[#07090b]"}`}>
  <span className={prominent?"text-4xl font-semibold tracking-tight tabular-nums":"text-lg font-semibold tabular-nums"}>{rates.apy.toFixed(2)}%</span>
  <span className={`${prominent?"text-2xl":"text-sm"} font-semibold ${dark?"text-[#e2a98e]":"text-[#ad7058]"}`}>APY</span>
  <InfoTip dark={dark} label="What APY means here">
   {oneYear
    ? <>You earn {percent}% over 12 months, so the yearly figure is the same as the reward you receive.</>
    : <>You earn {percent}% over {termLabel(days)}. APY shows what that would add up to over a year if you staked again at the end of every term on the same terms. It is for comparison only: what you actually receive is the {percent}% fixed when you deposit.</>}
  </InfoTip>
 </div>;
}

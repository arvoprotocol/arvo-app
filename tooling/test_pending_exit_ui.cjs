const assert=require('node:assert/strict'),{test}=require('node:test'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,f);
const resolve=Module._resolveFilename;Module._resolveFilename=function(n,p,...r){return resolve.call(this,n.startsWith('@/')?path.join(root,'src',n.slice(2)):n,p,...r)};
const owner='0x0000000000000000000000000000000000000001';
const position={id:1n,owner,vaultId:1,stakeMode:2,rewardMode:2,openedAt:1n,maturesAt:9999999999n,settledAt:2n,arvoPrincipal:1000n*10n**18n,usdcPrincipal:1000000n,arvoReward:55n*10n**18n,usdcReward:55000n,settled:true,emergencyExit:true,pendingEmergencyUsdc:1000000n};
const state={account:owner,network:true,configured:true,loading:false,error:'',refresh(){},data:{paused:true,now:3n,arvoBalance:1000n*10n**18n,usdcBalance:0n,totalPositions:1,positions:[position],acquisitions:{1:{cash:1000000n,principal:1000000n,outstandingPrincipal:0n}}}};
const load=Module._load;Module._load=function(n,...r){
 if(n==='@/hooks/useStakingData')return{useStakingData:()=>state};
 if(n==='@/hooks/usePoolTitles')return{usePoolTitles:()=>({1:'Test acquisition vault'})};
 if(n==='@/lib/staking/user-transactions')return{connectStakingWallet:async()=>{},transact:async()=>{}};
 if(n==='./AcquisitionFunding')return{AcquisitionFunding:()=>null};
 return load.call(this,n,...r);
};
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),{OnChainPositions}=require('../src/components/protocol/OnChainPositions.tsx');
test('an exited dual stake still presents its unpaid USDG claim and forfeited rewards',()=>{
 const html=renderToStaticMarkup(React.createElement(OnChainPositions));
 assert.match(html,/USDG to be repaid/);assert.match(html,/Your ARVO has been returned/);
 assert.match(html,/Forfeited reward/);assert.match(html,/Claim your returned USDG/);
 assert.doesNotMatch(html,/Claim deposit and reward/);
});
test('a collected receipt cannot present another USDG claim action',()=>{
 position.pendingEmergencyUsdc=0n;
 try{const html=renderToStaticMarkup(React.createElement(OnChainPositions));assert.doesNotMatch(html,/Claim your returned USDG/);assert.match(html,/Forfeited reward/);}finally{position.pendingEmergencyUsdc=1000000n;}
});

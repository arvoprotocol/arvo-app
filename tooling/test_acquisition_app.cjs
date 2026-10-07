const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs');const path=require('node:path');const Module=require('node:module');const ts=require('typescript');
const root=path.resolve(__dirname,'..');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,file);
const resolve=Module._resolveFilename;Module._resolveFilename=function(name,parent,...rest){if(name.startsWith('@/'))name=path.join(root,'src',name.slice(2));return resolve.call(this,name,parent,...rest);};
const math=require('../src/lib/staking/acquisition-math.ts');const form=require('../src/lib/staking/pool-form.ts');const capacity=require('../src/lib/staking/capacity.ts');const drafts=require('../src/lib/staking/vault-draft.ts');
const escrow='0x0000000000000000000000000000000000000011',proxy='0x0000000000000000000000000000000000000022',token='0x0000000000000000000000000000000000000033',treasury='0x0000000000000000000000000000000000000044',wallet='0x0000000000000000000000000000000000000055';
const account={escrow,token,treasury,cash:1000n,principal:2000n,outstandingPrincipal:1200n,activePositions:2n};
test('claims require both pool cash and returned principal; maturity does not supply cash',()=>{
 assert.equal(math.acquisitionClaimReady(account,500n,100n),true);
 assert.equal(math.acquisitionClaimReady({...account,cash:599n},500n,100n),false);
 assert.equal(math.acquisitionClaimReady(account,1000n,0n),false);
 assert.equal(math.acquisitionClaimReady({...account,cash:99999n},2001n,0n),false);
 assert.equal(math.releasable(account),800n);assert.equal(math.releasable({...account,cash:600n}),600n);
});
test('mixed rewards match reviewed contract vector and retain independent token units',()=>{
 assert.deepEqual(math.mixedRewards(1000n*10n**18n,1000n*10n**6n,1000,1000,1000,5000),{arvo:55n*10n**18n,usdc:55n*10n**6n});
 assert.deepEqual(math.mixedRewards(100n*10n**18n,1000n*10n**6n,1000,2000,0,2500),{arvo:2500000000000000000n,usdc:150000000n});
});
function prepared(products,values={}){return form.preparePool('custom','BUILD',{...form.initialValues,duration:'60',arvoRate:'10',usdcRate:'10',minArvo:'1000',minArvoUsdc:'1500',opens:'2099-01-01T00:00',...values},{...form.initialProducts,arvoArvo:false,...products},0);}
test('sixth product sets bit 32 and native mixed reward weighting',()=>{
 const pool=prepared({dualMixed:true},{mixedShare:'25'});assert.equal(pool.args[6],32);assert.equal(pool.args[1].mixedArvoShareBps,2500);assert.equal(pool.args[1].mixedRewardEnabled,true);assert.equal(pool.args[1].dualStakeEnabled,true);
 assert.throws(()=>prepared({dualMixed:true},{mixedShare:'0'}));assert.throws(()=>prepared({dualMixed:true},{mixedShare:'100'}));
 assert.equal(prepared({usdcUsdc:true},{minArvo:'',minArvoUsdc:''}).args[1].minArvo,0n);
});
test('mixed availability requires both reward allocations',()=>{
 const p=prepared({dualMixed:true});const row={products:32,vault:p.args[1],crossMinimum:0n,arvoPrincipal:0n,usdcPrincipal:0n,pool:{maxArvoPrincipal:0n,maxUsdcPrincipal:0n,protocolArvoAllocation:0n,protocolUsdcAllocation:0n,arvoRewardBudgetRemaining:55n*10n**18n,usdcRewardBudgetRemaining:55n*10n**6n}};
 assert.equal(capacity.productAvailability(row,5).available,true);row.pool.usdcRewardBudgetRemaining-=1n;assert.equal(capacity.productAvailability(row,5).available,false);
});
test('legacy draft JSON remains valid and preserves its existing product mask',()=>{
 const values={...form.initialValues,minArvo:'1000',minArvoUsdc:'1500'};delete values.mixedShare;const products={...form.initialProducts};delete products.dualMixed;
 const draft=drafts.validateDraft({title:'Existing',poolType:'standard',standardKind:'BUILD',values,products,visibility:'hidden',sortOrder:0});assert.equal(draft.products.dualMixed,false);assert.equal(draft.values.mixedShare,'50');assert.equal(form.preparePool('standard','BUILD',{...draft.values,opens:'2099-01-01T00:00'},draft.products,0).args[6],1);
});
test('project link keys identify immutable records, independently of mutable titles and slugs',()=>{assert.equal(math.projectHash(7),math.projectHash(7));assert.notEqual(math.projectHash(7),math.projectHash(8));assert.throws(()=>math.projectHash(0));});
const calls=[];let allowance=3n;let controller=proxy;
function stub(name,exports){const file=path.join(root,'src',name);require.cache[file]={id:file,filename:file,loaded:true,exports};}
const client={getChainId:async()=>46630,getCode:async()=> '0x01',readContract:async request=>{
 if(request.functionName==='acquisitionPools')return true;
 if(request.functionName==='acquisitionEscrow')return escrow;
 if(request.functionName==='controller')return controller;
 if(request.functionName==='usdc')return token;
 if(request.functionName==='allowance')return allowance;
 if(request.functionName==='accounts')return [treasury,1n,2n,false,100n,200n,50n,2n,math.projectHash(7)];
 throw new Error('Unexpected read '+request.functionName);
}};
stub('lib/staking/pool-transactions.ts',{stakingAbi:[],stakingConnection:()=>({address:proxy,chain:{id:46630},publicClient:client})});
stub('lib/staking/user-transactions.ts',{transact:async(...args)=>{calls.push(args);}});
stub('lib/wallet/client.ts',{getWalletProvider:()=>({request:async()=>[wallet]})});
const acquisition=require('../src/lib/staking/acquisition.ts');
test('repayment resets and approves escrow allowance, then repays chosen pool from pinned wallet',async()=>{
 calls.length=0;await acquisition.repayFromWallet(7,100n,()=>{});
 assert.deepEqual(calls.map(c=>[c[0],c[1]]),[['approve',[escrow,0n]],['approve',[escrow,100n]],['repay',[7,100n]]]);
 assert.equal(calls[0][4],token);assert.equal(calls[1][5],wallet);assert.equal(calls[2][5],wallet);assert.equal(calls[2][6].address,escrow);assert.equal(calls[2][6].abi,acquisition.escrowAbi);
 allowance=100n;calls.length=0;await acquisition.repayFromWallet(8,100n,()=>{});assert.equal(calls.length,1);assert.deepEqual(calls[0][1],[8,100n]);
});
test('custody reads reject a module bound to a different controller',async()=>{controller=treasury;await assert.rejects(acquisition.acquisitionConnection(),/binding/);controller=proxy;});
test('Safe export targets escrow with zero ETH and correctly encoded pool/amount',()=>{const viem=require('viem');const tx=acquisition.safeTransaction(escrow,acquisition.escrowAbi,'releasePrincipal',[7,123n]);assert.equal(tx.to,escrow);assert.equal(tx.value,'0');assert.deepEqual(viem.decodeFunctionData({abi:acquisition.escrowAbi,data:tx.data}).args,[7,123n]);});

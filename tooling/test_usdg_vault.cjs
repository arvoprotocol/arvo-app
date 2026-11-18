const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=require.extensions['.tsx']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText,file);
const Module=require('node:module'),load=Module._load;
Module._load=function(r,...a){if(r.startsWith('@/'))r=path.join(__dirname,'../src',r.slice(2));return load.call(this,r,...a);};
const F=require('../src/lib/staking/pool-form.ts'),V=require('../src/lib/staking/vault-draft.ts'),P=require('../src/lib/staking/presentation.ts');

const usdgValues={...F.initialValues,duration:'365',usdcRate:'10',minUsdc:'1000',maxUsdc:'250000',committedUsdc:'200000',opens:'2099-01-01T12:00'};
const usdgOnly={...F.initialProducts,arvoArvo:false,usdcUsdc:true};

test('a 250k USDG vault with 200k committed outside the app is valid and creates a 250k onchain cap',()=>{
 const pool=F.preparePool('custom','BUILD',usdgValues,usdgOnly,0);
 assert.equal(pool.args[5],250000n*10n**6n); // maxUsdcPrincipal: the committed amount is recorded later as protocol allocation
 assert.deepEqual(pool.summary.find(r=>r[0]==='USDG committed outside the app'),['USDG committed outside the app','200000 (recorded after creation in Allocation)']);
 assert.equal(pool.summary.find(r=>r[0]==='Duration')[1],'365 days');
});

test('committed USDG must stay below a defined cap so onchain deposits remain possible',()=>{
 assert.throws(()=>F.preparePool('custom','BUILD',{...usdgValues,committedUsdc:'250000'},usdgOnly,0),/below a defined USDG capacity/);
 assert.throws(()=>F.preparePool('custom','BUILD',{...usdgValues,maxUsdc:'0'},usdgOnly,0),/below a defined USDG capacity/);
 assert.doesNotThrow(()=>F.preparePool('custom','BUILD',{...usdgValues,committedUsdc:'0',maxUsdc:'0'},usdgOnly,0));
});

test('drafts saved before this change still load, with nothing committed',()=>{
 const {committedUsdc,...old}=usdgValues;
 const d=V.validateDraft({title:'Old draft',poolType:'custom',standardKind:'BUILD',values:old,products:usdgOnly,visibility:'hidden',sortOrder:0});
 assert.equal(d.values.committedUsdc,'0');
 assert.equal(V.draftPreview({...d,id:1}).committedUsdc,'0');
});

test('lock wording reads as 12 months for a 365-day vault and states no early withdrawal',()=>{
 assert.equal(P.lockLabel(365),'12-month lock from your deposit · no early withdrawal');
 assert.equal(P.lockLabel(60),'60-day lock from your deposit · no early withdrawal');
});

test('no user-facing text says USDC: the app pays and accepts USDG',()=>{
 const hits=[];
 const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(/\.(tsx?|mjs)$/.test(e.name)&&/\bUSDC\b/.test(fs.readFileSync(p,'utf8')))hits.push(p);}};
 walk(path.join(__dirname,'../src'));
 assert.deepEqual(hits,[]);
});

test('capacity bar shows committed, onchain and available amounts that add up to the cap',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const {CommittedCapacity}=require('../src/components/protocol/CommittedCapacity.tsx');
 const html=renderToStaticMarkup(React.createElement(CommittedCapacity,{asset:'USDG',cap:250000n*10n**6n,committed:200000n*10n**6n,deposited:12500n*10n**6n,decimals:6,committedLabel:'committed outside the app'}));
 assert.match(html,/212,500 \/ 250,000 USDG/);
 assert.match(html,/200,000 USDG committed outside the app\. 37,500 USDG remains for onchain deposits\./);
 assert.match(html,/width:80%/);assert.match(html,/width:5%/);
});

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

test('lock wording reads as 12 months for a 365-day vault',()=>{
 assert.equal(P.lockLabel(365),'Locked for 12 months from your deposit');
 assert.equal(P.lockLabel(60),'Locked for 60 days from your deposit');
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
 assert.match(html,/200,000 USDG committed outside the app\. 37,500 USDG still open to deposits in the app\./);
 assert.match(html,/width:80%/);assert.match(html,/width:5%/);
});

test('ARVO price: prefers the published pair, else the most liquid Robinhood pair, never another chain or token',()=>{
 const {parseMarketPrice}=require('../src/lib/protocol/price.ts'),{ARVO_TOKEN,ARVO_PAIR}=require('../src/lib/protocol/links.ts');
 const pair=(o)=>({chainId:'robinhood',pairAddress:'0x'+'1'.repeat(40),baseToken:{address:ARVO_TOKEN},priceUsd:'0.0003',liquidity:{usd:1000},priceChange:{h24:2.5},...o});
 assert.equal(parseMarketPrice({pairs:[pair({priceUsd:'0.0002'}),pair({pairAddress:ARVO_PAIR,priceUsd:'0.000298',liquidity:{usd:10}})]}).priceUsd,'0.000298');
 assert.equal(parseMarketPrice({pairs:[pair({priceUsd:'0.0002',liquidity:{usd:50}}),pair({priceUsd:'0.00031',liquidity:{usd:9000}})]}).priceUsd,'0.00031');
 assert.throws(()=>parseMarketPrice({pairs:[pair({chainId:'ethereum'}),pair({baseToken:{address:'0x'+'2'.repeat(40)}})]}),/unavailable/);
 assert.throws(()=>parseMarketPrice({pairs:null}),/unavailable/);
 assert.equal(parseMarketPrice({pairs:[pair({})]}).change24h,2.5);
});

test('seeded launch drafts pass the same validation as the admin vault editor',()=>{
 const Database=require('better-sqlite3'),os=require('node:os'),{execFileSync}=require('node:child_process');
 const file=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'arvo-seed-')),'t.db');const db=new Database(file);
 db.exec('CREATE TABLE "StakingVaultDraft" (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, poolType TEXT, standardKind TEXT, valuesJson TEXT, productsJson TEXT, visibility TEXT, sortOrder INTEGER, seedKey TEXT UNIQUE, revision INTEGER, linkedChainId INTEGER, linkedProxy TEXT, linkedPoolId INTEGER, createdAt DATETIME, updatedAt DATETIME)');
 execFileSync(process.execPath,[path.join(__dirname,'../scripts/seed-launch-vaults.mjs')],{env:{...process.env,DATABASE_URL:`file:${file}`}});
 const rows=db.prepare('select * from StakingVaultDraft order by sortOrder').all();
 assert.deepEqual(rows.map(r=>r.title),['First Edition','USDG 12-Month Vault','Genesis Pilot']);
 for(const r of rows){const d=V.validateDraft({title:r.title,poolType:r.poolType,standardKind:r.standardKind,values:JSON.parse(r.valuesJson),products:JSON.parse(r.productsJson),visibility:r.visibility,sortOrder:r.sortOrder});assert.equal(d.title,r.title);}
 const fe=JSON.parse(rows[0].valuesJson);assert.equal(fe.minArvo,'1500000');assert.equal(fe.maxArvo,'100000000');assert.equal(fe.opens,'2026-11-24T12:00');assert.equal(fe.closes,'2026-11-29T12:00');
 const usdg=JSON.parse(rows[1].valuesJson);assert.equal(usdg.duration,'365');assert.equal(usdg.maxUsdc,'250000');assert.equal(usdg.committedUsdc,'200000');
});

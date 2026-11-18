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
 assert.match(html,/200,000 USDG of this vault has already been committed|aria-valuetext="200,000 USDG committed outside the app, 12,500 deposited onchain, 37,500 available"/);
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

test('GeckoTerminal pool price is used only when the pool base token is ARVO on Robinhood Chain',()=>{
 const {parseGeckoPool}=require('../src/lib/protocol/price.ts'),{ARVO_TOKEN}=require('../src/lib/protocol/links.ts');
 const pool=(base,price='0.000300599688476645',h24='-2.31')=>({data:{id:'robinhood_0xb9b1139c812f4c9d0f3ec1dd502560777118e0e0',attributes:{address:'0xb9b1139c812f4c9d0f3ec1dd502560777118e0e0',name:'ARVO / VIRTUAL',base_token_price_usd:price,reserve_in_usd:'41234.5',price_change_percentage:{h24}},relationships:{base_token:{data:{id:base}}}}});
 const ok=parseGeckoPool(pool(`robinhood_${ARVO_TOKEN.toLowerCase()}`));
 assert.equal(ok.priceUsd,'0.000300599688476645');assert.equal(ok.change24h,-2.31);assert.equal(ok.source,'GeckoTerminal');assert.equal(ok.liquidityUsd,41234.5);
 assert.throws(()=>parseGeckoPool(pool('robinhood_0x0000000000000000000000000000000000000001')),/unavailable/);
 assert.throws(()=>parseGeckoPool(pool(`bsc_${ARVO_TOKEN.toLowerCase()}`)),/unavailable/);
 assert.throws(()=>parseGeckoPool(pool(`robinhood_${ARVO_TOKEN.toLowerCase()}`,'0')),/unavailable/);
 assert.throws(()=>parseGeckoPool({errors:[{status:'404'}]}),/unavailable/);
});

test('arranging launch vaults orders them, renames the USDG vault and keeps every draft valid',()=>{
 const Database=require('better-sqlite3'),os=require('node:os'),{execFileSync}=require('node:child_process');
 const file=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'arvo-arrange-')),'t.db');const db=new Database(file);
 db.exec('CREATE TABLE "StakingVaultDraft" (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, poolType TEXT, standardKind TEXT, valuesJson TEXT, productsJson TEXT, visibility TEXT, sortOrder INTEGER, seedKey TEXT UNIQUE, revision INTEGER, linkedChainId INTEGER, linkedProxy TEXT, linkedPoolId INTEGER, createdAt DATETIME, updatedAt DATETIME); CREATE TABLE "Project" (id INTEGER PRIMARY KEY, slug TEXT, title TEXT, publishStatus TEXT, sortOrder INTEGER, createdAt DATETIME);');
 db.prepare("insert into Project (slug,title,publishStatus,sortOrder,createdAt) values ('real-site','Real site','published',0,'2026-01-01')").run();db.prepare("insert into Project (slug,title,publishStatus,sortOrder,createdAt) values ('ripe-farm','Ripe','published',5,'2026-01-01')").run();
 const env={...process.env,DATABASE_URL:`file:${file}`};
 execFileSync(process.execPath,[path.join(__dirname,'../scripts/seed-launch-vaults.mjs')],{env});
 const old={...F.initialValues,minArvo:'500000',minArvoUsdc:'550000',opens:'2026-10-01T12:00',closes:'2026-10-05T12:00'};delete old.bonusPct;delete old.projectSlug;delete old.committedUsdc;
 for(const [t,k] of [['Build','BUILD'],['Advance','ADVANCE'],['Compound','COMPOUND'],['Foundation','FOUNDATION']])db.prepare("insert into StakingVaultDraft (title,poolType,standardKind,valuesJson,productsJson,visibility,sortOrder,revision,createdAt,updatedAt) values (?,?,?,?,?,?,0,1,'x','x')").run(t,'standard',k,JSON.stringify(old),JSON.stringify({...F.initialProducts,arvoArvo:false,arvoUsdc:true}),'openingSoon');
 db.prepare("insert into StakingVaultDraft (title,poolType,standardKind,valuesJson,productsJson,visibility,sortOrder,revision,linkedChainId,linkedProxy,linkedPoolId,createdAt,updatedAt) values ('Community Welcome','custom','BUILD',?,?,'openingSoon',9,1,46630,'0xabc',0,'x','x')").run(JSON.stringify({...F.initialValues,arvoRate:'10',minArvo:'850000',maxArvo:'50000000'}),JSON.stringify(F.initialProducts));
 const dry=execFileSync(process.execPath,[path.join(__dirname,'../scripts/arrange-launch-vaults.mjs')],{env}).toString();
 assert.match(dry,/Run again with --apply/);assert.equal(db.prepare("select count(*) n from StakingVaultDraft where title='Whole Site Finance'").get().n,0);
 execFileSync(process.execPath,[path.join(__dirname,'../scripts/arrange-launch-vaults.mjs'),'--apply'],{env});
 const rows=db.prepare('select * from StakingVaultDraft order by sortOrder').all();
 assert.deepEqual(rows.map(r=>r.title),['Community Welcome','First Edition','Genesis Pilot','Whole Site Finance','Build','Advance','Compound','Foundation']);
 for(const r of rows){V.validateDraft({title:r.title,poolType:r.poolType,standardKind:r.standardKind,values:JSON.parse(r.valuesJson),products:JSON.parse(r.productsJson),visibility:r.visibility,sortOrder:r.sortOrder});}
 const v=t=>JSON.parse(rows.find(r=>r.title===t).valuesJson);
 assert.equal(v('Whole Site Finance').usdcRate,'14');assert.equal(v('Whole Site Finance').minUsdc,'10000');
 assert.equal(v('First Edition').bonusPct,'5');assert.equal(v('Genesis Pilot').bonusPct,'5');assert.equal(v('Genesis Pilot').projectSlug,'ripe-farm');
 assert.equal(v('Build').minArvo,'1500000');assert.equal(v('Build').opens,'');assert.equal(v('Foundation').maxArvo,'100000000');
 assert.equal(v('Community Welcome').minArvo,'850000'); // live vault terms untouched
});

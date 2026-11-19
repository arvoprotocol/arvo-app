const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const S=require('../src/lib/staking/vault-share.ts');

test('vault share links use readable slugs from the vault name',()=>{
 assert.equal(S.vaultSlug('First Edition'),'first-edition');
 assert.equal(S.vaultSlug('Full Site Land Acquisition'),'full-site-land-acquisition');
 assert.equal(S.vaultSlug('  Genesis Pilot · Ripe! '),'genesis-pilot-ripe');
 assert.equal(S.vaultSlug('Café & Co'),'cafe-and-co');
 assert.equal(S.vaultSlug('***'),'vault');
 assert.match(S.vaultShareUrl('First Edition'),/\/vaults\/first-edition$/);
});

test('share text states only the vault terms, backing, opening date and audit',()=>{
 const now=Date.parse('2026-11-19T10:00:00Z');
 const fe=S.vaultShareText({title:'First Edition',days:60,rate:10,asset:'ARVO',bonusPct:5,opensAt:Date.parse('2026-11-24T12:00:00Z')},now);
 assert.equal(fe,'First Edition on Arvo: 10% fixed ARVO reward over 60 days, plus a share of a 5% bonus pot. Rewards backed by real land sales. Opens 24 Nov. Smart contracts audited by Soken.');
 const g=S.vaultShareText({title:'Genesis Pilot',days:60,rate:5,asset:'USDG',kind:'plotSale',projectTitle:'Ripe'},now);
 assert.match(g,/funded by a real plot sale at Ripe\./);
 const fs2=S.vaultShareText({title:'Full Site Land Acquisition',days:365,rate:14,asset:'USDG',kind:'fullSite',opensAt:now-1},now);
 assert.match(fs2,/14% fixed USDG reward over 12 months\. Back the purchase of a whole site/);
 assert.doesNotMatch(fs2,/Opens/); // past dates are not announced
 assert.equal(S.compactAmount(1500000),'1.5m');assert.equal(S.compactAmount(10000),'10k');assert.equal(S.compactAmount(1000),'1,000');
});

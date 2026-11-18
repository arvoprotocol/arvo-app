const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript');
require.extensions['.ts']=require.extensions['.tsx']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText,file);
const Module=require('node:module'),load=Module._load;
Module._load=function(r,...a){if(r.startsWith('@/'))r=require('node:path').join(__dirname,'../src',r.slice(2));return load.call(this,r,...a);};
const J=require('../src/lib/legal/jurisdictions.ts');

test('restricted jurisdictions match the published legal list and country checks work',()=>{
 assert.equal(J.RESTRICTED_JURISDICTIONS.length,31);
 assert.equal(new Set(J.RESTRICTED_JURISDICTIONS.map(j=>j.code)).size,31);
 assert.ok(J.isRestrictedCountry('us')&&J.isRestrictedCountry('GB')&&J.isRestrictedCountry('KP'));
 assert.ok(!J.isRestrictedCountry('FR')&&!J.isRestrictedCountry('')&&!J.isRestrictedCountry(null)&&!J.isRestrictedCountry('USA'));
 assert.match(J.restrictedJurisdictionList(),/^North Korea, Iran, .* and Russia$/);
});

test('calendar file has one event per position at maturity with a 1-day alert',()=>{
 process.env.NEXT_PUBLIC_APP_URL='https://app.arvoprotocol.com';
 const {calendarFile}=require('../src/components/protocol/PortfolioExtras.tsx');
 const ics=calendarFile([{id:7n,maturesAt:1800000000n,settled:false,vaultId:1},{id:8n,maturesAt:1800086400n,settled:false,vaultId:1}]);
 assert.match(ics,/^BEGIN:VCALENDAR\r\n/);assert.match(ics,/END:VCALENDAR$/);
 assert.equal((ics.match(/BEGIN:VEVENT/g)||[]).length,2);
 assert.match(ics,/DTSTART:20270115T080000Z/);
 assert.match(ics,/TRIGGER:-P1D/);assert.match(ics,/UID:arvo-position-7@arvoprotocol\.com/);
 assert.ok(!/\n(?<!\r)/.test(ics.replace(/\r\n/g,'')));
});

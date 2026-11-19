const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);
const Module=require('node:module'),load=Module._load;
Module._load=function(r,...a){if(r.startsWith('@/'))r=path.join(__dirname,'../src',r.slice(2));return load.call(this,r,...a);};
const R=require('../src/lib/staking/roles.ts');

test('saved governance addresses are parsed from the setting, invalid entries ignored',()=>{
 const list=R.savedGovernanceAddresses('Governance Safe=0xc2ba67d2a9a6e3db6e54c58b1de62f33e11f5d7c, Timelock = 0x4bfD52101d1ff4647477d1A48a9B9B0e9C74Ed22,Broken=0x123,=0x4bfD52101d1ff4647477d1A48a9B9B0e9C74Ed22,NoAddress');
 assert.deepEqual(list.map(x=>x.label),['Governance Safe','Timelock']);
 assert.equal(list[0].address,'0xc2Ba67d2A9A6E3dB6e54c58B1de62f33E11F5d7C'); // checksummed
 assert.deepEqual(R.savedGovernanceAddresses(''),[]);
});
test('every staking role is described in plain English',()=>{
 assert.deepEqual(R.ROLES.map(r=>r.key),['VAULT_MANAGER_ROLE','REWARD_MANAGER_ROLE','PAUSER_ROLE','UPGRADER_ROLE','DEFAULT_ADMIN_ROLE']);
 for(const r of R.ROLES)assert.ok(r.label&&r.does.length>20);
});

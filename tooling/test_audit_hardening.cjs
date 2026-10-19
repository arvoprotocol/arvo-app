const assert=require('node:assert/strict'),{test}=require('node:test');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const resolve=Module._resolveFilename;Module._resolveFilename=function(n,p,...r){return resolve.call(this,n.startsWith('@/')?path.join(root,'src',n.slice(2)):n,p,...r)};
const cookies=new Map();const load=Module._load;
Module._load=function(n,...r){if(n==='server-only')return{};if(n==='next/headers')return{cookies:async()=>({get:k=>cookies.has(k)?{value:cookies.get(k)}:undefined,set:(k,v)=>cookies.set(k,v)})};if(n==='@/lib/prisma')return{prisma:{}};return load.call(this,n,...r)};
process.env.NODE_ENV='production';process.env.NEXT_PUBLIC_SITE_URL='https://arvoprotocol.com';process.env.NEXT_PUBLIC_APP_URL='https://app.arvoprotocol.com';
const {proxy}=require('../src/proxy.ts'),{NextRequest}=require('next/server');
test('each rendered request receives a fresh enforced script nonce, forwarded to Next hydration',()=>{
 const req=()=>new NextRequest('https://app.arvoprotocol.com/portfolio',{headers:{host:'app.arvoprotocol.com','x-nonce':'attacker','content-security-policy':"script-src * 'unsafe-inline'"}});
 const first=proxy(req()),second=proxy(req());
 const policy=first.headers.get('content-security-policy');
 assert.match(policy,/default-src 'self'/);assert.match(policy,/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
 assert.doesNotMatch(policy,/script-src[^;]*unsafe-/);assert.match(policy,/script-src-attr 'none'/);
 assert.match(policy,/upgrade-insecure-requests/);assert.notEqual(policy,second.headers.get('content-security-policy'));
 assert.match(policy,/frame-src[^;]*https:\/\/secure\.walletconnect\.org/);
 assert.match(policy,/frame-src[^;]*https:\/\/www\.youtube-nocookie\.com/);
 assert.match(policy,/frame-src[^;]*https:\/\/platform\.twitter\.com/);
 assert.match(policy,/media-src 'self' https: blob:/);
 assert.equal(first.headers.get('x-middleware-request-content-security-policy'),policy);
 assert.notEqual(first.headers.get('x-middleware-request-x-nonce'),'attacker');
 assert.equal(first.headers.get('cache-control'),'private, no-store');
});
test('untrusted forwarded hosts cannot authorize a non-allowlisted Origin',()=>{
 const {requireSameOrigin}=require('../src/lib/security/request.ts');
 assert.throws(()=>requireSameOrigin(new Request('https://app.arvoprotocol.com/api/admin/projects',{headers:{origin:'https://evil.invalid','x-forwarded-host':'evil.invalid'}})));
 assert.throws(()=>requireSameOrigin(new Request('http://127.0.0.1:7000/api/admin/projects',{headers:{origin:'https://arvoprotocol.com','x-forwarded-host':'app.arvoprotocol.com'}})));
 requireSameOrigin(new Request('http://127.0.0.1:7000/api/admin/projects',{headers:{origin:'https://app.arvoprotocol.com','x-forwarded-host':'evil.invalid'}}));
});
test('app-access key rotation is independent of the administrator signing key',async()=>{
 process.env.APP_ACCESS_PASSWORD='test-password';process.env.APP_ACCESS_SESSION_SECRET='a'.repeat(64);process.env.ADMIN_SESSION_SECRET='b'.repeat(64);
 const s=require('../src/lib/app-access/session.ts');await s.grantAppAccess();assert.equal(await s.hasAppAccess(),true);
 process.env.ADMIN_SESSION_SECRET='c'.repeat(64);assert.equal(await s.hasAppAccess(),true);
 process.env.APP_ACCESS_SESSION_SECRET='d'.repeat(64);assert.equal(await s.hasAppAccess(),false);
});
test('unexpected draft errors stay private and explicit validation errors remain useful',async()=>{
 const {draftFailure}=require('../src/lib/admin/vault-draft-api.ts'),{StakingInputError}=require('../src/lib/staking/input-error.ts');
 const log=console.error;console.error=()=>{};
 try{const response=draftFailure(new Error('sensitive internal database path'));assert.equal(response.status,500);assert.doesNotMatch(await response.text(),/sensitive/);
 const invalid=draftFailure(new StakingInputError('Enter a vault name.'));assert.equal(invalid.status,400);assert.match(await invalid.text(),/Enter a vault name/);}finally{console.error=log;}
});
test('signup returns the same status and body for existing and newly registered contacts',async()=>{
 const security=require('../src/lib/security/request.ts');
 const savedLimit=security.limitRequest;security.limitRequest=async()=>{};
 let existing=false;
 const previous=Module._load;
 Module._load=function(n,...r){
  if(n==='@/lib/prisma')return{prisma:{platformSignup:{findUnique:async()=>existing?{id:1,notifiedAt:new Date()}:null,create:async()=>({id:2,contact:'fixture@example.invalid',createdAt:new Date()}),update:async()=>({})}}};
  if(n==='@/lib/mail/platform')return{sendPlatformSignupEmails:async()=>{}};
  return previous.call(this,n,...r);
 };
 try{
  const {POST}=require('../src/app/api/platform/signup/route.ts');
  const request=()=>new Request('https://arvoprotocol.com/api/platform/signup',{method:'POST',headers:{origin:'https://arvoprotocol.com','content-type':'application/json'},body:JSON.stringify({type:'email',contact:'fixture@example.invalid'})});
  const fresh=await POST(request());existing=true;const duplicate=await POST(request());
  assert.equal(fresh.status,200);assert.equal(duplicate.status,200);
  assert.deepEqual(await fresh.json(),{ok:true});assert.deepEqual(await duplicate.json(),{ok:true});
 }finally{Module._load=previous;security.limitRequest=savedLimit;}
});

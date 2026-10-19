const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const root=path.resolve(__dirname,'..');
const ts=require(path.join(root,'node_modules/typescript'));
for(const extension of ['.ts','.tsx'])require.extensions[extension]=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,file);
const resolver=Module._resolveFilename;Module._resolveFilename=function(name,parent,...rest){return resolver.call(this,name.startsWith('@/')?path.join(root,'src',name.slice(2)):name,parent,...rest)};
const loader=Module._load;Module._load=function(name,...rest){if(name==='server-only')return{};if(name==='@/lib/prisma')return{prisma:new Proxy({},{get(_,key){if(key==='$transaction')return async fn=>fn({supportRateLimit:{upsert:async()=>({count:1}),deleteMany:async()=>({count:0})}});throw Error('Unauthenticated route reached business database access')}})};if(name==='next/headers')return{cookies:async()=>({get:()=>undefined,set:()=>{throw Error('Unexpected cookie write')}})};if(name==='next/cache')return{revalidatePath:()=>{throw Error('Unexpected cache write')}};return loader.call(this,name,...rest)};
process.env.NODE_ENV='production';process.env.ADMIN_SESSION_SECRET='review-fixture-secret-'.repeat(3);process.env.ADMIN_WALLET_ADDRESS='0x0000000000000000000000000000000000000001';process.env.NEXT_PUBLIC_SITE_URL='https://arvoprotocol.com';process.env.NEXT_PUBLIC_APP_URL='https://app.arvoprotocol.com';
async function files(folder){return fs.readdirSync(folder,{withFileTypes:true}).flatMap(e=>e.isDirectory()?filesSync(path.join(folder,e.name)):[path.join(folder,e.name)])}
function filesSync(folder){return fs.readdirSync(folder,{withFileTypes:true}).flatMap(e=>e.isDirectory()?filesSync(path.join(folder,e.name)):[path.join(folder,e.name)])}
(async()=>{
 let count=0;
 for(const file of filesSync(path.join(root,'src/app/api/admin')).filter(f=>f.endsWith('/route.ts')&&!f.includes('/auth/'))){
  const route=require(file);
  for(const method of ['GET','POST','PATCH','DELETE'])if(route[method]){
   const request=new Request('https://app.arvoprotocol.com/api/admin/test',{method,headers:{origin:'https://app.arvoprotocol.com',host:'app.arvoprotocol.com','content-type':'application/json'},...(['POST','PATCH'].includes(method)?{body:'{}'}:{})});
   const response=await route[method](request,{params:Promise.resolve({id:'1'})});
   assert.ok([401,403].includes(response.status),file+' '+method+' unexpectedly returned '+response.status);count++;
  }
 }
 const image=require(path.join(root,'src/app/api/project-images/[filename]/route.ts'));
 for(const filename of ['../.env.local','../../etc/passwd','%2e%2e%2f.env','x.svg']){
  const response=await image.GET(new Request('https://app.arvoprotocol.com/api/project-images/x'),{params:Promise.resolve({filename})});assert.equal(response.status,404);count++;
 }
 console.log('PASS: '+count+' unauthenticated admin-route and image-path rejection checks');

})().catch(e=>{console.error(e.stack);process.exitCode=1});

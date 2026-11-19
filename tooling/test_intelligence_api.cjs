const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const Module=require('node:module'),load=Module._load;
Module._load=function(r,...a){if(r==='server-only')return {};if(r.startsWith('@/'))r=path.join(__dirname,'../src',r.slice(2));return load.call(this,r,...a);};
const {askClaude,jsonFromText}=require('../src/lib/intelligence/answer.ts');
const sources=[{id:'S1',page:1,text:'Access is from Mill Lane via a private track with a right of way.',label:'Demo · Title register (Title register)',date:'2026-09-12'}];
const answer={summary:'Access is from Mill Lane.',facts:[{text:'There is a right of way over the track.',sources:['S1']}],inferences:[],checks:[],notFound:[]};
function mock(responses){const calls=[];global.fetch=async(url,init)=>{calls.push(JSON.parse(init.body));const r=responses.shift();return new Response(JSON.stringify(r.body),{status:r.status});};return calls;}
process.env.ANTHROPIC_API_KEY='sk-ant-test';

test('asks for the answer tool without forcing it, and reads a tool reply',async()=>{
 const calls=mock([{status:200,body:{content:[{type:'tool_use',name:'respond',input:answer}],usage:{input_tokens:10,output_tokens:5}}}]);
 const r=await askClaude('Sample site','How do you get onto the site?',sources);
 assert.deepEqual(calls[0].tool_choice,{type:'auto'});assert.match(calls[0].system,/respond tool exactly once/);
 assert.equal(r.answer.summary,'Access is from Mill Lane.');assert.equal(r.answer.facts.length,1);
});
test('accepts a plain JSON text reply as a fallback',async()=>{
 mock([{status:200,body:{content:[{type:'text',text:'```json\n'+JSON.stringify(answer)+'\n```'}]}}]);
 const r=await askClaude('Sample site','Access?',sources);
 assert.equal(r.answer.summary,'Access is from Mill Lane.');
 assert.equal(jsonFromText('no json here'),undefined);
});
test('retries once without temperature when the model rejects it',async()=>{
 const calls=mock([{status:400,body:{type:'error',error:{message:'temperature is not supported for this model'}}},{status:200,body:{content:[{type:'tool_use',input:answer}]}}]);
 const r=await askClaude('Sample site','Access?',sources);
 assert.equal(calls.length,2);assert.equal(calls[0].temperature,0);assert.equal('temperature' in calls[1],false);assert.equal(r.answer.facts.length,1);
});
test('other errors still report Intelligence as unavailable',async()=>{
 mock([{status:400,body:{type:'error',error:{message:'something else'}}}]);
 const orig=console.error;console.error=()=>{};
 await assert.rejects(askClaude('Sample site','Access?',sources),/temporarily unavailable/);
 console.error=orig;
});

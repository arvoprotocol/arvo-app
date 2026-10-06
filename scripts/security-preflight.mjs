import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import Database from 'better-sqlite3';
const errors=[];
const major=Number(process.versions.node.split('.')[0]);
if(![22,24].includes(major))errors.push('Use a supported Node 22 or 24 LTS runtime for Arvo; this update was tested on Node 24.');
if(!process.env.ADMIN_SESSION_SECRET||process.env.ADMIN_SESSION_SECRET.length<32)errors.push('ADMIN_SESSION_SECRET must contain at least 32 characters. Do not paste the secret into chat.');
const raw=process.env.DATABASE_URL;
if(!raw||!raw.startsWith('file:')||raw.includes('?')||raw.includes('#')||!existsSync(resolve(raw.slice(5))))errors.push('Existing SQLite DATABASE_URL is required.');
else{
 let db;try{db=new Database(resolve(raw.slice(5)),{readonly:true,fileMustExist:true});for(const table of ['WalletChallenge','WalletSession','SupportRateLimit'])if(!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table))errors.push(`Required existing table is missing: ${table}`);}catch{errors.push('Unable to read the existing SQLite database.');}finally{db?.close();}
}
try{const url=new URL(process.env.NEXT_PUBLIC_SITE_URL||'https://arvoprotocol.com');if(url.protocol!=='https:'||url.username||url.password)errors.push('NEXT_PUBLIC_SITE_URL must identify the HTTPS site without credentials.');}catch{errors.push('NEXT_PUBLIC_SITE_URL is invalid.');}
if(errors.length){for(const error of errors)console.error(error);process.exitCode=1;}else console.log('Security preflight passed: supported runtime, existing protection tables, signing secret configured and HTTPS origin. No files or records changed.');

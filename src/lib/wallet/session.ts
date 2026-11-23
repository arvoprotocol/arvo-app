import "server-only";
import {appCookiePath} from "@/lib/protocol/app-url";
import {createHash,randomBytes} from "node:crypto";
import {cookies} from "next/headers";
import {getAddress,isAddress,verifyMessage,type Hex} from "viem";
import {prisma} from "@/lib/prisma";
import {SupportError,limit,rateIdentity} from "@/lib/support/server";
const MESSAGE_TITLE="Arvo wallet sign-in";
const challengeCookie="arvo_wallet_challenge",sessionCookie="arvo_wallet_session";
const options={httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"strict" as const,path:appCookiePath()};
const hash=(value:string)=>createHash("sha256").update(value).digest("hex");
function origin(request:Request){const value=request.headers.get("origin");if(!value)throw new SupportError("Open this request on the Arvo website.",403);return new URL(value);}
export async function createWalletChallenge(request:Request,address:unknown,chainId:unknown){
 if(typeof address!=="string"||!isAddress(address)||typeof chainId!=="number"||!Number.isSafeInteger(chainId)||chainId<1||chainId>2147483647)throw new SupportError("Choose a valid wallet account and network.");
 const normalized=getAddress(address),url=origin(request),nonce=randomBytes(24).toString("hex"),expiresAt=new Date(Date.now()+300000);
 const issuedAt=new Date();
 // Plain-text message (same approach as the admin login) rather than SIWE: some wallets reject SIWE-formatted
 // personal_sign requests. It still binds the site, wallet, network, nonce and expiry, and the server only
 // accepts the exact message it issued.
 const message=[MESSAGE_TITLE,"","Sign in to the Arvo app with your wallet. No transaction or token approval is requested.","",`Website: ${url.host}`,`Wallet: ${normalized}`,`Network: ${chainId}`,`Nonce: ${nonce}`,`Issued: ${issuedAt.toISOString()}`,`Expires: ${expiresAt.toISOString()}`].join("\n");
 const cookieStore=await cookies(),old=cookieStore.get(challengeCookie)?.value;
 await prisma.$transaction(async tx=>{await limit(tx,`wallet-login:${rateIdentity(request)}`,20,600000);await tx.walletChallenge.deleteMany({where:{OR:[{expiresAt:{lt:new Date()}},...(old?[{id:hash(old)}]:[])]}});await tx.walletChallenge.create({data:{id:hash(nonce),address:normalized.toLowerCase(),chainId,message,expiresAt}});});
 cookieStore.set(challengeCookie,nonce,{...options,maxAge:300});return {address:normalized,message,chainId};
}
export async function verifyWalletChallenge(request:Request,value:Record<string,unknown>){
 const cookieStore=await cookies(),nonce=cookieStore.get(challengeCookie)?.value;
 if(!nonce||typeof value.message!=="string"||value.message.length>3000||typeof value.signature!=="string"||!/^0x[a-f0-9]{130}$/i.test(value.signature))throw new SupportError("Invalid wallet login request.",401);
 const row=await prisma.walletChallenge.findUnique({where:{id:hash(nonce)}}),url=origin(request);
 if(!row||row.expiresAt.getTime()<=Date.now()||row.message!==value.message||!row.message.startsWith(MESSAGE_TITLE+"\n")||!row.message.includes(`\nWebsite: ${url.host}\n`))throw new SupportError("Login expired. Please sign in again.",401);
 let valid=false;try{valid=await verifyMessage({address:row.address as `0x${string}`,message:row.message,signature:value.signature as Hex});}catch{}
 if(!valid)throw new SupportError("The signature does not match this wallet.",401);
 const token=randomBytes(32).toString("hex"),old=cookieStore.get(sessionCookie)?.value;
 await prisma.$transaction(async tx=>{const consumed=await tx.walletChallenge.deleteMany({where:{id:row.id,expiresAt:{gt:new Date()}}});if(consumed.count!==1)throw new SupportError("This login has already been used. Sign in again.",401);await tx.walletSession.deleteMany({where:{OR:[{expiresAt:{lt:new Date()}},...(old?[{id:hash(old)}]:[])]}});await tx.walletSession.create({data:{id:hash(token),address:row.address,chainId:row.chainId,expiresAt:new Date(Date.now()+43200000)}});});
 cookieStore.set(challengeCookie,"",{...options,maxAge:0});cookieStore.set(sessionCookie,token,{...options,maxAge:43200});return{address:row.address,chainId:row.chainId};
}
export async function getWalletSession(){const value=(await cookies()).get(sessionCookie)?.value;if(!value||!/^[a-f0-9]{64}$/.test(value))return null;const row=await prisma.walletSession.findUnique({where:{id:hash(value)}});return row&&row.expiresAt.getTime()>Date.now()?{address:row.address,chainId:row.chainId}:null;}
export async function requireWalletSession(request:Request){const row=await getWalletSession(),expected=request.headers.get("x-arvo-wallet");if(!row||!expected||row.address!==expected.toLowerCase())throw new SupportError("Sign in with your connected wallet to view your tickets.",401);return row;}
export async function clearWalletSession(){const cookieStore=await cookies(),session=cookieStore.get(sessionCookie)?.value,challenge=cookieStore.get(challengeCookie)?.value;await prisma.$transaction(async tx=>{if(session)await tx.walletSession.deleteMany({where:{id:hash(session)}});if(challenge)await tx.walletChallenge.deleteMany({where:{id:hash(challenge)}});});for(const key of [sessionCookie,challengeCookie])cookieStore.set(key,"",{...options,maxAge:0});}

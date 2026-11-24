import "server-only";
import {appCookiePath} from "@/lib/protocol/app-url";

import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "arvo_app_access";

function getPassword() {
  const password = process.env.APP_ACCESS_PASSWORD;

  if (!password) {
    throw new Error("APP_ACCESS_PASSWORD is not configured.");
  }

  return password;
}

function signature(payload:string) {
 const secret=process.env.APP_ACCESS_SESSION_SECRET;
 if(!secret||secret.length<32)throw new Error("App session signing is not configured securely.");
 return crypto.createHmac("sha256",secret).update("arvo-app-access-v2:"+payload).digest("hex");
}
// Public release. The app opens to everyone automatically at PUBLIC_ACCESS_AT
// (26 Nov 2026 14:00 UTC, 48 hours after early access), or earlier with
// APP_PUBLIC_ACCESS=1. APP_PUBLIC_ACCESS_AT (ISO time) moves the date;
// APP_PUBLIC_ACCESS=0 keeps the gate closed regardless. Server-side settings: a restart applies them.
const DEFAULT_PUBLIC_ACCESS_AT = "2026-11-26T14:00:00Z";
export function publicAccessAt(): Date {
 const configured = process.env.APP_PUBLIC_ACCESS_AT ? new Date(process.env.APP_PUBLIC_ACCESS_AT) : null;
 return configured && !Number.isNaN(configured.getTime()) ? configured : new Date(DEFAULT_PUBLIC_ACCESS_AT);
}
export function appIsPublic() {
 if (process.env.APP_PUBLIC_ACCESS === "0") return false;
 return process.env.APP_PUBLIC_ACCESS === "1" || Date.now() >= publicAccessAt().getTime();
}
export async function hasAppAccess() {
 if(appIsPublic())return true;
 const value=(await cookies()).get(COOKIE_NAME)?.value;
 if(!value||value.length>1024)return false;
 const [payload,supplied,...extra]=value.split(".");if(extra.length||!supplied||!/^[a-f0-9]{64}$/.test(supplied))return false;
 const expected=signature(payload);
 if(!crypto.timingSafeEqual(Buffer.from(supplied,"hex"),Buffer.from(expected,"hex")))return false;
 try{const row=JSON.parse(Buffer.from(payload,"base64url").toString("utf8"));return typeof row.expiresAt==="number"&&row.expiresAt>Date.now()&&row.passwordVersion===signature("password:"+getPassword());}catch{return false;}
}
export async function grantAppAccess() {
 const payload=Buffer.from(JSON.stringify({expiresAt:Date.now()+7*86400000,nonce:crypto.randomBytes(16).toString("hex"),passwordVersion:signature("password:"+getPassword())})).toString("base64url");
 (await cookies()).set(COOKIE_NAME,`${payload}.${signature(payload)}`,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:appCookiePath(),maxAge:7*86400});
}

export async function hasAppAccessError() {
  const store = await cookies();
  return store.get("arvo_app_access_error")?.value === "1";
}

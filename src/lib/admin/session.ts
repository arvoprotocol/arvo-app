import "server-only";

import { createHash, randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import {prisma} from "@/lib/prisma";
import { cookies } from "next/headers";
import { getAddress } from "viem";

const COOKIE_NAME = "arvo_admin_session";
const SESSION_LIFETIME_SECONDS = 60 * 60 * 12;

type AdminSession = {
  address: string;
  expiresAt: number;
  sessionId:string;
};

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET is not configured securely.");
  }

  return secret;
}

export function getConfiguredAdminAddress() {
  const address = process.env.ADMIN_WALLET_ADDRESS;

  if (!address) {
    throw new Error("ADMIN_WALLET_ADDRESS is not configured.");
  }

  return getAddress(address);
}

function sign(payload: string) {
  return createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
}

function encodeSession(session: AdminSession) {
  const payload = Buffer.from(
    JSON.stringify(session),
    "utf8"
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

function decodeSession(value: string): AdminSession | null {
  if(value.length>4096)return null;
  const separator = value.lastIndexOf(".");

  if (separator === -1) {
    return null;
  }

  const payload = value.slice(0, separator);
  const suppliedSignature = value.slice(separator + 1);
  if(!/^[a-f0-9]{64}$/.test(suppliedSignature))return null;
  const expectedSignature = sign(payload);

  const supplied = Buffer.from(suppliedSignature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return null;
  }

  try {
    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as AdminSession;

    if (
      typeof session.sessionId !== "string" || !/^[a-f0-9]{64}$/.test(session.sessionId) ||
      typeof session.address !== "string" ||
      typeof session.expiresAt !== "number" ||
      !Number.isFinite(session.expiresAt) || session.expiresAt <= Date.now()
    ) {
      return null;
    }

    if (
      getAddress(session.address) !==
      getConfiguredAdminAddress()
    ) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function createAdminSession(address: string) {
  const normalizedAddress = getAddress(address);

  if (normalizedAddress !== getConfiguredAdminAddress()) {
    throw new Error("Wallet is not authorised for Arvo admin.");
  }

  const session: AdminSession = {
    address: normalizedAddress,
    sessionId:randomBytes(32).toString("hex"),
    expiresAt:
      Date.now() + SESSION_LIFETIME_SECONDS * 1000,
  };

  const cookieStore = await cookies();
  const previous=cookieStore.get(COOKIE_NAME)?.value;
  const old=previous?decodeSession(previous):null;
  await prisma.$transaction(async tx=>{
    await tx.walletSession.deleteMany({where:{OR:[{expiresAt:{lt:new Date()}},...(old?[{id:createHash("sha256").update("admin-session:"+old.sessionId).digest("hex")}]:[])]}});
    await tx.walletSession.create({data:{id:createHash("sha256").update("admin-session:"+session.sessionId).digest("hex"),address:normalizedAddress.toLowerCase(),chainId:0,expiresAt:new Date(session.expiresAt)}});
  });

  cookieStore.set(
    COOKIE_NAME,
    encodeSession(session),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_LIFETIME_SECONDS,
    }
  );
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;

  if (!value) {
    return null;
  }

  const session=decodeSession(value);if(!session)return null;
  const row=await prisma.walletSession.findUnique({where:{id:createHash("sha256").update("admin-session:"+session.sessionId).digest("hex")}});
  return row&&row.chainId===0&&row.address===session.address.toLowerCase()&&row.expiresAt.getTime()>Date.now()?session:null;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  const value=cookieStore.get(COOKIE_NAME)?.value,session=value?decodeSession(value):null;
  if(session)await prisma.walletSession.deleteMany({where:{id:createHash("sha256").update("admin-session:"+session.sessionId).digest("hex")}});

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    throw new Error("Unauthorised admin request.");
  }

  return session;
}

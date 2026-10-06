import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import {prisma} from "@/lib/prisma";
import {appOrigin, appUrl} from "@/lib/protocol/app-url";
import { cookies } from "next/headers";
import { getAddress } from "viem";

import { getConfiguredAdminAddress } from "@/lib/admin/session";

const COOKIE_NAME = "arvo_admin_challenge";
const CHALLENGE_LIFETIME_SECONDS = 5 * 60;

type Challenge = {
  address: string;
  nonce: string;
  issuedAt: number;
  expiresAt: number;
};

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET is not configured securely.");
  }

  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
}

function encodeChallenge(challenge: Challenge) {
  const payload = Buffer.from(
    JSON.stringify(challenge),
    "utf8"
  ).toString("base64url");

  return `${payload}.${sign(payload)}`;
}

function decodeChallenge(value: string): Challenge | null {
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
    const challenge = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as Challenge;

    if (
      typeof challenge.address !== "string" ||
      typeof challenge.nonce !== "string" || !/^[a-f0-9]{64}$/.test(challenge.nonce) ||
      typeof challenge.issuedAt !== "number" ||
      typeof challenge.expiresAt !== "number" ||
      !Number.isFinite(challenge.expiresAt) || challenge.expiresAt <= Date.now()
    ) {
      return null;
    }

    if (
      getAddress(challenge.address) !==
      getConfiguredAdminAddress()
    ) {
      return null;
    }

    return challenge;
  } catch {
    return null;
  }
}

function buildMessage(challenge: Challenge) {
  return [
    "Arvo Admin",
    `Domain: ${new URL(appOrigin()).host}`,
    `URI: ${appUrl("/app/admin")}`,
    "",
    "Sign this message to access the Arvo admin console.",
    "This request does not trigger a blockchain transaction or cost gas.",
    "",
    `Wallet: ${challenge.address}`,
    `Nonce: ${challenge.nonce}`,
    `Issued at: ${new Date(challenge.issuedAt).toISOString()}`,
    `Expires at: ${new Date(challenge.expiresAt).toISOString()}`,
  ].join("\n");
}

export async function createAdminChallenge(address: string) {
  const normalizedAddress = getAddress(address);

  if (normalizedAddress !== getConfiguredAdminAddress()) {
    throw new Error("Wallet is not authorised for Arvo admin.");
  }

  const now = Date.now();

  const challenge: Challenge = {
    address: normalizedAddress,
    nonce: randomBytes(32).toString("hex"),
    issuedAt: now,
    expiresAt: now + CHALLENGE_LIFETIME_SECONDS * 1000,
  };

  const cookieStore = await cookies();

  await prisma.$transaction(async tx=>{
    await tx.walletChallenge.deleteMany({where:{expiresAt:{lt:new Date()}}});
    await tx.walletChallenge.create({data:{id:createHash("sha256").update("admin:"+challenge.nonce).digest("hex"),address:normalizedAddress.toLowerCase(),chainId:0,message:buildMessage(challenge),expiresAt:new Date(challenge.expiresAt)}});
  });

  cookieStore.set(
    COOKIE_NAME,
    encodeChallenge(challenge),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: CHALLENGE_LIFETIME_SECONDS,
    }
  );

  return buildMessage(challenge);
}

export async function consumeAdminChallenge(
  address: string,
  message: string
) {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  if (!value) {
    return false;
  }

  const challenge = decodeChallenge(value);

  if (!challenge) {
    return false;
  }

  const normalizedAddress = getAddress(address);

  if (
    normalizedAddress !== challenge.address ||
    normalizedAddress !== getConfiguredAdminAddress()
  ) {
    return false;
  }

  if(message !== buildMessage(challenge))return false;
  const consumed=await prisma.walletChallenge.deleteMany({where:{id:createHash("sha256").update("admin:"+challenge.nonce).digest("hex"),address:normalizedAddress.toLowerCase(),chainId:0,message,expiresAt:{gt:new Date()}}});
  return consumed.count===1;
}

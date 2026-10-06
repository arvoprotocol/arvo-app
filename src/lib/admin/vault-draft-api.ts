import {requireSameOrigin,readJson,RequestError,securityFailure} from "@/lib/security/request";
import "server-only";
import { NextResponse } from "next/server";
import { getAdminSession } from "./session";

export async function draftAccess(request: Request, mutation = false) {
  if (!await getAdminSession()) return NextResponse.json({ error: "Unauthorised admin request." }, { status: 401 });
  if (mutation) {
    try {requireSameOrigin(request);}catch(error){return securityFailure(error);}
  }
  return null;
}
export async function draftBody(request: Request): Promise<Record<string, unknown>> {
  const value: unknown = await readJson(request);
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid draft request.");
  return value as Record<string, unknown>;
}
export function draftId(raw: string) {
  const id = Number(raw);
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(id) || id < 1 || id > 2147483647) throw new Error("Invalid draft ID.");
  return id;
}
export function draftFailure(error: unknown) {
  if(error instanceof RequestError)return securityFailure(error);
  const code = error && typeof error === "object" && "code" in error ? error.code : "";
  if (code === "P2002") return NextResponse.json({ error: "That pool is already linked to another draft." }, { status: 409 });
  if (typeof code === "string" && code.startsWith("P")) return NextResponse.json({ error: "Draft storage is unavailable. Check the database setup." }, { status: 503 });
  return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save draft." }, { status: 400 });
}

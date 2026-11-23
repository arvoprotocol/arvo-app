import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin/session";
import { RequestError } from "@/lib/security/request";

export async function adminPartnerId(context: { params: Promise<{ id: string }> }) {
  if (!await getAdminSession()) throw new RequestError("Admin authentication required.", 401);
  const id = Number((await context.params).id);
  if (!Number.isInteger(id) || id <= 0) throw new RequestError("Invalid partner.", 400);
  return id;
}

export function adminJson(value: unknown, status = 200) {
  return NextResponse.json(value, { status, headers: { "Cache-Control": "no-store" } });
}

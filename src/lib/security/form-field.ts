import { RequestError } from "@/lib/security/request";

/** Reads a trimmed string field from a JSON body with a length cap; single-line unless multiline. */
export function formField(body: Record<string, unknown>, key: string, max: number, required = false, multiline = false) {
  const value = typeof body[key] === "string" ? (body[key] as string).trim() : "";
  if (required && !value) throw new RequestError("Please complete the required fields.");
  if (value.length > max) throw new RequestError("One or more fields are too long.");
  if (!multiline && /[\r\n]/.test(value)) throw new RequestError("Please check your details.");
  return value;
}

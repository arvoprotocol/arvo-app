import {NextResponse, type NextRequest} from "next/server";
import {appOrigin, appSubdomainEnabled} from "@/lib/protocol/app-url";
import {routeAppHost} from "@/lib/protocol/host-routing";
import {randomBytes} from "node:crypto";
import {contentSecurityPolicy} from "@/lib/security/csp";
export function proxy(request: NextRequest) {
 const decision = routeAppHost(request.headers.get("host") || request.nextUrl.host, request.nextUrl.pathname, request.method,
  appSubdomainEnabled() ? appOrigin() : "", process.env.NEXT_PUBLIC_SITE_URL || "https://arvoprotocol.com");
 if (decision.action === "reject") return NextResponse.json({error:"Open the Arvo app on its app domain."},{status:404,headers:{"Cache-Control":"private, no-store"}});
 const url = request.nextUrl.clone();
 if (decision.path) url.pathname = decision.path;
 if (decision.action === "redirect") {
  const target = new URL(decision.targetOrigin!); target.pathname = url.pathname; target.search = url.search;
  return NextResponse.redirect(target, 307);
 }
 // Host-conditioned Next config rewrites resolve internally without a proxy round trip.
 const nonce = randomBytes(32).toString("base64");
 const policy = contentSecurityPolicy(nonce, process.env.NODE_ENV !== "production");
 const headers = new Headers(request.headers);
 headers.set("x-nonce", nonce);
 headers.set("Content-Security-Policy", policy);
 const response = NextResponse.next({request:{headers}});
 response.headers.set("Content-Security-Policy", policy);
 // Nonces must never be reused by an HTML response cache.
 response.headers.set("Cache-Control", "private, no-store");
 if (appSubdomainEnabled() && (request.headers.get("host") || "").split(":")[0] === new URL(appOrigin()).hostname && !url.pathname.startsWith("/_next/") && !/\.[a-z0-9]{1,12}$/i.test(url.pathname)) { response.headers.set("Cache-Control","private, no-store"); response.headers.set("X-Robots-Tag","noindex, nofollow"); }
 return response;
}
export const config = {matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};

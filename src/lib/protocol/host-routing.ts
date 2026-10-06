export type HostRoute = { action: "next" | "rewrite" | "redirect" | "reject"; path?: string; targetOrigin?: string };
const pages = new Set(["stake", "portfolio", "projects", "rewards", "treasury", "community", "governance", "activity", "support", "terms", "admin", "wallet", "vault-previews", "market-price", "community-data", "community-posts"]);
export function routeAppHost(host: string, path: string, method: string, configuredApp: string, marketing: string): HostRoute {
 if (!configuredApp) return { action: "next" };
 const app = new URL(configuredApp), site = new URL(marketing);
 const hostname = host.toLowerCase().replace(/:\d+$/, "");
 const appPath = path === "/app" || path.startsWith("/app/");
 if (hostname === site.hostname || hostname === "www." + site.hostname) {
  if (appPath && (method === "GET" || method === "HEAD")) return { action: "redirect", targetOrigin: app.origin, path: path === "/app" ? "/" : path.slice(4) };
  // Old API sessions do not cross to the new host. Marketing forms stay here.
  if (appPath || path === "/api/app-access" || path.startsWith("/api/admin/")) return { action: "reject" };
  return { action: "next" };
 }
 if (hostname !== app.hostname) return { action: "next" };
 if (path.startsWith("/_next/") || path.startsWith("/api/") || /\.[a-z0-9]{1,12}$/i.test(path)) return { action: "next" };
 if (appPath) return method === "GET" || method === "HEAD" ? { action: "redirect", targetOrigin: app.origin, path: path === "/app" ? "/" : path.slice(4) } : { action: "next" };
 if (path === "/" || pages.has(path.split("/")[1])) return { action: "rewrite", path: "/app" + (path === "/" ? "" : path) };
 return { action: "redirect", targetOrigin: site.origin, path };
}

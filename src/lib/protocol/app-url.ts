// Shared public URL helpers. Leave the app URL unset until HTTPS is ready.
export function appSubdomainEnabled(): boolean { return Boolean(process.env.NEXT_PUBLIC_APP_URL); }
export function appOrigin(): string {
 const raw = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://arvoprotocol.com";
 const url = new URL(raw);
 if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("Configure an HTTPS app origin without a path.");
 return url.origin;
}
export function appPath(path = "/app"): string {
 if (!appSubdomainEnabled()) return path;
 return path === "/app" ? "/" : path.startsWith("/app/") ? path.slice(4) : path.startsWith("/app?") || path.startsWith("/app#") ? "/" + path.slice(4) : path;
}
export function appUrl(path = "/app"): string { return appOrigin() + appPath(path); }
export function internalAppPath(path: string): string {
 if (!appSubdomainEnabled() || path === "/app" || path.startsWith("/app/")) return path;
 return path === "/" ? "/app" : "/app" + path;
}
export function appCookiePath(): string { return appSubdomainEnabled() ? "/" : "/app"; }

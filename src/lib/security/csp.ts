// Per-response script nonce. RPC and wallet transports use HTTPS/WSS;
// scripts themselves require a nonce and never allow inline/eval in production.
export function contentSecurityPolicy(nonce: string, development: boolean) {
  if (!/^[A-Za-z0-9+/=]+$/.test(nonce)) throw new Error("Invalid CSP nonce.");
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.reown.com",
    "media-src 'self' https: blob:",
    `connect-src 'self' https: wss:${development ? " ws:" : ""}`,
    "frame-src 'self' https://verify.walletconnect.com https://verify.walletconnect.org https://secure.walletconnect.org https://www.youtube-nocookie.com https://platform.twitter.com https://syndication.twitter.com",
    "worker-src 'self' blob:",
    "base-uri 'self'", "object-src 'none'", "frame-ancestors 'none'", "form-action 'self'",
    ...(!development ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

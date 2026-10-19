# Soken app remediation - 16 October 2026

Base: e6ab45a17607adbf4107339f3b08f88fa99caaa8. These are source changes
for verification; production rollout and browser/wallet smoke checks are separate.

| Finding | Response |
| --- | --- |
| APS-L1 | Request-specific cryptographic nonce with explicit default-src and script-src, strict-dynamic, no inline script attributes, no production unsafe-eval/unsafe-inline scripts, and upgrade-insecure-requests. Overwrite caller-supplied policy/nonce headers before Next rendering. Root layout waits for a request; responses are private/no-store so nonces are not reused. Inline styles remain allowed for the existing animation/UI stack. HTTPS/WSS connections remain available for configured RPC and wallet transports; script execution requires the nonce. |
| APS-L2 | Add the Prisma module's server-only build-time guard. |
| APS-L3 | Operational hold: keep max-age=31536000. Do not apply includeSubDomains or submit for preload until the owner verifies every subdomain and any delegated hostname serves HTTPS. This is not represented as fixed. |
| APS-I1 | Existing and new signups both return HTTP 200 with `{ok:true}` and omit the existing-account flag. This removes explicit status/body enumeration, not a promise of constant-time responses. |
| APS-I2 | Remove src/app/page.tsx.save and ignore *.save. |
| APS-I3 | Preserve authoritative route-level and layout authorization. Add CI that exercises actual auth logic. Proxy provides nonce policy, but does not claim to validate database-backed sessions. Centralizing auth in proxy is deferred rather than replacing or weakening route guards. |
| APS-I4 | APP_ACCESS_SESSION_SECRET is independent of ADMIN_SESSION_SECRET. No fallback to the admin key. Provision before restarting; old app-access cookies expire on rollout and users re-enter the app password. Admin sessions are not intentionally rotated. |
| APS-I5 | No unrelated dependency upgrade or forced downgrade. Recheck production/development audits on the server; development advisory disposition remains documented separately. |
| APS-I6 | Use the configured browser-Origin allowlist and reject cross-site requests. Admin mutations additionally require the configured app origin, preserving separation from marketing forms. Never authorize using forwarded Host headers. |
| APS-I7 | Display only typed input-validation messages; return neutral errors for unexpected failures and log details server-side. |

## Contract fix integration

After the staking upgrade, Portfolio/Rewards/Activity show a DUAL emergency
exit's pending USDC principal separately from completed ARVO settlement.
The owner can claim the pending principal when that escrow pool is funded,
independently of maturity and paused state. Original fixed rewards are labelled
forfeited after an emergency exit. Transactions retain simulation, account/network
pinning, exact target address and wallet signing. Acquisition cash is never
borrowed from another pool or ordinary reward reserves.

## Rollout and checks

Nonce-bearing HTML is rendered per request, including marketing pages; this
adds server rendering work compared with their previous static HTML cache.
Static asset caching is not intentionally changed. Wallet verification iframe
origins match the installed WalletConnect SDK, including secure.walletconnect.org.
The policy also permits the existing YouTube privacy embeds, X widget frames
and HTTPS video sources used by project/community/team pages. These exceptions
do not permit inline scripts or relax the production script nonce requirement.

Run `python3 tooling/configure_audit_sessions.py` in the live app before build
and restart. It appends a random independent app-access key to a regular mode-600
.env.local without printing values or changing the admin key. Never put its output
file or production environment in Git. Existing configuration can instead be
provisioned through your normal secret-management process.

Use the pinned lockfile/Next 16.3.8 environment for `npm run build`; do not alter
dependencies to match a local fallback test. CI builds in an isolated database.
After rollout, check marketing and app headers, page hydration, navigation,
MetaMask connection, WalletConnect QR/mobile connection, admin login, app-password
gate, project images and a testnet transaction. If any wallet service needs an
additional frame origin, approve that exact origin; never weaken script-src to `*`
or add unsafe-inline scripts to hide a failure.

The local fallback build and HTTP nonce smoke test used available Next 16.3.6
dependencies with webpack. They do not certify the pinned Turbopack build or
real mobile wallet compatibility. Re-run those on the deployment host.

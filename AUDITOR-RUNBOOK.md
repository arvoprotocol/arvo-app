# Reproduce the ARVO app for security review

Use a separate checkout/container and synthetic data. Never run these commands against
production environment files, a production database or a production wallet.
Record the full repository commit and Node/npm versions in your report.

## Build

Use Node 22 or 24 LTS. Install the lockfile, set DATABASE_URL to a throwaway absolute
file path, generate Prisma Client, run the existing regression tests and build:

```sh
npm ci
export DATABASE_URL=file:/absolute/audit-fixtures/arvo-audit-review.db
npx prisma generate
node --test tooling/test_*.cjs
python3 tooling/test_acquisition_deploy.py
npx tsc --noEmit
npm run build
npm audit --omit=dev
```

Pinned install-script approvals are recorded for Prisma engines/client prerequisites,
better-sqlite3 and the native resolver. The optional Reown version-check hook is
explicitly denied. Do not blanket-approve arbitrary hooks. On npm 12 these approvals
are needed for native installation; npm 11 may only warn.

The npm advisory result is a dated dependency check, not proof that all reported
attack prerequisites are reachable or that no unknown vulnerabilities remain.

## Create a complete, isolated test database

The committed historical migration creates only the original Project table. It does
not reproduce the current schema, which includes wallet sessions, protection buckets,
support tickets, vault drafts, partners and project plots. The following helper creates
all current-schema tables in a NEW fixture outside the application. It refuses an
existing path, creates a marker for the offline checks, and does not modify migration
history or production data. This is an audit/development bootstrap, not a production
migration strategy.

Choose a new absolute arvo-audit-*.db path. Change /absolute/audit-fixtures below to
an actual directory outside the checkout. Paths are intentionally not defaulted to
prisma/arvo.db or a configured production DATABASE_URL.

```sh
python3 tooling/prepare_audit_database.py \
  --database /absolute/audit-fixtures/arvo-audit-review.db

ARVO_AUDIT_DB=/absolute/audit-fixtures/arvo-audit-review.db \
  node tooling/audit_auth_checks.cjs
```

The checks use publicly known disposable test keys, synthetic records, a fresh SQLite
fixture and mocked Next cookie access. They exercise the actual frozen authentication
source and Prisma database operations. They test origin rejection, unauthorized admin,
challenge tampering/replay/expiry, signed administrator login, session tampering and
revocation, mismatched wallet signatures, wallet-login replay and wrong-wallet access.
They are not end-to-end tests of a browser, deployed server, RPC or Safe wallet.

## Staging and configuration

For interactive review, create separate staging secrets and test accounts. Configure
HTTPS origins, WalletConnect and the reviewed chain/proxy. List administrator login
identity separately from on-chain governance/Safe authority. Current login signature
verification supports standard 65-byte EOA signatures; do not assume ERC-1271 Safe
login support. Test wallets must have test funds only. Configure mail to a test sink;
never run campaigns or worker sends against real customers during review.

Authorize exact staging hosts/IPs, testing limits and dates in writing. The production
VPS hosts unrelated applications; ARVO review does not authorize testing other tenants.
Read final on-chain roles, Treasury/Safe/Timelock/oracle settings and verify deployment
bytecode separately. Successful builds and these offline checks do not replace that.

For machines with limited free RAM, use NODE_OPTIONS=--max-old-space-size=1536,
CIRCLE_NODE_TOTAL=2 and serialized jobs. The latter currently selects one Next page
worker in this dependency version. Confirm available RAM/swap before running a fresh
install/build alongside production services.

## Remaining tooling advisory

The development-only eslint-config-next -> fast-glob -> micromatch -> braces@3.0.3
chain still matches GHSA-vfj7-8cjw-p6xm. At this check, no fixed braces release was
available from the registry (latest 3.0.3). The full npm audit reports five affected
packages along this chain; they are not five independently confirmed app exploits.
These packages are not production request dependencies. Do not feed attacker-controlled
glob patterns into the lint tooling; ask the auditor to review this disposition and
monitor upstream remediation. Do not downgrade Next lint tooling to version 14 merely
to silence npm audit. Production-only audit reports zero advisories as of this check.

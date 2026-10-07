# ARVO app

Next.js website and staking interface with wallet connections, vault publishing,
project management, portfolios, reward schedules and acquisition-vault controls.
The staking contracts are maintained separately in `arvoprotocol/arvo-contracts`.

## Local setup

Use Node.js 22–24. Install the locked dependencies with `npm ci`. Create a private
`.env.local` using `.env.example` as a guide, then run:

```sh
npx prisma generate
npm run dev
```

Use a separate development SQLite database. The initial Prisma migration predates
several app features; review `scripts/install-*.mjs` before setting up a new database.
Do not assume the initial migration alone creates the complete current schema.
Do not run database installation scripts against production without a backup.

## Validation

```sh
node --test tooling/test_*.cjs
python3 tooling/test_acquisition_deploy.py
npx tsc --noEmit
npm run build
```

## Repository contents

`src` contains the current website, API routes and app. `public` contains referenced
logos, team images, social previews, market icons and the Satoshi font. `prisma`
contains schema and migrations, while `scripts` and `tooling` contain setup,
operational helpers and regression tests.

Secrets, private databases, uploaded project media, build output, patch archives,
backup revisions and unused logo experiments are excluded. Uploads are stored
outside source control using `PROJECT_UPLOAD_DIR`.

## Operation

Configure public staking variables for the intended chain and proxy. WalletConnect
needs a project ID; administrator and support features need their own private
settings. Copying source does not configure a chain, fund rewards or activate a
vault. Testnet reward minting helpers are explicitly restricted to testnet.

Build with `npm run build`, then restart only the website process managed for this
app. The support notification worker is a separate service.

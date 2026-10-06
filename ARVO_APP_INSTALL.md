# Arvo Protocol App

The protocol interface lives at `/app` and is intentionally not linked from the public marketing-site header yet.

## Included app routes
- `/app` – Overview
- `/app/stake` – Vault selection, reward calculator and staking flow
- `/app/portfolio` – Active and historic positions
- `/app/rewards` – ARVO and stablecoin rewards
- `/app/treasury` – Treasury overview and allocation
- `/app/governance` – Proposal interface
- `/app/activity` – Protocol activity

## Deploy
From the Arvo project root:

```bash
npm install
npm run build
pm2 restart arvo
```

## Current integration status
The app is a functional front-end prototype using demonstration portfolio/Treasury data. Calculator interactions and UI states work locally in the browser. Wallet connection, live balances, reward claims, staking transactions and contract data still need to be wired to the final token/staking contracts.

Vault terms match the public Arvo staking page:
- Build — 60 days — 4% target reward per cycle
- Advance — 90 days — 7% target reward per cycle
- Compound — 180 days — 14% target reward per cycle
- Foundation — 365 days — 30% target reward per cycle

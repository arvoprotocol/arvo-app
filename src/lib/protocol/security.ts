// Security and audit facts shown publicly. Keep these exact and current:
// update when a new audit is completed or the deployed code changes.
export const GITHUB = {
  contracts: "https://github.com/arvoprotocol/arvo-contracts",
  app: "https://github.com/arvoprotocol/arvo-app",
  bonusReview: "https://github.com/arvoprotocol/arvo-contracts/blob/feature/shared-bonus/docs/security/bonus/SECURITY-REVIEW.md",
};

export const AUDITS = [
  {
    auditor: "Soken",
    scope: "ARVO staking contracts",
    detail: "Staking, vault creation, reward accounting, emergency exit and governance handoff.",
    reviewed: "Commit 007754e6",
    date: "October 2026",
    result: "Final report: no critical or high-severity findings. Earlier findings, including a medium-severity issue, were remediated; the report keeps their original severity and remediation status.",
    href: "https://soken.dev/audits.html",
  },
  {
    auditor: "Soken",
    scope: "Arvo app",
    detail: "Wallet flows, admin console security, content security policy and transport security.",
    reviewed: "Commit 9e9ce9b",
    date: "October 2026",
    result: "Final report: no critical or high-severity findings. Remediation confirmed by Soken.",
    href: "https://soken.dev/audits.html",
  },
] as const;

export const ADDITIONAL_REVIEWS = [
  {
    title: "Shared bonus contract: independently tested",
    body: "Shared bonuses are paid by a separate, non-upgradeable contract that can only read the staking contract and cannot access principal or base rewards. It is not covered by the Soken audit. It was tested with dedicated unit, fuzz and invariant tests, Slither and Semgrep static analysis, and an independent AI security review; all findings were fixed. On 20 November 2026 it was extended to vaults that take ARVO and pay USDG; that change is covered by 39 bonus tests (310 in the full suite) but has not been separately reviewed.",
    href: GITHUB.bonusReview,
    link: "Read the review record",
  },
] as const;

export const SAFEGUARDS = [
  { title: "Time-locked upgrades", body: "Contract upgrades and admin changes must wait out a public timelock delay before they can execute." },
  { title: "Two-signature control", body: "Vault and reward management is held by a Safe that needs 2 of its 3 owners to sign; no single key can act alone." },
  { title: "Emergency pause", body: "An emergency key can pause deposits immediately. Unpausing goes through the timelock. While paused, stakers can exit with their principal." },
  { title: "Reserved rewards", body: "Each vault's reward budget is reserved before it opens, and principal is accounted for separately from rewards." },
  { title: "Onchain caps", body: "Vault capacity and minimum deposits are enforced by the contract, not just the website." },
  { title: "Hardened app", body: "Per-request content security policy, HTTPS-only transport (HSTS), server-side admin authentication and rate limiting." },
] as const;

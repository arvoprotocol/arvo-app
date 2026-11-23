// Staging only: adds (or removes) a confirmed test Strategic Partner on your own wallet, so you can see
// the Partner allocation page exactly as a partner would.
//   DATABASE_URL=file:... node scripts/staging-test-partner.mjs --wallet 0xYourWallet --usd 1000
//   DATABASE_URL=file:... node scripts/staging-test-partner.mjs --remove
// Refuses any database whose path does not contain "staging", and the live site's folder.
import Database from "better-sqlite3";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { resolve } from "node:path";

const EMAIL = "staging-test-partner@arvoprotocol.invalid";
const args = process.argv.slice(2), arg = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const raw = process.env.DATABASE_URL;
if (!raw || !raw.startsWith("file:")) throw new Error("Set DATABASE_URL to the staging SQLite file.");
const path = resolve(raw.slice(5));
if (!existsSync(path)) throw new Error("Database not found.");
const real = realpathSync(path);
if (!/staging/i.test(real) || /\/htdocs\/arvoprotocol\.com\//.test(real)) throw new Error(`Refusing: ${real} doesn't look like the staging database.`);
const db = new Database(real, { fileMustExist: true });
const now = new Date().toISOString().replace("Z", "+00:00");
try {
  const existing = db.prepare('select id from "StrategicPartner" where email = ?').get(EMAIL);
  if (args.includes("--remove")) {
    if (!existing) { console.log("No test partner to remove."); process.exit(0); }
    db.transaction(() => { db.prepare('delete from "PartnerRelease" where partnerId = ?').run(existing.id); db.prepare('delete from "StrategicPartner" where id = ?').run(existing.id); })();
    console.log("Test partner removed.");
    process.exit(0);
  }
  const wallet = arg("--wallet"), usd = arg("--usd") || "1000.00";
  if (!wallet || !/^0x[0-9a-fA-F]{40}$/.test(wallet)) throw new Error("Pass --wallet 0x… (your own wallet address).");
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(usd)) throw new Error("Pass --usd like 1000 or 1000.00.");
  const taken = db.prepare('select name from "StrategicPartner" where lower(registeredWallet) = lower(?) and email <> ?').get(wallet, EMAIL);
  if (taken) throw new Error(`That wallet already belongs to partner "${taken.name}". Use a different wallet.`);
  // Same conversion as src/lib/partners/allocation.ts (graduation price, rounded down).
  const price = /priceUsd:\s*"([\d.]+)"/.exec(readFileSync(new URL("../src/lib/partners/allocation.ts", import.meta.url), "utf8"))[1];
  const [w, c = ""] = usd.split("."), cents = BigInt(w) * 100n + BigInt(c.padEnd(2, "0"));
  const [pw, pf] = price.split("."), scale = 10n ** BigInt(pf.length), arvo = String((cents * scale) / ((BigInt(pw) * scale + BigInt(pf)) * 100n));
  const amount = `${BigInt(w)}.${c.padEnd(2, "0")}`;
  if (existing) {
    db.prepare('delete from "PartnerRelease" where partnerId = ?').run(existing.id);
    db.prepare('update "StrategicPartner" set registeredWallet = ?, allocationUsd = ?, allocationArvo = ?, allocationPrice = ?, status = \'confirmed\', updatedAt = ? where id = ?').run(wallet, amount, arvo, price, now, existing.id);
  } else {
    db.prepare('insert into "StrategicPartner" (name, email, originalWallet, registeredWallet, walletType, status, registrationToken, robinhoodConfirmed, notes, allocationUsd, allocationArvo, allocationPrice, registeredAt, confirmedAt, createdAt, updatedAt) values (?, ?, ?, ?, \'self_custody\', \'confirmed\', ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run("Test Partner (staging)", EMAIL, wallet, wallet, "staging-test-" + Date.now(), "Staging test partner. Remove with --remove.", amount, arvo, price, now, now, now, now);
  }
  console.log(`Test partner ready: ${wallet} · $${amount} → ${BigInt(arvo).toLocaleString("en-GB")} ARVO at $${price}.`);
  console.log("Open the app → Partner allocation, connect this wallet and sign in.");
} finally { db.close(); }

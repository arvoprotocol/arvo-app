// Prints ARVO's first DEX candles after graduation from GeckoTerminal, to confirm the partner
// conversion price (ALLOCATION.priceUsd in src/lib/partners/allocation.ts). Read-only; needs internet.
//   node scripts/first-candle-price.mjs
const TOKEN = "0x6457dA6FCA3C807b7f430770DbBe8aB5a767234A";
const POOL = (process.argv[2] || "0xb9b1139C812F4c9d0F3eC1dd502560777118E0E0").toLowerCase();
const base = "https://api.geckoterminal.com/api/v2/networks/robinhood";
const get = async url => { const r = await fetch(url, { headers: { accept: "application/json" } }); if (!r.ok) throw new Error(`${r.status} from ${url}`); return r.json(); };

const pool = (await get(`${base}/pools/${POOL}`)).data.attributes;
console.log(`Pool: ${pool.name} (${POOL})`);
console.log(`Pool created: ${pool.pool_created_at}`);
const created = Math.floor(Date.parse(pool.pool_created_at) / 1000);

for (const [frame, aggregate, span] of [["minute", 1, 600], ["hour", 1, 600 * 60]]) {
  const url = `${base}/pools/${POOL}/ohlcv/${frame}?aggregate=${aggregate}&limit=1000&currency=usd&token=${TOKEN}&before_timestamp=${created + span}`;
  const list = (await get(url)).data.attributes.ohlcv_list.sort((a, b) => a[0] - b[0]);
  console.log(`\nFirst ${frame} candles (USD per ARVO):`);
  for (const [t, o, h, l, c, v] of list.slice(0, 5)) console.log(`  ${new Date(t * 1000).toISOString()}  open ${o}  high ${h}  low ${l}  close ${c}  vol $${Number(v).toFixed(2)}`);
  if (!list.length) console.log("  none returned (GeckoTerminal may not keep this resolution that far back)");
}

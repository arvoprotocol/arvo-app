import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { sharedVault } from "@/lib/staking/vault-share-data";
import { shareBacking, shareOpening, sharePercent, shareTerm } from "@/lib/staking/vault-share";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const root = process.cwd();
const font = (w: number) => readFile(path.join(root, "public/fonts/satoshi/static", `Satoshi-${w}.ttf`));

/** 1200×630 link preview for one vault, in the app's dark card style. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const vault = await sharedVault((await params).slug);
  const [regular, medium, bold, logo] = await Promise.all([font(400), font(500), font(700), readFile(path.join(root, "src/lib/og/arvo-wordmark-white.png"))]);
  const wordmark = `data:image/png;base64,${logo.toString("base64")}`;
  const copper = "#e2a98e";
  const status = vault ? (vault.live ? "Live vault" : shareOpening(vault.opensAt) ? `Opens ${shareOpening(vault.opensAt)}` : "Coming soon") : "";
  const stats = vault ? [["Minimum", vault.minimum], ["Vault size", vault.size], ["Reward in", vault.asset]] : [];

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "60px 72px", backgroundColor: "#0b0a09", backgroundImage: "radial-gradient(circle at 88% 0%, rgba(201,132,106,0.34) 0%, rgba(201,132,106,0) 46%), radial-gradient(circle at 0% 100%, rgba(169,139,240,0.14) 0%, rgba(169,139,240,0) 42%)", color: "white", fontFamily: "Satoshi" }}>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- rendered by next/og, not the browser */}
        <img src={wordmark} height={44} width={138} alt="" />
        {vault && <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: copper }}>
          <div style={{ width: 10, height: 10, borderRadius: 10, background: copper, display: "flex" }} />{status}
        </div>}
      </div>

      {vault ? <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1 }}>{vault.title}</div>
          {vault.bonusPct ? <div style={{ display: "flex", padding: "10px 22px", borderRadius: 999, background: "linear-gradient(110deg,#c9846a,#f0d2b0,#bba0ce)", color: "#07090b", fontSize: 22, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{`+${sharePercent(vault.bonusPct)} bonus`}</div> : null}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 26, marginTop: 30 }}>
          <div style={{ fontSize: 132, fontWeight: 700, letterSpacing: -5, lineHeight: 0.9 }}>{sharePercent(vault.rate)}</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 30, lineHeight: 1.25, paddingBottom: 6 }}>
            <span style={{ color: copper, fontWeight: 500 }}>{`fixed ${vault.asset} reward${vault.bonusPct ? " + bonus" : ""}`}</span>
            <span style={{ color: "rgba(255,255,255,0.72)" }}>{`over ${shareTerm(vault.days)}`}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 38 }}>
          {stats.map(([label, value]) => <div key={label} style={{ display: "flex", flexDirection: "column", padding: "16px 24px", borderRadius: 18, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", minWidth: 220 }}>
            <span style={{ fontSize: 19, color: "rgba(255,255,255,0.62)" }}>{label}</span>
            <span style={{ fontSize: 30, fontWeight: 700, marginTop: 4 }}>{value}</span>
          </div>)}
        </div>
      </div> : <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3 }}>Arvo vaults</div>
        <div style={{ fontSize: 34, color: "rgba(255,255,255,0.72)", marginTop: 16 }}>Fixed rewards backed by real land sales.</div>
      </div>}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 26px", borderRadius: 18, background: "linear-gradient(110deg,#b9775d 0%,#e2a98e 38%,#f0d2b0 60%,#a98bf0 135%)", color: "#07090b", fontSize: 23, gap: 16 }}>
        <span style={{ fontWeight: 500, flexShrink: 1, marginRight: 24, fontSize: vault && shareBacking(vault).length > 52 ? 19 : 23 }}>{vault ? shareBacking(vault) : "Real land. Onchain participation."}</span>
        <span style={{ fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap" }}>Audited by Soken</span>
      </div>
    </div>,
    {
      width: 1200, height: 630,
      fonts: [{ name: "Satoshi", data: regular, weight: 400 }, { name: "Satoshi", data: medium, weight: 500 }, { name: "Satoshi", data: bold, weight: 700 }],
      headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
    },
  );
}

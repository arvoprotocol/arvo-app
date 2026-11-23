"use client";
import { useEffect, useState } from "react";

/** true / false once checked (null while checking or with no wallet): is the connected wallet a confirmed Strategic Partner with an allocation? */
export function usePartnerEligible(account: string | null | undefined) {
  const [state, setState] = useState<{ account: string; eligible: boolean } | null>(null);
  useEffect(() => {
    if (!account) return;
    const controller = new AbortController();
    void fetch("/app/allocation/eligible", { cache: "no-store", headers: { "x-arvo-wallet": account }, signal: controller.signal })
      .then(r => r.ok ? r.json() : { eligible: false })
      .then(v => { if (!controller.signal.aborted) setState({ account, eligible: v.eligible === true }); })
      .catch(() => {});
    return () => controller.abort();
  }, [account]);
  return account && state?.account === account ? state.eligible : null;
}

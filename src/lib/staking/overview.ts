import type { Position } from "@/hooks/useStakingData";
export function overviewPositions(positions: (Position & {id: bigint})[], now: bigint) {
  const active = positions.filter(p => !p.settled);
  const matured = active.filter(p => p.maturesAt <= now);
  const locked = active.filter(p => p.maturesAt > now).sort((a,b) => a.maturesAt < b.maturesAt ? -1 : a.maturesAt > b.maturesAt ? 1 : 0);
  const sum = (rows: Position[], field: "arvoPrincipal" | "usdcPrincipal" | "arvoReward" | "usdcReward") => rows.reduce((total,p) => total + p[field], 0n);
  return { active, matured, locked, arvoPrincipal: sum(active,"arvoPrincipal"), usdcPrincipal: sum(active,"usdcPrincipal"), arvoReward: sum(active,"arvoReward"), usdcReward: sum(active,"usdcReward"), maturedArvo: sum(matured,"arvoReward"), maturedUsdc: sum(matured,"usdcReward") };
}
export function positionProgress(position: Position, now: bigint) {
  if (now >= position.maturesAt) return 100;
  if (now <= position.openedAt || position.maturesAt <= position.openedAt) return 0;
  return Number((now - position.openedAt) * 100n / (position.maturesAt - position.openedAt));
}

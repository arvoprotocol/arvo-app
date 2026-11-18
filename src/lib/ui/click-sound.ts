"use client";
/**
 * Original interface click, synthesised with the Web Audio API (no audio file, nothing to download).
 * A very short, bright two-part tick: a high sine "snap" plus a soft filtered-noise transient.
 * Quiet by design, and the preference is remembered per browser.
 */
const KEY = "arvo-ui-sound";
let ctx: AudioContext | null = null;
let noise: AudioBuffer | null = null;
let last = 0;

export function soundEnabled(): boolean {
  try { return localStorage.getItem(KEY) !== "off"; } catch { return true; }
}
export function setSoundEnabled(on: boolean) {
  try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event("arvo-ui-sound"));
}
export function subscribeSound(callback: () => void) {
  window.addEventListener("arvo-ui-sound", callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener("arvo-ui-sound", callback); window.removeEventListener("storage", callback); };
}

function context(): AudioContext | null {
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 4);
  return ctx;
}

/** variant: "tap" for ordinary controls, "soft" for toggles/tabs, "confirm" for primary actions. */
export function playClick(variant: "tap" | "soft" | "confirm" = "tap") {
  if (!soundEnabled()) return;
  const now = performance.now();
  if (now - last < 40) return; // no machine-gun effect on rapid taps
  last = now;
  const ac = context();
  if (!ac || !noise) return;
  if (ac.state === "suspended") void ac.resume();
  const t = ac.currentTime + 0.001;
  const pitch = variant === "confirm" ? 1750 : variant === "soft" ? 1200 : 1500;
  const level = variant === "soft" ? 0.05 : 0.08;

  const out = ac.createGain();
  out.gain.value = 1;
  out.connect(ac.destination);

  // tonal snap
  const osc = ac.createOscillator(), og = ac.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(pitch * 1.6, t);
  osc.frequency.exponentialRampToValueAtTime(pitch, t + 0.012);
  og.gain.setValueAtTime(0.0001, t);
  og.gain.exponentialRampToValueAtTime(level, t + 0.002);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
  osc.connect(og).connect(out);
  osc.start(t); osc.stop(t + 0.06);

  // crisp transient
  const src = ac.createBufferSource(), bp = ac.createBiquadFilter(), ng = ac.createGain();
  src.buffer = noise;
  bp.type = "bandpass"; bp.frequency.value = 4200; bp.Q.value = 1.4;
  ng.gain.setValueAtTime(level * 0.9, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
  src.connect(bp).connect(ng).connect(out);
  src.start(t);

  if (variant === "confirm") { // a second, slightly higher tick
    const o2 = ac.createOscillator(), g2 = ac.createGain(), t2 = t + 0.055;
    o2.type = "sine"; o2.frequency.setValueAtTime(pitch * 1.34, t2);
    g2.gain.setValueAtTime(0.0001, t2);
    g2.gain.exponentialRampToValueAtTime(level * 0.8, t2 + 0.002);
    g2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.05);
    o2.connect(g2).connect(out); o2.start(t2); o2.stop(t2 + 0.07);
  }
}

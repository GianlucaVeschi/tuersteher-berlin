import { reduceMotion } from '../util';
import { ctx, cvs } from '../render/canvas';
import { RT } from '../core/runtime';
// Hint shown on the stamp card for each step of the toilet chain.
export const K_HINTS: Record<number, string> = { 1: 'Find Mila on the main dancefloor: pink hair, sunglasses, left speakers.', 2: 'You have the bag. Back to the guy at the toilet door.' };

/* ---- the 10-second K hit: melting rows and columns, ghost trails, blur, colour drift, slow motion ---- */
export const K_MS = 10000;
export const kBuf = document.createElement('canvas'), kBufCtx = kBuf.getContext('2d')!;
export const kTrail = document.createElement('canvas'), kTrailCtx = kTrail.getContext('2d')!;
export function startK() { RT.kStart = performance.now(); RT.kUntil = RT.kStart + K_MS; kTrailCtx.clearRect(0, 0, kTrail.width, kTrail.height); }
export function endK() { RT.kUntil = 0; cvs.style.filter = ''; }
// 0..1: rises quickly, holds, fades out over the last seconds
export function kLevel(now: number) {
  if (!RT.kUntil) return 0;
  const p = (now - RT.kStart) / K_MS;
  if (p >= 1) return 0;
  return Math.min(1, p * 6) * Math.min(1, (1 - p) * 3);
}
export const timeScale = (now: number) => 1 - 0.6 * kLevel(now);
export function applyK(now: number) {
  const env = kLevel(now);
  if (!env) { endK(); return; }
  if (reduceMotion) { cvs.style.filter = `blur(${(1.5 * env).toFixed(2)}px) saturate(${(1 + env).toFixed(2)}) hue-rotate(${Math.round(90 * env)}deg)`; return; }
  const W = cvs.width, H = cvs.height, t = now / 1000;
  if (kBuf.width !== W || kBuf.height !== H) { kBuf.width = W; kBuf.height = H; kTrail.width = W; kTrail.height = H; }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  // rows slide sideways in waves
  kBufCtx.drawImage(cvs, 0, 0);
  const ax = 12 * env;
  for (let y = 0; y < H; y += 2) ctx.drawImage(kBuf, 0, y, W, 2, Math.sin(y * 0.045 + t * 2.2) * ax + Math.sin(y * 0.13 + t * 5) * ax * 0.25, y, W, 2);
  // columns drip downwards: the room melts
  kBufCtx.drawImage(cvs, 0, 0);
  const ay = 18 * env;
  for (let x = 0; x < W; x += 2) {
    const d = Math.max(0, Math.sin(x * 0.028 + t * 1.1)) * ay + Math.sin(x * 0.17 + t * 3.3) * ay * 0.2;
    ctx.drawImage(kBuf, x, 0, 2, H, x, d, 2, H);
  }
  // ghost trails: everything that moves leaves an echo
  ctx.globalAlpha = 0.6 * env; ctx.drawImage(kTrail, 0, 0); ctx.globalAlpha = 1;
  kTrailCtx.drawImage(cvs, 0, 0);
  cvs.style.filter = `blur(${(2.4 * env).toFixed(2)}px) hue-rotate(${Math.round(now / 9) % 360}deg) saturate(${(1 + 2 * env).toFixed(2)}) contrast(${(1 + 0.35 * env).toFixed(2)})`;
}

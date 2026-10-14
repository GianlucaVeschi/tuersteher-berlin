import { RT } from './core/runtime';

/** querySelector for elements that are always in index.html. */
export const $ = <E extends HTMLElement = HTMLElement>(s: string): E => document.querySelector<E>(s)!;
export const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const shuffle = <V>(a: V[]): V[] => {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
};
export const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

/** Seeded random numbers (mulberry32), so the map art looks the same on every load. */
export const rnd = () => {
  RT.seed |= 0; RT.seed = RT.seed + 0x6D2B79F5 | 0;
  let t = Math.imul(RT.seed ^ RT.seed >>> 15, 1 | RT.seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
export const pick = <V>(a: readonly V[]): V => a[Math.floor(rnd() * a.length)];

export function circle(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, c: string) {
  g.fillStyle = c;
  for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y + 0.5)); g.fillRect(cx - w, cy + y, w * 2, 1); }
}

/** Outline colour used for everything. */
export const INK = '#14121c';

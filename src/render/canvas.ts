import { RT } from '../core/runtime';
import { CITY_H, CITY_W, T } from '../world/tiles';
import { $ } from '../util';
/* ================= RENDER ================= */
export const cvs = $<HTMLCanvasElement>('#game');
export const ctx = cvs.getContext('2d')!;
ctx.imageSmoothingEnabled = false;

/* ================= SCREEN FIT (mobile) ================= */
export const screenEl = $('#screen');
export const MOBILE = window.matchMedia('(max-width: 700px), (max-height: 500px)');
/**
 * Device pixels per game pixel. The canvas is drawn at the screen's real resolution (an integer
 * multiple of the game's pixels), so pixels stay sharp on high-density phones instead of being
 * stretched by the browser. Drawing code works in game pixels; `draw()` applies this as the base transform.
 */
export let PX = 1;
export function fitCanvas() {
  const dpr = window.devicePixelRatio || 1;
  let w = 384, h = 256, k: number;
  if (MOBILE.matches) {
    const r = screenEl.getBoundingClientRect();
    if (r.width < 32 || r.height < 32) return;
    // Aim for roughly 10-12 tiles across the short side.
    const s = Math.max(2, Math.round(Math.min(r.width, r.height) / 160));
    w = Math.min(CITY_W * T, Math.floor(r.width / s));
    h = Math.min(CITY_H * T, Math.floor(r.height / s));
    k = Math.max(1, Math.round(s * dpr));
    cvs.style.width = (w * k / dpr) + 'px';
    cvs.style.height = (h * k / dpr) + 'px';
  } else {
    cvs.style.width = ''; cvs.style.height = '';
    const cw = cvs.getBoundingClientRect().width || w;
    k = Math.max(1, Math.round(cw * dpr / w));
  }
  if (cvs.width !== w * k || cvs.height !== h * k) { cvs.width = w * k; cvs.height = h * k; }
  ctx.imageSmoothingEnabled = false;
  PX = k;
  RT.VW = w; RT.VH = h;
}
/** Keeps the canvas sized to the screen. */
export function initCanvas() {
  new ResizeObserver(fitCanvas).observe(screenEl);
  window.addEventListener('resize', fitCanvas);
  MOBILE.addEventListener('change', fitCanvas);
  // moving the window to a screen with another pixel density
  window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`).addEventListener('change', fitCanvas);
  fitCanvas();
}

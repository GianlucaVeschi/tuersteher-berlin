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
export function fitCanvas() {
  let w = 384, h = 256;
  if (MOBILE.matches) {
    const r = screenEl.getBoundingClientRect();
    if (r.width < 32 || r.height < 32) return;
    // Integer scale keeps pixels crisp; aim for roughly 10-12 tiles across the short side.
    const s = Math.max(2, Math.round(Math.min(r.width, r.height) / 160));
    w = Math.min(CITY_W * T, Math.floor(r.width / s));
    h = Math.min(CITY_H * T, Math.floor(r.height / s));
    cvs.style.width = (w * s) + 'px';
    cvs.style.height = (h * s) + 'px';
  } else {
    cvs.style.width = ''; cvs.style.height = '';
  }
  if (cvs.width !== w || cvs.height !== h) {
    cvs.width = w; cvs.height = h;
    ctx.imageSmoothingEnabled = false;
  }
  RT.VW = w; RT.VH = h;
}
/** Keeps the canvas sized to the screen. */
export function initCanvas() {
  new ResizeObserver(fitCanvas).observe(screenEl);
  window.addEventListener('resize', fitCanvas);
  MOBILE.addEventListener('change', fitCanvas);
  fitCanvas();
}

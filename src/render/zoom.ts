import { $ } from '../util';
import { save } from '../core/save';
import { T } from '../world/tiles';
import { RT } from '../core/runtime';
/* ================= ZOOM ================= */
export const ZOOMS = [2, 1.5, 1, 0.66, 0.5];
export const zoom = { i: 2, fit: false };
export const zoomLevel = () => zoom.fit ? Math.min(RT.VW / (RT.MW * T), RT.VH / (RT.MH * T)) : ZOOMS[zoom.i];
export const CLUB_SHORT = { berghain: 'BERGHAIN', tresor: 'TRESOR', kitkat: 'KITKAT', aboutblank: 'ABOUT BLANK', katerblau: 'KATER BLAU', sisyphos: 'SISYPHOS', cdv: 'CDV' };
export function setZoom(fn) { fn(); zoomUI(); save(); }
export const zoomIn = () => setZoom(() => { if (zoom.fit) { zoom.fit = false; zoom.i = ZOOMS.length - 1; } else zoom.i = Math.max(0, zoom.i - 1); });
export const zoomOut = () => setZoom(() => { if (zoom.i >= ZOOMS.length - 1) zoom.fit = true; else if (!zoom.fit) zoom.i++; });
export const toggleMap = () => setZoom(() => { zoom.fit = !zoom.fit; });
export function zoomUI() {
  const b = $('#zoomMap');
  if (b) { b.classList.toggle('on', zoom.fit); b.setAttribute('aria-pressed', String(zoom.fit)); }
}

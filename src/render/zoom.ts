import { $ } from '../util';
import { save } from '../core/save';
import { T } from '../world/tiles';
import { RT } from '../core/runtime';
/* ================= ZOOM ================= */
export const ZOOMS = [2, 1.5, 1, 0.66, 0.5];
export const zoom = { i: 2, fit: false };
export const zoomLevel = () => zoom.fit ? Math.min(RT.VW / (RT.MW * T), RT.VH / (RT.MH * T)) : ZOOMS[zoom.i];
export const CLUB_SHORT: Record<string, string> = { berghain: 'BERGHAIN', tresor: 'TRESOR', kitkat: 'KITKAT', rso: 'RSO', katerblau: 'KATER BLAU', sisyphos: 'SISYPHOS', cdv: 'CDV', heidegluehen: 'HEIDE' };
export function setZoom(fn: () => void) { fn(); zoomUI(); save(); }
// The whole-map view is a frozen overview: only MAP / M open it, and while it's open you can't zoom,
// walk or talk. MAP / M or B close it, back to the zoom you had (zoom.i is kept meanwhile).
export const zoomIn = () => { if (!zoom.fit) setZoom(() => { zoom.i = Math.max(0, zoom.i - 1); }); };
export const zoomOut = () => { if (!zoom.fit) setZoom(() => { zoom.i = Math.min(ZOOMS.length - 1, zoom.i + 1); }); };
export const toggleMap = () => setZoom(() => { zoom.fit = !zoom.fit; });
export function zoomUI() {
  const b = $('#zoomMap');
  if (b) { b.classList.toggle('on', zoom.fit); b.setAttribute('aria-pressed', String(zoom.fit)); }
  // in the map only MAP stays, so it's clear how to get out
  for (const id of ['#zoomIn', '#zoomOut', '#soundBtn']) $(id).hidden = zoom.fit;
}

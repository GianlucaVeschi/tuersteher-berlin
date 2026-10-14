import type { Dir, Look } from '../types';

/** [x, y, w, h, colour] in sprite pixels; a missing colour keeps the previous one */
type Part = [number, number, number, number, string | undefined];
import { INK } from '../util';
/* ================= SPRITES ================= */
/** Darken (k < 1) or lighten a hex colour. */
export function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join('');
}
/** Draws a 16x16 person. step: 0 standing, 1/2 walking frames. */
export function person(g: CanvasRenderingContext2D, X: number, Y: number, dir: Dir, step: number, L: Look) {
  const flip = dir === 'right';
  const d = flip ? 'left' : dir;
  const b = L.big ? 1 : 0;
  g.save();
  g.translate(X, Y);
  if (flip) { g.translate(16, 0); g.scale(-1, 1); }
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(3, 14, 10, 2);
  if (step) g.translate(0, -1);
  const parts: Part[] = [];
  if (d === 'left') parts.push([step ? 5 : 6, 11, 2, step === 1 ? 3 : 4, L.legs], [step ? 9 : 8, 11, 2, step === 2 ? 3 : 4, L.legs]);
  else parts.push([5, 11, 2, step === 1 ? 3 : 4, L.legs], [9, 11, 2, step === 2 ? 3 : 4, L.legs]);
  parts.push([4 - b, 7, 8 + 2 * b, 5, L.top]);
  if (d !== 'left') parts.push([3 - b, 8, 1, 3, L.top], [12 + b, 8, 1, 3, L.top]);
  parts.push([4, 1, 8, 7, L.skin]);
  g.fillStyle = INK;
  parts.forEach(p => g.fillRect(p[0] - 1, p[1] - 1, p[2] + 2, p[3] + 2));
  parts.forEach(p => { if (p[4] !== undefined) g.fillStyle = p[4]; g.fillRect(p[0], p[1], p[2], p[3]); });
  const det: Part[] = [];
  if (d === 'left') det.push([6, 8, 3, 3, shade(L.top, 0.7)], [7, 11, 1, 1, L.skin]);
  else det.push([3 - b, 11, 1, 1, L.skin], [12 + b, 11, 1, 1, L.skin]);
  if (L.stripes) det.push([4 - b, 8, 8 + 2 * b, 1, L.stripes], [4 - b, 10, 8 + 2 * b, 1, L.stripes]);
  if (L.shine) det.push([5, 8, 1, 3, L.shine]);
  if (L.sparkle) det.push([5, 8, 1, 1, L.sparkle], [9, 9, 1, 1, L.sparkle], [7, 10, 1, 1, L.sparkle], [11, 8, 1, 1, L.sparkle]);
  if (L.harness) { if (d === 'left') det.push([6, 7, 1, 4, INK], [6, 9, 4, 1, INK]); else det.push([5, 7, 1, 4, INK], [10, 7, 1, 4, INK], [5, 9, 6, 1, INK]); }
  if (L.shirt && d === 'down') det.push([7, 7, 2, 5, L.shirt]);
  if (L.tie && d === 'down') det.push([7, 7, 2, 1, '#e9e6ef'], [7, 8, 2, 3, L.tie]);
  if (L.btc && d === 'down') det.push([6, 7, 1, 5, L.btc], [7, 7, 1, 1, L.btc], [8, 8, 1, 1, L.btc], [7, 9, 1, 1, L.btc], [8, 10, 1, 1, L.btc], [7, 11, 1, 1, L.btc]);
  if (L.mohawk) {
    // a strip of hair down the middle of the head, sticking up above it; the sides are shaved
    if (d === 'down' || d === 'up') det.push([7, -2, 2, d === 'up' ? 9 : 4, L.hair]);
    else det.push([6, -2, 5, 2, L.hair], [7, 0, 4, 1, L.hair]);
  } else if (!L.bald) {
    if (L.long) {
      if (d === 'down') det.push([4, 1, 8, 2, L.hair], [3, 2, 2, 7, L.hair], [11, 2, 2, 7, L.hair]);
      else if (d === 'up') det.push([3, 1, 10, 8, L.hair]);
      else det.push([5, 1, 7, 2, L.hair], [8, 2, 5, 7, L.hair]);
    } else if (d === 'down') det.push([4, 1, 8, 2, L.hair], [4, 3, 1, 2, L.hair], [11, 3, 1, 2, L.hair]);
    else if (!L.long && d === 'up') det.push([4, 1, 8, 6, L.hair]);
    else if (!L.long) det.push([5, 1, 7, 2, L.hair], [9, 3, 3, 3, L.hair]);
  } else det.push([d === 'left' ? 7 : 5, 2, 2, 1, 'rgba(255,255,255,.4)']);
  if (L.hat) {
    if (d === 'down') det.push([4, 1, 8, 2, L.hat], [3, 3, 10, 1, L.hat]);
    else if (d === 'up') det.push([4, 1, 8, 3, L.hat]);
    else det.push([5, 1, 7, 2, L.hat], [2, 3, 6, 1, L.hat]);
  }
  if (L.ears) det.push([4, -2, 2, 3, INK], [10, -2, 2, 3, INK], [4, -1, 2, 2, L.ears], [10, -1, 2, 2, L.ears]);
  if (L.flowers && d !== 'up') det.push([4, 1, 2, 1, L.flowers[0]], [7, 0, 2, 1, L.flowers[1] || L.flowers[0]], [10, 1, 2, 1, L.flowers[0]]);
  if (L.flowers && d === 'up') det.push([4, 1, 2, 1, L.flowers[0]], [7, 1, 2, 1, L.flowers[1] || L.flowers[0]], [10, 1, 2, 1, L.flowers[0]]);
  if (d === 'down') {
    det.push([6, 4, 1, 2, INK], [9, 4, 1, 2, INK]);
    if (L.paint) det.push([5, 6, 1, 1, L.paint], [10, 6, 1, 1, L.paint], [7, 2, 2, 1, L.paint]);
    if (L.blush) det.push([5, 6, 2, 1, '#ff6b8a'], [9, 6, 2, 1, '#ff6b8a']);
    if (L.glasses) det.push([5, 4, 2, 2, L.glasses], [9, 4, 2, 2, L.glasses], [7, 4, 2, 1, INK], [6, 5, 1, 1, INK], [9, 5, 1, 1, INK]);
    if (L.shades) det.push([5, 4, 6, 1, INK], [5, 5, 2, 1, INK], [9, 5, 2, 1, INK]);
    if (L.beard) det.push([5, 6, 6, 2, L.beard]);
    if (L.tattoo) det.push([5, 6, 1, 1, '#3b3a5c'], [10, 6, 1, 1, '#3b3a5c'], [7, 2, 2, 1, '#3b3a5c'], [11, 4, 1, 1, '#c0c0d0']);
  } else if (d === 'left') {
    det.push([5, 4, 1, 2, INK]);
    if (L.paint) det.push([6, 6, 1, 1, L.paint]);
    if (L.glasses) det.push([4, 4, 2, 2, L.glasses], [5, 5, 1, 1, INK], [6, 4, 3, 1, INK]);
    if (L.shades) det.push([4, 4, 3, 1, INK]);
    if (L.beard) det.push([4, 6, 4, 2, L.beard]);
    if (L.tattoo) det.push([7, 5, 1, 1, '#3b3a5c'], [6, 3, 1, 1, '#3b3a5c']);
  }
  det.forEach(p => { if (p[4] !== undefined) g.fillStyle = p[4]; g.fillRect(p[0], p[1], p[2], p[3]); });
  g.restore();
}

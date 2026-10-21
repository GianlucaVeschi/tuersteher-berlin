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
  if (L.bike) bike(g, d);
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
    if (L.tears) det.push([6, 6, 1, 2, '#9fd6ff'], [9, 6, 1, 2, '#9fd6ff']);
    if (L.tattoo) det.push([5, 6, 1, 1, '#3b3a5c'], [10, 6, 1, 1, '#3b3a5c'], [7, 2, 2, 1, '#3b3a5c'], [11, 4, 1, 1, '#c0c0d0']);
  } else if (d === 'left') {
    det.push([5, 4, 1, 2, INK]);
    if (L.paint) det.push([6, 6, 1, 1, L.paint]);
    if (L.glasses) det.push([4, 4, 2, 2, L.glasses], [5, 5, 1, 1, INK], [6, 4, 3, 1, INK]);
    if (L.shades) det.push([4, 4, 3, 1, INK]);
    if (L.beard) det.push([4, 6, 4, 2, L.beard]);
    if (L.tears) det.push([5, 6, 1, 2, '#9fd6ff']);
    if (L.tattoo) det.push([7, 5, 1, 1, '#3b3a5c'], [6, 3, 1, 1, '#3b3a5c']);
  }
  // KitKat's dungeon: blindfolds, collars and whatever is in their hand (front and side views only)
  if (d !== 'up') {
    const side = d === 'left', o = side ? -6 : 0;
    if (L.blindfold) det.push(side ? [3, 4, 5, 2, INK] : [4, 4, 8, 2, INK]);
    if (L.collar) det.push(side ? [5, 7, 4, 1, INK] : [5, 7, 6, 1, INK], side ? [5, 8, 1, 1, '#e0b040'] : [7, 8, 2, 1, '#e0b040']);
    if (L.tool === 'flogger') det.push([13 + o, 8, 1, 4, '#3a2616'], [12 + o, 12, 1, 3, INK], [13 + o, 12, 1, 4, INK], [14 + o, 12, 1, 3, INK]);
    if (L.tool === 'paddle') det.push([13 + o, 9, 1, 3, '#5a3e26'], [12 + o, 4, 3, 5, INK], [13 + o, 5, 1, 3, '#c94a3a']);
    if (L.tool === 'crop') det.push([14 + o, 2, 1, 10, INK], [13 + o, 2, 2, 1, '#c4162a']);
    if (L.tool === 'rope') det.push([12 + o, 10, 3, 3, '#c4162a'], [13 + o, 11, 1, 1, '#7a1a22']);
    if (L.tool === 'leash') det.push([13 + o, 11, 3, 1, '#c0c4cc']);
    if (L.tool === 'candle') det.push([13 + o, 7, 2, 4, '#f3eee3'], [13 + o, 5, 2, 2, '#ffd23f'], [14 + o, 4, 1, 1, '#ff8c42']);
  }
  if (L.box) {
    // a square delivery bag on the back, with a white W on it from behind
    if (d === 'up') det.push([2, 4, 12, 9, INK], [3, 5, 10, 7, L.box], [5, 7, 1, 3, '#ffffff'], [7, 8, 2, 1, '#ffffff'], [10, 7, 1, 3, '#ffffff'], [6, 9, 1, 1, '#ffffff'], [9, 9, 1, 1, '#ffffff']);
    else if (d === 'left') det.push([10, 4, 6, 8, INK], [11, 5, 4, 6, L.box]);
    else det.push([2, 5, 1, 5, L.box], [13, 5, 1, 5, L.box], [2, 4, 12, 1, INK]);
  }
  if (L.cig) {
    // a cigarette in the corner of the mouth, the tip glowing
    if (d === 'down') det.push([10, 6, 3, 1, '#f3eee3'], [13, 6, 1, 1, '#ff5a2a']);
    else if (d === 'left') det.push([2, 6, 3, 1, '#f3eee3'], [1, 6, 1, 1, '#ff5a2a']);
  }
  if (L.bike && d !== 'left') det.push([2, 9, 12, 1, INK], [2, 8, 2, 1, '#c0c4cc'], [12, 8, 2, 1, '#c0c4cc']); // handlebars
  det.forEach(p => { if (p[4] !== undefined) g.fillStyle = p[4]; g.fillRect(p[0], p[1], p[2], p[3]); });
  g.restore();
}

/** A bike under the rider: from the side two wheels and a frame, from the front or back one wheel. */
function bike(g: CanvasRenderingContext2D, d: Dir) {
  g.fillStyle = INK;
  if (d === 'left') {
    for (const cx of [3, 13]) { g.fillRect(cx - 3, 11, 6, 5); g.fillStyle = '#5a5f66'; g.fillRect(cx - 2, 12, 4, 3); g.fillStyle = INK; g.fillRect(cx - 1, 13, 2, 1); }
    g.fillStyle = '#00c2e8'; g.fillRect(3, 12, 10, 1); g.fillRect(7, 10, 1, 3); g.fillRect(3, 9, 1, 4);
    g.fillStyle = INK; g.fillRect(2, 8, 3, 1); g.fillRect(6, 9, 3, 1);
  } else {
    g.fillRect(6, 10, 4, 7); g.fillStyle = '#5a5f66'; g.fillRect(7, 11, 2, 5);
  }
}

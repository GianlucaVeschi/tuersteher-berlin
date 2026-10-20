import { ctx } from './canvas';
import { INK, reduceMotion } from '../util';
import type { Dir } from '../types';

const ANGLE: Record<Dir, number> = { up: 0, right: Math.PI / 2, down: Math.PI, left: -Math.PI / 2 };

/** The yellow "go this way" arrow, drawn on the tile whose top-left screen pixel is (X, Y) and pointing
 *  `dir` (towards a door, stairs or exit next to that tile). It bobs towards where it points; still under
 *  reduceMotion. Used in front of club doors on the street and at every way out of a room inside. */
export function drawArrow(X: number, Y: number, dir: Dir, now: number) {
  const bob = reduceMotion ? 0 : Math.round(Math.abs(Math.sin(now / 220)) * 2);
  ctx.save();
  ctx.translate(X + 8, Y + 8); ctx.rotate(ANGLE[dir]); ctx.translate(-5, -5 - bob);
  // 10×9 arrow pointing up from (0, 0), outlined in ink
  const rows: [number, number][] = [[4, 2], [3, 4], [2, 6], [1, 8], [0, 10]];
  ctx.fillStyle = INK;
  rows.forEach(([o, w], i) => ctx.fillRect(o - 1, i - 1, w + 2, 3));
  ctx.fillRect(2, 4, 6, 6);
  ctx.fillStyle = '#ffd23f';
  rows.forEach(([o, w], i) => ctx.fillRect(o, i, w, 1));
  ctx.fillRect(3, 5, 4, 4);
  ctx.restore();
}

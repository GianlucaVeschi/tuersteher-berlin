import { RT } from '../core/runtime';
import { state } from '../core/state';
import { D, SOLID } from './tiles';
import { get } from './grid';
import { SHOPS } from '../data/outfits';
import { CLUBS } from '../data/clubs';
/* ================= COLLISION ================= */
export function clubAtDoor(x, y) { return CLUBS.find(c => c.dx === x && c.doorY === y); }
export function shopAtDoor(x, y) { return SHOPS.find(sh => sh.dx === x && sh.doorY === y); }
export function blocked(x, y) {
  const t = get(x, y);
  if (t === D) { if (shopAtDoor(x, y)) return false; const c = clubAtDoor(x, y); return !(c && state.stamps[c.id]); }
  if (SOLID.has(t)) return true;
  return RT.ents.some(e => !e.pickup && covers(e, x, y));
}
// most people fill one tile; groups on a bed are `w` tiles wide
export const covers = (e, x, y) => e.y === y && x >= e.x && x < e.x + (e.w || 1);

import { PLACES } from '../data/places';
import { RT } from '../core/runtime';
import { state } from '../core/state';
import { D, SOLID } from './tiles';
import { get } from './grid';
import { SHOPS } from '../data/outfits';
import { CLUBS } from '../data/clubs';
import type { Entity } from '../types';
/* ================= COLLISION ================= */
export function clubAtDoor(x: number, y: number) { return CLUBS.find(c => c.dx === x && c.doorY === y); }
export function shopAtDoor(x: number, y: number) { return SHOPS.find(sh => sh.dx === x && sh.doorY === y); }
export function placeAtDoor(x: number, y: number) { return PLACES.find(p => p.dx === x && p.doorY === y); }
/** Can't walk onto (x, y): solid tile, a person, or a club door you haven't earned yet. */
export function blocked(x: number, y: number): boolean {
  const t = get(x, y);
  if (t === D) { if (shopAtDoor(x, y) || placeAtDoor(x, y)) return false; const c = clubAtDoor(x, y); return !(c && state.stamps[c.id]); }
  if (SOLID.has(t)) return true;
  return RT.ents.some(e => !e.pickup && covers(e, x, y));
}
// most people fill one tile; groups on a bed are `w` tiles wide
export const covers = (e: Entity, x: number, y: number) => e.y === y && x >= e.x && x < e.x + (e.w || 1);

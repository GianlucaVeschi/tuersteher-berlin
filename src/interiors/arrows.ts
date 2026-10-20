import { EXIT, ICHAR, SOLID, STAIRS_DOWN, STAIRS_UP, STAIRS_UP2, STAIRS_UP_SIDE, isDoorTile } from '../world/tiles';
import type { ClubScene, Dir, FloorDef } from '../types';

export interface WayArrow { x: number; y: number; dir: Dir }

/** What a tile leads to on this floor (same rules as the floor change in game/loop.ts), or null. */
function wayOut(t: number, fl: FloorDef): string | null {
  if ((t === STAIRS_UP || t === STAIRS_UP_SIDE) && fl.up) return 'up';
  if (t === STAIRS_DOWN && fl.down) return 'down';
  if (t === STAIRS_UP2 && fl.up2) return 'up2';
  if (t === EXIT && fl.exit) return 'exit';
  if (isDoorTile(t) && fl.doors && fl.doors[ICHAR[t]]) return 'door' + ICHAR[t];
  return null;
}

const STEPS: [number, number, Dir][] = [[0, -1, 'down'], [0, 1, 'up'], [-1, 0, 'right'], [1, 0, 'left']];
const cache = new Map<string, WayArrow[]>();

/** One arrow per way out of the room (stairs, doorway, exit): on the free tile in front of it closest
 *  to its middle, pointing at it. Worked out once per floor. */
export function wayArrows(sc: ClubScene, fl: FloorDef): WayArrow[] {
  const key = sc.club + ':' + sc.floor;
  const hit = cache.get(key);
  if (hit) return hit;
  const { map, w, h } = sc;
  const kind = (x: number, y: number) => (x < 0 || y < 0 || x >= w || y >= h) ? null : wayOut(map[y][x], fl);
  const seen = new Set<string>();
  const out: WayArrow[] = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const k = kind(x, y);
    if (!k || seen.has(x + ',' + y)) continue;
    // the connected patch of this way out
    const group: [number, number][] = [];
    const q: [number, number][] = [[x, y]]; seen.add(x + ',' + y);
    while (q.length) {
      const [cx, cy] = q.pop()!; group.push([cx, cy]);
      for (const [dx, dy] of STEPS) {
        const nx = cx + dx, ny = cy + dy;
        if (kind(nx, ny) === k && !seen.has(nx + ',' + ny)) { seen.add(nx + ',' + ny); q.push([nx, ny]); }
      }
    }
    const mx = group.reduce((s, [gx]) => s + gx, 0) / group.length, my = group.reduce((s, [, gy]) => s + gy, 0) / group.length;
    let best: WayArrow | null = null, bestD = Infinity;
    group.forEach(([gx, gy]) => STEPS.forEach(([dx, dy, dir]) => {
      const ax = gx + dx, ay = gy + dy;
      if (ax < 0 || ay < 0 || ax >= w || ay >= h || kind(ax, ay) || SOLID.has(map[ay][ax])) return;
      const d = (ax - mx) ** 2 + (ay - my) ** 2;
      if (d < bestD) { bestD = d; best = { x: ax, y: ay, dir }; }
    }));
    if (best) out.push(best);
  }
  cache.set(key, out);
  return out;
}

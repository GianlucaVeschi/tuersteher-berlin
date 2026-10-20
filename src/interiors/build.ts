import type { ClubScene, Entity, Look, Rect } from '../types';
import { SCENES } from '../world/scenes';
import { drawInteriorTiles } from './tiles';
import { pick, rnd } from '../util';
import { RT } from '../core/runtime';
import { questDone } from '../quests/quests';
import { DANCES, ICH } from '../world/tiles';
import { INTERIORS } from '../data/interiors';
/* ================= CLUB INTERIORS ================= */
/** Where people wait who aren't on a floor yet (`onlyAfter`): far left of the map, never drawn. */
export const OFF_FLOOR = -50;
export const DANCER_TOPS = ['#0c0c12', '#16151c', '#1a1920', '#2a2a33', '#0c0c12', '#e8e8f0', '#3a1f2a'];
export const DANCER_SKINS = ['#f3c9a8', '#f0c7a0', '#e2b08c', '#d9a27c', '#c98d6a', '#8d5a3b', '#6b4430'];
export const DANCER_HAIR = ['#111111', '#2a2420', '#5a3a22', '#c9a24a', '#b04a2a', '#c0c0c0', '#e83f8f', '#7ec8ff'];

export function buildInteriors() {
  Object.entries(INTERIORS).forEach(([clubId, club]) => {
    Object.entries(club.floors).forEach(([floorId, fl]) => {
      const id = clubId + ':' + floorId;
      const h = fl.map.length, w = fl.map[0].length;
      const grid = fl.map.map(row => [...row].map(ch => ICH[ch] !== undefined ? ICH[ch] : 41));
      const list: Entity[] = fl.people.map(p => ({ kind: 'npc', dir: p.dir || 'down', lines: [], ...p, home: { x: p.x, y: p.y } }));
      list.forEach((e, i) => { if (e.pile) { e.kind = 'pile'; e.act = 'pile'; e.phase = i * 1.37; } });
      list.forEach(e => { if (e.movedWhen && e.movedTo && questDone(clubId, e.movedWhen)) { e.x = e.movedTo[0]; e.y = e.movedTo[1]; } });
      list.forEach(e => { if (e.onlyAfter && !questDone(clubId, e.onlyAfter)) e.x = OFF_FLOOR; });
      // scatter dancers on the dancefloor, away from staff and stairs
      RT.seed = 4242 + id.length * 31;
      const busyTile = (x: number, y: number) => list.some(e => Math.abs(e.x - x) + Math.abs(e.y - y) <= 2);
      const spawns = Object.values(fl.spawn);
      let tries = 0, placed = 0;
      const dance: Rect = { x0: w, y0: h, x1: 0, y1: 0 };
      grid.forEach((row, y) => row.forEach((t, x) => { if (DANCES.has(t)) { dance.x0 = Math.min(dance.x0, x); dance.y0 = Math.min(dance.y0, y); dance.x1 = Math.max(dance.x1, x); dance.y1 = Math.max(dance.y1, y); } }));
      while (placed < (fl.dancers || 0) && tries++ < 2000) {
        const x = dance.x0 + Math.floor(rnd() * (dance.x1 - dance.x0 + 1)), y = dance.y0 + Math.floor(rnd() * (dance.y1 - dance.y0 + 1));
        if (!DANCES.has(grid[y][x]) || busyTile(x, y) || spawns.some(s => Math.abs(s[0] - x) + Math.abs(s[1] - y) <= 2)) continue;
        if (list.some(e => e.x === x && e.y === y)) continue;
        const long = rnd() < 0.4, pal = club.dancerPalette;
        const look: Look = pal && pal.style === 'kinky'
          // latex, leather, harnesses, bare skin, the odd pair of bunny ears
          ? (() => { const skin = pick(DANCER_SKINS); return { skin, hair: pick(pal.hair), long, bald: !long && rnd() < 0.25, top: rnd() < 0.3 ? skin : pick(pal.tops), legs: pick(pal.legs),
              harness: rnd() < 0.45, shine: rnd() < 0.4 ? '#7a7a99' : undefined, shades: rnd() < 0.25, ears: rnd() < 0.15 ? pick(pal.extras) : undefined }; })()
          : pal
          // colourful festival crowd: glitter, stripes, flower crowns, face paint
          ? { skin: pick(DANCER_SKINS), hair: pick(pal.hair), long, top: pick(pal.tops), legs: pick(pal.legs), shades: rnd() < 0.2,
              sparkle: rnd() < 0.35 ? pick(pal.extras) : undefined, stripes: rnd() < 0.3 ? pick(pal.extras) : undefined,
              flowers: rnd() < 0.3 ? [pick(pal.extras), pick(pal.extras)] : undefined, paint: rnd() < 0.3 ? pick(pal.extras) : undefined,
              hat: !long && rnd() < 0.2 ? pick(pal.tops) : undefined, beard: !long && rnd() < 0.2 ? pick(pal.hair) : undefined }
          : { skin: pick(DANCER_SKINS), hair: pick(DANCER_HAIR), bald: !long && rnd() < 0.2, long, top: pick(DANCER_TOPS), legs: '#121116', shades: rnd() < 0.25, harness: rnd() < 0.12, beard: !long && rnd() < 0.2 ? '#2a2420' : undefined };
        list.push({ kind: 'npc', act: 'dancer', dance: true, phase: rnd() * 10, x, y, dir: 'down', look, lines: [pick(club.dancerLines)] });
        placed++;
      }
      // empty bottles to collect for Pfand (hidden once taken, so a reset brings them back)
      (fl.bottles || []).forEach(([x, y, type], i) => list.push({ kind: 'bottle', pickup: true, bid: id + ':' + i, type, x, y }));
      const sc: ClubScene = { id, club: clubId, floor: floorId, map: grid, w, h, ents: list, dance, canvas: document.createElement('canvas') };
      sc.canvas = drawInteriorTiles(sc);
      SCENES[id] = sc;
    });
  });
}

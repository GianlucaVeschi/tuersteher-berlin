import type { Scene } from '../types';
import { RT } from '../core/runtime';
import { INK, circle, pick, rnd } from '../util';
import { pixelText } from '../render/pixelFont';
import { ICHAR, SOLID, T, WALLISH, isDoorTile } from '../world/tiles';
import { INTERIORS } from '../data/interiors';
/** Clubs trying out the new doorway looks (doorway digits 1–9); the rest keep the bead curtain.
 *  'strips': a strip curtain with light behind it. 'haze': grey fog in the opening, someone walking past.
 *  'fog': coloured fog slowly changing colour, wisps drifting out onto the floor.
 *  'neon': a rounded neon tube around the opening, in the colour of the room it leads to.
 *  'leds': a frame of little LEDs with a few bright ones chasing round it.
 *  'floor': a light strip on the threshold and two low lights at the sides, glowing on the floor.
 *  'runway': a light strip on the threshold and two rows of lights on the floor that light up one after
 *  another, leading you in. */
export type DoorStyle = 'strips' | 'haze' | 'fog' | 'neon' | 'leds' | 'floor' | 'runway';
export const DOOR_STYLE: Record<string, DoorStyle> = { katerblau: 'strips', rso: 'fog', sisyphos: 'neon', heidegluehen: 'leds', cdv: 'floor', kitkat: 'runway', anker: 'fog' };
/** Single rooms with their own doorway look, overriding the club's: every doorway into the room and every
 *  doorway in it. Berghain's smoking area is full of smoke, so its doorways are fog. */
const ROOM_STYLE: Record<string, DoorStyle> = { 'berghain:smoke': 'fog' };
/** The look of the doorway tile `t` on scene `sceneId` ('club:floor'), or undefined for the club's old door. */
export function doorStyleAt(sceneId: string, t: number): DoorStyle | undefined {
  const [club, floor] = sceneId.split(':');
  const to = INTERIORS[club]?.floors[floor]?.doors?.[ICHAR[t]]?.to;
  return (to && ROOM_STYLE[club + ':' + to]) || ROOM_STYLE[sceneId] || DOOR_STYLE[club];
}

/** Which way a doorway opens: towards the floor next to it. 'down' means the room is below it (a doorway
 *  in a wall in front of you), 'up' a doorway in the wall behind you, 'left'/'right' one in a side wall. */
export type DoorSide = 'down' | 'up' | 'left' | 'right';
export function doorSide(map: number[][], x: number, y: number): DoorSide {
  const open = (a: number, b: number) => {
    const t = map[b]?.[a];
    return t !== undefined && !SOLID.has(t) && !WALLISH.has(t) && !(t >= 81 && t <= 89);
  };
  return open(x, y + 1) ? 'down' : open(x, y - 1) ? 'up' : open(x - 1, y) ? 'left' : open(x + 1, y) ? 'right' : 'down';
}
/** Doorways are designed opening downwards (the far end at the top, your side at the bottom); this turns a
 *  rectangle of that design to the doorway's real side. Returns [x, y, w, h]. */
export function doorRect(side: DoorSide, X: number, Y: number, cx: number, cy: number, w: number, h: number): [number, number, number, number] {
  if (side === 'up') return [X + cx, Y + 16 - cy - h, w, h];
  if (side === 'left') return [X + 16 - cy - h, Y + cx, h, w]; // the room is on the left, the far end on the right
  if (side === 'right') return [X + cy, Y + cx, h, w];
  return [X + cx, Y + cy, w, h];
}
/** Draws a club floor's tiles once into its own canvas. */
export function drawInteriorTiles(sc: Scene): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = sc.w * T; cv.height = sc.h * T;
  const g = cv.getContext('2d')!;
  const P = (x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= sc.w || y >= sc.h) ? 62 : sc.map[y][x];
  const up = (t: number) => t === 124;
  const floorBase = (X: number, Y: number) => { P(X, Y, 16, 16, '#2f2e35'); for (let i = 0; i < 4; i++) P(X + Math.floor(rnd() * 15), Y + Math.floor(rnd() * 15), 1, 1, pick(['#37363e', '#28272d'])); };
  const face = (X: number, Y: number) => { // raw concrete wall seen from the front, with formwork tie holes
    P(X, Y, 16, 16, '#5c5a56'); P(X, Y, 1, 16, '#4e4c48'); P(X, Y, 16, 2, '#6e6c67'); P(X, Y + 13, 16, 3, '#2a2928');
    [[4, 5], [12, 5], [4, 10], [12, 10]].forEach(([a, b]) => P(X + a, Y + b, 1, 1, '#45433f'));
  };
  RT.seed = 777 + sc.id.length;
  for (let y = 0; y < sc.h; y++) for (let x = 0; x < sc.w; x++) {
    const t = sc.map[y][x], X = x * T, Y = y * T;
    // a wall shows its front face when there's floor below it; a doorway counts as wall here, so the wall
    // above a doorway (a side wall, or a thick wall like a house) doesn't turn into a front face
    const below = at(x, y + 1);
    const doorBelow = below >= 81 && below <= 89 && !!doorStyleAt(sc.id, below);
    const frontFace = !WALLISH.has(below) && !doorBelow;
    switch (t) {
      case 40: if (frontFace) face(X, Y); else { P(X, Y, 16, 16, '#141318'); if (!WALLISH.has(at(x, y - 1)) && y > 0) P(X, Y, 16, 1, '#26252c'); } break;
      case 41: floorBase(X, Y); break;
      case 42: P(X, Y, 16, 16, '#222128'); P(X, Y, 16, 1, '#29282f'); P(X, Y, 1, 16, '#29282f'); P(X + 8, Y + 8, 1, 1, '#2f2e36'); break;
      case 61: P(X, Y, 16, 16, '#3a3a43'); for (let a = 1; a < 16; a += 3) for (let b = 1; b < 16; b += 3) P(X + a, Y + b, 1, 1, '#2c2c34'); break;
      case 47: P(X, Y, 16, 16, '#40454c'); P(X, Y, 16, 1, '#353940'); P(X, Y + 8, 16, 1, '#353940'); P(X, Y, 1, 16, '#353940'); P(X + 8, Y, 1, 16, '#353940'); break;
      case 46: P(X, Y, 16, 16, '#07060a'); if (rnd() < 0.2) P(X + Math.floor(rnd() * 15), Y + Math.floor(rnd() * 15), 1, 1, '#121117'); break;
      case 43: case 44: case 130: {
        const up = t !== 44;
        if (sc.id.startsWith('heidegluehen:')) {
          // Heideglühen's spiral staircase, drawn once over the whole block of stair tiles: wooden steps running
          // up the left side, across the top and down the right round a dark stairwell, a brass handrail on both
          // edges. You step on at the bottom left. Going up the steps get lighter, going down darker.
          let bx = x, by = y; while (at(bx - 1, y) === t) bx--; while (at(x, by - 1) === t) by--;
          let bw = 1, bh = 1; while (at(bx + bw, by) === t) bw++; while (at(bx, by + bh) === t) bh++;
          const ox = bx * T, oy = by * T, W = bw * T, H2 = bh * T, ring = Math.max(5, Math.round(Math.min(W, H2) * 0.32));
          g.save(); g.beginPath(); g.rect(X, Y, 16, 16); g.clip();
          P(ox, oy, W, H2, INK);
          P(ox + ring, oy + ring, W - 2 * ring, H2 - ring, up ? '#1c140e' : '#07050a'); // the stairwell in the middle
          // the steps, in walking order: up the left side, along the top, down the right
          const steps: [number, number, number, number][] = [];
          for (let sy = H2 - 3; sy >= ring; sy -= 3) steps.push([ox + 1, oy + sy, ring - 1, 3]);
          steps.push([ox + 1, oy + 1, ring - 1, ring - 1]);
          for (let sx = ring; sx < W - ring; sx += 3) steps.push([ox + sx, oy + 1, 3, ring - 1]);
          steps.push([ox + W - ring, oy + 1, ring - 1, ring - 1]);
          for (let sy = ring; sy <= H2 - 3; sy += 3) steps.push([ox + W - ring, oy + sy, ring - 1, 3]);
          steps.forEach(([sx, sy, w, h], i) => {
            const k = i / Math.max(1, steps.length - 1);
            const lit = up ? 0.55 + 0.45 * k : 1 - 0.75 * k;
            const c = (base: number) => Math.round(base * lit);
            g.fillStyle = `rgb(${c(232)},${c(184)},${c(120)})`; g.fillRect(sx, sy, w, h);
            g.fillStyle = `rgb(${c(120)},${c(80)},${c(44)})`;  // the edge of each step
            if (w >= h) g.fillRect(sx, sy + h - 1, w, 1); else g.fillRect(sx + w - 1, sy, 1, h);
          });
          // brass handrails: round the outside and along the stairwell
          g.fillStyle = '#e0b040';
          g.fillRect(ox, oy, W, 1); g.fillRect(ox, oy, 1, H2); g.fillRect(ox + W - 1, oy, 1, H2);
          g.fillRect(ox + ring - 1, oy + ring - 1, 1, H2 - ring + 1); g.fillRect(ox + W - ring, oy + ring - 1, 1, H2 - ring + 1); g.fillRect(ox + ring - 1, oy + ring - 1, W - 2 * ring + 2, 1);
          g.restore();
          break;
        }
        for (let i = 0; i < 4; i++) {
          const shade = up ? ['#5d5d68', '#6d6d78', '#7d7d88', '#8d8d98'][3 - i] : ['#4a4a54', '#3e3e47', '#33333b', '#282830'][i];
          P(X, Y + i * 4, 16, 4, shade); P(X, Y + i * 4, 16, 1, '#c9b25a');
        }
        if (at(x - 1, y) !== t) { P(X, Y, 2, 16, '#a7a7b3'); P(X + 2, Y, 1, 16, INK); }
        if (at(x + 1, y) !== t) { P(X + 14, Y, 2, 16, '#a7a7b3'); P(X + 13, Y, 1, 16, INK); }
        break;
      }
      case 45: P(X, Y, 16, 16, '#0f0e13'); P(X + 2, Y, 12, 16, '#3b3a2c'); P(X + 2, Y + 12, 12, 4, '#6a6648'); if (at(x - 1, y) !== 45) P(X + 4, Y + 2, 8, 3, '#3fbf6f'); break;
      case 52: P(X, Y, 16, 16, '#3a3226'); for (let a = 1; a < 16; a += 4) for (let b = 1; b < 14; b += 4) P(X + a, Y + b, 3, 3, pick(['#c9a24a', '#a8823a', '#e8dcc0', '#7a5a2a', '#d9c27a'])); P(X, Y + 13, 16, 3, '#2a2928'); break;
      case 51: {
        face(X, Y); P(X + 1, Y + 1, 14, 12, INK); P(X + 2, Y + 2, 12, 10, '#07060a');
        for (let i = 0; i < 14; i++) { const gx = X + 1 + i, wy = Math.round(7 + 3 * Math.sin((gx) / 6)); P(gx, Y + wy, 1, 1, '#9fd6c0'); P(gx, Y + wy + 1, 1, 1, '#4a7a6a'); if (i % 3 === 0) P(gx, Y + 12 - Math.round(2 * Math.cos(gx / 5)), 1, 1, '#f0b8d0'); }
        break;
      }
      case 50: { // a tall church-like window: stone frame, pointed arch, violet stained glass with lead lines
        P(X, Y, 16, 16, '#2a2928'); P(X, Y + 13, 16, 3, '#1d1c22');
        P(X + 3, Y + 4, 10, 10, INK); P(X + 4, Y + 2, 8, 3, INK); P(X + 6, Y + 1, 4, 2, INK);
        P(X + 4, Y + 5, 8, 8, '#6a3fb0'); P(X + 5, Y + 3, 6, 2, '#7a4fc8'); P(X + 7, Y + 2, 2, 1, '#8a5fd8');
        P(X + 4, Y + 5, 3, 3, '#9a6fe8'); P(X + 9, Y + 8, 3, 2, '#5a2f90'); P(X + 5, Y + 10, 2, 3, '#b08cf0');
        P(X + 7, Y + 3, 1, 10, INK); P(X + 4, Y + 8, 8, 1, INK);
        break;
      }
      case 134: { // the same church window, with red glass (Berghain's smoking area)
        P(X, Y, 16, 16, '#2a2928'); P(X, Y + 13, 16, 3, '#1d1c22');
        P(X + 3, Y + 4, 10, 10, INK); P(X + 4, Y + 2, 8, 3, INK); P(X + 6, Y + 1, 4, 2, INK);
        P(X + 4, Y + 5, 8, 8, '#a8142a'); P(X + 5, Y + 3, 6, 2, '#c81e34'); P(X + 7, Y + 2, 2, 1, '#e02a40');
        P(X + 4, Y + 5, 3, 3, '#ff4a5e'); P(X + 9, Y + 8, 3, 2, '#7a0a1c'); P(X + 5, Y + 10, 2, 3, '#ff7a86');
        P(X + 7, Y + 3, 1, 10, INK); P(X + 4, Y + 8, 8, 1, INK);
        break;
      }
      case 161: // Sisyphos's entrance hallway: painted red walls, wooden boards, a string of bulbs
        if (frontFace) {
          P(X, Y, 16, 16, '#b3202c'); for (let i = 0; i < 16; i += 4) P(X + i, Y, 1, 13, '#8e1822');
          P(X, Y + 1, 16, 1, '#d6303a'); P(X, Y + 13, 16, 3, '#4a0c12');
          if (x % 2 === 0) { P(X + 7, Y + 3, 2, 2, '#ffe28a'); P(X + 6, Y + 2, 4, 1, 'rgba(255,226,138,.35)'); }
        } else {
          // seen from above: the red wall top, a lighter edge on the side facing the hallway
          P(X, Y, 16, 16, '#8e1822');
          if (at(x + 1, y) === 162 || at(x + 1, y) === 163) P(X + 13, Y, 3, 16, '#c42834');
          if (at(x - 1, y) === 162 || at(x - 1, y) === 163) P(X, Y, 3, 16, '#c42834');
          if (!WALLISH.has(at(x, y - 1)) && y > 0) P(X, Y, 16, 1, '#d6303a');
        }
        break;
      case 162: // the hallway floor in red light
        P(X, Y, 16, 16, '#6a1c24'); P(X, Y, 16, 1, '#5a161e'); for (let i = 0; i < 5; i++) P(X + Math.floor(rnd() * 15), Y + Math.floor(rnd() * 15), 1, 1, pick(['#7a2430', '#58161e', '#86303a']));
        break;
      case 163: // a metal crowd barrier running down the hallway between the two queues
        P(X, Y, 16, 16, '#6a1c24');
        P(X + 6, Y, 4, 16, INK); P(X + 7, Y, 2, 16, '#9aa0aa'); P(X + 7, Y, 1, 16, '#c8ccd4');
        for (const ry of [3, 11]) { P(X + 5, Y + ry, 6, 2, INK); P(X + 6, Y + ry, 4, 1, '#9aa0aa'); }
        P(X + 4, Y + 14, 8, 2, INK);
        break;
      case 164: { // Sisyphos's circus tent from above, drawn once from the bottom-right tile of its block:
        // a many-pointed green canvas round a centre pole, a big red star on top, small red stars on the
        // panels, red pennants on the points
        P(X, Y, 16, 16, '#3f7a3a');
        if (at(x + 1, y) === 164 || at(x, y + 1) === 164) break;
        let x0 = x, y0 = y;
        while (at(x0 - 1, y) === 164) x0--;
        while (at(x, y0 - 1) === 164) y0--;
        const cx = (x0 * T + X + T) / 2, cy = (y0 * T + Y + T) / 2, rx = (X + T - x0 * T) / 2 - 1, ry = (Y + T - y0 * T) / 2 - 1;
        const N = 10, pts: [number, number][] = [];
        for (let k = 0; k < N * 2; k++) {
          const a = -Math.PI / 2 + k * Math.PI / N, r = k % 2 ? 0.8 : 1;
          pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]);
        }
        g.fillStyle = INK; g.beginPath(); pts.forEach(([px, py], k) => k ? g.lineTo(px, py) : g.moveTo(px, py)); g.closePath(); g.fill();
        for (let k = 0; k < pts.length; k++) {
          const [ax, ay] = pts[k], [bx, by] = pts[(k + 1) % pts.length];
          g.fillStyle = k % 2 ? '#4a9468' : '#62b484';
          g.beginPath(); g.moveTo(cx, cy); g.lineTo(ax + (cx - ax) * 0.06, ay + (cy - ay) * 0.06); g.lineTo(bx + (cx - bx) * 0.06, by + (cy - by) * 0.06); g.closePath(); g.fill();
        }
        const star = (sx: number, sy: number, r: number, c: string) => {
          g.beginPath();
          for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; g.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); }
          g.closePath(); g.fillStyle = c; g.fill();
        };
        for (let k = 0; k < N * 2; k += 2) { const [px, py] = pts[k]; star(px, py, 3, '#c8303a'); }
        for (let k = 1; k < N * 2; k += 4) { const [px, py] = pts[k]; star(cx + (px - cx) * 0.55, cy + (py - cy) * 0.55, 4, '#b8202c'); }
        star(cx, cy, Math.min(rx, ry) * 0.42 + 1, INK); star(cx, cy, Math.min(rx, ry) * 0.42, '#c8303a');
        circle(g, Math.round(cx), Math.round(cy), 2, '#f3eee3');
        break;
      }
      case 165: // a baller box: a little wooden DJ hut on the sand, a speaker and coloured lights
        P(X, Y, 16, 16, '#c9a86a');
        P(X + 1, Y + 2, 14, 13, INK); P(X + 2, Y + 3, 12, 11, '#8a5a32'); P(X + 2, Y + 3, 12, 3, '#6a4426');
        circle(g, X + 8, Y + 10, 3, INK); circle(g, X + 8, Y + 10, 2, '#3a3a3a');
        for (let i = 3; i < 14; i += 3) P(X + i, Y + 4, 1, 1, pick(['#ff5e7a', '#ffd23f', '#5ec8ff', '#b6f36b']));
        break;
      case 166: // a grey roof seen from above (the sauna house, the café): slabs and a ridge
        P(X, Y, 16, 16, '#5c6068'); for (let r = 3; r < 16; r += 4) P(X, Y + r, 16, 1, '#4c5058');
        if (at(x, y - 1) !== 166) P(X, Y, 16, 1, INK);
        if (at(x - 1, y) !== 166) P(X, Y, 1, 16, INK);
        if (at(x + 1, y) !== 166) P(X + 15, Y, 1, 16, INK);
        if (rnd() < 0.15) P(X + 4 + Math.floor(rnd() * 8), Y + 4 + Math.floor(rnd() * 8), 2, 2, '#7a7e86');
        break;
      case 167: // a souvenir shelf against the wall: folded shirts, tote bags, hoodies, a row of lighters
        P(X, Y, 16, 16, '#5a3a22'); P(X + 1, Y, 14, 15, '#3a2414');
        for (const sy of [1, 6, 11]) P(X + 1, Y + sy + 4, 14, 1, '#7a5432');
        for (let i = 0; i < 3; i++) P(X + 2 + i * 4, Y + 2, 3, 3, pick(['#f3eee3', '#14121c', '#ff5e7a', '#5ec8ff', '#ffd23f']));
        P(X + 2, Y + 7, 5, 4, '#e8dcc0'); P(X + 4, Y + 8, 1, 2, '#3a2a20'); P(X + 9, Y + 7, 5, 4, pick(['#c28cff', '#b6f36b', '#ff8c42']));
        for (let i = 0; i < 6; i++) P(X + 2 + i * 2, Y + 12, 1, 3, pick(['#ff5e7a', '#ffd23f', '#5ec8ff', '#b6f36b']));
        break;
      case 168: { // the big bonfire on the beach, 2×2: drawn once from its bottom-right tile (flames in fx.ts)
        P(X, Y, 16, 16, '#c9a86a');
        if (at(x + 1, y) === 168 || at(x, y + 1) === 168) break;
        const cx = X, cy = Y;
        circle(g, cx, cy + 1, 13, INK); circle(g, cx, cy + 1, 12, '#6a6a72'); circle(g, cx, cy + 1, 9, '#2a1a12');
        for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5; circle(g, Math.round(cx + Math.cos(a) * 11), Math.round(cy + 1 + Math.sin(a) * 11), 2, k % 2 ? '#8a8a92' : '#5a5a62'); }
        P(cx - 8, cy, 16, 3, '#6b4a2e'); P(cx - 2, cy - 7, 3, 15, '#5a3d24'); P(cx - 7, cy - 5, 14, 2, '#7a5432');
        break;
      }
      case 169: { // the PIZZA sign: a red board with a slice on it, three tiles wide, drawn from its left tile
        if (at(x - 1, y) === 169) break;
        let w = 1; while (at(x + w, y) === 169) w++;
        const Wd = w * T;
        P(X, Y + 1, Wd, 13, INK); P(X + 1, Y + 2, Wd - 2, 11, '#c4162a'); P(X + 1, Y + 2, Wd - 2, 1, '#e8404a');
        // the slice
        P(X + 4, Y + 4, 8, 2, '#c98d4a'); P(X + 5, Y + 6, 6, 2, '#f2c14e'); P(X + 6, Y + 8, 4, 2, '#f2c14e'); P(X + 7, Y + 10, 2, 1, '#f2c14e');
        P(X + 6, Y + 6, 1, 1, '#c4162a'); P(X + 8, Y + 8, 1, 1, '#c4162a');
        pixelText(g, 'PIZZA', X + 16, Y + 5, '#fff6d8');
        P(X + 3, Y + 14, 1, 2, INK); P(X + Wd - 4, Y + 14, 1, 2, INK);
        break;
      }
      case 170: case 171: { // the garden's little houses (Sisyphos), drawn once from the bottom-right tile of
        // their block, seen from above like the aerial view: a pitched roof, and along the top (the garden
        // side) a porch with the door. The door tile itself is left alone (it's drawn as a doorway).
        P(X, Y, 16, 16, '#3f7a3a');
        if (at(x + 1, y) === t || at(x, y + 1) === t) break;
        let x0 = x, y0 = y;
        while (at(x0 - 1, y) === t) x0--;
        while (at(x, y0 - 1) === t || isDoorTile(at(x, y0 - 1))) y0--;
        const bx = x0 * T, by = y0 * T, bw = X + T - bx, bh = Y + T - by;
        g.save();
        g.beginPath(); g.rect(bx, by, bw, bh);
        for (let dx = x0; dx <= x; dx++) if (isDoorTile(at(dx, y0))) g.rect(dx * T + T, y0 * T, -T, T);
        g.clip('evenodd');
        P(bx, by, bw, bh, '#3f7a3a');
        const sauna = t === 170, porch = 13, wall = 16, ry = by + porch, rh = bh - porch - wall, ridge = ry + Math.round(rh / 2);
        // the roof: shingles (sauna, dark wood) or clay tiles (café), lit from the top, a ridge in the middle
        P(bx + 1, ry - 1, bw - 2, rh + 2, INK);
        const top = sauna ? '#7a5636' : '#d0603e', bottom = sauna ? '#5a3d24' : '#a8442c', line = sauna ? '#4a3018' : '#8a3422';
        P(bx + 2, ry, bw - 4, ridge - ry, top); P(bx + 2, ridge, bw - 4, ry + rh - ridge, bottom);
        for (let yy = ry + 3; yy < ry + rh; yy += 4) for (let xx = bx + 2 + ((yy >> 2) % 2) * 3; xx < bx + bw - 2; xx += 6) P(xx, yy, 4, 1, line);
        P(bx + 2, ridge - 1, bw - 4, 2, sauna ? '#3a2414' : '#6a2418'); P(bx + 2, ridge - 2, bw - 4, 1, sauna ? '#9a7652' : '#e88a64');
        // the front wall under the eaves, with warm windows: wooden planks (sauna) or cream plaster (café)
        const wy = ry + rh + 1;
        P(bx + 2, wy, bw - 4, wall - 1, INK);
        P(bx + 3, wy, bw - 6, wall - 2, sauna ? '#8a5a32' : '#efe2c4');
        if (sauna) for (let yy = wy + 2; yy < wy + wall - 2; yy += 3) P(bx + 3, yy, bw - 6, 1, '#6e4626');
        P(bx + 1, wy - 1, bw - 2, 2, INK); P(bx + 1, wy - 1, bw - 2, 1, sauna ? '#3a2414' : '#6a2418');   // the eaves' shadow
        const nWin = sauna ? 3 : 2;
        for (let k = 0; k < nWin; k++) {
          const wx = Math.round(bx + (bw / (nWin + 1)) * (k + 1)) - 5;
          P(wx - 1, wy + 3, 12, 9, INK); P(wx, wy + 4, 10, 7, '#ffd27a'); P(wx, wy + 4, 10, 2, '#fff2c0'); P(wx + 4, wy + 4, 1, 7, INK);
          if (sauna) P(wx, wy + 7, 10, 1, INK);
          else {
            P(wx - 3, wy + 4, 2, 7, '#3f7a6a'); P(wx + 11, wy + 4, 2, 7, '#3f7a6a');                       // shutters
            P(wx - 1, wy + 12, 12, 2, '#6b4a2e'); for (let i = 0; i < 4; i++) P(wx + i * 3, wy + 11, 2, 2, ['#ff5e7a', '#ffd23f', '#c28cff', '#ff8c42'][i]);
          }
        }
        if (sauna) { P(bx + bw - 14, wy + 4, 8, 8, INK); P(bx + bw - 13, wy + 5, 6, 6, '#b07a4a'); P(bx + bw - 13, wy + 7, 6, 1, '#6e4626'); } // a stack of firewood
        // the chimney (smoke or steam rises from it in fx.ts)
        const cx = bx + bw - 26, cyy = ridge - 9;
        P(cx - 1, cyy - 1, 10, 12, INK); P(cx, cyy, 8, 10, sauna ? '#8a8a92' : '#b05a3a'); P(cx, cyy, 8, 2, sauna ? '#a8a8b0' : '#d07a5a'); P(cx + 2, cyy + 2, 4, 3, '#2a2a2a');
        // the porch along the garden side
        P(bx, by, bw, porch, INK); P(bx + 1, by + 1, bw - 2, porch - 2, sauna ? '#a87a4a' : '#c9a06a');
        for (let xx = bx + 4; xx < bx + bw; xx += 5) P(xx, by + 1, 1, porch - 2, sauna ? '#8a5a32' : '#a8804a');
        if (sauna) {
          // the house number, a towel rack with towels, a bucket, a lantern by the door
          P(bx + 4, by + 3, 13, 8, INK); P(bx + 5, by + 4, 11, 6, '#f3eee3'); pixelText(g, '15', bx + 7, by + 4, '#14121c');
          P(bx + bw - 30, by + 2, 1, 9, INK); P(bx + bw - 14, by + 2, 1, 9, INK); P(bx + bw - 30, by + 2, 17, 1, INK);
          ['#5ec8ff', '#ff5e7a', '#ffd23f', '#f3eee3'].forEach((c, i) => P(bx + bw - 28 + i * 4, by + 3, 3, 6, c));
          P(bx + bw - 10, by + 5, 6, 6, INK); P(bx + bw - 9, by + 6, 4, 4, '#b07a4a');
        } else {
          // a striped awning, flower boxes, fairy lights, the chalkboard
          for (let xx = bx + 1; xx < bx + bw - 1; xx += 4) P(xx, by + 1, 4, 4, ((xx - bx) >> 2) % 2 ? '#f3eee3' : '#d6303a');
          P(bx + 1, by + 5, bw - 2, 1, INK);
          for (let xx = bx + 6; xx < bx + bw - 6; xx += 3) P(xx, by + 6, 1, 1, ['#ffd23f', '#ff5e7a', '#5ec8ff', '#b6f36b'][(xx >> 1) % 4]);
          for (const fx0 of [bx + 3, bx + bw - 23]) { P(fx0, by + 8, 20, 4, '#6b4a2e'); for (let i = 0; i < 6; i++) P(fx0 + 1 + i * 3, by + 7, 2, 2, ['#ff5e7a', '#ffd23f', '#c28cff', '#ff8c42'][i % 4]); }
        }
        g.restore();
        if (!sauna) {
          // the chalkboard by the door, on the grass edge of the porch
          const dxs = [...Array(x - x0 + 1).keys()].map(i => x0 + i).find(dx => isDoorTile(at(dx, y0)));
          const sx = dxs !== undefined ? dxs * T + T + 2 : bx + 4;
          P(sx, by + 2, 15, 10, INK); P(sx + 1, by + 3, 13, 8, '#2a3a2e'); pixelText(g, 'CAFE', sx + 1, by + 5, '#f3eee3');
        } else {
          const dxs = [...Array(x - x0 + 1).keys()].map(i => x0 + i).find(dx => isDoorTile(at(dx, y0)));
          if (dxs !== undefined) { P(dxs * T + T + 1, by + 3, 3, 5, INK); P(dxs * T + T + 2, by + 4, 1, 3, '#ffd36b'); }
        }
        break;
      }
      case 172: { // Sisyphos's old factory (Hammahalle up top, Dampfer and Tunnel below), from a night photo:
        // brick in purple light, rows of arched windows glowing green, a corrugated-metal ground floor with
        // round portholes (the Dampfer) and red lacquer with lanterns (the Tunnel). Drawn once from the
        // bottom-right tile of its block; the doors (on the beach side) are left alone. Lasers sweep over it in fx.ts.
        P(X, Y, 16, 16, '#3f7a3a');
        if (at(x + 1, y) === t || at(x, y + 1) === t) break;
        let x0 = x, y0 = y;
        while (at(x0 - 1, y) === t || isDoorTile(at(x0 - 1, y))) x0--;
        while (at(x, y0 - 1) === t || isDoorTile(at(x, y0 - 1))) y0--;
        const bx = x0 * T, by = y0 * T, bw = X + T - bx, bh = Y + T - by;
        g.save();
        g.beginPath(); g.rect(bx, by, bw, bh);
        for (let yy = y0; yy <= y; yy++) for (let xx = x0; xx <= x; xx++) if (isDoorTile(at(xx, yy))) g.rect(xx * T + T, yy * T, -T, T);
        g.clip('evenodd');
        // the roof, seen over the top of the facade
        P(bx, by, bw, 18, INK); P(bx + 1, by + 1, bw - 2, 15, '#24222e');
        for (let xx = bx + 3; xx < bx + bw - 3; xx += 6) P(xx, by + 4, 3, 1, '#34323e');
        P(bx + 24, by + 2, 10, 9, '#3a3842'); P(bx + bw - 40, by + 3, 8, 7, '#3a3842'); P(bx + 1, by + 16, bw - 2, 2, '#14121c');
        // the brick facade, washed in purple from below
        const fy = by + 18, lowY = by + bh - 44;
        for (let yy = fy; yy < lowY; yy++) {
          const k = (yy - fy) / (lowY - fy);
          P(bx, yy, bw, 1, `rgb(${Math.round(70 + 60 * k)},${Math.round(44 + 18 * k)},${Math.round(84 + 70 * k)})`);
        }
        for (let yy = fy + 3; yy < lowY; yy += 4) { P(bx, yy, bw, 1, 'rgba(0,0,0,.18)'); for (let xx = bx + ((yy >> 2) % 2) * 4; xx < bx + bw; xx += 8) P(xx, yy - 3, 1, 3, 'rgba(0,0,0,.14)'); }
        P(bx, fy, 1, lowY - fy, INK); P(bx + bw - 1, fy, 1, lowY - fy, INK);
        P(bx + Math.round(bw * 0.62), fy, 2, lowY - fy, 'rgba(255,220,255,.18)');   // the corner, catching the light
        // three rows of arched windows: most glow green, a few are dark
        for (const [ri, wy] of [[0, fy + 8], [1, fy + 36], [2, fy + 64]] as const) {
          if (wy + 18 > lowY) continue;
          for (let wx = bx + 8; wx < bx + bw - 12; wx += 18) {
            const lit = ((wx >> 3) + ri * 3) % 5 !== 0;
            P(wx - 1, wy, 12, 19, INK); P(wx, wy - 2, 10, 3, INK); P(wx + 2, wy - 3, 6, 2, INK);
            const c = lit ? (ri === 1 ? '#5ef0c0' : '#3fd6a0') : '#1a1424';
            P(wx, wy + 1, 10, 17, c); P(wx + 1, wy - 1, 8, 2, c);
            if (lit) { P(wx + 1, wy + 2, 3, 6, 'rgba(255,255,255,.35)'); P(wx, wy + 8, 10, 1, INK); P(wx + 4, wy + 1, 1, 17, INK); }
            P(wx - 2, wy + 18, 14, 2, '#6a4a5a');                                                 // the sill
          }
        }
        // a sign for the Hammahalle, up on the brick
        P(bx + bw / 2 - 26, fy + 2, 52, 9, INK); P(bx + bw / 2 - 25, fy + 3, 50, 7, '#14121c'); pixelText(g, 'HAMMAHALLE', bx + bw / 2 - 20, fy + 4, '#ff7ad9');
        // the ground floor: the Dampfer on the left (corrugated metal, portholes), the Tunnel on the right
        const split = bx + Math.round(bw * 0.58);
        P(bx, lowY - 4, bw, 4, INK); P(bx, lowY - 3, bw, 2, '#2a2830');                          // the awning
        P(bx, lowY, split - bx, bh - (lowY - by), '#3a4a6a');
        for (let xx = bx + 2; xx < split; xx += 3) P(xx, lowY, 1, bh - (lowY - by), '#2c3a56');
        for (let k = 0; k < 3; k++) {
          const px = bx + [14, 62, 80][k], py = lowY + 14;   // clear of the door
          circle(g, px, py, 7, INK); circle(g, px, py, 6, '#8a9098'); circle(g, px, py, 4, '#7ec8ff'); P(px - 2, py - 3, 2, 2, '#d8f0ff');
        }
        P(split - 26, lowY + 22, 18, 14, INK); P(split - 25, lowY + 23, 16, 12, '#ffe6f6'); P(split - 25, lowY + 23, 16, 3, '#ffffff');   // a glowing hatch
        P(bx + 4, lowY + 4, 40, 7, INK); P(bx + 5, lowY + 5, 38, 5, '#14121c'); pixelText(g, 'DAMPFER', bx + 9, lowY + 5, '#7ec8ff');
        P(split, lowY, bx + bw - split, bh - (lowY - by), '#8a1a24');
        for (let xx = split + 4; xx < bx + bw - 2; xx += 10) for (let yy = lowY + 8; yy < by + bh - 4; yy += 10) P(xx, yy, 2, 2, '#d9a43a');
        for (let xx = split + 10; xx < bx + bw - 6; xx += 16) { P(xx + 2, lowY, 1, 4, INK); P(xx, lowY + 4, 6, 7, INK); P(xx + 1, lowY + 5, 4, 5, '#ff4a3a'); P(xx + 2, lowY + 6, 2, 2, '#ffd27a'); }
        P(split + 6, lowY + 16, 32, 7, INK); P(split + 7, lowY + 17, 30, 5, '#14121c'); pixelText(g, 'TUNNEL', split + 10, lowY + 17, '#ffd27a');
        P(split - 1, lowY, 2, bh - (lowY - by), INK);
        P(bx, by + bh - 2, bw, 2, INK);
        g.restore();
        // a round lamp on the wall beside each door
        for (let yy = y0; yy <= y; yy++) for (let xx = x0; xx <= x; xx++) if (isDoorTile(at(xx, yy))) {
          const lx = xx * T - 6, ly = yy * T + 2;
          P(lx, ly, 5, 5, INK); P(lx + 1, ly + 1, 3, 3, '#ffd27a');
        }
        break;
      }
      case 135: // heavy chains hanging from the ceiling down to the floor
        floorBase(X, Y);
        for (const cx of [4, 10]) for (let ly = -12; ly < 14; ly += 4) { P(X + cx - 1, Y + ly, 3, 4, INK); P(X + cx, Y + ly + 1, 1, 2, ly % 8 ? '#8a8e98' : '#5a5e68'); }
        P(X + 2, Y + 13, 12, 2, '#1d1c22');
        break;
      case 60: face(X, Y); P(X + 3, Y + 2, 10, 14, INK); P(X + 4, Y + 3, 8, 13, '#1a1820'); P(X + 5, Y + 5, 6, 2, '#c9b25a'); break;
      case 49: floorBase(X, Y); P(X + 3, Y - 9, 10, 25, INK); P(X + 4, Y - 8, 8, 23, '#6a6e78'); P(X + 4, Y - 8, 2, 23, '#8a8e98'); P(X + 10, Y - 8, 2, 23, '#4e525a'); break;
      case 58: floorBase(X, Y); P(X + 1, Y, 14, 16, INK); P(X + 2, Y + 1, 12, 14, '#1b1a20'); circle(g, X + 8, Y + 9, 4, '#34333b'); circle(g, X + 8, Y + 9, 2, '#0c0c12'); P(X + 4, Y + 2, 8, 2, '#2c2b33'); break;
      case 59: floorBase(X, Y); P(X, Y + 1, 16, 15, INK); P(X, Y + 2, 16, 13, '#1c1b22'); P(X, Y + 2, 16, 4, '#2c2b33'); for (let i = 0; i < 3; i++) P(X + 2 + Math.floor(rnd() * 12), Y + 3 + Math.floor(rnd() * 2), 1, 1, pick(['#f2c45a', '#ff4d6d', '#6fb7ff'])); break;
      case 55: floorBase(X, Y); P(X, Y, 16, 16, INK); P(X + 1, Y + 1, 14, 9, '#1e1d24'); P(X + 1, Y + 1, 14, 1, '#2e2d36'); P(X + 1, Y + 10, 14, 5, '#111015'); if (rnd() < 0.5) { P(X + 3 + Math.floor(rnd() * 8), Y + 3, 2, 4, pick(['#7ec8ff', '#f2c45a', '#c8f0d0'])); } break;
      case 53: floorBase(X, Y); P(X, Y, 16, 16, INK); P(X + 1, Y + 1, 14, 9, '#7d5838'); P(X + 1, Y + 10, 14, 5, '#553a22'); break;
      case 54: floorBase(X, Y); P(X, Y, 16, 16, INK); P(X + 1, Y + 1, 14, 9, '#d9e6e0'); P(X + 1, Y + 10, 14, 5, '#9fb5ab'); circle(g, X + 5, Y + 5, 2, pick(['#f7c6d9', '#f2e2a0', '#7a4a2e'])); circle(g, X + 11, Y + 5, 2, pick(['#f7c6d9', '#f2e2a0', '#c8f0d0'])); break;
      case 56: floorBase(X, Y); P(X, Y, 16, 16, INK); P(X + 1, Y + 1, 14, 9, '#4a4a52'); P(X + 1, Y + 10, 14, 5, '#33333a'); P(X + 5, Y + 2, 6, 4, '#6fb7ff'); break;
      case 57: floorBase(X, Y); P(X + 1, Y + 5, 14, 8, INK); P(X + 2, Y + 6, 12, 6, '#2a2930'); P(X + 2, Y + 6, 12, 2, '#3a3942'); break;
      case 48: P(X, Y, 16, 16, '#40454c'); P(X + 6, Y - 6, 4, 22, INK); P(X + 7, Y - 5, 2, 20, '#8a9098'); break;
      // ---- Sisyphos ----
      case 63: P(X, Y, 16, 16, '#c9a86a'); for (let i = 0; i < 7; i++) P(X + Math.floor(rnd() * 15), Y + Math.floor(rnd() * 15), 1, 1, pick(['#b8955a', '#d9bc84', '#a88a50'])); break;
      case 64: {
        P(X, Y, 16, 16, '#2f86ad');
        for (let i = 0; i < 2; i++) P(X + Math.floor(rnd() * 11), Y + 3 + Math.floor(rnd() * 10), 4, 1, '#5fb6db');
        const edge = '#e8e4d8';
        if (at(x, y - 1) !== 64) { P(X, Y, 16, 3, edge); P(X, Y + 3, 16, 1, '#1d5f80'); }
        if (at(x, y + 1) !== 64) P(X, Y + 14, 16, 2, edge);
        if (at(x - 1, y) !== 64) P(X, Y, 2, 16, edge);
        if (at(x + 1, y) !== 64) P(X + 14, Y, 2, 16, edge);
        break;
      }
      case 65: P(X, Y, 16, 16, '#6b4a2e'); for (let r = 3; r < 16; r += 4) P(X, Y + r, 16, 1, '#563a22'); P(X + ((y % 2) ? 5 : 11), Y, 1, 16, '#5a3e26'); P(X + 2, Y + 1, 1, 1, '#8a6a48'); break;
      case 66: P(X, Y, 16, 16, '#3f7a3a'); for (let i = 0; i < 4; i++) P(X + Math.floor(rnd() * 15), Y + Math.floor(rnd() * 14), 1, 2, pick(['#4f8f45', '#356a31'])); if (rnd() < 0.25) P(X + Math.floor(rnd() * 14), Y + Math.floor(rnd() * 14), 2, 2, pick(['#ff5e7a', '#ffd23f', '#f3eee3', '#c28cff'])); break;
      case 67: P(X, Y, 16, 16, '#3f7a3a'); P(X + 7, Y + 10, 2, 6, '#5a3a22'); circle(g, X + 8, Y + 7, 7, INK); circle(g, X + 8, Y + 7, 6, '#2f6b35'); circle(g, X + 6, Y + 5, 3, '#4f8f4a'); P(X + 9, Y + 9, 2, 2, pick(['#ff5e7a', '#ffd23f', '#5ec8ff'])); break;
      case 68: if (frontFace) { P(X, Y, 16, 16, '#8a4b3a'); for (let r = 0; r < 16; r += 4) { P(X, Y + r + 3, 16, 1, '#6e3a2c'); P(X + ((r / 4) % 2 ? 4 : 12), Y + r, 1, 3, '#6e3a2c'); } P(X, Y + 13, 16, 3, '#4a2a22'); } else { P(X, Y, 16, 16, '#2a1a18'); if (!WALLISH.has(at(x, y - 1)) && y > 0) P(X, Y, 16, 1, '#4a2e28'); } break;
      case 69: if (frontFace) { P(X, Y, 16, 16, '#c08a55'); for (let i = 3; i < 16; i += 4) P(X + i, Y, 1, 16, '#a06e40'); P(X, Y + 13, 16, 3, '#7a5432'); } else P(X, Y, 16, 16, '#5a3a22'); break;
      case 70: P(X, Y, 16, 16, '#7a5432'); for (let r = 0; r < 16; r += 4) P(X, Y + r, 16, 3, '#a87a4a'); break;
      case 71: P(X, Y, 16, 16, '#7a5432'); P(X + 1, Y + 4, 14, 12, INK); P(X + 2, Y + 5, 12, 10, '#3a3a3a'); circle(g, X + 5, Y + 6, 3, '#8a8a8a'); circle(g, X + 10, Y + 6, 3, '#6a6a6a'); circle(g, X + 8, Y + 4, 2, '#9a9a9a'); P(X + 6, Y + 11, 4, 2, '#ff8c42'); break;
      case 72: P(X, Y, 16, 16, '#3f7a3a'); P(X, Y + 4, 16, 2, '#7a5a3a'); P(X, Y + 10, 16, 2, '#7a5a3a'); P(X + 2, Y + 1, 3, 15, '#8a6a48'); P(X + 11, Y + 1, 3, 15, '#8a6a48'); if (rnd() < 0.4) P(X + 6, Y + 6, 3, 4, pick(['#ff5e7a', '#ffd23f', '#5ec8ff', '#b6f36b'])); break;
      case 73: {
        P(X, Y, 16, 16, '#3f7a3a');
        const cols = ['#ff5e7a', '#ffd23f', '#5ec8ff', '#b6f36b', '#c28cff'];
        P(X + 3, Y - 10, 10, 26, INK);
        for (let i = 0; i < 5; i++) P(X + 4, Y - 9 + i * 5, 8, 5, cols[(i + x) % 5]);
        P(X + 6, Y - 6, 1, 1, INK); P(X + 9, Y - 6, 1, 1, INK); P(X + 6, Y - 3, 4, 1, INK);
        break;
      }
      case 74: if (frontFace) { P(X, Y, 16, 16, '#7fb8b0'); P(X, Y, 16, 1, '#d8e8e0'); P(X, Y + 7, 16, 1, '#d8e8e0'); P(X, Y, 1, 16, '#d8e8e0'); P(X + 2, Y + 2, 2, 4, '#c9efe7'); P(X, Y + 14, 16, 2, '#4a6a66'); } else { P(X, Y, 16, 16, '#26403c'); P(X, Y, 16, 1, '#3f6660'); } break;
      case 75: P(X, Y, 16, 16, '#4a1416'); P(X, Y, 16, 1, '#6a4a1a'); P(X, Y + 8, 16, 1, '#6a4a1a'); P(X, Y, 1, 16, '#6a4a1a'); P(X + 8, Y, 1, 16, '#6a4a1a'); break;
      case 76: P(X, Y, 16, 16, '#7a5432'); P(X, Y + 2, 16, 12, INK); P(X, Y + 3, 16, 7, '#e0b47c'); P(X, Y + 10, 16, 3, '#a87a4a'); break;
      case 77: P(X, Y, 16, 16, '#7a5434'); for (let r = 0; r < 16; r += 4) P(X, Y + r, 16, 1, '#6a4628'); P(X + ((y % 2) ? 3 : 10), Y, 1, 16, '#6a4628'); if (rnd() < 0.3) P(X + Math.floor(rnd() * 13), Y + Math.floor(rnd() * 13), 3, 1, '#8a6440'); break;
      case 78: P(X, Y, 16, 16, '#8a4b3a'); P(X, Y + 13, 16, 3, '#4a2a22'); circle(g, X + 8, Y + 7, 6, '#c9a24a'); circle(g, X + 8, Y + 7, 4, '#2f6f8f'); P(X + 6, Y + 5, 2, 2, '#9fd0e6'); break;
      case 79: if (frontFace) { P(X, Y, 16, 16, '#a3161a'); P(X, Y + 2, 16, 1, '#e0b040'); P(X, Y + 11, 16, 1, '#e0b040'); for (let i = 1; i < 16; i += 5) { P(X + i, Y + 4, 3, 1, '#e0b040'); P(X + i, Y + 4, 1, 4, '#e0b040'); P(X + i, Y + 7, 3, 1, '#e0b040'); } P(X, Y + 13, 16, 3, '#5a0a0c'); } else { P(X, Y, 16, 16, '#3a0a0c'); P(X, Y, 16, 1, '#6a1a1c'); } break;
      // ---- KitKat ----
      case 90: if (frontFace) {
        P(X, Y, 16, 16, '#1a0a2a');
        const neon = ['#39ff14', '#ff2bd6', '#00e5ff', '#fff200'];
        for (let k = 0; k < 3; k++) { const c = neon[(x + k) % 4], ph = rnd() * 6; for (let i = 0; i < 16; i++) P(X + i, Y + 3 + Math.round(4 + 3 * Math.sin(i / 2.5 + ph + k)), 1, 1, c); }
        P(X + 4 + Math.floor(rnd() * 8), Y + 4, 2, 2, pick(neon));
        P(X, Y + 13, 16, 3, '#0a0612');
      } else P(X, Y, 16, 16, '#0a0612'); break;
      case 91: P(X, Y, 16, 16, '#2a0a1a'); for (let i = 0; i < 3; i++) P(X + Math.floor(rnd() * 15), Y + Math.floor(rnd() * 15), 1, 1, '#ff2bd6');
        if (at(x, y + 1) !== 91 && at(x, y + 1) !== 92) P(X, Y + 14, 16, 2, '#e0b040'); break;
      case 92: P(X, Y, 16, 16, '#2a0a1a'); P(X + 6, Y - 12, 4, 28, INK); P(X + 7, Y - 11, 2, 26, '#d8dce6'); P(X + 7, Y - 11, 1, 26, '#ffffff'); P(X + 4, Y + 13, 8, 3, '#8a9098'); break;
      case 93: floorBase(X, Y); P(X, Y + 2, 16, 13, INK); P(X + 1, Y + 3, 14, 6, '#3a0a12'); P(X + 1, Y + 9, 14, 5, '#5a1220'); P(X + 2, Y + 4, 12, 1, '#7a2a36'); for (let i = 3; i < 14; i += 4) P(X + i, Y + 6, 1, 1, '#1a0408'); break;
      case 94: floorBase(X, Y); P(X, Y + 1, 16, 15, INK); P(X + 1, Y + 2, 14, 13, '#2a0a14'); P(X + 1, Y + 2, 14, 1, '#4a1a24'); break;
      case 95: floorBase(X, Y); for (let i = 0; i < 14; i++) { P(X + 1 + i, Y + 1 + i, 2, 2, '#3a2418'); P(X + 13 - i, Y + 1 + i, 2, 2, '#3a2418'); } P(X + 1, Y + 1, 3, 2, '#0c0c12'); P(X + 12, Y + 1, 3, 2, '#0c0c12'); P(X + 2, Y + 2, 1, 1, '#c0c4cc'); P(X + 13, Y + 2, 1, 1, '#c0c4cc'); break;
      case 96: floorBase(X, Y); P(X + 3, Y - 8, 1, 16, '#8a9098'); P(X + 12, Y - 8, 1, 16, '#8a9098'); P(X + 2, Y + 8, 12, 4, INK); P(X + 3, Y + 9, 10, 2, '#3a0a12'); break;
      case 97: P(X, Y, 16, 16, INK); P(X + 1, Y - 6, 14, 22, '#a3161a'); P(X + 1, Y - 6, 14, 4, '#e0b040'); for (let i = 0; i < 6; i++) P(X + 3 + i * 2, Y - 5, 1, 2, i % 2 ? '#fff200' : '#ff2bd6');
        P(X + 3, Y, 10, 15, '#6a0a18'); for (let i = 4; i < 13; i += 3) P(X + i, Y, 1, 15, '#4a0610'); break;
      case 98: { // a cage: the back half (the bars in front of whoever is inside are drawn over them in fx.ts)
        const first = at(x - 1, y) !== 98, last = at(x + 1, y) !== 98;
        floorBase(X, Y);
        P(X, Y + 10, 16, 5, '#3a0a12'); P(X, Y + 10, 16, 1, '#5a1220');              // a red rubber mat on the cage floor
        P(X, Y - 11, 16, 2, '#8a9098'); P(X, Y - 11, 16, 1, '#c0c4cc');                // the roof frame, standing above the floor
        for (let i = 1; i < 16; i += 3) P(X + i, Y - 9, 1, 19, '#4a4f56');            // back bars, in the shadow
        if (first) { P(X, Y - 11, 2, 26, '#8a9098'); }                                 // corner posts
        if (last) { P(X + 14, Y - 11, 2, 26, '#8a9098'); }
        if (first) { P(X + 3, Y + 11, 5, 2, INK); P(X + 4, Y + 11, 3, 1, '#c0c4cc'); } // a water bowl
        break;
      }
      case 100: floorBase(X, Y); P(X + 3, Y + 5, 10, 6, INK); P(X + 4, Y + 6, 8, 4, '#d9e6e0'); P(X + 1, Y + 2, 2, 5, '#8a9098'); P(X + 13, Y + 2, 2, 5, '#8a9098'); P(X + 7, Y + 11, 2, 5, '#8a9098'); break;
      // ---- Heideglühen ----
      case 102: // fire pit: a ring of stones with logs (the flames are animated in fx.ts)
        P(X, Y, 16, 16, '#3f7a3a'); circle(g, X + 8, Y + 9, 7, INK); circle(g, X + 8, Y + 9, 6, '#6a6a72');
        circle(g, X + 8, Y + 9, 4, '#2a1a12'); P(X + 4, Y + 9, 8, 2, '#6b4a2e'); P(X + 7, Y + 6, 2, 7, '#5a3d24'); break;
      case 103: // karaoke machine: a TV on a stand with a mic
        P(X, Y, 16, 16, '#40454c'); P(X + 1, Y + 1, 14, 10, INK); P(X + 2, Y + 2, 12, 8, '#1a2a4a');
        P(X + 7, Y + 11, 2, 4, '#8a9098'); P(X + 4, Y + 14, 8, 2, '#5a5f66'); P(X + 13, Y + 9, 2, 5, '#c0c4cc'); P(X + 12, Y + 8, 4, 2, INK); break;
      // ---- Berghain ----
      case 123: { // the drop to the Säule: darkness with lights far below; a railing where the floor ends
        P(X, Y, 16, 16, '#07060a');
        if (rnd() < 0.5) P(X + 2 + Math.floor(rnd() * 12), Y + 2 + Math.floor(rnd() * 12), 1, 1, pick(['#3a2a4a', '#4a2030', '#2a3a4a', '#c9c5d4']));
        if (at(x + 1, y) !== 123) { P(X + 13, Y, 3, 16, INK); P(X + 14, Y, 1, 16, '#8a8e98'); for (let i = 1; i < 16; i += 5) P(X + 12, Y + i, 4, 1, '#6a6e78'); }
        if (at(x, y + 1) !== 123) { P(X, Y + 13, 16, 3, INK); P(X, Y + 14, 16, 1, '#8a8e98'); }
        break;
      }
      case 124: case 127: { // a side staircase, Pokémon style: the whole block is one diagonal flight rising
        // to the right (small treads and risers), a row of posts along the front and a handrail on the diagonal
        let bx0 = x, bx1 = x, by0 = y, by1 = y;
        while (at(bx0 - 1, y) === t) bx0--; while (at(bx1 + 1, y) === t) bx1++;
        while (at(x, by0 - 1) === t) by0--; while (at(x, by1 + 1) === t) by1++;
        const BW = (bx1 - bx0 + 1) * 16, BH = (by1 - by0 + 1) * 16, band = Math.max(28, Math.round(BH * 0.62));
        const n = Math.max(3, Math.round(BW / 7)), stepW = BW / n, rise = (BH - band) / n;
        const ox = (x - bx0) * 16, oy = (y - by0) * 16;
        floorBase(X, Y);
        const col = (c: number, gy0: number, h: number, colour: string) => {
          const y0 = Math.max(0, gy0 - oy), y1 = Math.min(16, gy0 + h - oy);
          if (y1 > y0) P(X + c, Y + y0, 1, y1 - y0, colour);
        };
        const railC = up(t) ? '#c9b25a' : '#d6d2e0';
        for (let c = 0; c < 16; c++) {
          const gx = ox + c, si = Math.min(n - 1, Math.floor(gx / stepW));
          const tread = Math.round(BH - band - si * rise);                 // top of this step (stepped)
          const line = BH - band - (gx / BW) * (n - 1) * rise;             // the smooth diagonal
          const rail = Math.round(line + band * 0.62);
          col(c, tread, rail + 6 - tread, '#6a6a74');                      // the flight behind the posts
          col(c, tread, 3, '#c9c5d4');                                     // tread
          if (gx - si * stepW < 1.2) col(c, tread, rail + 6 - tread, '#4a4a54'); // riser shadow where a step begins
          if (gx % 4 === 1) { col(c, rail - 10, 10, '#9a9eaa'); col(c, rail - 11, 2, '#e8e4f0'); } // posts with caps
          if (gx % 4 === 2) col(c, rail - 10, 10, '#5a5e68');
          col(c, rail, 3, railC); col(c, rail + 3, 1, INK);                // handrail
          col(c, rail + 4, 2, '#18171d');                                  // shadow under it
        }
        break;
      }
      case 125: // the mezzanine railing: steel posts and a top rail, the floor below shows through
        P(X, Y, 16, 16, '#3a3a43'); for (let a = 1; a < 16; a += 3) for (let b = 1; b < 16; b += 3) P(X + a, Y + b, 1, 1, '#2c2c34');
        P(X, Y + 3, 16, 2, INK); P(X, Y + 3, 16, 1, '#b9b5c6');
        for (let i = 1; i < 16; i += 5) P(X + i, Y + 4, 2, 10, '#6a6e78');
        P(X, Y + 13, 16, 1, '#6a6e78');
        break;
      case 128: { // a column like on a Greek temple, three tiles tall: drawn once from its bottom tile
        floorBase(X, Y);
        if (at(x, y + 1) === 128) break;
        P(X - 2, Y + 10, 20, 6, INK); P(X - 1, Y + 11, 18, 4, '#9a968c'); P(X - 1, Y + 11, 18, 1, '#b8b4a8');   // base
        P(X, Y - 26, 16, 37, INK); P(X + 1, Y - 25, 14, 36, '#b8b4a8');                                       // shaft
        for (let f = 2; f < 15; f += 3) { P(X + f, Y - 25, 1, 36, '#8a867c'); P(X + f + 1, Y - 25, 1, 36, '#cfcbc0'); } // flutes
        P(X - 3, Y - 32, 22, 7, INK); P(X - 2, Y - 31, 20, 5, '#cfcbc0'); P(X - 2, Y - 27, 20, 1, '#8a867c');     // capital
        circle(g, X - 2, Y - 28, 3, '#8a867c'); circle(g, X + 18, Y - 28, 3, '#8a867c');                         // volutes
        P(X - 3, Y - 34, 22, 2, '#9a968c');
        break;
      }
      case 131: // the Eisbar's chrome-tiled bar: little steel tiles, sprinkles and sugar shakers on top
        floorBase(X, Y); P(X, Y, 16, 16, INK); P(X + 1, Y + 1, 14, 5, '#e8eaee');
        for (let a = 1; a < 15; a += 3) for (let b = 7; b < 15; b += 3) P(X + a, Y + b, 2, 2, (a + b) % 2 ? '#b9bec7' : '#d6dae1');
        if (rnd() < 0.6) { P(X + 3, Y + 1, 3, 4, '#f3eee3'); P(X + 3, Y + 1, 3, 1, '#9aa0aa'); P(X + 9, Y + 2, 4, 2, pick(['#ff5fa2', '#ffd23f', '#5ec8ff', '#7a4a2e'])); }
        break;
      case 132: // the glass ice case: tubs of ice cream, a pink neon tube glowing over them
        floorBase(X, Y); P(X, Y, 16, 16, INK); P(X + 1, Y + 1, 14, 9, '#d9e6e0'); P(X + 1, Y + 10, 14, 5, '#b9bec7');
        P(X + 2, Y + 4, 5, 4, '#5a3424'); P(X + 9, Y + 4, 5, 4, pick(['#f7c6d9', '#f2e2a0', '#5a3424']));
        P(X, Y + 1, 16, 2, '#ff6fb5'); P(X, Y + 1, 16, 1, '#ffd6ec');
        break;
      case 133: // a small round table with two pink paper cups
        floorBase(X, Y); circle(g, X + 8, Y + 9, 6, INK); circle(g, X + 8, Y + 9, 5, '#d6dae1'); P(X + 7, Y + 13, 2, 3, INK);
        P(X + 5, Y + 6, 3, 3, '#ff8cc4'); P(X + 9, Y + 8, 3, 3, '#ff8cc4');
        break;
      case 129: { // a black leather sofa, backrest against the right wall, seat facing the room
        floorBase(X, Y);
        const top = at(x, y - 1) !== 129, bot = at(x, y + 1) !== 129;
        P(X + 1, Y + (top ? 1 : 0), 15, 16 - (top ? 1 : 0) - (bot ? 1 : 0), INK);
        P(X + 10, Y + (top ? 2 : 0), 5, 16 - (top ? 2 : 0) - (bot ? 2 : 0), '#1c1b22');    // backrest
        P(X + 2, Y + (top ? 2 : 0), 8, 16 - (top ? 2 : 0) - (bot ? 2 : 0), '#2a2930');     // seat
        P(X + 3, Y + (top ? 3 : 1), 6, 1, '#4a4952');                                       // shine
        if (!bot) P(X + 2, Y + 15, 8, 1, '#141318');                                        // seam between cushions
        if (top) P(X + 1, Y + 2, 2, 5, '#141318'); if (bot) P(X + 1, Y + 9, 2, 5, '#141318'); // armrests
        break;
      }
      case 126: // a Garderobe rack: a rail full of jackets, hoodies and bags
        P(X, Y, 16, 16, '#1c1b22'); P(X, Y + 2, 16, 1, '#8a8e98');
        for (let i = 0; i < 5; i++) { const c = pick(['#0c0c12', '#2a2a33', '#3a2a20', '#5a5a66', '#1f2f4d', '#4a1a1a']); P(X + 1 + i * 3, Y + 3, 3, 10 + (i % 2) * 2, c); P(X + 2 + i * 3, Y + 3, 1, 1, '#c9c5d4'); }
        break;
      // ---- black-light minigolf ----
      case 114: { // a glowing lane: dark felt, neon rails, a hole with a flag
        P(X, Y, 16, 16, '#0c0b14'); P(X + 1, Y + 1, 14, 14, '#123a24');
        const neon = ['#39ff14', '#ff2bd6', '#00e5ff', '#fff200'][(x + y) % 4];
        P(X + 1, Y + 1, 14, 1, neon); P(X + 1, Y + 14, 14, 1, neon); P(X + 1, Y + 1, 1, 14, neon); P(X + 14, Y + 1, 1, 14, neon);
        if ((x + y) % 2) { circle(g, X + 8, Y + 9, 2, INK); P(X + 8, Y + 3, 1, 6, '#f3eee3'); P(X + 9, Y + 3, 3, 2, '#ff2bd6'); }
        else { P(X + 4, Y + 6, 8, 1, neon); P(X + 6, Y + 9, 4, 1, neon); }
        break;
      }
      // ---- Ankerklause ----
      case 113: // the jukebox: a rounded cabinet with coloured light tubes
        P(X, Y, 16, 16, '#6b4a2e'); P(X + 2, Y + 1, 12, 15, INK); P(X + 3, Y + 2, 10, 13, '#7a1a22');
        P(X + 4, Y + 2, 8, 3, '#ffd23f'); P(X + 3, Y + 5, 1, 9, '#ff5e7a'); P(X + 12, Y + 5, 1, 9, '#ff5e7a');
        P(X + 5, Y + 6, 6, 4, '#2a2420'); P(X + 6, Y + 7, 4, 1, '#c9a24a'); P(X + 5, Y + 11, 6, 2, '#5ec8ff');
        break;
      case 115: // the veranda window over the canal: blue frame, glass, white railing, a box of geraniums
        P(X, Y, 16, 16, '#1f4f9a'); P(X + 1, Y + 1, 14, 7, '#8fc4d8'); P(X + 2, Y + 2, 3, 1, '#d9f0f6'); P(X + 2, Y + 3, 1, 2, '#d9f0f6');
        P(X, Y + 8, 16, 1, '#f3eee3'); for (let i = 1; i < 16; i += 3) P(X + i, Y + 8, 1, 4, '#f3eee3');
        P(X, Y + 12, 16, 3, '#6b4a2e'); P(X, Y + 15, 16, 1, '#163a72');
        for (let i = 0; i < 6; i++) { const fx = Math.floor(rnd() * 14), fy = 9 + Math.floor(rnd() * 3); P(X + fx, Y + fy, 2, 2, pick(['#ff5e7a', '#e8304a', '#ff8cc4', '#c4162a'])); P(X + fx, Y + fy + 2, 1, 1, '#3f7a3a'); }
        break;
      // ---- Heideglühen ----
      case 136: { // a wooden tribune: rows of seats, the back rows (higher up, against the wall) a little lighter
        const run = (dx: number, dy: number) => { let n = 0; while (at(x + dx * (n + 1), y + dy * (n + 1)) === 136) n++; return n; };
        const l = run(-1, 0), r = run(1, 0), u = run(0, -1), dn = run(0, 1);
        const shades = ['#8a5a34', '#9a6a3e', '#a87a4a', '#b88a58'];
        if (u + dn > l + r) {
          // standing along a side wall: the rows run up and down, the back row against the wall
          const wallLeft = SOLID.has(at(x - l - 1, y)) || WALLISH.has(at(x - l - 1, y));
          const row = wallLeft ? r : l, wood = shades[Math.min(3, row)];
          P(X, Y, 16, 16, wood);
          if (wallLeft) { P(X, Y, 1, 16, '#c9a070'); P(X + 6, Y, 1, 16, '#4a3020'); P(X + 13, Y, 3, 16, '#5a3e26'); }
          else { P(X + 15, Y, 1, 16, '#c9a070'); P(X + 9, Y, 1, 16, '#4a3020'); P(X, Y, 3, 16, '#5a3e26'); }
          if (y % 3 === 0) P(wallLeft ? X + 7 : X + 3, Y + 7, 6, 1, '#5a3e26');
        } else {
          // along the back wall: the rows run left to right, the back row at the top
          const wood = shades[Math.min(3, dn)];
          P(X, Y, 16, 16, wood); P(X, Y, 16, 1, '#c9a070'); P(X, Y + 6, 16, 1, '#4a3020'); P(X, Y + 13, 16, 3, '#5a3e26');
          if (x % 3 === 0) P(X + 7, Y + 7, 1, 6, '#5a3e26');
        }
        break;
      }
      case 145: case 147: case 148: case 149: case 150: { // a long couch: one piece over the whole run of couch
        // tiles, armrests at the two ends, the backrest on one side. 'ç' (145) puts its back against the wall
        // next to it (red, Heideglühen); 147–150 stand free with their back up/down/left/right (old sofas in
        // all sorts of colours, CDV)
        P(X, Y, 16, 16, '#6b4a2e');
        const C = t, wallAt = (dx: number, dy: number) => WALLISH.has(at(x + dx, y + dy));
        const side = t === 147 ? 'up' : t === 148 ? 'down' : t === 149 ? 'left' : t === 150 ? 'right'
          : wallAt(0, -1) ? 'up' : wallAt(0, 1) ? 'down' : wallAt(-1, 0) ? 'left' : 'right';
        const along = side === 'up' || side === 'down';
        const prev = along ? at(x - 1, y) === C : at(x, y - 1) === C, next = along ? at(x + 1, y) === C : at(x, y + 1) === C;
        // one colour per couch: from where it starts
        let sx0 = x, sy0 = y; while (along ? at(sx0 - 1, y) === C : at(x, sy0 - 1) === C) { if (along) sx0--; else sy0--; }
        const [seat, back, arm, hi] = t === 145 ? ['#a3242c', '#6e1820', '#7a1a22', '#c94a3a']
          : [['#3d7a4a', '#24502e', '#2e5f39', '#5aa36a'], ['#c9a227', '#8a6a12', '#a3841a', '#e8c95a'], ['#3d5f94', '#26406a', '#2e4c7a', '#5a86c4'], ['#a3242c', '#6e1820', '#7a1a22', '#c94a3a'], ['#7a3fd1', '#4e2690', '#5e2ea8', '#a06ef0']][(sx0 * 7 + sy0 * 3) % 5];
        // in the couch's own frame: u runs along it, v from the wall (0) into the room (16)
        const R = (u: number, v: number, w: number, h: number, c: string) => {
          if (side === 'up') P(X + u, Y + v, w, h, c); else if (side === 'down') P(X + u, Y + 16 - v - h, w, h, c);
          else if (side === 'left') P(X + v, Y + u, h, w, c); else P(X + 16 - v - h, Y + u, h, w, c);
        };
        const u0 = prev ? 0 : 1, u1 = next ? 16 : 15;
        R(u0, 1, u1 - u0, 14, INK);                                  // outline
        R(u0 + (prev ? 0 : 1), 2, u1 - u0 - (prev ? 0 : 1) - (next ? 0 : 1), 12, seat);
        R(u0 + (prev ? 0 : 1), 2, u1 - u0 - (prev ? 0 : 1) - (next ? 0 : 1), 4, back);   // backrest
        if (!prev) R(2, 2, 3, 12, arm);                                                    // armrests
        if (!next) R(11, 2, 3, 12, arm);
        if (prev && (along ? x : y) % 2 === 0) R(0, 6, 1, 8, arm);                         // a seam between cushions
        R(prev ? 2 : 6, 7, 3, 1, hi);
        break;
      }
      // ---- KitKat's dungeon ----
      case 154: { // a spanking bench: padded red leather on a black frame, two tiles long
        floorBase(X, Y); const first = at(x - 1, y) !== 154;
        P(X, Y + 4, 16, 6, INK); P(first ? X + 2 : X, Y + 5, first ? 14 : 16, 4, '#7a0a1c'); P(first ? X + 2 : X, Y + 5, first ? 14 : 16, 1, '#a3162a');
        P(X + 3, Y + 10, 2, 5, INK); P(X + 11, Y + 10, 2, 5, INK); if (first) { P(X + 1, Y + 6, 2, 6, INK); P(X + 1, Y + 7, 1, 3, '#c0c4cc'); }
        break;
      }
      case 155: // stocks: a wooden board with holes for the head and hands, on a post
        floorBase(X, Y); P(X + 7, Y + 8, 2, 8, INK); P(X + 1, Y + 3, 14, 6, INK); P(X + 2, Y + 4, 12, 4, '#6b4a2e');
        P(X + 7, Y + 4, 2, 3, INK); P(X + 3, Y + 5, 2, 2, INK); P(X + 11, Y + 5, 2, 2, INK); P(X + 2, Y + 4, 12, 1, '#8a6a48');
        break;
      case 156: { // a bondage table: black padding, cuffs at the corners
        floorBase(X, Y); const first = at(x - 1, y) !== 156;
        P(first ? X + 1 : X, Y + 2, first ? 15 : 15, 12, INK); P(first ? X + 2 : X, Y + 3, first ? 14 : 13, 10, '#1a1920'); P(first ? X + 2 : X, Y + 3, first ? 14 : 13, 1, '#3a3942');
        P(first ? X + 2 : X + 11, Y + 4, 2, 2, '#c0c4cc'); P(first ? X + 2 : X + 11, Y + 10, 2, 2, '#c0c4cc');
        break;
      }
      case 157: { // the doctor's bed: white padded table, a paper roll, a lamp on an arm
        floorBase(X, Y); const first = at(x - 1, y) !== 157;
        P(first ? X + 1 : X, Y + 3, 15, 10, INK); P(first ? X + 2 : X, Y + 4, first ? 14 : 13, 8, '#e8e4d8'); P(first ? X + 5 : X, Y + 4, first ? 11 : 13, 8, '#f8f6f0');
        P(X + 3, Y + 13, 2, 3, '#8a9098'); P(X + 11, Y + 13, 2, 3, '#8a9098');
        if (!first) { P(X + 13, Y - 6, 1, 10, '#8a9098'); P(X + 10, Y - 7, 5, 3, INK); P(X + 11, Y - 6, 3, 1, '#fff2a8'); } // the lamp
        break;
      }
      case 158: { // a suspension frame: a steel bar overhead, chains and rings hanging down
        floorBase(X, Y);
        P(X, Y + 1, 16, 2, '#8a9098'); P(X, Y + 1, 16, 1, '#c0c4cc');
        if (at(x - 1, y) !== 158) P(X + 1, Y + 1, 2, 15, '#8a9098'); if (at(x + 1, y) !== 158) P(X + 13, Y + 1, 2, 15, '#8a9098');
        for (let r = 3; r < 10; r += 2) P(X + 7, Y + r, 1, 1, '#c0c4cc'); P(X + 6, Y + 10, 3, 2, '#c0c4cc');
        break;
      }
      case 159: // a whipping post: a thick wooden post with iron rings
        floorBase(X, Y); P(X + 5, Y, 6, 16, INK); P(X + 6, Y, 4, 16, '#5a3e26'); P(X + 7, Y, 1, 16, '#7a5432');
        P(X + 4, Y + 4, 8, 2, '#8a9098'); P(X + 4, Y + 11, 8, 2, '#8a9098');
        break;
      case 160: // a little dragon hanging on the wall, facing into the room, jaws open (the fire is drawn in fx.ts)
        P(X, Y, 16, 16, '#141318');
        P(X + 1, Y + 3, 9, 10, INK); P(X + 2, Y + 4, 7, 8, '#2f7a3a');                        // the body against the wall
        P(X + 8, Y + 5, 7, 6, INK); P(X + 9, Y + 6, 6, 2, '#3d9a4a'); P(X + 9, Y + 9, 6, 1, '#3d9a4a'); // head, open jaws
        P(X + 10, Y + 8, 5, 1, '#7a0a1c');                                                     // inside the mouth
        P(X + 10, Y + 5, 1, 1, '#ff2b2b'); P(X + 9, Y + 3, 2, 2, '#c9a24a'); P(X + 5, Y + 2, 2, 2, '#c9a24a'); // eye, horns
        for (let i = 0; i < 3; i++) P(X + 3 + i * 2, Y + 12, 1, 2, '#c9a24a');                 // claws on the wall
        break;
      // ---- KitKat's pool ----
      case 153: { // an inflatable mattress by the pool, two tiles long, puffy stripes, in a loud colour
        P(X, Y, 16, 16, '#9fe0e8'); P(X, Y, 16, 1, '#7fc8d2'); P(X, Y, 1, 16, '#7fc8d2');
        const first = at(x - 1, y) !== 153, last = at(x + 1, y) !== 153;
        let x0 = x; while (at(x0 - 1, y) === 153) x0--;
        const [c, dark, hi] = [['#ff5ea8', '#c23a7e', '#ffb3d6'], ['#3fd0e0', '#1f8fa0', '#b8f3f8'], ['#ffd23f', '#c99a10', '#fff0a8'], ['#9be15d', '#5fa52a', '#d8f7b8'], ['#b07aff', '#7a46c9', '#e0ccff']][(x0 * 3 + y) % 5];
        const l = first ? 2 : 0, r = last ? 14 : 16;
        P(X + l, Y + 3, r - l, 11, INK); P(X + l + (first ? 1 : 0), Y + 4, r - l - (first ? 1 : 0) - (last ? 1 : 0), 9, c);
        for (let i = (first ? 5 : 1); i < (last ? 13 : 16); i += 4) P(X + i, Y + 4, 1, 9, dark);   // the puffy tubes
        P(X + l + 1, Y + 5, r - l - 2, 1, hi);                                                        // shine on top
        if (first) P(X + 3, Y + 6, 2, 5, hi);                                                         // the pillow end
        break;
      }
      // ---- Club der Visionäre: the tiny dance room ----
      case 151: { // its walls: wooden planks, each painted a different bright colour
        P(X, Y, 16, 16, INK);
        const cols = ['#ff5e7a', '#ffd23f', '#5ec8ff', '#b6f36b', '#c28cff', '#ff8c42'];
        for (let i = 0; i < 4; i++) P(X + i * 4, Y + 1, 3, 14, cols[(x * 2 + y + i) % cols.length]);
        P(X, Y, 16, 1, '#f3eee3');
        break;
      }
      case 152: { // its floor: worn wooden boards painted in patches of colour, under all the feet
        const cols = ['#c94a6a', '#d9a227', '#3d8fbf', '#6fa83a', '#8a5ac9', '#d9733a'];
        P(X, Y, 16, 16, cols[(x * 3 + y * 5) % cols.length]);
        for (let r = 3; r < 16; r += 4) P(X, Y + r, 16, 1, 'rgba(0,0,0,.25)');
        P(X + ((y % 2) ? 5 : 11), Y, 1, 16, 'rgba(0,0,0,.25)');
        break;
      }
      case 144: // under the jacuzzi: a wooden deck (the tub, the water and the steam are drawn in fx.ts)
        P(X, Y, 16, 16, '#7a5432'); for (let r = 3; r < 16; r += 4) P(X, Y + r, 16, 1, '#6b4a2e');
        break;
      case 137: // a few wooden steps up to the raised yard
        P(X, Y, 16, 16, '#8a5a34'); P(X, Y, 16, 5, '#a87a4a'); P(X, Y + 5, 16, 1, '#4a3020'); P(X, Y + 6, 16, 5, '#9a6e40'); P(X, Y + 11, 16, 1, '#4a3020');
        break;
      case 138: // the stage: dark boards, a bright front edge
        P(X, Y, 16, 16, '#2e2218'); for (let r = 3; r < 16; r += 4) P(X, Y + r, 16, 1, '#241a12');
        // the front edge on the side the crowd stands (a stage against the south wall faces north)
        if (at(x, y + 1) !== 138 && !SOLID.has(at(x, y + 1))) { P(X, Y + 12, 16, 4, '#5a3e26'); P(X, Y + 12, 16, 1, '#c9a24a'); }
        else if (at(x, y - 1) !== 138 && !SOLID.has(at(x, y - 1))) { P(X, Y, 16, 4, '#5a3e26'); P(X, Y + 3, 16, 1, '#c9a24a'); }
        if ((x + y) % 4 === 0) { P(X + 7, Y + 2, 1, 9, '#8a9098'); P(X + 6, Y + 1, 3, 2, INK); } // a mic stand
        break;
      case 139: // under a rotating seat: a wooden base (the turning disc and the people on it are drawn in fx.ts)
        P(X, Y, 16, 16, '#6b4a2e'); for (let r = 3; r < 16; r += 4) P(X, Y + r, 16, 1, '#563a22');
        break;
      case 140: // the sofa platform up high: a deck on posts, with sofas
        P(X, Y, 16, 16, '#7a5432'); for (let r = 3; r < 12; r += 4) P(X, Y + r, 16, 1, '#6b4a2e');
        if (at(x, y + 1) !== 140) { P(X, Y + 12, 16, 4, '#2a1a10'); P(X + 2, Y + 12, 2, 4, '#6b4a2e'); P(X + 12, Y + 12, 2, 4, '#6b4a2e'); } // posts underneath
        if ((x + y) % 2 === 0) { P(X + 2, Y + 2, 12, 7, INK); P(X + 3, Y + 3, 10, 5, '#a3242c'); P(X + 3, Y + 3, 10, 2, '#c94a3a'); }
        break;
      case 141: // its stairs: a steep wooden stair going up
        P(X, Y, 16, 16, '#6b4a2e'); P(X + 3, Y, 2, 16, '#3a2616'); P(X + 11, Y, 2, 16, '#3a2616');
        for (let r = 1; r < 16; r += 3) P(X + 5, Y + r, 6, 2, '#a87a4a');
        break;
      case 142: // the open middle of the gallery: the dancefloor far below, a railing along the edge
        P(X, Y, 16, 16, '#1c140e'); for (let r = 3; r < 16; r += 4) P(X, Y + r, 16, 1, '#241a12');
        if (at(x, y - 1) !== 142) P(X, Y, 16, 3, '#8a5a34');
        if (at(x, y + 1) !== 142) P(X, Y + 13, 16, 3, '#8a5a34');
        if (at(x - 1, y) !== 142) P(X, Y, 3, 16, '#8a5a34');
        if (at(x + 1, y) !== 142) P(X + 13, Y, 3, 16, '#8a5a34');
        break;
      case 143: // the ticket booth window in the corridor wall
        P(X, Y, 16, 16, '#7a5432'); P(X + 2, Y + 2, 12, 9, INK); P(X + 3, Y + 3, 10, 7, '#2a3a4a'); P(X + 4, Y + 4, 3, 2, '#5a7aa8');
        P(X, Y + 11, 16, 2, '#a87a4a'); for (let i = 0; i < 3; i++) P(X + 3 + i * 4, Y + 13, 2, 2, pick(['#ff5e7a', '#ffd23f', '#5ec8ff']));
        break;
      // ---- Erkahn's Späti ----
      case 118: // a beer fridge: steel frame, lit glass door, shelves of bottles and cans
        if (frontFace) {
          P(X, Y, 16, 16, '#9aa0aa'); P(X + 1, Y + 1, 14, 13, INK); P(X + 2, Y + 2, 12, 11, '#cfe8f2'); P(X + 2, Y + 2, 12, 1, '#ffffff');
          for (const sy of [3, 7, 11]) {
            P(X + 2, Y + sy + 2, 12, 1, '#8a9098');
            for (let i = 0; i < 4; i++) { const c = pick(['#6b3a1a', '#2f7a3a', '#c9a227', '#7a1a22', '#e8e4d8', '#2b4c7a']); P(X + 3 + i * 3, Y + sy - 1, 2, 3, c); P(X + 3 + i * 3, Y + sy - 2, 2, 1, pick(['#c0c4cc', '#ffd23f', '#e04f5f'])); }
          }
          P(X, Y + 14, 16, 2, '#5a5f66'); P(X + 13, Y + 6, 1, 3, '#c0c4cc');
        } else P(X, Y, 16, 16, '#5a5f66');
        break;
      case 119: // the chips shelf: two rows of crinkly bags in every colour
        P(X, Y, 16, 16, '#d9d4c8'); P(X + 1, Y + 1, 14, 14, INK); P(X + 2, Y + 2, 12, 12, '#8a9098');
        for (const sy of [3, 9]) for (let i = 0; i < 3; i++) { const c = pick(['#e04f5f', '#f2c14e', '#4ea8de', '#58b368', '#ff8c42', '#c28cff']); P(X + 3 + i * 4, Y + sy, 3, 4, c); P(X + 3 + i * 4, Y + sy, 3, 1, '#f3eee3'); }
        break;
      case 120: // tobacco behind the counter: rows of little packs, papers and lighters
        if (frontFace) {
          P(X, Y, 16, 16, '#3a2616'); P(X, Y + 13, 16, 3, '#24180e');
          for (const sy of [1, 5, 9]) { P(X, Y + sy + 3, 16, 1, '#5a3e26'); for (let i = 0; i < 5; i++) P(X + 1 + i * 3, Y + sy, 2, 3, pick(['#f3eee3', '#c4162a', '#2b4c7a', '#c9a24a', '#14121c', '#3d8f6b'])); }
        } else P(X, Y, 16, 16, '#24180e');
        break;
      case 121: // Späti lino: big pale tiles
        P(X, Y, 16, 16, (x + y) % 2 ? '#c9c4b6' : '#bdb7a8'); P(X, Y, 16, 1, '#aaa496'); P(X, Y, 1, 16, '#aaa496');
        break;
      case 122: // the counter: chewing gum, lighters and a till on a worn wooden top
        P(X, Y, 16, 16, '#c9c4b6'); P(X, Y + 2, 16, 14, INK); P(X + 1, Y + 3, 14, 4, '#a87a4a'); P(X + 1, Y + 7, 14, 8, '#7a5432');
        if (x % 2) { P(X + 3, Y, 8, 5, INK); P(X + 4, Y + 1, 6, 3, '#3a3a4a'); P(X + 5, Y + 2, 3, 1, '#b6f36b'); }
        else for (let i = 0; i < 4; i++) P(X + 2 + i * 3, Y + 4, 2, 2, pick(['#ff5e7a', '#ffd23f', '#5ec8ff', '#b6f36b']));
        break;
      case 116: // old wood covered in graffiti and stickers
        if (frontFace) {
          P(X, Y, 16, 16, '#7a5432'); for (let i = 3; i < 16; i += 4) P(X + i, Y, 1, 16, '#5a3e26'); P(X, Y + 13, 16, 3, '#4a3020');
          for (let i = 0; i < 3; i++) { const c = pick(['#ff5e7a', '#b6f36b', '#5ec8ff', '#ffd23f', '#f3eee3', '#14121c']), tx = Math.floor(rnd() * 10), ty = 1 + Math.floor(rnd() * 9); P(X + tx, Y + ty, 4 + Math.floor(rnd() * 3), 1, c); P(X + tx + 1, Y + ty + 1, 1, 2, c); P(X + tx + 3, Y + ty - 1, 1, 3, c); }
          if (rnd() < 0.5) { const sx = Math.floor(rnd() * 11); P(X + sx, Y + 9, 4, 3, pick(['#f3eee3', '#ffd23f', '#e8304a'])); }
        } else P(X, Y, 16, 16, '#3a2616');
        break;
      case 117: // an old armchair, the red velvet worn through
        P(X, Y, 16, 16, '#6b4a2e'); for (let r = 3; r < 16; r += 4) P(X, Y + r, 16, 1, '#563a22');
        P(X + 2, Y + 2, 12, 12, INK); P(X + 3, Y + 3, 10, 4, '#5a1a2a'); P(X + 3, Y + 7, 10, 6, '#7a2a3a');
        P(X + 2, Y + 6, 2, 7, '#5a1a2a'); P(X + 12, Y + 6, 2, 7, '#5a1a2a'); P(X + 6, Y + 9, 3, 2, '#a85a5a'); P(X + 9, Y + 4, 2, 1, '#c9a24a');
        P(X + 3, Y + 14, 2, 2, '#3a2616'); P(X + 11, Y + 14, 2, 2, '#3a2616');
        break;
      // ---- Kater Blau ----
      case 112: { // circus tent: red and white stripes, a pointed roof on the top row
        P(X, Y, 16, 16, '#3f7a3a');
        const top = at(x, y - 1) !== 112;
        for (let i = 0; i < 16; i += 4) P(X + i, top ? Y + 6 : Y, 2, top ? 10 : 16, '#d6453d'), P(X + i + 2, top ? Y + 6 : Y, 2, top ? 10 : 16, '#f3eee3');
        if (top) { P(X, Y + 4, 16, 2, '#d6453d'); P(X + 2, Y + 2, 12, 2, '#f3eee3'); P(X + 5, Y, 6, 2, '#d6453d'); if (at(x - 1, y) === 112 && at(x + 1, y) === 112) P(X + 7, Y - 5, 2, 6, '#ffd23f'); }
        break;
      }
      // ---- Tresor ----
      case 110: // the old Wertheim safe-deposit boxes: a wall of little steel doors with keyholes
        P(X, Y, 16, 16, '#2a2c32');
        for (let by = 0; by < 4; by++) for (let bx = 0; bx < 3; bx++) {
          const x0 = X + 1 + bx * 5, y0 = Y + 1 + by * 4;
          P(x0, y0, 4, 3, pick(['#6a6e78', '#5c606a', '#757984'])); P(x0, y0, 4, 1, '#8a8e98'); P(x0 + 2, y0 + 1, 1, 1, '#1b1a20');
        }
        break;
      case 111: // iron bars in front of the DJ, like the cage in the old vault
        floorBase(X, Y);
        for (let i = 1; i < 16; i += 4) { P(X + i, Y - 6, 2, 22, INK); P(X + i, Y - 6, 1, 22, '#6a6e78'); }
        P(X, Y - 6, 16, 2, INK); P(X, Y - 6, 16, 1, '#6a6e78');
        break;
      // ---- Club der Visionäre ----
      case 104: { // weeping willow: a dense canopy, branches hanging down at the edges, trunk under the middle
        P(X, Y, 16, 16, '#6b4a2e'); for (let r = 3; r < 16; r += 4) P(X, Y + r, 16, 1, '#563a22');
        const top = at(x, y - 1) !== 104, bot = at(x, y + 1) !== 104, lft = at(x - 1, y) !== 104, rgt = at(x + 1, y) !== 104;
        const x0 = lft ? 2 : 0, x1 = rgt ? 14 : 16, y0 = top ? 3 : 0, y1 = bot ? 8 : 16;
        if (bot && !lft && !rgt && at(x + 2, y) !== 104) P(X - 2, Y + 6, 4, 10, '#4a3020'); // one trunk, between the two middle tiles
        P(X + x0, Y + y0, x1 - x0, y1 - y0, '#2f5f2c');
        if (top) P(X + x0 + 2, Y + y0 - 1, x1 - x0 - 4, 1, '#2f5f2c');
        for (let i = x0; i < x1; i++) {
          if (rnd() < 0.3) continue;
          const len = bot ? 4 + Math.floor(rnd() * 9) : 16 - y0;
          P(X + i, Y + y0 + Math.floor(rnd() * 3), 1, len, i % 2 ? '#5c9a4c' : '#4a8a40');
        }
        if (top) P(X + x0 + 2, Y + y0, x1 - x0 - 4, 1, '#7ab865');
        break;
      }
      case 105: // newer deck boards, lighter than the rest (after the 2019 fire)
        P(X, Y, 16, 16, '#a9825a'); for (let r = 3; r < 16; r += 4) P(X, Y + r, 16, 1, '#8f6a44'); P(X + ((y % 2) ? 5 : 11), Y, 1, 16, '#8f6a44');
        if (at(x - 1, y) !== 105) P(X, Y, 1, 16, '#2a1a12');
        break;
      case 106: // the Flutgraben: dark green canal water
        P(X, Y, 16, 16, '#2e5652');
        for (let i = 0; i < 2; i++) P(X + Math.floor(rnd() * 11), Y + 3 + Math.floor(rnd() * 10), 5, 1, '#4a7d76');
        if (at(x, y + 1) !== 106 && y + 1 < sc.h) P(X, Y + 13, 16, 3, '#3a2a1c');
        break;
      case 101: P(X, Y, 16, 16, '#9fe0e8'); P(X, Y, 16, 1, '#7fc8d2'); P(X, Y + 8, 16, 1, '#7fc8d2'); P(X, Y, 1, 16, '#7fc8d2'); P(X + 8, Y, 1, 16, '#7fc8d2'); break;
      case 81: case 82: case 83: case 84: case 85: case 86: case 87: case 88: case 89: {
        if (doorStyleAt(sc.id, t)) {
          // the opening of a doorway; what's in it (curtain, fog, neon) is drawn each frame in interiors/fx.ts.
          // Around it the wall carries on: copy the wall tile next to it along the wall, if it's drawn already.
          const st = doorStyleAt(sc.id, t), side = doorSide(sc.map, x, y);
          const [wx, wy] = side === 'down' || side === 'up' ? [x - 1, y] : [x, y - 1];
          if (wx >= 0 && wy >= 0 && (WALLISH.has(at(wx, wy)) || SOLID.has(at(wx, wy)))) g.drawImage(cv, wx * T, wy * T, T, T, X, Y, T, T);
          else P(X, Y, 16, 16, INK);
          const R = (cx: number, cy: number, w: number, h: number, c: string) => { const [a, b, ww, hh] = doorRect(side, X, Y, cx, cy, w, h); P(a, b, ww, hh, c); };
          R(2, 0, 12, 16, INK); const dark = st === 'neon' || st === 'leds' || st === 'floor' || st === 'runway';
          R(3, 1, 10, 15, st === 'floor' || st === 'runway' ? '#16151c' : dark ? '#100f16' : '#24232c');
          if (!dark) R(2, 0, 12, 1, st === 'strips' ? '#3a3946' : '#8a8896');
          if (st === 'floor' || st === 'runway') {
            // the light strip on the threshold lights the opening from below: brighter towards your side, and the
            // edges of the opening catch it, so the doorway shows up even in a black wall
            ['#1e1d27', '#25232f', '#2d2b39', '#363346'].forEach((c, i) => R(3, 1 + i * 3, 10, i < 3 ? 3 : 5, c));
            R(2, 0, 1, 16, '#5a5870'); R(13, 0, 1, 16, '#5a5870'); R(2, 0, 12, 1, '#4a4860');
          }
          break;
        }
        if (sc.id.startsWith('berghain')) {
          // Berghain: a heavy steel door in the concrete, open a crack, red light behind it
          P(X, Y, 16, 16, '#5c5a56'); P(X + 1, Y + 1, 14, 15, INK); P(X + 2, Y + 2, 12, 14, '#3a3c42');
          P(X + 2, Y + 2, 12, 1, '#5a5e68'); P(X + 11, Y + 8, 2, 2, '#a7a7b3'); P(X + 2, Y + 2, 2, 14, '#7a0a1c');
          break;
        }
        // a doorway with a bead curtain
        P(X, Y, 16, 16, '#1a1018'); P(X, Y, 16, 2, '#c9a24a'); P(X, Y, 2, 16, '#c9a24a'); P(X + 14, Y, 2, 16, '#c9a24a');
        const beads = ['#ff5e7a', '#ffd23f', '#5ec8ff', '#b6f36b', '#c28cff'];
        for (let i = 3; i < 14; i += 2) for (let j = 3; j < 15; j += 3) P(X + i, Y + j, 1, 2, beads[(i + j) % 5]);
        break;
      }
      // ---- Antonio's salon ----
      case 107: // mirror wall: a big mirror with a row of dressing-room bulbs above it
        if (frontFace) {
          P(X, Y, 16, 16, '#4a1a5a'); P(X, Y + 13, 16, 3, '#2a0a34');
          P(X + 2, Y + 4, 12, 9, INK); P(X + 3, Y + 5, 10, 7, '#9fd6e6'); P(X + 4, Y + 5, 3, 7, '#c9eef6'); P(X + 10, Y + 9, 2, 2, '#c9eef6');
          for (let i = 2; i < 15; i += 4) P(X + i, Y + 1, 2, 2, '#fff2a8');
        } else P(X, Y, 16, 16, '#2a0a34');
        break;
      case 108: // salon chair: red leather on a chrome foot, facing the mirror
        P(X, Y, 16, 16, (x + y) % 2 ? '#e8e4d8' : '#14121c');
        P(X + 3, Y + 2, 10, 8, INK); P(X + 4, Y + 3, 8, 6, '#c4162a'); P(X + 5, Y + 3, 2, 6, '#e8404f');
        P(X + 2, Y + 9, 12, 3, INK); P(X + 3, Y + 9, 10, 2, '#a3121f');
        P(X + 7, Y + 12, 2, 3, '#c0c4cc'); P(X + 4, Y + 14, 8, 2, '#8a9098');
        break;
      case 109: // black and white checkered floor
        P(X, Y, 8, 8, '#e8e4d8'); P(X + 8, Y, 8, 8, '#14121c'); P(X, Y + 8, 8, 8, '#14121c'); P(X + 8, Y + 8, 8, 8, '#e8e4d8');
        break;
      default: P(X, Y, 16, 16, '#000'); break;
    }
  }
  // KitKat's pool: a long rectangle with big rounded ends, like the real one, drawn smooth over the box its
  // water tiles sit in (the tiles themselves only cut the corners)
  if (sc.id === 'kitkat:pool') {
    let x0 = sc.w, y0 = sc.h, x1 = -1, y1 = -1;
    sc.map.forEach((row, y) => row.forEach((t, x) => { if (t === 64) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } }));
    if (x1 >= 0) {
      const bx = x0 * T, by = y0 * T, bw = (x1 - x0 + 1) * T, bh = (y1 - y0 + 1) * T, cx = bx + bw / 2, cy = by + bh / 2;
      // the tiled deck round it
      for (let y = by; y < by + bh; y += 8) for (let x = bx; x < bx + bw; x += 8) { P(x, y, 8, 8, '#9fe0e8'); P(x, y, 8, 1, '#7fc8d2'); P(x, y, 1, 8, '#7fc8d2'); }
      // a rounded rectangle, inset by d on every side, corners rounded as much as the height allows
      const pool = (d: number, c: string) => {
        const x = bx + d, y = by + d, w = bw - 2 * d, h = bh - 2 * d, r = Math.min(h / 2, 2.4 * T - d);
        g.fillStyle = c; g.beginPath();
        g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.arc(x + w - r, y + r, r, -Math.PI / 2, 0); g.lineTo(x + w, y + h - r);
        g.arc(x + w - r, y + h - r, r, 0, Math.PI / 2); g.lineTo(x + r, y + h); g.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI);
        g.lineTo(x, y + r); g.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5); g.closePath(); g.fill();
      };
      pool(0, '#e8e4d8');     // white rim
      pool(3, '#1d5f80');     // its shadow on the water
      pool(4, '#2f86ad');     // the water
      pool(16, '#3a96bd');    // lighter towards the middle (lit from below)
      for (let i = 0; i < 24; i++) { const a = i * 2.39, r = 0.25 + (i % 5) * 0.14; P(Math.round(cx + Math.cos(a) * r * bw / 2 - 2), Math.round(cy + Math.sin(a) * r * bh / 2), 5, 1, '#5fb6db'); }
    }
  }
  return cv;
}

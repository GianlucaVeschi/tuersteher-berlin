import type { Scene } from '../types';
import { RT } from '../core/runtime';
import { INK, circle, pick, rnd } from '../util';
import { T, WALLISH } from '../world/tiles';
/** Draws a club floor's tiles once into its own canvas. */
export function drawInteriorTiles(sc: Scene): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = sc.w * T; cv.height = sc.h * T;
  const g = cv.getContext('2d')!;
  const P = (x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= sc.w || y >= sc.h) ? 62 : sc.map[y][x];
  const floorBase = (X: number, Y: number) => { P(X, Y, 16, 16, '#2f2e35'); for (let i = 0; i < 4; i++) P(X + Math.floor(rnd() * 15), Y + Math.floor(rnd() * 15), 1, 1, pick(['#37363e', '#28272d'])); };
  const face = (X: number, Y: number) => { // raw concrete wall seen from the front, with formwork tie holes
    P(X, Y, 16, 16, '#5c5a56'); P(X, Y, 1, 16, '#4e4c48'); P(X, Y, 16, 2, '#6e6c67'); P(X, Y + 13, 16, 3, '#2a2928');
    [[4, 5], [12, 5], [4, 10], [12, 10]].forEach(([a, b]) => P(X + a, Y + b, 1, 1, '#45433f'));
  };
  RT.seed = 777 + sc.id.length;
  for (let y = 0; y < sc.h; y++) for (let x = 0; x < sc.w; x++) {
    const t = sc.map[y][x], X = x * T, Y = y * T;
    const frontFace = !WALLISH.has(at(x, y + 1));
    switch (t) {
      case 40: if (frontFace) face(X, Y); else { P(X, Y, 16, 16, '#141318'); if (!WALLISH.has(at(x, y - 1)) && y > 0) P(X, Y, 16, 1, '#26252c'); } break;
      case 41: floorBase(X, Y); break;
      case 42: P(X, Y, 16, 16, '#222128'); P(X, Y, 16, 1, '#29282f'); P(X, Y, 1, 16, '#29282f'); P(X + 8, Y + 8, 1, 1, '#2f2e36'); break;
      case 61: P(X, Y, 16, 16, '#3a3a43'); for (let a = 1; a < 16; a += 3) for (let b = 1; b < 16; b += 3) P(X + a, Y + b, 1, 1, '#2c2c34'); break;
      case 47: P(X, Y, 16, 16, '#40454c'); P(X, Y, 16, 1, '#353940'); P(X, Y + 8, 16, 1, '#353940'); P(X, Y, 1, 16, '#353940'); P(X + 8, Y, 1, 16, '#353940'); break;
      case 46: P(X, Y, 16, 16, '#07060a'); if (rnd() < 0.2) P(X + Math.floor(rnd() * 15), Y + Math.floor(rnd() * 15), 1, 1, '#121117'); break;
      case 43: case 44: {
        const up = t === 43;
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
      case 50: P(X, Y, 16, 16, '#1d1c22'); P(X + 1, Y + 1, 14, 12, '#2a2a32'); for (let i = 2; i < 13; i += 2) P(X + 1, Y + i, 14, 1, '#4c4c56'); P(X, Y + 13, 16, 3, '#2a2928'); break;
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
      case 98: floorBase(X, Y); P(X, Y + 1, 16, 1, '#8a9098'); for (let i = 1; i < 16; i += 3) P(X + i, Y + 1, 1, 15, '#8a9098'); break;
      case 100: floorBase(X, Y); P(X + 3, Y + 5, 10, 6, INK); P(X + 4, Y + 6, 8, 4, '#d9e6e0'); P(X + 1, Y + 2, 2, 5, '#8a9098'); P(X + 13, Y + 2, 2, 5, '#8a9098'); P(X + 7, Y + 11, 2, 5, '#8a9098'); break;
      // ---- Heideglühen ----
      case 102: // fire pit: a ring of stones with logs (the flames are animated in fx.ts)
        P(X, Y, 16, 16, '#3f7a3a'); circle(g, X + 8, Y + 9, 7, INK); circle(g, X + 8, Y + 9, 6, '#6a6a72');
        circle(g, X + 8, Y + 9, 4, '#2a1a12'); P(X + 4, Y + 9, 8, 2, '#6b4a2e'); P(X + 7, Y + 6, 2, 7, '#5a3d24'); break;
      case 103: // karaoke machine: a TV on a stand with a mic
        P(X, Y, 16, 16, '#40454c'); P(X + 1, Y + 1, 14, 10, INK); P(X + 2, Y + 2, 12, 8, '#1a2a4a');
        P(X + 7, Y + 11, 2, 4, '#8a9098'); P(X + 4, Y + 14, 8, 2, '#5a5f66'); P(X + 13, Y + 9, 2, 5, '#c0c4cc'); P(X + 12, Y + 8, 4, 2, INK); break;
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
  return cv;
}

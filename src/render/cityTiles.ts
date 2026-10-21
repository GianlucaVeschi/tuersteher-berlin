import { buildInteriors } from '../interiors/build';
import { CLUBS } from '../data/clubs';
import { MOLECULE, TOWER, buildings, roads } from '../world/city';
import { STATION } from '../world/station';
import { get } from '../world/grid';
import { INK, circle, pick, rnd } from '../util';
import { ATB, B, BK, BR, C, D, DK, F, FB, FN, G, GRL, KU, MTB, OT, PL, R, RL, S, SA, SK, T, TER, TR, TW, UMB, W } from '../world/tiles';
import { RT } from '../core/runtime';
import { pixelText, pixelTextWidth } from './pixelFont';
import type { Building, Club } from '../types';

/* ================= PRERENDER MAP ================= */
// The street is drawn once into this canvas; each frame copies the visible part.
RT.mc = document.createElement('canvas');
RT.mc.width = RT.MW * T; RT.mc.height = RT.MH * T;
export const m = RT.mc.getContext('2d')!;
/** Fill a rectangle on the street map canvas. */
export function P(x: number, y: number, w: number, h: number, c: string) { m.fillStyle = c; m.fillRect(x, y, w, h); }
export const isWater = (t: number) => t === W;

export function drawGrass(X: number, Y: number) {
  P(X, Y, 16, 16, '#26473a');
  for (let i = 0; i < 3; i++) { const a = Math.floor(rnd() * 14), b = Math.floor(rnd() * 14); P(X + a, Y + b, 1, 2, '#30594a'); P(X + a + 1, Y + b + 1, 1, 1, '#30594a'); }
  if (rnd() < 0.15) P(X + Math.floor(rnd() * 14), Y + Math.floor(rnd() * 14), 1, 1, '#8a6fb0');
  if (rnd() < 0.3) P(X + Math.floor(rnd() * 14), Y + Math.floor(rnd() * 14), 2, 1, '#1f3d30');
}
export function drawTile(x: number, y: number) {
  const X = x * T, Y = y * T, t = RT.map[y][x];
  switch (t) {
    case B:
      if (y === 24 && (x === 37 || x === 40)) { P(X, Y, 16, 16, '#8a3c35'); break; }
      drawGrass(X, Y); break;
    case G: case C: case D: drawGrass(X, Y); break;
    case R:
      P(X, Y, 16, 16, '#343345');
      for (let i = 0; i < 4; i++) P(X + Math.floor(rnd() * 16), Y + Math.floor(rnd() * 16), 1, 1, '#3f3e52');
      break;
    case S:
      P(X, Y, 16, 16, '#6c677d');
      P(X, Y, 16, 1, '#5f5a70'); P(X, Y + 8, 16, 1, '#5f5a70');
      P(X + ((y % 2) ? 4 : 12), Y, 1, 8, '#5f5a70'); P(X + ((y % 2) ? 12 : 4), Y + 8, 1, 8, '#5f5a70');
      if (rnd() < 0.1) P(X + 3 + Math.floor(rnd() * 10), Y + 3 + Math.floor(rnd() * 10), 2, 1, '#7d7890');
      break;
    case W: {
      P(X, Y, 16, 16, '#1e3a6e');
      for (let i = 0; i < 2; i++) P(X + Math.floor(rnd() * 11), Y + 2 + Math.floor(rnd() * 12), 4, 1, '#2b4f8c');
      const up = get(x, y - 1), dn = get(x, y + 1), lf = get(x - 1, y), rt = get(x + 1, y);
      if (!isWater(up) && up !== BR) { P(X, Y, 16, 2, '#14284f'); P(X, Y + 2, 16, 1, '#6f93c9'); }
      if (!isWater(dn) && dn !== BR) P(X, Y + 14, 16, 2, '#14284f');
      if (!isWater(lf) && lf !== BR) P(X, Y, 2, 16, '#14284f');
      if (!isWater(rt) && rt !== BR) P(X + 14, Y, 2, 16, '#14284f');
      break;
    }
    case BR: {
      const brick = x >= 37 && x <= 40 && y >= 20 && y <= 28;
      if (brick) {
        P(X, Y, 16, 16, '#8a3c35');
        for (let r = 0; r < 4; r++) { P(X, Y + r * 4 + 3, 16, 1, '#6e2c27'); P(X + ((r % 2) ? 2 : 10), Y + r * 4, 1, 3, '#6e2c27'); }
      } else {
        P(X, Y, 16, 16, '#64616f');
        for (let r = 0; r < 4; r++) P(X, Y + r * 4 + 3, 16, 1, '#555261');
      }
      const rail = brick ? '#c56b5c' : '#b9b5c6';
      if (isWater(get(x - 1, y))) { P(X, Y, 3, 16, INK); P(X, Y, 2, 16, rail); }
      if (isWater(get(x + 1, y))) { P(X + 13, Y, 3, 16, INK); P(X + 14, Y, 2, 16, rail); }
      if (isWater(get(x, y - 1))) { P(X, Y, 16, 3, INK); P(X, Y, 16, 2, rail); }
      if (isWater(get(x, y + 1))) { P(X, Y + 13, 16, 3, INK); P(X, Y + 14, 16, 2, rail); }
      break;
    }
    case TR:
      drawGrass(X, Y);
      P(X + 7, Y + 11, 2, 4, '#3a2a22');
      circle(m, X + 8, Y + 7, 7, INK);
      circle(m, X + 8, Y + 7, 6, '#24503b');
      circle(m, X + 6, Y + 5, 3, '#33704f');
      P(X + 9, Y + 9, 2, 1, '#1b3d2c');
      break;
    case F: {
      P(X, Y, 16, 16, '#d6d0c1');
      const cols = ['#e24a4a', '#f2c14e', '#4ea8de', '#58b368', '#b36bd1', '#f28c38', '#ff7ab8'];
      for (let i = 0; i < 4; i++) P(X + Math.floor(rnd() * 12), Y + 3 + Math.floor(rnd() * 8), 2 + Math.floor(rnd() * 5), 2 + Math.floor(rnd() * 4), pick(cols));
      P(X, Y, 16, 2, '#b9b2a2'); P(X, Y + 14, 16, 2, '#8a8476'); P(X, Y + 2, 16, 1, '#f1ece0');
      break;
    }
    case SA:
      P(X, Y, 16, 16, '#9a8256');
      for (let i = 0; i < 5; i++) P(X + Math.floor(rnd() * 16), Y + Math.floor(rnd() * 16), 1, 1, pick(['#b09868', '#836c45']));
      break;
    case RL:
      P(X, Y, 16, 16, '#3c3744');
      for (let i = 0; i < 16; i += 4) P(X + i, Y + 2, 2, 12, '#5a4636');
      P(X, Y + 4, 16, 1, '#a9a9b8'); P(X, Y + 11, 16, 1, '#a9a9b8');
      break;
    case PL: // S-Bahn platform: concrete slabs, yellow safety line along the track
      P(X, Y, 16, 16, '#8a8696'); P(X, Y + 8, 16, 1, '#7a7686'); P(X + (x % 2 ? 4 : 11), Y + 3, 1, 13, '#7a7686');
      P(X, Y, 16, 2, '#f2c14e'); P(X, Y + 2, 16, 1, '#5a5668');
      break;
    // ---- Görlitzer Park ----
    case FN: // the new fence: wire mesh between posts
      drawGrass(X, Y);
      P(X, Y + 5, 16, 1, '#9a9aa6'); P(X, Y + 10, 16, 1, '#9a9aa6');
      for (let i = 1; i < 16; i += 5) P(X + i, Y + 2, 2, 13, '#6a6a76');
      break;
    case GRL: // a kettle grill on the sand
      P(X, Y, 16, 16, '#9a8256');
      P(X + 4, Y + 10, 1, 5, INK); P(X + 11, Y + 10, 1, 5, INK);
      circle(m, X + 8, Y + 8, 5, INK); circle(m, X + 8, Y + 8, 4, '#2a2a30'); P(X + 5, Y + 6, 6, 1, '#ff8c42');
      break;
    case TW: // a towel on the grass
      drawGrass(X, Y); { const c = pick(['#ff5e7a', '#5ec8ff', '#ffd23f', '#b6f36b', '#c28cff']); P(X + 2, Y + 3, 12, 10, c); P(X + 2, Y + 6, 12, 2, '#f3eee3'); P(X + 2, Y + 10, 12, 1, '#f3eee3'); }
      break;
    case KU: { // the Kuhle: the lawn dips into a bowl, darker towards the middle
      const edge = [get(x, y - 1), get(x, y + 1), get(x - 1, y), get(x + 1, y)].filter(n => n !== KU && n !== TW).length;
      P(X, Y, 16, 16, edge ? '#3a6e36' : '#2f5f2c');
      for (let i = 0; i < 4; i++) P(X + Math.floor(rnd() * 15), Y + Math.floor(rnd() * 14), 1, 2, pick(['#4f8f45', '#356a31']));
      if (get(x, y - 1) !== KU && get(x, y - 1) !== TW) P(X, Y, 16, 2, '#2a5228');
      break;
    }
    case BK: // basketball court: orange-red with white lines, a hoop at the ends
      P(X, Y, 16, 16, '#b4523a');
      if (get(x, y - 1) !== BK) P(X, Y, 16, 1, '#f3eee3');
      if (get(x, y + 1) !== BK) P(X, Y + 15, 16, 1, '#f3eee3');
      if (get(x - 1, y) !== BK) { P(X, Y, 1, 16, '#f3eee3'); if (get(x, y - 1) === BK && get(x, y + 1) === BK) { P(X + 1, Y + 4, 3, 8, INK); P(X + 3, Y + 6, 3, 4, '#ff8c42'); } }
      if (get(x + 1, y) !== BK) { P(X + 15, Y, 1, 16, '#f3eee3'); if (get(x, y - 1) === BK && get(x, y + 1) === BK) { P(X + 12, Y + 4, 3, 8, INK); P(X + 10, Y + 6, 3, 4, '#ff8c42'); } }
      break;
    case FB: // football pitch: stripes of grass, white lines round the edge and through the middle
      P(X, Y, 16, 16, x % 2 ? '#4a8a3e' : '#448236');
      if (get(x, y - 1) !== FB) P(X, Y, 16, 1, '#f3eee3');
      if (get(x, y + 1) !== FB) P(X, Y + 15, 16, 1, '#f3eee3');
      if (get(x - 1, y) !== FB) { P(X, Y, 1, 16, '#f3eee3'); P(X + 1, Y + 5, 2, 6, '#e8e4d8'); }
      if (get(x + 1, y) !== FB) { P(X + 15, Y, 1, 16, '#f3eee3'); P(X + 13, Y + 5, 2, 6, '#e8e4d8'); }
      break;
    case SK: { // skate park: smooth grey concrete with a light edge; a quarter-pipe ramp along its east end
      P(X, Y, 16, 16, '#8a8696');
      for (let i = 0; i < 3; i++) P(X + Math.floor(rnd() * 15), Y + Math.floor(rnd() * 15), 2, 1, '#7a7686');
      if (get(x, y - 1) !== SK) P(X, Y, 16, 2, '#c9c5d4');
      if (get(x - 1, y) !== SK) P(X, Y, 2, 16, '#c9c5d4');
      if (get(x + 1, y) !== SK) {
        // the ramp: the concrete curves up towards the east, lighter as it rises, a steel coping on top
        for (let i = 0; i < 12; i++) P(X + 4 + i, Y, 1, 16, `rgb(${138 + i * 7},${134 + i * 7},${150 + i * 6})`);
        P(X + 4, Y, 1, 16, '#6a6678'); P(X + 14, Y, 2, 16, '#e8e8f0'); P(X + 15, Y, 1, 16, '#9aa0aa');
        if (get(x, y + 1) !== SK) P(X + 4, Y + 14, 12, 2, '#5a5668');
      } else if (get(x, y + 1) !== SK) P(X, Y + 14, 16, 2, '#5a5668');
      break;
    }
    case OT: // old rails of the Görlitzer Bahnhof, half grown over
      drawGrass(X, Y);
      for (let i = 1; i < 16; i += 5) P(X + i, Y + 4, 3, 8, '#5a4636');
      P(X, Y + 5, 16, 1, '#8a8a96'); P(X, Y + 10, 16, 1, '#8a8a96');
      if (rnd() < 0.5) P(X + Math.floor(rnd() * 13), Y + 7, 3, 2, '#4f8f45');
      break;
    // ---- canal terraces ----
    case TER: case ATB: case MTB: case UMB: {
      // cobblestones
      P(X, Y, 16, 16, '#7a7468');
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) P(X + c * 4 + (r % 2) * 2, Y + r * 4, 3, 3, pick(['#8e8879', '#857f71', '#948e80']));
      if (t === ATB) { // Ankerklause: red tablecloth with white dots, blue folding chairs either side
        P(X, Y + 5, 3, 7, '#2b5aa8'); P(X + 13, Y + 5, 3, 7, '#2b5aa8'); P(X, Y + 5, 3, 1, '#9fc0f0'); P(X + 13, Y + 5, 3, 1, '#9fc0f0');
        P(X + 3, Y + 3, 10, 8, INK); P(X + 3, Y + 3, 10, 7, '#d6453d');
        for (let i = 0; i < 4; i++) P(X + 4 + (i % 2) * 5 + (i > 1 ? 2 : 0), Y + 4 + (i > 1 ? 3 : 0), 1, 1, '#f3eee3');
        P(X + 4, Y + 11, 1, 4, '#c9c5d4'); P(X + 11, Y + 11, 1, 4, '#c9c5d4');
        P(X + 7, Y + 4, 2, 3, '#ffd23f');
      } else if (t === MTB) { // La Maison: a small round bistro table, rattan chairs either side
        P(X, Y + 6, 3, 7, '#c9a26a'); P(X + 13, Y + 6, 3, 7, '#c9a26a'); P(X, Y + 6, 3, 1, '#e0c08a'); P(X + 13, Y + 6, 3, 1, '#e0c08a');
        circle(m, X + 8, Y + 7, 5, INK); circle(m, X + 8, Y + 7, 4, '#3a2a20');
        P(X + 7, Y + 11, 2, 4, INK); P(X + 6, Y + 5, 2, 2, '#ff8c42'); P(X + 9, Y + 6, 1, 2, '#e8d8b0');
      } else if (t === UMB) { // a folded parasol in brewery blue
        P(X + 7, Y + 10, 2, 6, '#c9c5d4'); P(X + 5, Y - 14, 6, 25, INK); P(X + 6, Y - 13, 4, 23, '#1f3f7a'); P(X + 6, Y - 4, 4, 2, '#e8f0ff');
      }
      break;
    }
    case DK:
      P(X, Y, 16, 16, '#6e4b2e');
      for (let r = 0; r < 4; r++) P(X, Y + r * 4 + 3, 16, 1, '#553821');
      P(X + 2, Y + 1, 1, 1, '#8a6a48'); P(X + 12, Y + 9, 1, 1, '#8a6a48');
      break;
  }
}

export function drawRoadMarks() {
  roads.forEach(r => {
    for (let i = r.a; i <= r.b; i++) {
      if (r.h) {
        if (get(i, r.y - 1) === R || get(i, r.y + 2) === R || get(i, r.y) === BR) continue;
        P(i * T + 2, (r.y + 1) * T - 1, 6, 2, '#c9b25a');
        P(i * T + 10, (r.y + 1) * T - 1, 4, 2, '#c9b25a');
      } else {
        if (get(r.x - 1, i) === R || get(r.x + 2, i) === R) continue;
        P((r.x + 1) * T - 1, i * T + 2, 2, 6, '#c9b25a');
        P((r.x + 1) * T - 1, i * T + 10, 2, 4, '#c9b25a');
      }
    }
  });
}

export function windows(X: number, Y: number, w: number, h: number, skipDoor: boolean) {
  for (let ry = 1; ry < h; ry++) for (let cx = 0; cx < w; cx++) {
    if (skipDoor && ry === h - 1 && cx === Math.floor(w / 2)) continue;
    for (const ox of [3, 10]) {
      const lit = rnd() < 0.42;
      const wx = X + cx * T + ox, wy = Y + ry * T + 3;
      P(wx - 1, wy - 1, 5, 9, INK);
      P(wx, wy, 3, 7, lit ? pick(['#f2d06b', '#f5b95a', '#e8e0a0']) : '#262238');
      if (!lit && rnd() < 0.3) P(wx, wy, 3, 1, '#3a3554');
      P(wx - 1, wy + 8, 5, 1, '#a9a2b4');
    }
  }
}
export function drawAltbau(b: Building) {
  const X = b.x * T, Y = b.y * T, Wd = b.w * T, H = b.h * T;
  const walls = ['#76687a', '#66737e', '#7d7262'][b.v ?? 0];
  const roofs = ['#4a3c58', '#3d4458', '#523d3d'][b.v ?? 0];
  P(X, Y, Wd, H, INK);
  P(X + 1, Y + 1, Wd - 2, 15, roofs);
  for (let i = 4; i < 15; i += 4) P(X + 1, Y + 1 + i, Wd - 2, 1, 'rgba(0,0,0,.25)');
  P(X + 1, Y + 1, Wd - 2, 2, 'rgba(255,255,255,.08)');
  P(X + 1, Y + 16, Wd - 2, H - 17, walls);
  P(X + 1, Y + 16, Wd - 2, 2, 'rgba(255,255,255,.18)');
  P(X + Wd - 14, Y - 2, 5, 8, INK); P(X + Wd - 13, Y - 1, 3, 6, '#6e4a3a');
  windows(X, Y, b.w, b.h, true);
  const dX = X + Math.floor(b.w / 2) * T;
  if (b.shop) {
    const sh = b.shop, sy = Y + H - T;
    P(X + 2, sy - 1, Wd - 4, T, INK);
    P(X + 3, sy + 3, Wd - 6, 10, '#f2d47a');
    for (let i = 0; i < 12; i++) P(X + 5 + Math.floor(rnd() * (Wd - 12)), sy + 7 + Math.floor(rnd() * 5), 2, 2, pick(['#e24a4a', '#4ea8de', '#58b368', '#f28c38', '#3a3a3a', '#d94bd1']));
    P(X + 2, sy - 6, Wd - 4, 11, INK);
    P(X + 3, sy - 5, Wd - 6, 9, sh.band);
    m.fillStyle = sh.ink; m.font = '8px "Press Start 2P", monospace'; m.textBaseline = 'top';
    const tw = m.measureText(sh.label).width;
    // small shops: if the sign doesn't fit, use the sharp 3×5 font instead
    if (tw <= Wd - 8) m.fillText(sh.label, Math.round(X + Wd / 2 - tw / 2), sy - 5);
    else pixelText(m, sh.label, Math.round(X + Wd / 2 - pixelTextWidth(sh.label) / 2), sy - 3, sh.ink);
    if (sh.awning) {
      // a striped awning under the sign, like the Ankerklause's red and white one
      for (let i = 0; i < Wd - 4; i += 4) P(X + 2 + i, sy + 4, 4, 5, sh.awning[(i / 4) % 2]);
      P(X + 2, sy + 9, Wd - 4, 1, INK);
      for (let i = 0; i < Wd - 4; i += 8) P(X + 4 + i, sy + 10, 1, 1, '#ffd23f');
    }
    if (sh.door) {
      P(dX + 2, sy + 4, 12, 12, INK);
      P(dX + 3, sy + 5, 10, 11, '#fbecb4');
      P(dX + 7, sy + 5, 1, 11, INK);
      P(dX + 9, sy + 10, 1, 2, INK);
    }
  } else {
    P(dX + 3, Y + H - 14, 10, 13, INK);
    P(dX + 4, Y + H - 13, 8, 12, '#4a2f2a');
    P(dX + 4, Y + H - 13, 8, 3, '#d9c27a');
  }
}
export function drawStation(b: Building) {
  const X = b.x * T, Y = b.y * T, Wd = b.w * T, H = b.h * T;
  P(X, Y, Wd, H, INK);
  P(X + 1, Y + 1, Wd - 2, 30, '#3f6b6e');
  for (let i = 0; i < Wd; i += 8) P(X + 1 + i, Y + 1, 1, 30, '#5e9195');
  P(X + 1, Y + 15, Wd - 2, 1, '#5e9195');
  P(X + 1, Y + 32, Wd - 2, H - 33, '#6d3a32');
  for (let r = 0; r < (H - 33) / 4; r++) P(X + 1, Y + 32 + r * 4 + 3, Wd - 2, 1, '#5a2e28');
  for (let i = 0; i < b.w; i++) { P(X + i * T + 3, Y + 40, 10, 14, INK); P(X + i * T + 4, Y + 41, 8, 12, i % 2 ? '#f2d06b' : '#d9e6e0'); }
  P(X + 10, Y + H - 15, Wd - 20, 14, INK); P(X + 11, Y + H - 14, Wd - 22, 13, '#2a2533');
  const cx = X + Wd / 2;
  P(cx - 44, Y + 3, 88, 12, INK);
  circle(m, cx - 36, Y + 9, 5, '#1f8a4a'); m.fillStyle = '#fff'; m.font = '8px "Press Start 2P", monospace'; m.textBaseline = 'top';
  m.fillText('S', cx - 39, Y + 5);
  m.fillText('OSTKREUZ', cx - 28, Y + 5);
}
export const towerC = document.createElement('canvas');
export function drawTower(b: Building) {
  // Draw the whole tower (rows TOWER.top .. bottom of footprint) into its own canvas.
  const Wd = b.w * T, H = (b.y + b.h - TOWER.top) * T;
  towerC.width = Wd; towerC.height = H;
  const g = towerC.getContext('2d')!;
  const P = (x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const m = g, X = 0, Y = 0, cx = Wd / 2;
  // plaza
  P(0, H - b.h * T + 2, Wd, b.h * T - 2, '#5f5a70');
  for (let i = 0; i < Wd; i += 8) P(i, H - b.h * T + 2, 1, b.h * T - 2, '#57526a');
  // base pavilion
  P(X + 2, Y + H - 22, Wd - 4, 20, INK);
  P(X + 3, Y + H - 21, Wd - 6, 18, '#77748a');
  for (let i = 6; i < Wd - 8; i += 6) P(X + i, Y + H - 16, 3, 6, '#f2d06b');
  // shaft
  P(cx - 5, Y + 50, 10, H - 72, INK);
  P(cx - 4, Y + 50, 8, H - 72, '#bdbacb');
  P(cx + 1, Y + 50, 3, H - 72, '#9591a6');
  // sphere
  circle(m, cx, Y + 42, 16, INK);
  circle(m, cx, Y + 42, 15, '#c7c4d4');
  m.save(); m.beginPath(); m.rect(cx - 16, Y + 44, 32, 16); m.clip(); circle(m, cx, Y + 42, 15, '#9a97ab'); m.restore();
  P(cx - 15, Y + 40, 30, 4, '#2b2838');
  for (let i = -13; i < 13; i += 3) P(cx + i, Y + 41, 2, 2, '#f2c45a');
  // antenna
  P(cx - 2, Y + 6, 4, 22, INK);
  for (let i = 0; i < 22; i += 4) P(cx - 1, Y + 6 + i, 2, 4, (i / 4) % 2 ? '#e9e6ef' : '#d64545');
  P(cx - 3, Y + 24, 6, 4, '#bdbacb');
  // footprint part goes into the static map
  const fy = (b.y - TOWER.top) * T;
  mDraw(towerC, 0, fy, Wd, H - fy, b.x * T, b.y * T);
}
export function mDraw(img: CanvasImageSource, sx: number, sy: number, sw: number, sh: number, dx: number, dy: number) { m.drawImage(img, sx, sy, sw, sh, dx, dy, sw, sh); }
/** The name board of Warschauer Straße, up above the tracks (over the trees) so people on the platform don't cover it. */
function drawStationBoard() {
  const name = 'WARSCHAUER STRASSE', w = pixelTextWidth(name) + 16, X = STATION.x0 * T + Math.round(((STATION.x1 - STATION.x0 + 1) * T - w) / 2), Y = (STATION.y - 2) * T + 3;
  P(X + 3, Y + 9, 1, 4, INK); P(X + w - 4, Y + 9, 1, 4, INK); // posts
  P(X, Y, w, 10, INK); P(X + 1, Y + 1, w - 2, 8, '#1b2a3a');
  circle(m, X + 6, Y + 5, 3, '#1f8a4a'); pixelText(m, 'S', X + 5, Y + 3, '#ffffff');
  pixelText(m, name, X + 12, Y + 3, '#ffffff');
}
/** Molecule Man: three aluminium figures standing in the river, arms meeting in the middle,
 *  full of round holes. Drawn onto the static map over the water tiles. */
export function drawMoleculeMan() {
  const X = MOLECULE.x * T, Y = MOLECULE.y * T, W = MOLECULE.w * T, H = MOLECULE.h * T;
  const metal = '#c7cbd6', shadow = '#9aa0ae', water = Y + H - 6;
  // ripples where the legs go into the water, and a shimmer of reflection
  P(X + 2, water + 1, W - 4, 2, '#2b4f8c'); P(X + 6, water + 4, W - 12, 1, '#5d86c4');
  [6, 22, 38].forEach((cx, i) => {
    const top = Y - 10 + (i === 1 ? 0 : 4); // the middle figure stands a little taller
    // legs, body, head (outline first, then aluminium, then a shaded edge)
    P(X + cx - 4, top + 8, 10, water - top - 8, INK);
    P(X + cx - 3, top + 9, 8, water - top - 9, metal);
    P(X + cx + 3, top + 9, 2, water - top - 9, shadow);
    P(X + cx, top + 28, 1, water - top - 28, INK); // the gap between the legs
    circle(m, X + cx + 1, top + 4, 5, INK); circle(m, X + cx + 1, top + 4, 4, metal);
    // the holes
    for (let k = 0; k < 5; k++) circle(m, X + cx - 1 + Math.floor(rnd() * 5), top + 12 + Math.floor(rnd() * (water - top - 16)), 1, '#2a2d38');
  });
  // arms reaching to the middle, meeting above the water
  P(X + 4, Y - 1, W - 8, 4, INK); P(X + 5, Y, W - 10, 2, metal);
}
export function drawObTower(b: Building) {
  const X = b.x * T, Y = b.y * T;
  P(X + 1, Y - 10, 14, 26, INK);
  P(X + 2, Y - 9, 12, 24, '#9a4038');
  for (let r = 0; r < 6; r++) P(X + 2, Y - 9 + r * 4 + 3, 12, 1, '#7a2f29');
  P(X + 5, Y - 2, 6, 8, INK); P(X + 6, Y - 1, 4, 6, '#f2c45a');
  P(X + 3, Y - 14, 10, 5, INK); P(X + 4, Y - 13, 8, 4, '#4a5a6a');
  P(X + 7, Y - 18, 2, 5, INK);
}

export function signText(text: string, X: number, Y: number, Wd: number, color: string) {
  m.font = '8px "Press Start 2P", monospace'; m.textBaseline = 'top';
  const tw = Math.ceil(m.measureText(text).width);
  const sx = Math.round(X + Wd / 2 - tw / 2);
  P(sx - 4, Y + 2, tw + 8, 13, INK);
  P(sx - 3, Y + 3, tw + 6, 11, '#0b0a10');
  m.fillStyle = color; m.fillText(text, sx, Y + 5);
}
/** The Sisyphos entrance on Hauptstraße, from a photo: the rusty steel gate with two big birds facing each
 *  other beak to beak over a sunburst of bars, the arched rusty SISYPHOS banner, dark brick pillars, and
 *  the red-and-white circus fence with pointed crowns, white stars and disco balls; trees behind it, the
 *  yellow-lid recycling bins on the left. The gate stands where the door is (bottom middle). */
function drawSisyphosGate(X: number, Y: number, Wd: number, H: number) {
  const RUST = '#a4562a', RUST_D = '#7a3a1a', RUST_L = '#c8763c';
  // trees behind the fence
  P(X, Y, Wd, H, '#24452a');
  for (let i = 0; i < 14; i++) circle(m, X + 4 + i * 8 + Math.floor(rnd() * 4), Y + 6 + Math.floor(rnd() * 10), 5 + Math.floor(rnd() * 3), pick(['#2f5a35', '#3f7a45', '#356b3c']));
  // the circus fence, left and right, each with a pointed crown in the middle
  const fence = (x0: number, w: number) => {
    const peak = x0 + w / 2;
    for (let x = x0; x < x0 + w; x++) {
      const d = Math.min(1, Math.abs(x + 0.5 - peak) / (w / 2));
      const top = Math.round(8 + 16 * (1 - (1 - d) ** 2));
      P(X + x, Y + top - 1, 1, 1, INK);
      P(X + x, Y + top, 1, H - 6 - top, ((x - x0) >> 2) % 2 ? '#f0ebe0' : '#d6303a');
    }
    P(X + x0, Y + H - 6, w, 6, '#2e2c30');
    // a white star, and a disco ball on a little post on top of the crown
    const sx = X + Math.round(peak), sy = Y + 40;
    ['...X...', '...X...', 'XXXXXXX', '.XXXXX.', '..XXX..', '.XX.XX.', 'X.....X'].forEach((row, ry) =>
      [...row].forEach((ch, rx) => { if (ch === 'X') P(sx - 3 + rx, sy - 3 + ry, 1, 1, '#ffffff'); }));
    P(sx, Y + 5, 1, 3, INK);
    circle(m, sx, Y + 3, 3, INK); circle(m, sx, Y + 3, 2, '#c9ccd6'); P(sx - 1, Y + 2, 1, 1, '#ffffff');
  };
  fence(0, 28); fence(Wd - 28, 28);
  // the recycling bins on the left: black, yellow lids
  for (const bx of [1, 8, 15]) { P(X + bx, Y + H - 13, 7, 11, INK); P(X + bx + 1, Y + H - 12, 5, 9, '#26242a'); P(X + bx, Y + H - 14, 7, 2, '#f2c418'); P(X + bx + 2, Y + H - 9, 3, 2, '#f2c418'); P(X + bx + 1, Y + H - 2, 1, 1, '#8a8a8a'); P(X + bx + 5, Y + H - 2, 1, 1, '#8a8a8a'); }
  // brick pillars either side of the gate
  for (const px of [28, Wd - 34]) {
    P(X + px, Y + 18, 6, H - 18, INK); P(X + px + 1, Y + 19, 4, H - 19, '#3a383c');
    for (let r = 22; r < H; r += 3) P(X + px + 1, Y + r, 4, 1, '#2a282c');
    P(X + px + 1, Y + 19, 4, 1, '#55525a');
  }
  // the gate: an arched steel frame, pale panels behind a sunburst of rusty bars
  const gx0 = 34, gx1 = Wd - 34, cx = Wd / 2, base = H - 2;
  const arch = (x: number) => Math.round(26 - 5 * (1 - ((x + 0.5 - cx) / (cx - gx0)) ** 2));
  for (let x = gx0; x < gx1; x++) {
    const top = arch(x);
    P(X + x, Y + top, 1, base - top, '#c3cdd3');
    P(X + x, Y + top - 1, 1, 2, RUST_D);
    if ((x - gx0) % 4 === 1) P(X + x, Y + top - 4, 1, 3, RUST_D); // spikes along the top
  }
  P(X + gx0, Y + 21, 1, base - 21, RUST_D); P(X + gx1 - 1, Y + 21, 1, base - 21, RUST_D);
  P(X + gx0, Y + base - 1, gx1 - gx0, 1, RUST_D);
  // rays from behind the birds out to the whole frame: up the left side, over the arch, down the right
  const ox = cx, oy = base - 16, rim: [number, number][] = [];
  for (let y = base - 3; y > arch(gx0) + 2; y -= 5) rim.push([gx0 + 1, y]);
  for (let x = gx0 + 3; x < gx1 - 3; x += 4) rim.push([x, arch(x) + 1]);
  for (let y = arch(gx1 - 1) + 3; y < base - 2; y += 5) rim.push([gx1 - 2, y]);
  for (const [tx, ty] of rim) {
    const n = Math.ceil(Math.max(Math.abs(tx - ox), Math.abs(ty - oy)));
    for (let k = 4; k <= n; k++) P(X + Math.round(ox + (tx - ox) * k / n), Y + Math.round(oy + (ty - oy) * k / n), 1, 1, RUST);
  }
  P(X + cx - 1, Y + arch(cx) , 2, base - arch(cx), RUST_D); // where the two wings meet
  // the two birds, beak to beak (the left one drawn, the right one its mirror image)
  const bird = (flip: boolean) => {
    const px = (x: number, y: number, w: number, h: number, c: string) => P(X + (flip ? Wd - x - w : x), Y + y, w, h, c);
    const by = base - 15;
    // outline first, then the rusty body
    px(37, by - 3, 4, 3, INK); px(38, by - 4, 2, 2, INK);                                  // tail
    px(39, by - 4, 14, 10, INK); px(41, by - 5, 10, 12, INK);                             // body
    px(49, by - 15, 5, 12, INK);                                                           // neck
    px(49, by - 18, 7, 5, INK); px(55, by - 17, 2, 2, INK);                                // head, beak
    px(38, by - 3, 2, 2, RUST); px(39, by - 3, 1, 1, RUST);
    px(40, by - 3, 12, 8, RUST); px(42, by - 4, 8, 10, RUST);
    px(50, by - 14, 3, 11, RUST);
    px(50, by - 17, 5, 3, RUST); px(55, by - 16, 1, 1, RUST_D);
    px(52, by - 16, 1, 1, '#f0ebe0');                                                      // eye
    px(43, by - 1, 7, 1, RUST_D); px(42, by + 1, 8, 1, RUST_D); px(44, by - 2, 4, 1, RUST_L); // wing
    px(50, by - 14, 1, 10, RUST_L);
    px(43, by + 6, 1, 4, RUST_D); px(47, by + 6, 1, 4, RUST_D); px(42, by + 9, 3, 1, RUST_D); px(46, by + 9, 3, 1, RUST_D); // feet
  };
  bird(false); bird(true);
  // the arched banner over it all: rusty steel, the name cut out of it
  const bx0 = 22, bx1 = Wd - 22;
  const band = (x: number) => Math.round(12 - 7 * (1 - ((x + 0.5 - cx) / (cx - bx0)) ** 2));
  for (let x = bx0 - 5; x < bx1 + 5; x++) {
    const tail = x < bx0 || x >= bx1;
    const y = tail ? band(x < bx0 ? bx0 : bx1 - 1) + 3 : band(x);
    P(X + x, Y + y - 1, 1, 11, INK);
    P(X + x, Y + y, 1, 9, tail ? RUST_D : RUST);
    if (!tail && x % 3 === 0) P(X + x, Y + y + 8, 1, 1, RUST_D);
  }
  const word = 'SISYPHOS', tw = word.length * 5;
  [...word].forEach((ch, i) => { const lx = Math.round(cx - tw / 2 + i * 5); pixelText(m, ch, X + lx, Y + band(lx + 1) + 2, '#f3e6c8'); });
}
export function drawClub(c: Club) {
  const X = c.x * T, Y = c.y * T, Wd = c.w * T, H = c.h * T;
  const base = ({ berghain: '#6c6a66', tresor: '#4c3532', kitkat: '#4f1d3b', rso: '#7a3a2c', heidegluehen: '#4a3420', katerblau: '#6a4a2c', sisyphos: '#5c4630', cdv: '#5a432d' } as Record<string, string>)[c.style];
  P(X, Y, Wd, H, INK);
  P(X + 1, Y + 1, Wd - 2, H - 2, base);
  P(X + 1, Y + 1, Wd - 2, 15, 'rgba(0,0,0,.28)');
  P(X + 1, Y + 15, Wd - 2, 1, 'rgba(255,255,255,.12)');
  switch (c.style) {
    case 'berghain':
      for (let i = T; i < Wd; i += T) P(X + i, Y + 16, 1, H - 17, '#5a5854');
      P(X + 1, Y + 48, Wd - 2, 2, '#5a5854');
      P(X + 10, Y + 22, Wd - 20, 10, INK);
      P(X + 11, Y + 23, Wd - 22, 8, '#c98b4a');
      for (let i = 0; i < Wd - 22; i += 3) P(X + 11 + i, Y + 23, 1, 8, '#8d5f33');
      for (let i = 0; i < c.w; i++) { if (i === Math.floor(c.w / 2)) continue; P(X + i * T + 7, Y + 54, 2, 30, '#1d1b22'); }
      P(X + 1, Y + 1, Wd - 2, 4, '#55534f');
      break;
    case 'tresor':
      for (let r = 16; r < H - 1; r += 4) { P(X + 1, Y + r, Wd - 2, 1, '#3d2a28'); for (let i = (r / 4) % 2 ? 4 : 0; i < Wd; i += 8) P(X + i, Y + r - 3, 1, 3, '#3d2a28'); }
      for (let i = 0; i + 2 <= c.w; i += 3) {
        const wx = X + i * T + 8, wy = Y + 22;
        P(wx - 1, wy - 1, 24, 32, INK); P(wx, wy, 22, 30, '#1e3646');
        P(wx + 7, wy, 1, 30, base); P(wx + 14, wy, 1, 30, base); P(wx, wy + 10, 22, 1, base); P(wx, wy + 20, 22, 1, base);
        P(wx + 1, wy + 1, 5, 8, '#2f5a76');
      }
      P(X + Wd - 14, Y - 14, 8, 16, INK); P(X + Wd - 13, Y - 13, 6, 14, '#5b403c');
      signText('TRESOR', X, Y, Wd, '#e8e8f0');
      break;
    case 'kitkat':
      for (let r = 20; r < H - 18; r += 8) for (let i = ((r / 8) % 2) * 4 + 3; i < Wd - 3; i += 8) P(X + i, Y + r, 2, 2, '#6d2a52');
      for (let i = 1; i < c.w - 1; i += 2) { circle(m, X + i * T + 8, Y + 34, 5, INK); circle(m, X + i * T + 8, Y + 34, 4, '#ff7ab8'); }
      signText('KITKAT', X, Y, Wd, '#ff8cc4');
      break;
    case 'rso': {
      // red brewery brick, tall arched factory windows, a brick chimney
      for (let r = 16; r < H - 1; r += 4) { P(X + 1, Y + r, Wd - 2, 1, '#5e2b20'); for (let i = (r / 4) % 2 ? 4 : 0; i < Wd; i += 8) P(X + i, Y + r - 3, 1, 3, '#5e2b20'); }
      for (let i = 0; i < c.w; i++) {
        if (i === Math.floor(c.w / 2)) continue;
        const wx = X + i * T + 4, wy = Y + 20;
        P(wx - 1, wy - 2, 10, 24, INK); P(wx, wy, 8, 21, '#2a1e1a'); circle(m, wx + 4, wy, 4, '#2a1e1a');
        if (rnd() < 0.5) P(wx + 1, wy + 8, 6, 2, '#ff8c42');
      }
      P(X + Wd - 16, Y - 22, 10, 24, INK); P(X + Wd - 15, Y - 21, 8, 22, '#8a3c2c');
      for (let r = 0; r < 22; r += 4) P(X + Wd - 15, Y - 21 + r, 8, 1, '#5e2b20');
      signText('RSO', X, Y, Wd, '#ff8c42');
      break;
    }
    case 'heidegluehen': {
      // a wooden fence with fairy lights, firelight glowing over it, a glass roof behind
      P(X + 1, Y + 1, Wd - 2, 14, '#9fc7d6'); for (let i = 0; i < Wd; i += 12) P(X + i, Y + 1, 1, 14, '#5a7a86');
      P(X + 1, Y + 8, Wd - 2, 1, '#5a7a86');
      for (let i = 2; i < Wd - 2; i += 4) P(X + i, Y + 16, 3, H - 17, i % 8 ? '#6b4a2e' : '#5a3d24');
      for (let i = 3; i < Wd - 3; i += 5) P(X + i, Y + 20 + ((i / 5 | 0) % 2), 2, 2, pick(['#ffd23f', '#ff8c42', '#fff2b0']));
      for (let i = 0; i < 3; i++) { const fx = X + 10 + i * 40; circle(m, fx, Y + 46, 7, 'rgba(255,140,40,.35)'); circle(m, fx, Y + 46, 3, '#ffb347'); }
      signText('HEIDEGLÜHEN', X, Y + 16, Wd, '#ffb347');
      break;
    }
    case 'katerblau':
      for (let i = 4; i < Wd; i += 4) P(X + i, Y + 16, 1, H - 17, '#59391f');
      for (let i = 2; i < Wd - 6; i += 7) {
        const col = ['#ff5e7a', '#ffd23f', '#5ec8ff', '#b6f36b'][(i / 7 | 0) % 4];
        P(X + i, Y + 17, 5, 2, col); P(X + i + 1, Y + 19, 3, 1, col); P(X + i + 2, Y + 20, 1, 1, col);
      }
      for (let i = 1; i < c.w - 1; i += 2) { if (i === Math.floor(c.w / 2)) continue; circle(m, X + i * T + 8, Y + 34, 4, INK); circle(m, X + i * T + 8, Y + 34, 3, '#7ec8ff'); }
      signText('KATER BLAU', X, Y, Wd, '#7ec8ff');
      break;
    case 'sisyphos':
      // the gate is the door: nothing else to draw
      drawSisyphosGate(X, Y, Wd, H);
      return;
    case 'cdv':
      for (let i = 4; i < Wd; i += 4) P(X + i, Y + 16, 1, H - 17, '#4a3522');
      P(X + 10, Y + 26, 14, 10, INK); P(X + 11, Y + 27, 12, 8, '#f2c45a');
      // the big tree hanging over the deck
      circle(m, X + Wd - 4, Y + 6, 15, INK);
      circle(m, X + Wd - 4, Y + 6, 14, '#2a5a3c');
      circle(m, X + Wd - 8, Y + 2, 7, '#3b7a50');
      for (let i = 0; i < 7; i++) P(X + Wd - 16 + i * 4, Y + 18, 1, 6 + (i % 3) * 3, '#2a5a3c');
      signText('CDV', X - 12, Y + 16, Wd, '#a6e3a1');
      break;
  }
  // door
  const dX = c.dx * T, dY = c.doorY * T;
  P(dX + 2, dY + 1, 12, 15, INK);
  P(dX + 3, dY + 2, 10, 14, '#0d0b12');
  P(dX + 6, dY - 1, 4, 2, INK); P(dX + 7, dY - 1, 2, 1, '#f2c45a');
}

export function prerender() {
  RT.seed = 1337;
  for (let y = 0; y < RT.MH; y++) for (let x = 0; x < RT.MW; x++) drawTile(x, y);
  drawRoadMarks();
  buildings.forEach(b => {
    if (b.kind === 'altbau') drawAltbau(b);
    else if (b.kind === 'station') drawStation(b);
    else if (b.kind === 'tower') drawTower(b);
    else if (b.kind === 'holzmarkt') drawHolzmarkt(b);
    else if (b.kind === 'kino') drawKino(b);
  });
  CLUBS.forEach(drawClub);
  buildInteriors();
  buildings.forEach(b => { if (b.kind === 'obtower') drawObTower(b); });
  drawMoleculeMan();
  drawStationBoard();
}

/* Holzmarkt 25 (researched): the cooperative village the Bar25 crew built on the Spree. A patchwork of wooden huts
   and kiosks from recycled wood, brightly painted houses, the restaurant on a wooden ship, all strung with lights;
   Haus 2+, clad all over in red wood, marks the entrance. Here it stands on the strip west of Görli, every front
   facing east to the road (seen sideways); the animated bits (lights, smoke, flags, people) are in render/draw.ts. */
export function drawHolzmarkt(b: Building) {
  const X = b.x * T, Y = b.y * T, W = b.w * T;
  P(X, Y, W, b.h * T, '#3f7a3a');
  // a hut seen from above with its front (door, window) on its east side; w, h in pixels
  const hut = (x: number, y: number, w: number, h: number, wall: string, roof: string, door = true) => {
    P(x, y, w, h, INK);
    P(x + 1, y + 1, w - 8, h - 2, roof);                                        // roof from above
    for (let i = y + 3; i < y + h - 2; i += 3) P(x + 1, i, w - 8, 1, 'rgba(0,0,0,.22)'); // corrugated / boards
    P(x + 1, y + 1, 2, h - 2, 'rgba(255,255,255,.12)');
    P(x + w - 7, y + 1, 6, h - 2, wall);                                        // the east wall, facing the road
    P(x + w - 7, y + 1, 1, h - 2, 'rgba(0,0,0,.3)');
    if (h > 18) P(x + w - 6, y + 3, 4, 4, '#ffd27a');                           // a lit window
    if (door) { P(x + w - 6, y + h - 11, 4, 8, INK); P(x + w - 5, y + h - 10, 2, 7, '#5a3420'); }
    P(x + w, y + 2, 2, h - 2, 'rgba(0,0,0,.25)');                               // shadow on the ground
  };
  // ---- Haus 2+: three storeys of vivid red wood at the north end ----
  const hy = Y + 2, hh = 58;
  P(X + 2, hy, W - 4, hh, INK); P(X + 3, hy + 1, W - 6, hh - 2, '#b8281f');
  for (let i = X + 5; i < X + W - 4; i += 3) P(i, hy + 1, 1, hh - 2, '#8e1c16');  // the red boards
  P(X + 3, hy + hh / 2 - 1, W - 6, 2, '#6e140f');                                // the roof ridge, north to south
  P(X + W - 12, hy + 1, 9, hh - 2, '#d23a2e');                                   // its east front, lit by the street
  for (let f = 0; f < 3; f++) { P(X + W - 10, hy + 5 + f * 16, 5, 7, INK); P(X + W - 9, hy + 6 + f * 16, 3, 5, '#ffcf6a'); } // a window per storey
  P(X + W - 11, hy + hh - 14, 7, 12, INK); P(X + W - 10, hy + hh - 13, 5, 11, '#3a1a10');   // the big door
  P(X + 2, hy + hh, W - 4, 3, 'rgba(0,0,0,.3)');
  // ---- the patchwork of huts and kiosks ----
  const py = Y + 66;
  hut(X + 2, py, 58, 34, '#2bb3a3', '#5a4a3a');
  hut(X + 62, py, 46, 26, '#f2c14e', '#6b4a2e');
  hut(X + 2, py + 36, 44, 40, '#e06b8a', '#4a3a3a');
  hut(X + 48, py + 28, 60, 22, '#58b368', '#7a5432');
  hut(X + 48, py + 52, 60, 24, '#c28cff', '#5a4a3a', false);
  P(X + 30, py + 6, 6, 6, INK); P(X + 31, py + 7, 4, 4, '#8a9098');             // a chimney (it smokes in draw.ts)
  P(X + 14, py + 10, 10, 6, '#3d6fb6'); P(X + 15, py + 11, 8, 1, '#7fb0ff');     // a patched-on solar panel
  // ---- the village square, open to the road, under strings of lights ----
  const sy = Y + 146, sh = 62;
  P(X + 2, sy, W - 4, sh, '#8a5a34'); for (let i = sy + 3; i < sy + sh; i += 4) P(X + 2, i, W - 4, 1, '#6b4a2e');
  P(X + 2, sy, W - 4, 2, '#4a3020'); P(X + 2, sy + sh - 2, W - 4, 2, '#4a3020'); P(X + 2, sy, 2, sh, '#4a3020'); // a low fence, open to the east
  circle(m, X + 26, sy + 30, 17, INK); circle(m, X + 26, sy + 30, 16, '#2f6b35'); circle(m, X + 22, sy + 25, 8, '#4f8f4a'); // the big tree
  P(X + 25, sy + 40, 3, 6, '#5a3a22');
  for (const [bx, by] of [[X + 52, sy + 12], [X + 52, sy + 44], [X + 80, sy + 28]] as const) { P(bx, by, 14, 5, INK); P(bx + 1, by + 1, 12, 3, '#a87a4a'); } // benches
  // (the HOLZMARKT sign over the square is drawn on top of the lights, in render/draw.ts)
  // ---- Katerschmaus: the restaurant on a wooden ship ----
  const ky = Y + 214, kh = 62;
  m.fillStyle = INK; m.beginPath(); m.moveTo(X + 8, ky); m.lineTo(X + W - 8, ky); m.lineTo(X + W - 4, ky + kh - 16); m.lineTo(X + W / 2, ky + kh); m.lineTo(X + 4, ky + kh - 16); m.closePath(); m.fill();
  m.fillStyle = '#7a4a2a'; m.beginPath(); m.moveTo(X + 9, ky + 1); m.lineTo(X + W - 9, ky + 1); m.lineTo(X + W - 5, ky + kh - 16); m.lineTo(X + W / 2, ky + kh - 2); m.lineTo(X + 5, ky + kh - 16); m.closePath(); m.fill();
  P(X + 14, ky + 6, W - 28, kh - 26, '#a87a4a'); for (let i = ky + 9; i < ky + kh - 20; i += 4) P(X + 14, i, W - 28, 1, '#8a6038'); // the deck
  for (let i = 0; i < 4; i++) { const ty = ky + 10 + i * 9; P(X + 22, ty, 10, 6, INK); P(X + 23, ty + 1, 8, 4, '#f3eee3'); P(X + 46, ty, 10, 6, INK); P(X + 47, ty + 1, 8, 4, '#f3eee3'); } // tables
  for (let i = 0; i < 4; i++) { circle(m, X + W - 10, ky + 8 + i * 11, 3, INK); circle(m, X + W - 10, ky + 8 + i * 11, 2, '#ffd27a'); } // portholes, east side
  P(X + 72, ky + 4, 2, 40, '#3a2616');                                           // the mast (its flags flutter in draw.ts)
  // ---- the lookout tower and a painted container at the south end ----
  const ty = Y + 282;
  P(X + 6, ty, 30, 34, INK); P(X + 7, ty + 1, 28, 32, '#6b4a2e'); P(X + 9, ty + 3, 24, 28, '#8a5a34'); P(X + 9, ty + 3, 24, 2, '#a87a4a');
  P(X + 20, ty - 6, 2, 10, '#3a2616');                                           // the flagpole
  P(X + 42, ty + 6, 64, 26, INK); P(X + 43, ty + 7, 62, 24, '#3d5f94');
  for (let i = X + 45; i < X + 104; i += 4) P(i, ty + 7, 1, 24, '#2e4c7a');     // the container's ribs
  const tags = ['#ff5e7a', '#ffd23f', '#b6f36b', '#f3eee3'];
  for (let i = 0; i < 6; i++) P(X + 48 + i * 9, ty + 12 + (i % 3) * 4, 6, 2, tags[i % 4]); // graffiti
}


/* Freiluftkino Kreuzberg (researched: the open-air cinema in the Bethanien courtyard at Mariannenplatz, films in the
   original language with subtitles; moved here, east of Görli, and dramatised). Seen from above: the big screen on
   its scaffold at the north end with the marquee under it, rows of deckchairs facing it, the projection booth at the
   back, a popcorn kiosk, bikes. The gate in the west fence faces the road. The film, the beam, the audience and the
   usher are drawn each frame in render/draw.ts (drawKinoLife). */
export function drawKino(b: Building) {
  const X = b.x * T, Y = b.y * T, W = b.w * T, H = b.h * T;
  P(X, Y, W, H, '#3f7a3a');
  // the gravel courtyard inside a low brick wall, with the gate on the road side
  P(X + 1, Y + 1, W - 2, H - 2, INK); P(X + 2, Y + 2, W - 4, H - 4, '#7a4a3a');
  P(X + 4, Y + 4, W - 8, H - 8, '#34303a');
  for (let i = 0; i < 260; i++) P(X + 4 + Math.floor(rnd() * (W - 9)), Y + 4 + Math.floor(rnd() * (H - 9)), 1, 1, rnd() < 0.5 ? '#3e3a46' : '#2c2832');
  P(X, Y + 150, 5, 26, '#34303a'); P(X + 1, Y + 148, 3, 2, INK); P(X + 1, Y + 176, 3, 2, INK); // the gate
  // the aisle along the west side, with little floor lights
  P(X + 4, Y + 94, 14, 164, '#45404c');
  for (let y = Y + 100; y < Y + 256; y += 16) P(X + 5, y, 1, 1, '#ffb84a');
  // the screen on its scaffold, the speakers either side (the picture itself is drawn each frame)
  P(X + 12, Y + 58, 3, 14, INK); P(X + 97, Y + 58, 3, 14, INK);
  P(X + 5, Y + 3, 102, 60, INK); P(X + 6, Y + 4, 100, 58, '#0d0b12'); P(X + 8, Y + 6, 96, 54, '#1a1a22');
  for (const sx of [X + 4, X + 98]) {
    P(sx, Y + 56, 10, 15, INK); P(sx + 1, Y + 57, 8, 13, '#26242e');
    circle(m, sx + 5, Y + 60, 2, '#4a4852'); circle(m, sx + 5, Y + 66, 3, '#4a4852'); P(sx + 5, Y + 66, 1, 1, INK);
  }
  // the marquee under the screen (its bulbs chase in draw.ts)
  P(X + 4, Y + 72, W - 8, 20, INK); P(X + 5, Y + 73, W - 10, 18, '#7a1420'); P(X + 5, Y + 75, W - 10, 1, '#c99a20'); P(X + 5, Y + 88, W - 10, 1, '#c99a20');
  m.save(); m.translate(X + 9, Y + 77); m.scale(2, 2); pixelText(m, 'FREILUFTKINO', 0, 0, '#ffe9a8'); m.restore();
  // the projection booth at the back: a wooden hut, its window (the lens) looking north over the audience
  P(X + 42, Y + 260, 32, 34, INK); P(X + 43, Y + 261, 30, 32, '#6b4a2e');
  for (let i = X + 45; i < X + 72; i += 3) P(i, Y + 265, 1, 27, '#5a3c24');
  P(X + 43, Y + 261, 30, 3, '#4a3020'); P(X + 52, Y + 260, 12, 6, INK); P(X + 53, Y + 261, 10, 4, '#3a3028');
  pixelText(m, '35MM', X + 51, Y + 280, '#f2c14e');
  // the popcorn kiosk, a red and white awning
  P(X + 4, Y + 264, 32, 30, INK); P(X + 5, Y + 265, 30, 28, '#f3eee3');
  for (let i = 0; i < 5; i++) P(X + 5 + i * 6, Y + 265, 3, 7, '#c4162a');
  P(X + 5, Y + 272, 30, 1, INK); pixelText(m, 'POPCORN', X + 7, Y + 275, '#c4162a');
  P(X + 8, Y + 283, 24, 8, INK); P(X + 9, Y + 284, 22, 6, '#ffd96a');
  for (let i = 0; i < 8; i++) P(X + 10 + Math.floor(rnd() * 20), Y + 285 + Math.floor(rnd() * 4), 2, 1, '#fff8e0'); // popcorn in the machine
  // a big chestnut tree in the corner
  circle(m, X + 92, Y + 276, 15, INK); circle(m, X + 92, Y + 276, 14, '#2f6b35'); circle(m, X + 88, Y + 271, 7, '#4f8f4a');
  // bikes, of course, at the back wall
  P(X + 8, Y + 304, W - 16, 1, '#8a9098');
  const BIKES = ['#c94a3a', '#3d6fb6', '#f3eee3', '#58b368', '#ffd23f', '#14121c'];
  for (let i = 0; i < 6; i++) {
    const bx = X + 10 + i * 16, c = BIKES[i];
    circle(m, bx + 2, Y + 310, 3, INK); circle(m, bx + 11, Y + 310, 3, INK); circle(m, bx + 2, Y + 310, 1, '#34303a'); circle(m, bx + 11, Y + 310, 1, '#34303a');
    P(bx + 2, Y + 307, 9, 1, c); P(bx + 5, Y + 305, 1, 3, c); P(bx + 10, Y + 304, 2, 1, INK);
  }
}

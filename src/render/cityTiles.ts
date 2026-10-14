import { buildInteriors } from '../interiors/build';
import { CLUBS } from '../data/clubs';
import { TOWER, buildings, roads } from '../world/city';
import { get } from '../world/grid';
import { INK, circle, pick, rnd } from '../util';
import { B, BR, C, D, DK, F, G, R, RL, S, SA, T, TR, W } from '../world/tiles';
import { RT } from '../core/runtime';
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
    m.fillText(sh.label, Math.round(X + Wd / 2 - tw / 2), sy - 5);
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
export function drawClub(c: Club) {
  const X = c.x * T, Y = c.y * T, Wd = c.w * T, H = c.h * T;
  const base = ({ berghain: '#6c6a66', tresor: '#4c3532', kitkat: '#4f1d3b', aboutblank: '#55555f', katerblau: '#6a4a2c', sisyphos: '#5c4630', cdv: '#5a432d' } as Record<string, string>)[c.style];
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
    case 'aboutblank': {
      const cols = ['#b6f36b', '#ff5e7a', '#5ec8ff', '#ffd23f', '#c28cff', '#ffffff'];
      for (let i = 0; i < 60; i++) {
        const gx = X + 2 + Math.floor(rnd() * (Wd - 10)), gy = Y + 18 + Math.floor(rnd() * (H - 22));
        const col = pick(cols);
        P(gx, gy, 2 + Math.floor(rnd() * 6), 2, col);
        if (rnd() < 0.5) P(gx + 1, gy - 2, 2, 2, col);
      }
      signText('ABOUT BLANK', X, Y, Wd, '#ffffff');
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
      for (let r = 19; r < H - 1; r += 4) P(X + 1, Y + r, Wd - 2, 1, '#4b3826');
      for (const ly of [20, 34]) for (let i = 3; i < Wd - 3; i += 5) P(X + i, Y + ly + ((i / 5 | 0) % 2), 2, 2, pick(['#ffd36b', '#ff7a5a', '#7ec8ff', '#b6f36b']));
      signText('SISYPHOS', X, Y, Wd, '#ffd36b');
      break;
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
  });
  CLUBS.forEach(drawClub);
  buildInteriors();
  buildings.forEach(b => { if (b.kind === 'obtower') drawObTower(b); });
}

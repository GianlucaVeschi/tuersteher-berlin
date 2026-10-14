import type { Entity } from '../types';
import { SHOPS } from '../data/outfits';
import { CLUB_SHORT, zoomLevel } from './zoom';
import { towerC } from './cityTiles';
import { TOWER } from '../world/city';
import { lookOf } from './looks';
import { person } from './sprites';
import { INK, reduceMotion } from '../util';
import { CLUBS } from '../data/clubs';
import { drawInteriorFx } from '../interiors/fx';
import { inClub } from '../world/scenes';
import { ctx } from './canvas';
import { RT } from '../core/runtime';
import { T, W } from '../world/tiles';
import { player, state } from '../core/state';
export const train = { x: -400, wait: 2500 };

/** Player position in pixels, including the walk in progress. */
export function playerPx(): [number, number] {
  if (!player.moving) return [player.x * T, player.y * T];
  const k = player.t / player.dur;
  return [Math.round((player.x + (player.tx - player.x) * k) * T), Math.round((player.y + (player.ty - player.y) * k) * T)];
}
/** Draws the current scene at the world scale; returns [camX, camY, ppx, ppy]. */
export function drawWorld(now: number): [number, number, number, number] {
  const [ppx, ppy] = playerPx();
  // Small rooms are centred; big maps follow the player.
  const camX = RT.MW * T <= RT.VW ? Math.round((RT.MW * T - RT.VW) / 2) : Math.max(0, Math.min(RT.MW * T - RT.VW, ppx + 8 - RT.VW / 2));
  const camY = RT.MH * T <= RT.VH ? Math.round((RT.MH * T - RT.VH) / 2) : Math.max(0, Math.min(RT.MH * T - RT.VH, ppy + 8 - RT.VH / 2));
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, RT.VW, RT.VH);
  ctx.drawImage(RT.mc, -camX, -camY);

  if (inClub()) { drawInteriorFx(now, camX, camY, ppx, ppy); return [camX, camY, ppx, ppy]; }
  // water shimmer
  const tick = Math.floor(now / 450);
  const x0 = Math.max(0, Math.floor(camX / T)), y0 = Math.max(0, Math.floor(camY / T));
  for (let y = y0; y <= y0 + RT.VH / T + 1 && y < RT.MH; y++) for (let x = x0; x <= x0 + RT.VW / T + 1 && x < RT.MW; x++) {
    if (RT.map[y][x] !== W) continue;
    const k = (x * 5 + y * 3 + tick) % 7;
    if (k < 2) {
      ctx.fillStyle = k ? '#5d86c4' : '#8fb4e8';
      ctx.fillRect(x * T - camX + ((x * 7 + k * 5 + tick) % 11) + 1, y * T - camY + ((y * 11 + x) % 10) + 3, 3, 1);
    }
  }

  // club doors
  CLUBS.forEach(c => {
    const dx = c.dx * T - camX, dy = c.doorY * T - camY;
    if (dx < -16 || dy < -16 || dx > RT.VW || dy > RT.VH) return;
    if (state.stamps[c.id]) {
      const pulse = 0.55 + 0.45 * Math.sin(now / (reduceMotion ? 1e9 : 160));
      ctx.globalAlpha = pulse; ctx.fillStyle = c.glow; ctx.fillRect(dx + 3, dy + 2, 10, 14);
      ctx.globalAlpha = 1; ctx.fillStyle = '#0d0b12'; ctx.fillRect(dx + 5, dy + 6, 2, 3); ctx.fillRect(dx + 9, dy + 4, 2, 3);
    } else if (Math.floor(now / 1200 + c.dx) % 3 !== 0) {
      ctx.fillStyle = c.glow; ctx.fillRect(dx + 4, dy + 15, 8, 1);
    }
  });
  // S-Bahn
  if (train.wait <= 0) {
    ctx.save();
    ctx.beginPath(); ctx.rect(13 * T - camX, 0, RT.VW + RT.MW * T, RT.VH); ctx.clip();
    for (let i = 0; i < 3; i++) {
      const tx = Math.round(train.x) + i * 44 - camX, ty = T + 2 - camY;
      ctx.fillStyle = INK; ctx.fillRect(tx - 1, ty - 1, 44, 14);
      ctx.fillStyle = '#e0a83a'; ctx.fillRect(tx, ty, 42, 6);
      ctx.fillStyle = '#a8323a'; ctx.fillRect(tx, ty + 6, 42, 6);
      ctx.fillStyle = '#26223a'; ctx.fillRect(tx + 3, ty + 2, 36, 3);
      ctx.fillStyle = '#f2d06b'; for (let j = 5; j < 38; j += 7) ctx.fillRect(tx + j, ty + 2, 2, 2);
    }
    ctx.restore();
  }
  // entities + player sorted by row
  const list: { e: Entity | null; y: number }[] = RT.ents.map(e => ({ e, y: e.y }));
  list.push({ e: null, y: ppy / T });
  list.sort((a, b) => a.y - b.y);
  list.forEach(({ e }) => {
    if (!e) {
      const step = player.moving ? (player.t < player.dur / 2 ? (player.n % 2) + 1 : 0) : 0;
      person(ctx, ppx - camX, ppy - camY - 3, player.dir, step, lookOf(state.outfit));
      return;
    }
    const X = e.x * T - camX + Math.round(e.ox || 0), Y = e.y * T - camY;
    if (X < -16 || Y < -24 || X > RT.VW || Y > RT.VH + 8) return;
    if (e.kind === 'sign') {
      ctx.fillStyle = INK; ctx.fillRect(X + 7, Y + 8, 2, 8); ctx.fillRect(X + 1, Y + 1, 14, 9);
      ctx.fillStyle = '#b08a52'; ctx.fillRect(X + 2, Y + 2, 12, 7);
      ctx.fillStyle = '#7d5f35'; ctx.fillRect(X + 4, Y + 4, 8, 1); ctx.fillRect(X + 4, Y + 6, 6, 1);
    } else if (e.look) {
      person(ctx, X, Y - 3, e.dir ?? 'down', 0, e.look);
    }
  });
  // Fernsehturm upper part, drawn in front of everything north of it
  const tX = TOWER.x * T - camX, tY = TOWER.top * T - camY, fy = (TOWER.y - TOWER.top) * T;
  if (towerC.width && tX > -towerC.width && tX < RT.VW && tY < RT.VH) {
    ctx.drawImage(towerC, 0, 0, towerC.width, fy, tX, tY, towerC.width, fy);
    if (Math.floor(now / 700) % 2 === 0) { ctx.fillStyle = '#ff3b3b'; ctx.fillRect(tX + towerC.width / 2 - 1, tY + 3, 2, 2); }
  }
  return [camX, camY, ppx, ppy];
}
let chipRects: { x: number; y: number; w: number; h: number }[] = [];
/** A name label on the zoomed-out map, nudged down if it would overlap another. */
export function chip(text: string, x: number, y: number, bg: string, fg: string, size: number) {
  ctx.font = size + 'px "Press Start 2P", monospace'; ctx.textBaseline = 'top';
  const w = Math.ceil(ctx.measureText(text).width) + 6, h = size + 6;
  const X = Math.round(Math.max(1, Math.min(RT.VW - w - 1, x - w / 2)));
  let Y = Math.round(Math.max(1, Math.min(RT.VH - h - 1, y - h)));
  // nudge down until it no longer overlaps a label drawn earlier this frame
  for (let i = 0; i < 6 && chipRects.some(r => X < r.x + r.w + 2 && X + w + 2 > r.x && Y < r.y + r.h + 2 && Y + h + 2 > r.y); i++) Y += h + 3;
  chipRects.push({ x: X, y: Y, w, h });
  ctx.fillStyle = INK; ctx.fillRect(X - 1, Y - 1, w + 2, h + 2);
  ctx.fillStyle = bg; ctx.fillRect(X, Y, w, h);
  ctx.fillStyle = fg; ctx.fillText(text, X + 3, Y + 3);
}
export function draw(now: number) {
  const z = zoomLevel();
  const realW = RT.VW, realH = RT.VH;
  // draw the world at scale z: everything inside treats VW/VH as the visible world size
  RT.VW = realW / z; RT.VH = realH / z;
  ctx.setTransform(z, 0, 0, z, 0, 0);
  ctx.imageSmoothingEnabled = z < 1;
  let cam;
  try { cam = drawWorld(now); } finally {
    RT.VW = realW; RT.VH = realH;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }
  if (z >= 0.9) return;
  // zoomed out: label clubs and shops, and mark the player
  const [camX, camY, ppx, ppy] = cam;
  const sx = (wx: number) => (wx - camX) * z, sy = (wy: number) => (wy - camY) * z;
  const size = RT.VW < 260 ? 6 : 8;
  chipRects = [];
  if (!inClub()) {
    // clubs on the roof, shops at the shopfront (smaller), so neighbours don't collide
    CLUBS.forEach(c => chip((state.stamps[c.id] ? '✓ ' : '') + CLUB_SHORT[c.id], sx((c.x + c.w / 2) * T), sy(c.y * T + 4), c.glow, INK, size));
    SHOPS.forEach(sh => chip(sh.label, sx((sh.x + sh.w / 2) * T), sy((sh.y + sh.h) * T) + size + 6, '#f3eee3', INK, Math.max(6, size - 2)));
  }
  const px = sx(ppx + 8), py = sy(ppy + 2);
  const pulse = reduceMotion ? 1 : 0.6 + 0.4 * Math.sin(now / 180);
  ctx.strokeStyle = `rgba(255,77,109,${pulse})`; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(px, sy(ppy + 8), Math.max(6, 10 * z) + 3 * pulse, 0, Math.PI * 2); ctx.stroke();
  chip('YOU', px, py - 6, '#ff4d6d', '#fff', size);
}

import { PLACES } from '../data/places';
import { PIXEL_H, pixelText, pixelTextWidth } from './pixelFont';
import type { Entity } from '../types';
import { SHOPS } from '../data/outfits';
import { CLUB_SHORT, zoom, zoomLevel } from './zoom';
import { towerC } from './cityTiles';
import { GORLI, HOLZMARKT, KINO, TOWER } from '../world/city';
import { drawKinoLife } from './kino';
import { lookOf } from './looks';
import { person } from './sprites';
import { INK, reduceMotion } from '../util';
import { CLUBS } from '../data/clubs';
import { drawInteriorFx } from '../interiors/fx';
import { inClub } from '../world/scenes';
import { MOBILE, PX, ctx } from './canvas';
import { RT } from '../core/runtime';
import { GRL, T, W } from '../world/tiles';
import { player, state } from '../core/state';
/** The S-Bahn: x position, ms until the next one comes, ms left standing at the station, stopped there yet this run. */
/** The player's position on screen: 0..1 across and down the visible view. */
export const playerOnScreen = { x: 0.5, y: 0.5 };
export const train = { x: -400, wait: 2500, dwell: 0, served: false };

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
      // DB logo: red letters on white inside a red frame, with a pixel of white around the letters
      // (without it the eye reads the gaps as the letters)
      ctx.fillStyle = '#ec0016'; ctx.fillRect(tx + 15, ty + 2, 11, 9);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(tx + 16, ty + 3, 9, 7);
      pixelText(ctx, 'DB', tx + 17, ty + 4, '#ec0016');
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
    const X = e.x * T - camX + Math.round(e.ox || 0), Y = e.y * T - camY + Math.round(e.oy || 0);
    if (X < -16 || Y < -24 || X > RT.VW || Y > RT.VH + 8) return;
    if (e.kind === 'sign') {
      ctx.fillStyle = INK; ctx.fillRect(X + 7, Y + 8, 2, 8); ctx.fillRect(X + 1, Y + 1, 14, 9);
      ctx.fillStyle = '#b08a52'; ctx.fillRect(X + 2, Y + 2, 12, 7);
      ctx.fillStyle = '#7d5f35'; ctx.fillRect(X + 4, Y + 4, 8, 1); ctx.fillRect(X + 4, Y + 6, 6, 1);
    } else if (e.kind === 'column') {
      // Litfaßsäule: green dome and base, a round column wrapped in posters, a little taller than a person
      ctx.fillStyle = INK; ctx.fillRect(X + 2, Y - 5, 12, 21); ctx.fillRect(X + 4, Y - 8, 8, 3);
      ctx.fillStyle = '#2f6b4f'; ctx.fillRect(X + 5, Y - 7, 6, 2); ctx.fillRect(X + 3, Y - 4, 10, 2); ctx.fillRect(X + 3, Y + 13, 10, 2);
      ctx.fillStyle = '#e9e2cf'; ctx.fillRect(X + 3, Y - 2, 10, 15);
      ctx.fillStyle = '#d6453d'; ctx.fillRect(X + 4, Y - 1, 4, 5);
      ctx.fillStyle = '#f2c14e'; ctx.fillRect(X + 8, Y - 1, 4, 3); ctx.fillRect(X + 4, Y + 7, 3, 5);
      ctx.fillStyle = '#3d6fb6'; ctx.fillRect(X + 8, Y + 3, 4, 4);
      ctx.fillStyle = INK; ctx.fillRect(X + 4, Y + 5, 3, 1); ctx.fillRect(X + 8, Y + 8, 4, 1); ctx.fillRect(X + 8, Y + 10, 3, 1);
      // rounding: darker right edge
      ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(X + 11, Y - 2, 2, 15);
    } else if (e.kind === 'animal') {
      drawAnimal(e, X, Y, now);
    } else if (e.look && e.move) {
      drawMover(e, X, Y, now);
    } else if (e.look) {
      // legs move while sliding to the next tile
      const off = Math.abs(e.ox || 0) + Math.abs(e.oy || 0), step = off ? (Math.floor(off / 8) % 2) + 1 : 0;
      ctx.globalAlpha = e.alpha ?? 1;
      person(ctx, X, Y - 3, e.dir ?? 'down', step, e.look);
      ctx.globalAlpha = 1;
    }
  });
  drawSmoke(now, camX, camY);
  drawHolzmarktLife(now, camX, camY);
  drawKinoLife(now, camX, camY);
  // Fernsehturm upper part, drawn in front of everything north of it
  const tX = TOWER.x * T - camX, tY = TOWER.top * T - camY, fy = (TOWER.y - TOWER.top) * T;
  if (towerC.width && tX > -towerC.width && tX < RT.VW && tY < RT.VH) {
    ctx.drawImage(towerC, 0, 0, towerC.width, fy, tX, tY, towerC.width, fy);
    if (Math.floor(now / 700) % 2 === 0) { ctx.fillStyle = '#ff3b3b'; ctx.fillRect(tX + towerC.width / 2 - 1, tY + 3, 2, 2); }
  }
  return [camX, camY, ppx, ppy];
}
/** The animals at the Görli children's farm, facing left or right, nibbling now and then. */
function drawAnimal(e: Entity, X: number, Y: number, now: number) {
  const nib = !reduceMotion && Math.floor(now / 900 + e.x) % 4 === 0 ? 1 : 0, L = e.dir === 'left';
  const hx = L ? X : X + 11;
  if (e.species === 'rabbit') {
    ctx.fillStyle = INK; ctx.fillRect(X + 4, Y + 9, 8, 6);
    ctx.fillStyle = '#c9b8a0'; ctx.fillRect(X + 5, Y + 10, 6, 4); ctx.fillStyle = INK; ctx.fillRect(L ? X + 3 : X + 10, Y + 6 + nib, 3, 5);
    ctx.fillStyle = '#c9b8a0'; ctx.fillRect(L ? X + 4 : X + 11, Y + 4 + nib, 1, 3); ctx.fillStyle = '#f3eee3'; ctx.fillRect(L ? X + 11 : X + 4, Y + 11, 2, 2);
    return;
  }
  const big = e.species === 'donkey';
  const body = e.species === 'goat' ? '#e8e0d0' : e.species === 'sheep' ? '#f3eee3' : '#8a8494';
  ctx.fillStyle = INK; ctx.fillRect(X + 3, Y + 11, 2, 4); ctx.fillRect(X + 10, Y + 11, 2, 4);
  ctx.fillRect(X + 2, Y + (big ? 3 : 4), 12, big ? 9 : 8);
  ctx.fillStyle = body; ctx.fillRect(X + 3, Y + (big ? 4 : 5), 10, big ? 7 : 6);
  if (e.species === 'goat') { ctx.fillStyle = '#8a5a3a'; ctx.fillRect(X + 5, Y + 6, 4, 3); }
  ctx.fillStyle = e.species === 'sheep' ? INK : body; ctx.fillRect(hx, Y + 4 + nib, 5, 4);
  ctx.fillStyle = INK; ctx.fillRect(hx, Y + 4 + nib, 5, 1);
  if (e.species === 'donkey') { ctx.fillRect(hx + 1, Y - 1 + nib, 1, 5); ctx.fillRect(hx + 3, Y - 1 + nib, 1, 5); }
  if (e.species === 'goat') { ctx.fillStyle = '#c9c0a8'; ctx.fillRect(hx + 1, Y + 1 + nib, 1, 3); ctx.fillRect(hx + 3, Y + 1 + nib, 1, 3); }
}

/** Grill smoke in Görli: grey puffs rising and drifting from every grill on screen, embers glowing. */
let grills: [number, number][] | null = null;
/** Street people who keep doing something on the spot (Görli). They stop and face you when you come close,
 *  so you can talk; with reduced motion they just stand there.
 *  skate: rolling back and forth on a skateboard, an ollie at each end (up the ramp)
 *  dribble: bouncing a basketball, shuffling a little
 *  run: running back and forth after a football
 *  hop: jumping up and down (the activists chanting) */
function drawMover(e: Entity, X: number, Y: number, now: number) {
  const look = e.look;
  if (!look) return;
  const near = Math.abs(player.x - e.x) + Math.abs(player.y - e.y) <= 2;
  const moving = !reduceMotion && !near, t = now / 1000 + e.x * 0.7 + e.y * 1.3;
  const facing = near ? (player.x < e.x ? 'left' : player.x > e.x ? 'right' : player.y < e.y ? 'up' : 'down') : e.dir ?? 'down';
  if (e.move === 'skate') {
    const s = moving ? Math.sin(t * 0.9) : 0, v = moving ? Math.cos(t * 0.9) : 0;
    const dx = Math.round(s * 22), lift = moving && Math.abs(s) > 0.93 ? Math.round((Math.abs(s) - 0.93) * 90) : 0; // an ollie at each end
    const PX0 = X + dx, dir = moving ? (v > 0 ? 'right' : 'left') : facing;
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(PX0 + 2, Y + 14, 12, 2);
    ctx.fillStyle = INK; ctx.fillRect(PX0 + 1, Y + 11 - lift, 14, 3);
    ctx.fillStyle = '#c94a3a'; ctx.fillRect(PX0 + 2, Y + 11 - lift, 12, 1);                  // the deck
    ctx.fillStyle = '#f3eee3'; ctx.fillRect(PX0 + 3, Y + 13 - lift, 2, 2); ctx.fillRect(PX0 + 11, Y + 13 - lift, 2, 2); // wheels
    person(ctx, PX0, Y - 6 - lift, dir, 0, look);
    return;
  }
  if (e.move === 'dribble') {
    const dx = moving ? Math.round(Math.sin(t * 0.6) * 5) : 0, bounce = moving ? Math.abs(Math.sin(t * 5)) : 0.4;
    const side = (e.dir === 'left' ? -1 : 1), bx = X + dx + (side > 0 ? 13 : -1), by = Y + 11 - Math.round(bounce * 9);
    person(ctx, X + dx, Y - 3, facing, moving ? (Math.floor(now / 240 + e.x) % 2) + 1 : 0, look);
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(bx, Y + 14, 4, 1);
    ctx.fillStyle = INK; ctx.fillRect(bx - 1, by - 1, 6, 6); ctx.fillStyle = '#e07a2a'; ctx.fillRect(bx, by, 4, 4); ctx.fillStyle = INK; ctx.fillRect(bx + 1, by, 1, 4);
    return;
  }
  if (e.move === 'run') {
    const s = moving ? Math.sin(t * 1.1) : 0, v = moving ? Math.cos(t * 1.1) : 0, dx = Math.round(s * 14);
    const dir = moving ? (v > 0 ? 'right' : 'left') : facing;
    person(ctx, X + dx, Y - 3, dir, moving ? (Math.floor(now / 140 + e.x) % 2) + 1 : 0, look);
    if (e.npcId === 'gorli-kick1') { // the one with the ball
      const bx = X + dx + (v > 0 ? 14 : -2), by = Y + 11;
      ctx.fillStyle = INK; ctx.fillRect(bx - 1, by - 1, 5, 5); ctx.fillStyle = '#f3eee3'; ctx.fillRect(bx, by, 3, 3); ctx.fillStyle = INK; ctx.fillRect(bx + 1, by + 1, 1, 1);
    }
    return;
  }
  if (e.move === 'sway') { // sunbathers: shift about slowly and look round now and then
    const dx = moving ? Math.round(Math.sin(t * 0.5) * 2) : 0;
    const dir = moving ? (['down', e.dir ?? 'down', 'down', e.dir === 'left' ? 'right' : 'left'] as const)[Math.floor(t / 3) % 4] : facing;
    person(ctx, X + dx, Y - 3, dir, 0, look);
    return;
  }
  // hop
  const lift = moving ? Math.max(0, Math.round(Math.sin(t * 5) * 3)) : 0;
  person(ctx, X, Y - 3 - lift, facing, 0, look);
}

/** Holzmarkt's moving bits, over its drawing in render/cityTiles.ts: strings of lights over the village square
 *  twinkling, smoke from a hut's chimney, bunting on the ship's mast and the flag on the tower fluttering, and a
 *  few people hanging out in the square. Everything holds still with reduced motion. */
const HZ_PEOPLE = [
  { dx: 58, dy: 176, look: { skin: '#f3c9a8', hair: '#c9a24a', top: '#ff8cc4', legs: '#2b3f6b', long: true }, dance: true },
  { dx: 78, dy: 186, look: { skin: '#8d5a3b', hair: '#111111', top: '#f2c14e', legs: '#26242e' }, dance: true },
  { dx: 62, dy: 198, look: { skin: '#e2b08c', hair: '#5a3a22', top: '#58b368', legs: '#3a3a4a', beard: '#5a3a22' }, dance: false },
  { dx: 94, dy: 178, look: { skin: '#f0c7a0', hair: '#b04a2a', top: '#5ec8ff', legs: '#26242e', long: true, flowers: ['#ff5e7a', '#ffd23f'] }, dance: true }
];
function drawHolzmarktLife(now: number, camX: number, camY: number) {
  const X = HOLZMARKT.x * T - camX, Y = HOLZMARKT.y * T - camY, W = HOLZMARKT.w * T;
  if (X > RT.VW || Y > RT.VH || X + W < 0 || Y + HOLZMARKT.h * T < 0) return;
  const moving = !reduceMotion, t = now / 1000;
  // people in the square
  HZ_PEOPLE.forEach((p, i) => {
    const beat = moving && p.dance ? Math.floor(now / 260 + i * 1.7) : 0;
    person(ctx, X + p.dx - 8, Y + p.dy - 12 - (beat % 2), p.dance ? (['down', 'left', 'down', 'right'] as const)[Math.floor(now / 900 + i) % 4] : 'left', p.dance ? (beat % 2) + 1 : 0, p.look);
  });
  // strings of lights across the square, sagging a little
  const COLS = ['#ffd23f', '#ff5e7a', '#5ec8ff', '#b6f36b', '#fff2c8'];
  for (let s = 0; s < 3; s++) {
    const y0 = Y + 150 + s * 20;
    for (let i = 0; i <= 12; i++) {
      const k = i / 12, lx = X + 4 + k * (W - 8), ly = y0 + Math.sin(k * Math.PI) * 6;
      const on = !moving || (Math.floor(now / 400) + i + s) % 4 !== 0;
      ctx.fillStyle = 'rgba(40,30,20,.6)'; ctx.fillRect(Math.round(lx), Math.round(ly) - 1, 3, 1);
      ctx.fillStyle = on ? COLS[(i + s) % COLS.length] : '#3a3028'; ctx.fillRect(Math.round(lx), Math.round(ly), 2, 2);
    }
  }
  // smoke from the chimney on the turquoise hut
  for (let i = 0; i < 4; i++) {
    const k = moving ? ((t * 0.5 + i / 4) % 1) : i / 4;
    ctx.fillStyle = `rgba(200,200,205,${(0.45 * (1 - k)).toFixed(2)})`;
    ctx.fillRect(Math.round(X + 32 + Math.sin(k * 6 + i) * 3), Math.round(Y + 104 - k * 22), 3, 3);
  }
  // bunting from the ship's mast, and the flag on the tower
  const BUNT = ['#ff5e7a', '#ffd23f', '#5ec8ff', '#b6f36b', '#c28cff'];
  for (let i = 0; i < 6; i++) {
    const fx = X + 74 + i * 5, fy = Y + 219 + i * 2, w = moving ? Math.round(Math.sin(t * 4 + i) * 1) : 0;
    ctx.fillStyle = BUNT[i % BUNT.length]; ctx.fillRect(fx, fy + w, 3, 3); ctx.fillRect(fx + 1, fy + 3 + w, 1, 1);
  }
  // the HOLZMARKT sign over the village square, twice the size of the little map font, on top of everything
  const label = 'HOLZMARKT', tw = (label.length * 4 - 1) * 2, bx = X + W - tw - 10, by = Y + 134;
  ctx.fillStyle = INK; ctx.fillRect(bx - 1, by - 1, tw + 10, 16);
  ctx.fillStyle = '#f2c14e'; ctx.fillRect(bx, by, tw + 8, 14);
  ctx.fillStyle = '#c99a20'; ctx.fillRect(bx, by + 12, tw + 8, 2);
  ctx.save(); ctx.translate(bx + 4, by + 2); ctx.scale(2, 2); pixelText(ctx, label, 0, 0, INK); ctx.restore();
  ctx.fillStyle = INK; ctx.fillRect(bx + 6, by + 15, 2, 6); ctx.fillRect(bx + tw, by + 15, 2, 6);   // its two posts
  const wave = moving ? Math.round(Math.sin(t * 5) * 1.5) : 0;
  ctx.fillStyle = INK; ctx.fillRect(X + 21, Y + 276, 9, 6);
  ctx.fillStyle = '#c4302a'; ctx.fillRect(X + 22, Y + 277 + (wave > 0 ? 0 : 1), 7, 4); ctx.fillStyle = '#f3eee3'; ctx.fillRect(X + 22 + 3 + wave, Y + 278, 2, 2);
}

function drawSmoke(now: number, camX: number, camY: number) {
  if (!grills) { grills = []; RT.map.forEach((row, y) => row.forEach((t, x) => { if (t === GRL) grills!.push([x, y]); })); }
  for (const [gx, gy] of grills) {
    const X = gx * T - camX, Y = gy * T - camY;
    if (X < -32 || X > RT.VW + 16 || Y < -16 || Y > RT.VH + 48) continue;
    ctx.fillStyle = Math.floor(now / 160 + gx) % 3 ? '#ff8c42' : '#ffd23f'; ctx.fillRect(X + 6, Y + 6, 4, 1);
    for (let i = 0; i < 6; i++) {
      const p = reduceMotion ? i / 6 : ((now / 2600 + i / 6 + gx * 0.13) % 1);
      const r = 2 + p * 6;
      ctx.fillStyle = `rgba(214,210,222,${(0.55 * (1 - p)).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(X + 8 + Math.sin(p * 5 + gx) * 5 + p * 10, Y + 4 - p * 34, r, 0, Math.PI * 2); ctx.fill();
    }
  }
}

let chipRects: { x: number; y: number; w: number; h: number }[] = [];
/** A name label on the zoomed-out map, nudged down if it would overlap another. */
/** `size` is a font size in px, or 'small' for the sharp 3×5 pixel font (shops, guest list). */
export function chip(text: string, x: number, y: number, bg: string, fg: string, size: number | 'small') {
  const small = size === 'small';
  if (!small) { ctx.font = size + 'px "Press Start 2P", monospace'; ctx.textBaseline = 'top'; }
  const pad = small ? 2 : 3;
  const w = (small ? pixelTextWidth(text) : Math.ceil(ctx.measureText(text).width)) + 2 * pad, h = (small ? PIXEL_H : size) + 2 * pad;
  const X = Math.round(Math.max(1, Math.min(RT.VW - w - 1, x - w / 2)));
  let Y = Math.round(Math.max(1, Math.min(RT.VH - h - 1, y - h)));
  // nudge down until it no longer overlaps a label drawn earlier this frame
  for (let i = 0; i < 6 && chipRects.some(r => X < r.x + r.w + 2 && X + w + 2 > r.x && Y < r.y + r.h + 2 && Y + h + 2 > r.y); i++) Y += h + 3;
  chipRects.push({ x: X, y: Y, w, h });
  ctx.fillStyle = INK; ctx.fillRect(X - 1, Y - 1, w + 2, h + 2);
  ctx.fillStyle = bg; ctx.fillRect(X, Y, w, h);
  if (small) pixelText(ctx, text, X + pad, Y + pad, fg);
  else { ctx.fillStyle = fg; ctx.fillText(text, X + pad, Y + pad); }
}
export function draw(now: number) {
  const z = zoomLevel();
  const realW = RT.VW, realH = RT.VH;
  // draw the world at scale z: everything inside treats VW/VH as the visible world size
  RT.VW = realW / z; RT.VH = realH / z;
  ctx.setTransform(PX * z, 0, 0, PX * z, 0, 0);
  ctx.imageSmoothingEnabled = PX * z < 1;
  let cam;
  try { cam = drawWorld(now); } finally {
    RT.VW = realW; RT.VH = realH;
    ctx.setTransform(PX, 0, 0, PX, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }
  // where the player is on screen, as a fraction of the view (ui/hud.ts fades the HUD when you walk under it)
  playerOnScreen.x = (cam[2] + 8 - cam[0]) * z / realW;
  playerOnScreen.y = (cam[3] + 8 - cam[1]) * z / realH;
  if (z >= 0.9) return;
  // on phones the labels would cover half the screen: only the MAP view shows them
  const labels = zoom.fit || !MOBILE.matches;
  // zoomed out: label clubs and shops, and mark the player
  const [camX, camY, ppx, ppy] = cam;
  const sx = (wx: number) => (wx - camX) * z, sy = (wy: number) => (wy - camY) * z;
  const size = RT.VW < 260 ? 6 : 8;
  chipRects = [];
  if (!inClub() && labels) {
    // clubs on the roof, shops at the shopfront (smaller), so neighbours don't collide
    CLUBS.forEach(c => chip((state.stamps[c.id] ? '✓ ' : '') + CLUB_SHORT[c.id], sx((c.x + c.w / 2) * T), sy(c.y * T + 4), c.glow, INK, size));
    SHOPS.forEach(sh => chip(sh.label, sx((sh.x + sh.w / 2) * T), sy((sh.y + sh.h) * T) + PIXEL_H + 4, '#f3eee3', INK, 'small'));
    PLACES.forEach(pl => chip(pl.name.toUpperCase(), sx((pl.x + pl.w / 2) * T), sy((pl.y + pl.h) * T) + PIXEL_H + 4, '#f3eee3', INK, 'small'));
    chip('GÖRLI', sx((GORLI.x0 + GORLI.x1) / 2 * T), sy((GORLI.y0 + 2) * T), '#3f7a3a', '#fff', size);
    chip('HOLZMARKT', sx((HOLZMARKT.x + HOLZMARKT.w / 2) * T), sy((HOLZMARKT.y + HOLZMARKT.h / 2) * T), '#b8281f', '#fff', 'small');
    chip('FREILUFTKINO', sx((KINO.x + KINO.w / 2) * T), sy((KINO.y + KINO.h / 2) * T), '#7a1420', '#ffe9a8', 'small');
    RT.ents.forEach(e => { if (e.kind === 'column') chip('GUEST LIST', sx((e.x + 0.5) * T), sy(e.y * T - 8), '#2f6b4f', '#fff', 'small'); });
  }
  const px = sx(ppx + 8), py = sy(ppy + 2);
  const pulse = reduceMotion ? 1 : 0.6 + 0.4 * Math.sin(now / 180);
  ctx.strokeStyle = `rgba(255,77,109,${pulse})`; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(px, sy(ppy + 8), Math.max(6, 10 * z) + 3 * pulse, 0, Math.PI * 2); ctx.stroke();
  if (labels) chip('YOU', px, py - 6, '#ff4d6d', '#fff', size);
}

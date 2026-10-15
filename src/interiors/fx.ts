import type { ClubScene, Entity } from '../types';
import { get } from '../world/grid';
import { drawPile } from '../quests/kitkat';
import { drawBottle } from '../quests/sisyphos';
import { hasQuest } from '../quests/markers';
import { lookOf } from '../render/looks';
import { person } from '../render/sprites';
import { player, state } from '../core/state';
import { followerPx } from './follower';
import { DARK, T, WALLISH } from '../world/tiles';
import { ctx } from '../render/canvas';
import { INK, reduceMotion } from '../util';
import { INTERIORS } from '../data/interiors';
import { RT } from '../core/runtime';
import { SCENES } from '../world/scenes';
/** Everything on a club floor that moves: lights, people, steam, darkness. */
export function drawInteriorFx(now: number, camX: number, camY: number, ppx: number, ppy: number) {
  const sc = SCENES[RT.scene] as ClubScene;
  const fl = INTERIORS[sc.club].floors[sc.floor];
  const lights = !reduceMotion;
  // pool water shimmer
  sc.map.forEach((row, y) => row.forEach((t, x) => {
    if (t !== 64) return;
    const k = (x * 5 + y * 3 + Math.floor(now / 400)) % 6;
    if (k < 2) { ctx.fillStyle = k ? '#7fcde8' : '#c9f0ff'; ctx.fillRect(x * T - camX + 3 + ((x * 7 + k * 5) % 8), y * T - camY + 5 + ((y * 11 + x) % 6), 3, 1); }
  }));
  // moving coloured spots on the dancefloor
  if (sc.dance.x1 >= sc.dance.x0) {
    const d = sc.dance, bx = d.x0 * T - camX, by = d.y0 * T - camY, bw = (d.x1 - d.x0 + 1) * T, bh = (d.y1 - d.y0 + 1) * T;
    ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    const cols = fl.spots || (sc.floor === 'pb' ? ['rgba(255,170,90,.16)', 'rgba(255,90,160,.14)', 'rgba(140,120,255,.14)'] : ['rgba(255,40,80,.15)', 'rgba(60,120,255,.15)', 'rgba(255,255,255,.10)', 'rgba(170,80,255,.13)']);
    for (let i = 0; i < 6; i++) {
      const t = (lights ? now / 1000 : 0) * (0.35 + i * 0.07) + i * 1.7;
      const cx = bx + bw / 2 + Math.sin(t) * bw * 0.4, cy = by + bh / 2 + Math.cos(t * 1.3) * bh * 0.4;
      const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, 34);
      gr.addColorStop(0, cols[i % cols.length]); gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr; ctx.fillRect(cx - 34, cy - 34, 68, 68);
    }
    ctx.restore();
  }
  // DJ booth lights
  sc.map.forEach((row, y) => row.forEach((t, x) => {
    if (t !== 59) return;
    if ((Math.floor(now / 180) + x * 3) % 4 === 0) { ctx.fillStyle = ['#ff4d6d', '#6fb7ff', '#f2c45a'][(x + y) % 3]; ctx.fillRect(x * T - camX + 3 + (x * 5) % 9, y * T - camY + 4, 2, 2); }
  }));
  // entities, follower and player, sorted by row
  const list: { e: Entity | null | 'follower'; y: number }[] = RT.ents.map(e => ({ e, y: e.y }));
  list.push({ e: null, y: ppy / T });
  if (RT.follower) list.push({ e: 'follower', y: followerPx()[1] / T });
  list.sort((a, b) => a.y - b.y);
  list.forEach(({ e }) => {
    if (!e) {
      const step = player.moving ? (player.t < player.dur / 2 ? (player.n % 2) + 1 : 0) : 0;
      person(ctx, ppx - camX, ppy - camY - 3, player.dir, step, lookOf(state.outfit));
      return;
    }
    if (e === 'follower') {
      if (!RT.follower) return;
      const [fx, fy] = followerPx();
      const step = player.moving ? (player.t < player.dur / 2 ? ((player.n + 1) % 2) + 1 : 0) : 0;
      person(ctx, fx - camX, fy - camY - 3, RT.follower.dir, step, RT.follower.look);
      return;
    }
    const X = e.x * T - camX + Math.round(e.ox || 0), Y = e.y * T - camY + Math.round(e.oy || 0);
    if (X < -16 || Y < -24 || X > RT.VW || Y > RT.VH + 8) return;
    if (e.kind === 'bottle') { if (e.bid && e.type && !state.pfand.taken[e.bid]) drawBottle(X, Y, e.type, now); return; }
    if (e.kind === 'pile') { drawPile(e, X, Y, now, lights); if (hasQuest(e, sc.club)) questMark(X, Y - 8, now); return; }
    if (!e.look) return;
    if (e.dance && lights) {
      const phase = e.phase ?? 0;
      const beat = Math.floor(now / 230 + phase);
      const dir = (['down', 'left', 'down', 'right'] as const)[Math.floor(now / 900 + phase) % 4];
      person(ctx, X, Y - 3 - (beat % 2), dir, (beat % 2) + 1, e.look);
    } else {
      // legs move while someone walks to the next tile
      const off = Math.abs(e.ox || 0) + Math.abs(e.oy || 0);
      person(ctx, X, Y - 3, e.dir ?? 'down', off ? (Math.floor(off / 8) % 2) + 1 : 0, e.look);
    }
    if (hasQuest(e, sc.club)) questMark(X, Y - 3, now);
  });
  // main floor: the light bar along the top wall and a short strobe now and then
  if (sc.floor === 'mf') {
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(T - camX, T + 5 - camY, (sc.w - 2) * T, 2);
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(T - camX, T + 2 - camY, (sc.w - 2) * T, 8);
    if (lights && now % 3200 < 70) { ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(0, 0, RT.VW, RT.VH); }
  }
  // Panorama Bar sunrise: open blinds and light falling into the room
  if (sc.floor === 'pb' && state.sunrise[sc.club]) {
    sc.map.forEach((row, y) => row.forEach((t, x) => {
      if (t !== 50) return;
      const X = x * T - camX, Y = y * T - camY;
      ctx.fillStyle = '#ffe2a0'; ctx.fillRect(X + 1, Y + 1, 14, 12);
      ctx.fillStyle = '#fff4d6'; ctx.fillRect(X + 1, Y + 1, 14, 3);
      ctx.fillStyle = '#c9a26a'; ctx.fillRect(X + 1, Y + 1, 14, 1);
    }));
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const wx0 = 9 * T - camX, wx1 = 25 * T - camX, wy = 2 * T - camY;
    const gr = ctx.createLinearGradient(0, wy, 0, wy + 10 * T);
    gr.addColorStop(0, 'rgba(255,200,120,.30)'); gr.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(wx0, wy); ctx.lineTo(wx1, wy); ctx.lineTo(wx1 - 5 * T, wy + 10 * T); ctx.lineTo(wx0 - 6 * T, wy + 10 * T); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // Heideglühen: fire pits and the karaoke screen
  sc.map.forEach((row, y) => row.forEach((t, x) => {
    if (t !== 102 && t !== 103) return;
    const X = x * T - camX, Y = y * T - camY;
    if (X < -24 || Y < -24 || X > RT.VW + 8 || Y > RT.VH + 8) return;
    if (t === 102) {
      const fl = lights ? Math.sin(now / 90 + x * 3) : 0;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const gr = ctx.createRadialGradient(X + 8, Y + 8, 2, X + 8, Y + 8, 26);
      gr.addColorStop(0, 'rgba(255,140,40,.35)'); gr.addColorStop(1, 'rgba(255,140,40,0)');
      ctx.fillStyle = gr; ctx.fillRect(X - 18, Y - 18, 52, 52);
      ctx.restore();
      ctx.fillStyle = '#ff5a1f'; ctx.fillRect(X + 5, Y + 3 - fl, 6, 7);
      ctx.fillStyle = '#ffb347'; ctx.fillRect(X + 6, Y + 1 - Math.round(fl * 1.5), 4, 6);
      ctx.fillStyle = '#fff2b0'; ctx.fillRect(X + 7, Y + 4, 2, 3);
    } else {
      const hue = lights ? Math.floor(now / 700) % 3 : 0;
      ctx.fillStyle = ['#1a2a6a', '#4a1a5a', '#1a4a4a'][hue]; ctx.fillRect(X + 2, Y + 2, 12, 8);
      const off = lights ? Math.floor(now / 250) % 8 : 0;
      ctx.fillStyle = '#fff2b0'; ctx.fillRect(X + 3, Y + 7, Math.max(1, off + 2), 1);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(X + 3, Y + 4, 8, 1);
    }
  }));
  // a glass roof over part of the floor (Heideglühen's covered dancefloor)
  if (fl.roof) {
    const [rx0, ry0, rx1, ry1] = fl.roof;
    const X0 = rx0 * T - camX, Y0 = ry0 * T - camY, W = (rx1 - rx0 + 1) * T, H = (ry1 - ry0 + 1) * T;
    ctx.fillStyle = 'rgba(170,215,235,.08)'; ctx.fillRect(X0, Y0, W, H);
    ctx.fillStyle = 'rgba(200,235,250,.18)';
    for (let x = 0; x <= W; x += 2 * T) ctx.fillRect(X0 + x, Y0, 1, H);
    for (let y = 0; y <= H; y += 2 * T) ctx.fillRect(X0, Y0 + y, W, 1);
  }
  // fairy lights strung between two tiles, sagging a little
  (fl.fairy || []).forEach(([x0, y0, x1, y1], si) => {
    const n = Math.max(4, Math.abs(x1 - x0) * 2);
    for (let i = 0; i <= n; i++) {
      const k = i / n, sag = Math.sin(k * Math.PI) * 5;
      const lx = (x0 + (x1 - x0) * k) * T + 8 - camX, ly = (y0 + (y1 - y0) * k) * T + 2 + sag - camY;
      const on = !lights || (Math.floor(now / 500) + i + si) % 3 !== 0;
      ctx.fillStyle = 'rgba(20,18,28,.6)'; if (i < n) ctx.fillRect(lx, ly, T / 2, 1);
      if (on) { ctx.fillStyle = ['#ffd23f', '#ff5e7a', '#5ec8ff', '#b6f36b', '#c28cff'][(i + si) % 5]; ctx.fillRect(lx - 1, ly, 2, 2); }
    }
  });
  // red paper lanterns, swaying (the Tunnel)
  (fl.lanterns || []).forEach(([lx, ly], i) => {
    const sway = lights ? Math.sin(now / 700 + i) * 2 : 0;
    const X = lx * T + 8 - camX + sway, Y = ly * T - 4 - camY;
    ctx.fillStyle = 'rgba(255,90,40,.18)'; ctx.beginPath(); ctx.arc(X, Y + 6, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = INK; ctx.fillRect(X - 0.5, Y - 6, 1, 6);
    ctx.fillStyle = '#e0b040'; ctx.fillRect(X - 3, Y, 6, 1); ctx.fillRect(X - 3, Y + 10, 6, 1);
    ctx.fillStyle = '#d42a1e'; ctx.fillRect(X - 4, Y + 1, 8, 9);
    ctx.fillStyle = '#ff6a3a'; ctx.fillRect(X - 2, Y + 2, 2, 7);
    ctx.fillStyle = '#e0b040'; ctx.fillRect(X - 0.5, Y + 11, 1, 3);
  });
  // sauna steam (thicker during the Aufguss)
  if (fl.steam) {
    const thick = RT.steamUntil > now ? 1 : 0.35;
    ctx.save(); ctx.globalAlpha = 0.18 * thick;
    for (let i = 0; i < 14; i++) {
      const t = (lights ? now / 2600 : 0) + i * 1.3;
      const sx = ((i * 53 + t * 30) % (sc.w * T)) - camX, sy = (sc.h * T - ((t * 40 + i * 37) % (sc.h * T))) - camY;
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(sx, sy, 12 + (i % 4) * 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  // open air: warm afternoon light
  if (fl.daylight) { ctx.fillStyle = 'rgba(255,214,140,.10)'; ctx.fillRect(0, 0, RT.VW, RT.VH); }
  // KitKat: UV light upstairs, red light in the dungeon
  if (fl.uv) {
    ctx.fillStyle = 'rgba(110,30,200,.16)'; ctx.fillRect(0, 0, RT.VW, RT.VH);
    // the fluorescent paintings glow under the UV
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = lights ? 0.18 + 0.08 * Math.sin(now / 600) : 0.2;
    sc.map.forEach((row, y) => row.forEach((t, x) => { if (t === 90 && !WALLISH.has(sc.map[y + 1] ? sc.map[y + 1][x] : 40)) ctx.drawImage(RT.mc, x * T, y * T, T, T, x * T - camX, y * T - camY, T, T); }));
    ctx.restore();
  }
  if (fl.red) { ctx.fillStyle = 'rgba(170,0,30,.18)'; ctx.fillRect(0, 0, RT.VW, RT.VH); }
  // darkroom: you only see right around you
  if (get(player.x, player.y) === DARK || (player.moving && get(player.tx, player.ty) === DARK)) {
    const cx = ppx - camX + 8, cy = ppy - camY + 6;
    const gr = ctx.createRadialGradient(cx, cy, 8, cx, cy, 44);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.94)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, RT.VW, RT.VH);
  }
}

/** A red exclamation mark bobbing over someone who has a side quest for you. */
function questMark(X: number, Y: number, now: number) {
  const bob = reduceMotion ? 0 : Math.round(Math.sin(now / 220) * 1.5);
  const x = X + 5, y = Y - 13 + bob;
  ctx.fillStyle = INK; ctx.fillRect(x, y, 6, 11);
  ctx.fillStyle = '#e8263c'; ctx.fillRect(x + 1, y + 1, 4, 9);
  ctx.fillStyle = '#fff'; ctx.fillRect(x + 2, y + 2, 2, 4); ctx.fillRect(x + 2, y + 7, 2, 2);
}

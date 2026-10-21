import type { ClubScene, Entity, Look } from '../types';
import { get } from '../world/grid';
import { drawPile } from '../quests/kitkat';
import { drawBottle } from '../quests/sisyphos';
import { hasQuest } from '../minigames';
import { lookOf } from '../render/looks';
import { person } from '../render/sprites';
import { player, state } from '../core/state';
import { followerPx } from './follower';
import { DARK, ICH, ICHAR, T, WALLISH, isDoorTile } from '../world/tiles';
import { ctx } from '../render/canvas';
import { INK, reduceMotion } from '../util';
import { INTERIORS } from '../data/interiors';
import { RT } from '../core/runtime';
import { SCENES } from '../world/scenes';
import { doorRect, doorSide, doorStyleAt } from './tiles';
import { CLUBS } from '../data/clubs';
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
  drawDoorways(sc, now, camX, camY);
  drawRotatingSeats(sc, now, camX, camY);
  drawJacuzzi(sc, now, camX, camY);
  drawCrowdBelow(sc, now, camX, camY);
  // entities, follower and player, sorted by row
  const list: { e: Entity | null | 'follower'; y: number }[] = RT.ents.map(e => ({ e, y: e.y }));
  list.push({ e: null, y: ppy / T });
  if (RT.follower) list.push({ e: 'follower', y: followerPx()[1] / T });
  list.sort((a, b) => a.y - b.y);
  list.forEach(({ e }) => {
    if (!e) {
      if (RT.spin) return; // you're on a rotating seat: drawn there (drawRotatingSeats)
      if (RT.lying) {
        // flat on your back: the standing sprite turned on its side
        ctx.save(); ctx.translate(ppx - camX + 8, ppy - camY + 9); ctx.rotate(-Math.PI / 2);
        person(ctx, -8, -8, 'down', 0, lookOf(state.outfit));
        ctx.restore();
        return;
      }
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
    if (e.swim) {
      // swimming slow lengths back and forth: head and shoulders above the water, arms coming over in turns,
      // a little wake behind. How far they go depends on how much water there is on either side.
      const water = (dx: number) => { let n = 0; while (n < 2 && sc.map[e.y]?.[e.x + dx * (n + 1)] === 64) n++; return n; };
      const reach = Math.min(water(-1), water(1)) * T + 6, t = now / 1000 + (e.phase ?? e.x * 0.9 + e.y);
      const sx = reduceMotion ? 0 : Math.round(Math.sin(t * 0.5) * reach), going = Math.cos(t * 0.5) >= 0 ? 'right' : 'left';
      const bob = reduceMotion ? 0 : Math.round(Math.sin(now / 600 + e.x * 1.3 + e.y));
      const SX = X + sx;
      ctx.save(); ctx.beginPath(); ctx.rect(SX - 2, Y - 8, 20, 14); ctx.clip();
      person(ctx, SX, Y - 1 + bob, reduceMotion ? (e.dir ?? 'down') : going, 0, e.look);
      ctx.restore();
      if (!reduceMotion) {
        const stroke = Math.floor(now / 350 + e.x) % 2; // one arm out of the water, then the other
        ctx.fillStyle = e.look.skin; ctx.fillRect(SX + (stroke ? 1 : 12), Y + 1 + bob, 3, 2);
        ctx.fillStyle = 'rgba(255,255,255,.5)';
        const back = going === 'right' ? -1 : 1; // the wake trails behind
        ctx.fillRect(SX + 8 + back * 10, Y + 6, 4, 1); ctx.fillRect(SX + 8 + back * 14, Y + 7, 3, 1);
      }
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(SX + 2, Y + 6, 11, 1);
      return;
    }
    if (e.lie) {
      // lying on their side, in the middle of the mattress (or whatever they lie on) under them
      const under = sc.map[e.y]?.[e.x];
      let m0 = e.x, m1 = e.x; while (sc.map[e.y]?.[m0 - 1] === under) m0--; while (sc.map[e.y]?.[m1 + 1] === under) m1++;
      const mid = ((m0 + m1 + 1) / 2) * T - camX;
      const breathe = fl.fidget && lights ? Math.round(Math.sin(now / 700 + e.x * 1.9) * 0.6) : 0; // a slow breath
      ctx.save(); ctx.translate(Math.round(mid), Y + 7 + breathe); ctx.rotate(-Math.PI / 2);
      person(ctx, -8, -8, 'down', 0, e.look);
      ctx.restore();
      return;
    }
    if (e.dance && lights) {
      const phase = e.phase ?? 0;
      const beat = Math.floor(now / 230 + phase);
      const dir = (['down', 'left', 'down', 'right'] as const)[Math.floor(now / 900 + phase) % 4];
      person(ctx, X, Y - 3 - (beat % 2), dir, (beat % 2) + 1, e.look);
    } else {
      // legs move while someone walks to the next tile
      const off = Math.abs(e.ox || 0) + Math.abs(e.oy || 0);
      let step = off ? (Math.floor(off / 8) % 2) + 1 : 0, lift = 0;
      if (fl.fidget && lights && !off) {
        // standing about: shifting their weight now and then, and whoever holds a tool keeps using it
        const ph = e.phase ?? e.x * 1.7 + e.y * 0.9;
        lift = Math.sin(now / 900 + ph) > 0.6 ? 1 : 0;
        if (e.look.tool) step = Math.floor(now / 320 + ph) % 3 === 0 ? 1 : 0;
      }
      person(ctx, X, Y - 3 - lift, e.dir ?? 'down', step, e.look);
    }
    if (e.look.cig) {
      // smoke curling up from the cigarette
      const tipX = X + (e.dir === 'left' ? 1 : e.dir === 'right' ? 14 : 13), tipY = Y + 3;
      for (let i = 0; i < 3; i++) {
        const p = lights ? ((now / 1400 + i / 3 + (e.phase ?? e.x * 0.37)) % 1) : i / 3;
        ctx.fillStyle = `rgba(200,200,210,${(0.45 * (1 - p)).toFixed(2)})`;
        ctx.fillRect(Math.round(tipX + Math.sin(p * 6 + i) * 2), Math.round(tipY - p * 14), 2, 2);
      }
    }
    if (hasQuest(e, sc.club)) questMark(X, Y - 3, now);
  });
  if (sc.id === 'kitkat:pool') drawSwing(sc, now, camX, camY);
  drawDragonFire(sc, now, camX, camY);
  drawCageFronts(sc, camX, camY);
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
      // the blinds are up: morning light fills the arched windows
      ctx.fillStyle = '#ffe2a0'; ctx.fillRect(X + 4, Y + 5, 8, 8); ctx.fillRect(X + 5, Y + 3, 6, 2);
      ctx.fillStyle = '#fff4d6'; ctx.fillRect(X + 5, Y + 5, 6, 3);
    }));
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const wins = windowSpan(sc), wx0 = wins[0] * T - camX, wx1 = (wins[1] + 1) * T - camX, wy = 2 * T - camY;
    const gr = ctx.createLinearGradient(0, wy, 0, wy + 10 * T);
    gr.addColorStop(0, 'rgba(255,200,120,.30)'); gr.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(wx0, wy); ctx.lineTo(wx1, wy); ctx.lineTo(wx1 - 5 * T, wy + 10 * T); ctx.lineTo(wx0 - 6 * T, wy + 10 * T); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // Panorama Bar before sunrise: violet light falling through the church windows onto the floor;
  // the smoking area's red windows (tile 134) throw red light the same way, all night
  if (fl.violet && !state.sunrise[sc.club]) windowShafts(sc, 50, '150,80,255', now, camX, camY, lights);
  windowShafts(sc, 134, '255,30,50', now, camX, camY, lights);
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
  // the garden's little houses (Sisyphos): steam from the sauna chimney, wood smoke from the café's
  sc.map.forEach((row, y) => row.forEach((t, x) => {
    if ((t !== 170 && t !== 171) || row[x + 1] === t || sc.map[y + 1]?.[x] === t) return;
    let x0 = x, y0 = y;
    while (row[x0 - 1] === t) x0--;
    while (sc.map[y0 - 1]?.[x] === t) y0--;
    const bx = x0 * T, by = y0 * T, bw = (x + 1) * T - bx, bh = (y + 1) * T - by;
    const ridge = by + 13 + Math.round((bh - 13 - 16) / 2);
    const cx = bx + bw - 22 - camX, cy = ridge - 9 - camY;
    if (cx < -30 || cy < -40 || cx > RT.VW + 30 || cy > RT.VH + 10) return;
    for (let i = 0; i < 5; i++) {
      const p = reduceMotion ? i / 5 : ((now / (t === 170 ? 1600 : 2200) + i / 5) % 1);
      const a = (t === 170 ? 0.5 : 0.4) * (1 - p);
      ctx.fillStyle = t === 170 ? `rgba(240,244,250,${a.toFixed(2)})` : `rgba(170,170,180,${a.toFixed(2)})`;
      const r = 2 + Math.round(p * 3);
      ctx.fillRect(Math.round(cx + Math.sin(p * 5 + i) * 4 - r / 2), Math.round(cy - p * 26), r, r);
    }
  }));
  // the old factory (Sisyphos): pink and violet lasers sweeping across the brick, like on a night out
  sc.map.forEach((row, y) => row.forEach((t, x) => {
    if (t !== 172 || row[x + 1] === 172 || sc.map[y + 1]?.[x] === 172) return;
    let x0 = x, y0 = y;
    while (row[x0 - 1] === 172 || isDoorTile(row[x0 - 1])) x0--;
    while (sc.map[y0 - 1]?.[x] === 172 || isDoorTile(sc.map[y0 - 1]?.[x] ?? 0)) y0--;
    const bx = x0 * T - camX, by = y0 * T - camY, bw = (x + 1 - x0) * T, bh = (y + 1 - y0) * T;
    if (bx > RT.VW || by > RT.VH || bx + bw < 0 || by + bh < 0) return;
    ctx.save(); ctx.beginPath(); ctx.rect(bx, by + 16, bw, bh - 60); ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    const ox = bx + bw + 30, oy = by - 20;
    for (let i = 0; i < 3; i++) {
      const a = 2.35 + i * 0.22 + (lights ? Math.sin(now / 1700 + i * 2) * 0.18 : 0);
      ctx.strokeStyle = i === 1 ? 'rgba(190,120,255,.55)' : 'rgba(255,90,210,.6)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + Math.cos(a) * 400, oy + Math.sin(a) * 400); ctx.stroke();
    }
    ctx.restore();
  }));
  // the big bonfire (2×2, Sisyphos): one tall fire over the middle of the block, sparks rising
  sc.map.forEach((row, y) => row.forEach((t, x) => {
    if (t !== 168 || row[x + 1] === 168 || sc.map[y + 1]?.[x] === 168) return;
    const X = x * T - camX, Y = y * T - camY;
    if (X < -40 || Y < -40 || X > RT.VW + 40 || Y > RT.VH + 40) return;
    const f = lights ? Math.sin(now / 80) : 0, f2 = lights ? Math.sin(now / 130 + 1) : 0;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const gr = ctx.createRadialGradient(X, Y, 4, X, Y, 54);
    gr.addColorStop(0, 'rgba(255,140,40,.42)'); gr.addColorStop(1, 'rgba(255,140,40,0)');
    ctx.fillStyle = gr; ctx.fillRect(X - 56, Y - 56, 112, 112);
    ctx.restore();
    ctx.fillStyle = '#ff4a12'; ctx.fillRect(X - 7, Y - 8 - f, 14, 10); ctx.fillRect(X - 4, Y - 13 - f2, 8, 6);
    ctx.fillStyle = '#ff8a2a'; ctx.fillRect(X - 5, Y - 11 - Math.round(f * 1.5), 10, 10); ctx.fillRect(X - 2, Y - 17 - f, 4, 6);
    ctx.fillStyle = '#ffd36b'; ctx.fillRect(X - 3, Y - 7, 6, 6); ctx.fillStyle = '#fff2b0'; ctx.fillRect(X - 1, Y - 5, 2, 3);
    if (lights) for (let i = 0; i < 4; i++) {
      const p = (now / 1100 + i / 4) % 1;
      ctx.fillStyle = `rgba(255,${180 + i * 15},80,${(1 - p).toFixed(2)})`;
      ctx.fillRect(Math.round(X - 6 + i * 4 + Math.sin(p * 9 + i) * 3), Math.round(Y - 14 - p * 26), 1, 1);
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
  // vault fog: big slow grey clouds, and a strobe now and then
  if (fl.fog) {
    for (let i = 0; i < 16; i++) {
      const t = (lights ? now / 4200 : 0) + i * 2.1;
      const fx0 = ((i * 71 + t * 22) % (sc.w * T + 80)) - 40 - camX, fy0 = ((i * 43 + Math.sin(t + i) * 20) % (sc.h * T)) - camY;
      const r = 34 + (i % 5) * 8;
      const gr = ctx.createRadialGradient(fx0, fy0, 0, fx0, fy0, r);
      gr.addColorStop(0, 'rgba(205,200,220,.22)'); gr.addColorStop(1, 'rgba(205,200,220,0)');
      ctx.fillStyle = gr; ctx.fillRect(fx0 - r, fy0 - r, r * 2, r * 2);
    }
  }
  // the lighting guy's show (RT.lightShow, set by his handler in quests/acts.ts), main floor only
  let show = RT.lightShow && RT.lightShow.until > now && RT.scene === 'berghain:mf' ? RT.lightShow : null;
  if (RT.lightShow && RT.lightShow.until <= now) RT.lightShow = null;
  const showT = show ? now - show.start : 0;
  if (show && show.mode === 'dark' && showT < 4000) {   // total darkness for a few bars, beams off
    ctx.fillStyle = 'rgba(0,0,0,.9)'; ctx.fillRect(0, 0, RT.VW, RT.VH);
    show = null;
  }
  // light beams: cones from the rig along the top, sweeping over the dancefloor
  if (fl.beams && !(RT.lightShow && RT.lightShow.mode === 'dark' && RT.scene === 'berghain:mf' && now - RT.lightShow.start < 4000)) {
    const red = show && show.mode === 'red', fast = show && show.mode === 'dark' ? 0.55 : red ? 1.8 : 1;
    const cols = red ? ['255,30,40', '220,0,30', '255,60,60', '200,20,40', '255,40,30'] : ['255,60,90', '80,140,255', '255,200,80', '160,80,255', '60,220,200'];
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
      const ox = (sc.dance.x0 + (sc.dance.x1 - sc.dance.x0) * (i + 0.5) / 5) * T - camX, oy = (sc.dance.y0 - 1) * T - camY;
      const a = lights ? Math.sin(now / ((1400 + i * 230) * fast) + i * 1.7) * 0.7 : (i - 2) * 0.25, len = (sc.dance.y1 - sc.dance.y0 + 2) * T;
      const tx = ox + Math.sin(a) * len, ty = oy + Math.cos(a) * len, wd = 22;
      const gr = ctx.createLinearGradient(ox, oy, tx, ty);
      const c = cols[(i + (lights ? Math.floor(now / 2400) : 0)) % cols.length];
      gr.addColorStop(0, `rgba(${c},.32)`); gr.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(ox - 2, oy); ctx.lineTo(ox + 2, oy);
      ctx.lineTo(tx + Math.cos(a) * wd, ty - Math.sin(a) * wd); ctx.lineTo(tx - Math.cos(a) * wd, ty + Math.sin(a) * wd); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  if (show && show.mode === 'red') { ctx.fillStyle = 'rgba(170,0,20,.22)'; ctx.fillRect(0, 0, RT.VW, RT.VH); }
  if (show && show.mode === 'strobe') {
    if (lights) { if (now % 220 < 70) { ctx.fillStyle = 'rgba(255,255,255,.38)'; ctx.fillRect(0, 0, RT.VW, RT.VH); } }
    else { ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(0, 0, RT.VW, RT.VH); }   // reduced motion: a steady wash, no flashing
  }
  if (show && show.mode === 'dark' && showT < 5200) {     // the lights slam back on
    ctx.fillStyle = `rgba(255,255,255,${(0.35 * (1 - (showT - 4000) / 1200)).toFixed(3)})`; ctx.fillRect(0, 0, RT.VW, RT.VH);
  }
  if (fl.strobe && lights && now % 2600 < 60) { ctx.fillStyle = 'rgba(255,255,255,.24)'; ctx.fillRect(0, 0, RT.VW, RT.VH); }
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
  if (fl.blacklight) blackLight(sc, now, camX, camY, ppx, ppy, lights);
  // darkroom: you only see right around you
  if (get(player.x, player.y) === DARK || (player.moving && get(player.tx, player.ty) === DARK)) {
    const cx = ppx - camX + 8, cy = ppy - camY + 6;
    const gr = ctx.createRadialGradient(cx, cy, 8, cx, cy, 44);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.94)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, RT.VW, RT.VH);
  } else {
    // from outside a darkroom looks dark: whoever is in there (and the club lights) disappears into it
    ctx.fillStyle = 'rgba(4,3,8,.9)';
    const x0 = Math.max(0, Math.floor(camX / T)), y0 = Math.max(0, Math.floor(camY / T));
    for (let y = y0; y <= y0 + RT.VH / T + 1 && y < sc.h; y++) for (let x = x0; x <= x0 + RT.VW / T + 1 && x < sc.w; x++) {
      if (sc.map[y][x] === DARK) ctx.fillRect(x * T - camX, y * T - camY, T, T);
    }
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

/** The first and last column of the windows (`W`, tile 50, or another window tile) on a floor. */
function windowSpan(sc: ClubScene, tile = 50): [number, number] {
  let x0 = sc.w, x1 = 0;
  sc.map.forEach(row => row.forEach((t, x) => { if (t === tile) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); } }));
  return x0 <= x1 ? [x0, x1] : [0, 0];
}

/** LED colours per club for the 'leds' doorways. */
const LEDS: Record<string, string[]> = { heidegluehen: ['#ffd23f', '#ff8c42', '#ff5e3a', '#fff2c8'] };
/** Strip colours per club; clubs not listed get dark see-through strips. */
const STRIPS: Record<string, string[]> = { katerblau: ['#ff5e7a', '#5ec8ff', '#ffd23f', '#b6f36b', '#c28cff'] };

/** The new doorways (see DOOR_STYLE and ROOM_STYLE in interiors/tiles.ts), animated each frame.
 *  'strips': light from the next room behind a strip curtain, five strips swaying a little, a glint
 *  running down them, and a bit of light on the floor in front.
 *  'haze': grey haze in the opening, thicker at the top, and now and then a silhouette walks past inside. */
function drawDoorways(sc: ClubScene, now: number, camX: number, camY: number) {
  const cols = STRIPS[sc.club];
  const glow = reduceMotion ? 0.27 : 0.25 + 0.08 * Math.sin(now / 800);
  sc.map.forEach((row, y) => row.forEach((t, x) => {
    if (t < 81 || t > 89) return;
    const style = doorStyleAt(sc.id, t);
    if (!style) return;
    const X = x * T - camX, Y = y * T - camY;
    if (X < -16 || Y < -16 || X > RT.VW || Y > RT.VH) return;
    // everything below is designed for a doorway opening downwards; R turns it to the real side
    const side = doorSide(sc.map, x, y);
    const R = (cx: number, cy: number, w: number, h: number) => { const [a, b, ww, hh] = doorRect(side, X, Y, cx, cy, w, h); ctx.fillRect(a, b, ww, hh); };
    if (style === 'neon') {
      // a rounded neon tube around the opening, in the colour of the room behind it; it flickers off now and then
      const on = reduceMotion || Math.floor((now + x * 900) / 120) % 41 !== 0;
      ctx.fillStyle = on ? neonColour(sc, t) : '#3a3946';
      R(5, 1, 6, 1); R(4, 2, 1, 1); R(11, 2, 1, 1); R(3, 3, 1, 13); R(12, 3, 1, 13);
      if (on) {
        ctx.globalAlpha = 0.25; R(2, 3, 1, 13); R(13, 3, 1, 13); R(4, 0, 8, 1);
        if (side === 'down' || side === 'up') { ctx.globalAlpha = 0.16; R(3, 16, 1, 4); R(12, 16, 1, 4); } // reflection on the floor
        ctx.globalAlpha = 1;
      }
      return;
    }
    if (style === 'runway') {
      // a light strip on the threshold, and two rows of three lights on the floor in front that light up one
      // after another towards the doorway, like runway lights
      ctx.fillStyle = 'rgba(235,235,255,.85)'; R(2, 15, 12, 1);
      const step = reduceMotion ? -1 : Math.floor(now / 250) % 3;
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = step === 2 - i ? '#ffffff' : '#5a5c70';
        R(4, 18 + i * 4, 1, 1); R(11, 18 + i * 4, 1, 1);
      }
      return;
    }
    if (style === 'floor') {
      // a light strip on the threshold and two low lights at the sides, breathing slowly, with a soft glow on the floor
      const a = reduceMotion ? 0.9 : 0.75 + 0.25 * Math.sin(now / 500);
      ctx.fillStyle = `rgba(235,235,255,${a.toFixed(3)})`;
      R(2, 15, 12, 1); R(2, 11, 1, 3); R(13, 11, 1, 3);
      ctx.fillStyle = `rgba(220,220,245,${(0.12 * a).toFixed(3)})`; R(1, 16, 14, 5);
      return;
    }
    if (style === 'leds') {
      // little LEDs all round the frame, dim, with a few bright ones chasing round (fire colours at Heideglühen)
      const leds = LEDS[sc.club] ?? ['#ffffff'];
      const path: [number, number][] = [];
      for (let i = 15; i >= 1; i -= 2) path.push([2, i]);
      for (let i = 3; i <= 12; i += 2) path.push([i, 1]);
      for (let i = 1; i <= 15; i += 2) path.push([13, i]);
      ctx.fillStyle = '#6a4a38'; path.forEach(([a, b]) => R(a, b, 1, 1));
      const head = reduceMotion ? 0 : Math.floor(now / 90 + x * 5) % path.length;
      for (let k = 0; k < 4; k++) {
        const [a, b] = path[(head - k * 5 + path.length * 4) % path.length];
        ctx.fillStyle = leds[k % leds.length]; R(a, b, 1, 1);
        ctx.globalAlpha = 0.3; R(a - 1, b, 3, 1); R(a, b - 1, 1, 3); ctx.globalAlpha = 1; // a little glow round each lit one
      }
      return;
    }
    if (style === 'fog') {
      // coloured fog, brighter at the far end, slowly drifting through every colour; wisps float out onto the floor
      const hue = Math.round(reduceMotion ? 260 : (now / 40) % 360);
      for (let r = 0; r < 15; r++) { ctx.fillStyle = `hsl(${hue},45%,${Math.round(22 + 18 * (1 - r / 15))}%)`; R(3, 1 + r, 10, 1); }
      if (!reduceMotion) for (let i = 0; i < 5; i++) {
        const fx = (now / 50 + i * 19) % 18;
        ctx.fillStyle = `hsla(${hue},40%,70%,${(0.18 - fx / 120).toFixed(3)})`;
        R(2 + ((i * 5) % 10), Math.round(15 + fx / 2), 4, 1);
      }
      return;
    }
    if (style === 'haze') {
      for (let r = 0; r < 15; r++) { ctx.fillStyle = `rgba(150,150,175,${(0.55 - 0.4 * r / 15).toFixed(3)})`; R(3, 1 + r, 10, 1); }
      // every few seconds someone crosses the doorway (each doorway on its own timing)
      const cyc = reduceMotion ? 999 : (now / 30 + x * 37 + y * 11) % 160;
      const sx = Math.round(1 + cyc / 4);
      if (cyc < 60 && sx > 2 && sx < 12) {
        ctx.fillStyle = '#0a0a0e';
        R(sx, 5, 3, 3); R(sx - 1, 8, 5, 6); R(sx, 14, 1, 2); R(sx + 2, 14, 1, 2);
      }
      return;
    }
    // strips: light behind the curtain, five strips swaying a little with a glint running down, light on the floor
    ctx.fillStyle = `rgba(210,215,235,${glow})`; R(4, 3, 8, 12);
    for (let i = 0; i < 5; i++) {
      const sx = 3 + i * 2 + (reduceMotion ? 0 : Math.round(Math.sin(now / 700 + i * 1.3) * 0.6));
      ctx.globalAlpha = cols ? 0.6 : 0.55; ctx.fillStyle = cols ? cols[i % cols.length] : '#0f0e14'; R(sx, 1, 1, 15);
      ctx.globalAlpha = 1; ctx.fillStyle = 'rgba(240,244,255,.6)';
      R(sx, 1 + (reduceMotion ? i * 3 : (Math.floor(now / 90) + i * 5) % 15), 1, 2);
    }
    ctx.fillStyle = `rgba(210,215,235,${glow * 0.5})`; R(3, 16, 10, 3);
  }));
}

/** The neon colour of a doorway: the main light of the room it leads to (its first `spots` colour, made
 *  solid), or the club's colour if that room has none. */
function neonColour(sc: ClubScene, t: number): string {
  const club = INTERIORS[sc.club], to = club?.floors[sc.floor]?.doors?.[ICHAR[t]]?.to;
  const spot = to ? club.floors[to]?.spots?.[0] : undefined;
  const m = spot?.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  return m ? `rgb(${m[1]},${m[2]},${m[3]})` : CLUBS.find(c => c.id === sc.club)?.glow ?? '#e8eaff';
}

/** Coloured light falling through a row of windows in the top wall (row 1) onto the floor below. */
function windowShafts(sc: ClubScene, tile: number, rgb: string, now: number, camX: number, camY: number, lights: boolean) {
  const [x0, x1] = windowSpan(sc, tile);
  if (x1 < x0 || sc.map[1][x0] !== tile) return;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let x = x0; x <= x1; x += 2) {
    const sway = lights ? Math.sin(now / 1800 + x) * 6 : 0, X = x * T + 8 - camX, Y = 2 * T - camY;
    const gr = ctx.createLinearGradient(0, Y, 0, Y + 8 * T);
    gr.addColorStop(0, `rgba(${rgb},.26)`); gr.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(X - 5, Y); ctx.lineTo(X + 5, Y);
    ctx.lineTo(X - 3 * T + 10 + sway, Y + 8 * T); ctx.lineTo(X - 3 * T - 14 + sway, Y + 8 * T); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

/** The people already sitting on Heideglühen's rotating seats (one look per seat, the same every night). */
const SPINNERS: Look[] = [
  { skin: '#f3c9a8', hair: '#c9a24a', top: '#d9733a', legs: '#2b3f6b', long: true },
  { skin: '#8d5a3b', hair: '#111111', top: '#2bb3a3', legs: '#26242e', beard: '#111111' },
  { skin: '#e2b08c', hair: '#b04a2a', top: '#f2c14e', legs: '#3a3a4a' },
  { skin: '#6b4430', hair: '#5a3a22', top: '#c94a3a', legs: '#2b3f6b', long: true }
];
/** Rotating seats (2×2 blocks of 'ß'): a round wooden disc turning slowly with four people sitting on it,
 *  one of them smoking. If you sat down on one (RT.spin), you take the first seat and go round too. */
function drawRotatingSeats(sc: ClubScene, now: number, camX: number, camY: number) {
  const SEAT = ICH['ß'];
  sc.map.forEach((row, y) => row.forEach((t, x) => {
    if (t !== SEAT || row[x - 1] === SEAT || sc.map[y - 1]?.[x] === SEAT) return;
    const cx = x * T + 16 - camX, cy = y * T + 16 - camY;
    if (cx < -32 || cy < -32 || cx > RT.VW + 32 || cy > RT.VH + 32) return;
    const a0 = reduceMotion ? 0.4 : now / 2600 + x;
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(cx, cy, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#9a6a3e'; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#7a5432'; ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.fill();
    // a few planks turning with the disc, so you can see it go round
    ctx.fillStyle = '#5a3e26';
    for (let k = 0; k < 4; k++) { const a = a0 + k * Math.PI / 2; ctx.fillRect(Math.round(cx + Math.cos(a) * 11) - 1, Math.round(cy + Math.sin(a) * 11) - 1, 2, 2); }
    ctx.fillStyle = '#c9a24a'; ctx.fillRect(cx - 1, cy - 1, 2, 2);
    const mine = RT.spin && RT.spin.x === x && RT.spin.y === y;
    const seats = [0, 1, 2, 3].map(k => {
      const a = a0 + k * Math.PI / 2 + Math.PI / 4;
      return { k, px: cx + Math.cos(a) * 8, py: cy + Math.sin(a) * 8, a };
    }).sort((p, q) => p.py - q.py);
    seats.forEach(({ k, px, py, a }) => {
      const look = mine && k === 0 ? lookOf(state.outfit) : SPINNERS[(k + x) % SPINNERS.length];
      const dir = Math.abs(Math.cos(a)) > Math.abs(Math.sin(a)) ? (Math.cos(a) > 0 ? 'left' : 'right') : (Math.sin(a) > 0 ? 'up' : 'down');
      person(ctx, Math.round(px - 8), Math.round(py - 13), dir, 0, look);
      if (k === 2 && !reduceMotion) { // a little smoke rising from the one with the cigarette
        const s = (now / 60) % 12;
        ctx.fillStyle = `rgba(220,220,230,${(0.5 - s / 24).toFixed(3)})`; ctx.fillRect(Math.round(px + 3), Math.round(py - 14 - s), 2, 2);
      }
    });
  }));
}

/** From the gallery you look down into the open middle: heads bobbing on the dancefloor below. */
function drawCrowdBelow(sc: ClubScene, now: number, camX: number, camY: number) {
  if (sc.id !== 'heidegluehen:galerie') return;
  const VOID = ICH['¶'], HAIR = ['#2a2420', '#c9a24a', '#b04a2a', '#111111', '#9a9a9a', '#5a3a22'];
  sc.map.forEach((row, y) => row.forEach((t, x) => {
    if (t !== VOID) return;
    const X = x * T - camX, Y = y * T - camY;
    if (X < -16 || Y < -16 || X > RT.VW || Y > RT.VH) return;
    for (let i = 0; i < 2; i++) {
      const bob = reduceMotion ? 0 : Math.round(Math.sin(now / 230 + x * 1.7 + y * 2.3 + i * 3));
      const hx = X + 4 + i * 6 + ((x * 3 + i * 5) % 3), hy = Y + 4 + ((y * 5 + i * 7) % 6) + bob;
      ctx.fillStyle = '#e2b08c'; ctx.fillRect(hx, hy + 1, 3, 3);
      ctx.fillStyle = HAIR[(x + y * 3 + i) % HAIR.length]; ctx.fillRect(hx, hy, 3, 2);
    }
  }));
  // the DJ's lights sweeping across the floor below
  if (!reduceMotion) {
    const k = (now / 1800) % 1, bx = (3 + k * 10) * T - camX;
    ctx.fillStyle = 'rgba(255,180,90,.10)'; ctx.fillRect(Math.round(bx), 3 * T - camY, T * 2, 8 * T);
  }
}

/** The jacuzzi (a 2×2 block of 'é'): a round wooden tub, warm bubbling water lit from below, steam rising,
 *  and two people soaking in it up to their shoulders. */
function drawJacuzzi(sc: ClubScene, now: number, camX: number, camY: number) {
  const TUB = ICH['é'];
  sc.map.forEach((row, y) => row.forEach((t, x) => {
    if (t !== TUB || row[x - 1] === TUB || sc.map[y - 1]?.[x] === TUB) return;
    const cx = x * T + 16 - camX, cy = y * T + 16 - camY;
    if (cx < -32 || cy < -32 || cx > RT.VW + 32 || cy > RT.VH + 32) return;
    // the tub: dark rim, wooden staves, water
    ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(cx, cy, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#8a5a34'; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5a3e26'; for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; ctx.fillRect(Math.round(cx + Math.cos(a) * 13) - 1, Math.round(cy + Math.sin(a) * 13) - 1, 2, 2); }
    ctx.fillStyle = '#2fb6c9'; ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6ad8e3'; ctx.beginPath(); ctx.arc(cx - 2, cy - 2, 7, 0, Math.PI * 2); ctx.fill();
    // two people soaking: just heads and shoulders above the water
    ([[-5, 2, '#f3c9a8', '#d9b25c'], [5, -3, '#6b4430', '#111111']] as const).forEach(([dx, dy, skin, hair], i) => {
      const bob = reduceMotion ? 0 : Math.round(Math.sin(now / 700 + i * 2));
      const hx = cx + dx - 3, hy = cy + dy - 4 + bob;
      ctx.fillStyle = skin; ctx.fillRect(hx - 1, hy + 5, 8, 2); ctx.fillRect(hx, hy, 6, 5);
      ctx.fillStyle = hair; ctx.fillRect(hx, hy, 6, 2);
      ctx.fillStyle = INK; ctx.fillRect(hx + 1, hy + 3, 1, 1); ctx.fillRect(hx + 4, hy + 3, 1, 1);
    });
    if (reduceMotion) return;
    // bubbles popping up all over the water
    ctx.fillStyle = 'rgba(255,255,255,.75)';
    for (let k = 0; k < 7; k++) {
      const a = k * 2.4 + now / 900, rr = 3 + ((k * 37 + Math.floor(now / 160)) % 7);
      if ((Math.floor(now / 120) + k) % 3) ctx.fillRect(Math.round(cx + Math.cos(a) * rr), Math.round(cy + Math.sin(a) * rr), 1, 1);
    }
    // steam drifting up
    for (let k = 0; k < 4; k++) {
      const s = (now / 45 + k * 9) % 22;
      ctx.fillStyle = `rgba(230,235,240,${(0.28 - s / 80).toFixed(3)})`;
      ctx.fillRect(Math.round(cx - 8 + k * 5 + Math.sin(now / 500 + k) * 2), Math.round(cy - 10 - s), 3, 2);
    }
  }));
}

/** The swing hanging from the roof over the middle of KitKat's pool: two ropes from the ceiling, a wooden seat,
 *  someone sitting on it kicking their legs to swing higher, and the seat's shadow moving on the water below. */
function drawSwing(sc: ClubScene, now: number, camX: number, camY: number) {
  let x0 = sc.w, y0 = sc.h, x1 = -1, y1 = -1;
  sc.map.forEach((row, y) => row.forEach((t, x) => { if (t === 64) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } }));
  if (x1 < 0) return;
  const cx = ((x0 + x1 + 1) / 2) * T - camX, cy = ((y0 + y1 + 1) / 2) * T - camY;
  const swing = reduceMotion ? 0 : Math.sin(now / 900);            // -1 … 1, a slow pendulum
  const seatX = Math.round(cx + swing * 26), seatY = Math.round(cy - 4 - Math.abs(swing) * 5); // higher at the ends of the swing
  const topY = cy - 70;                                              // the ropes go up into the dark roof
  // the shadow on the water
  ctx.fillStyle = 'rgba(0,0,30,.25)'; ctx.fillRect(seatX - 8, Math.round(cy + 10), 16, 3);
  // ropes
  ctx.strokeStyle = '#c9a24a'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx - 7, topY); ctx.lineTo(seatX - 7, seatY); ctx.moveTo(cx + 7, topY); ctx.lineTo(seatX + 7, seatY); ctx.stroke();
  // the person sitting on it, legs swinging forward and back to keep it going
  const kick = swing > 0 ? 1 : 2;
  person(ctx, seatX - 8, seatY - 14, swing > 0 ? 'right' : 'left', reduceMotion ? 0 : kick, { skin: '#f0c7a0', hair: '#ff8cc4', top: '#c4162a', legs: '#c4162a', shine: '#ff7a8a', long: true });
  // the seat, in front of their legs
  ctx.fillStyle = INK; ctx.fillRect(seatX - 9, seatY - 1, 18, 4);
  ctx.fillStyle = '#8a5a34'; ctx.fillRect(seatX - 8, seatY, 16, 2);
}

/** The little dragon on the dungeon wall breathes fire every few seconds: a cone of flame into the room and a
 *  warm flash on the floor. With reduced motion it just glows. */
function drawDragonFire(sc: ClubScene, now: number, camX: number, camY: number) {
  const DRAGON = ICH['û'];
  sc.map.forEach((row, y) => row.forEach((t, x) => {
    if (t !== DRAGON) return;
    const mx = (x + 1) * T - camX, my = y * T + 8 - camY;
    if (mx < -64 || my < -32 || mx > RT.VW + 64 || my > RT.VH + 32) return;
    const cyc = reduceMotion ? 99 : (now + x * 700) % 4200;
    if (cyc > 1100) { ctx.fillStyle = 'rgba(255,140,40,.25)'; ctx.fillRect(mx - 3, my - 1, 3, 2); return; } // embers in its mouth
    const k = cyc / 1100, len = 10 + Math.sin(k * Math.PI) * 44;
    ctx.fillStyle = `rgba(255,120,40,${(0.18 * Math.sin(k * Math.PI)).toFixed(3)})`; ctx.fillRect(mx, my - 18, len + 10, 36); // the flash
    for (let i = 0; i < 26; i++) {
      const d = ((i * 37 + now / 6) % len), spread = 1 + d * 0.28, off = Math.sin(i * 12.7 + now / 90) * spread;
      ctx.fillStyle = d < len * 0.35 ? '#fff2a8' : d < len * 0.7 ? '#ffb020' : '#e8401a';
      const sz = d < len * 0.5 ? 2 : 3;
      ctx.fillRect(Math.round(mx + d), Math.round(my + off), sz, sz);
    }
  }));
}

/** The front of every cage, drawn over the people in it: bright steel bars, the bottom rail, the door on the
 *  right end hanging open a crack, and a padlock that isn't actually locked. */
function drawCageFronts(sc: ClubScene, camX: number, camY: number) {
  const CAGE = 98;
  sc.map.forEach((row, y) => row.forEach((t, x) => {
    if (t !== CAGE) return;
    const X = x * T - camX, Y = y * T - camY;
    if (X < -16 || Y < -24 || X > RT.VW || Y > RT.VH + 8) return;
    const first = row[x - 1] !== CAGE, last = row[x + 1] !== CAGE;
    for (let i = 2; i < 16; i += 4) { ctx.fillStyle = INK; ctx.fillRect(X + i + 1, Y - 8, 1, 22); ctx.fillStyle = '#c0c4cc'; ctx.fillRect(X + i, Y - 8, 1, 22); }
    ctx.fillStyle = INK; ctx.fillRect(X, Y + 14, 16, 2); ctx.fillStyle = '#a7a7b3'; ctx.fillRect(X, Y + 13, 16, 1); // bottom rail
    ctx.fillStyle = '#a7a7b3'; ctx.fillRect(X, Y - 9, 16, 1);                                                      // top rail
    if (first) { ctx.fillStyle = '#c0c4cc'; ctx.fillRect(X, Y - 9, 2, 24); }
    if (last) {
      ctx.fillStyle = '#c0c4cc'; ctx.fillRect(X + 14, Y - 9, 2, 24);
      // the padlock, hanging open
      ctx.fillStyle = INK; ctx.fillRect(X + 10, Y + 1, 5, 5); ctx.fillStyle = '#e0b040'; ctx.fillRect(X + 11, Y + 2, 3, 3);
      ctx.fillStyle = '#c0c4cc'; ctx.fillRect(X + 11, Y - 2, 1, 3); ctx.fillRect(X + 13, Y - 1, 1, 2);
    }
  }));
}

/** How a colour looks under black light: whites and light colours glow cyan-white, bright colours turn neon,
 *  dark ones (black latex, leather) stay dark. */
function fluoro(hex: string | undefined): string {
  if (!hex || hex[0] !== '#' || hex.length < 7) return '#000000';
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  const lum = (0.3 * r + 0.59 * g + 0.11 * b) / 255, max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (lum > 0.72) return '#c8ffff';                            // white: the brightest glow
  if (lum < 0.18) return '#000000';                            // black: nothing ('lighter' adds nothing)
  if (max - min > 90) return max === r ? (b > g ? '#ff40e0' : '#ff7a30') : max === g ? '#60ff40' : '#40d0ff'; // colours go neon
  return '#5a2a9a';                                            // skin and greys: a faint violet sheen
}
const fluoroLook = (L: Look): Look => ({
  ...L, skin: '#3a1a6a', hair: fluoro(L.hair), top: fluoro(L.top), legs: fluoro(L.legs), stripes: L.stripes && fluoro(L.stripes),
  shine: L.shine && '#e0c0ff', paint: L.paint && '#ffffff', sparkle: L.sparkle && '#ffffff'
});

/** Black light: the room deep violet, UV tubes glowing along the top wall, three UV spotlights sweeping slowly
 *  through the room, and wherever a beam passes over someone their clothes light up fluorescent. With reduced motion the beams stand still. */
function blackLight(sc: ClubScene, now: number, camX: number, camY: number, ppx: number, ppy: number, lights: boolean) {
  ctx.fillStyle = 'rgba(40,0,110,.34)'; ctx.fillRect(0, 0, RT.VW, RT.VH);
  const W = sc.w * T, H = sc.h * T, t = lights ? now / 1000 : 0;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  // UV tubes on the top wall
  for (let x = 2; x + 3 < sc.w; x += 7) {
    const X = x * T - camX, Y = T - 5 - camY;
    const gr = ctx.createLinearGradient(0, Y, 0, Y + 4 * T);
    gr.addColorStop(0, 'rgba(150,80,255,.26)'); gr.addColorStop(1, 'rgba(150,80,255,0)');
    ctx.fillStyle = gr; ctx.fillRect(X - 6, Y, 3 * T + 12, 4 * T);
    ctx.fillStyle = '#d0a0ff'; ctx.fillRect(X, Y, 3 * T, 2); ctx.fillStyle = 'rgba(190,120,255,.6)'; ctx.fillRect(X - 1, Y - 1, 3 * T + 2, 4);
  }
  // the moving spotlights, each on its own slow loop round the room
  const R = 3.2 * T;
  const beams = [[0.13, 0.21, 0], [0.17, 0.11, 2.1], [0.09, 0.16, 4.4]].map(([a, b, ph]) => ({
    x: W / 2 + Math.sin(t * a * 2 * Math.PI / 2 + ph) * W * 0.38, y: H / 2 + Math.sin(t * b * 2 * Math.PI / 2 + ph * 1.7) * H * 0.34
  }));
  beams.forEach((bm, i) => {
    const X = bm.x - camX, Y = bm.y - camY;
    const gr = ctx.createRadialGradient(X, Y, 0, X, Y, R);
    const c = i === 1 ? '120,60,255' : '170,70,255';
    gr.addColorStop(0, `rgba(${c},.30)`); gr.addColorStop(0.6, `rgba(${c},.12)`); gr.addColorStop(1, `rgba(${c},0)`);
    ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(X, Y, R, R * 0.7, 0, 0, Math.PI * 2); ctx.fill();
  });
  // fluorescence: anyone a beam passes over lights up, brighter the closer they are to its middle
  const glowAt = (cx: number, cy: number) => beams.reduce((m, bm) => Math.max(m, 1 - Math.hypot((cx - bm.x) / R, (cy - bm.y) / (R * 0.7))), 0);
  const glow = (X: number, Y: number, k: number, draw: () => void) => {
    if (k <= 0) return; ctx.globalAlpha = Math.min(0.85, k * 1.1); draw(); ctx.globalAlpha = 1;
  };
  RT.ents.forEach(e => {
    if (!e.look || e.swim || e.kind !== 'npc') return;
    const wx = e.x * T + 8 + (e.ox || 0), wy = e.y * T + 6 + (e.oy || 0), X = Math.round(wx - 8 - camX), Y = Math.round(wy - 6 - camY);
    if (X < -16 || Y < -24 || X > RT.VW || Y > RT.VH + 8) return;
    const k = glowAt(wx, wy), L = fluoroLook(e.look);
    glow(X, Y, k, () => {
      if (e.lie) {
        const under = sc.map[e.y]?.[e.x]; let m0 = e.x, m1 = e.x;
        while (sc.map[e.y]?.[m0 - 1] === under) m0--; while (sc.map[e.y]?.[m1 + 1] === under) m1++;
        ctx.save(); ctx.translate(Math.round(((m0 + m1 + 1) / 2) * T - camX), Y + 7); ctx.rotate(-Math.PI / 2); person(ctx, -8, -8, 'down', 0, L); ctx.restore();
      } else person(ctx, X, Y - 3, e.dir ?? 'down', 0, L);
    });
  });
  glow(ppx - camX, ppy - camY, glowAt(ppx + 8, ppy + 6), () => person(ctx, ppx - camX, ppy - camY - 3, player.dir, 0, fluoroLook(lookOf(state.outfit))));
  ctx.restore();
}

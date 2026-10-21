import { ctx } from './canvas';
import { person } from './sprites';
import { pixelText, pixelTextWidth } from './pixelFont';
import { INK, reduceMotion } from '../util';
import { KINO } from '../world/city';
import { RT } from '../core/runtime';
import { T } from '../world/tiles';
import type { Dir, Look } from '../types';

/* The Freiluftkino's moving parts, over its drawing in render/cityTiles.ts (drawKino): tonight's film on the screen
   (a 22-second loop: the countdown leader, the title, the queue, the dancefloor, the sunrise, with subtitles and old
   film scratches), the projector beam with dust in it, the audience in deckchairs (laughing at the punchline, bobbing
   to the club scene, someone standing up into the beam now and then), the usher with a torch, the marquee bulbs.
   With reduced motion it holds the title card and nobody moves. */

const hash = (n: number) => { let h = Math.imul(n ^ 0x5bd1e995, 0x27d4eb2d); h ^= h >>> 15; return (Math.imul(h, 0x165667b1) >>> 0); };
const rgba = (hex: string, a: number) => `rgba(${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)},${a.toFixed(3)})`;

// the film: scene lengths in seconds, and the colour each one throws onto the audience
const SCENES = [
  { len: 3, cast: '#d8d2c0' },  // countdown leader
  { len: 4, cast: '#9fb0ff' },  // title
  { len: 5, cast: '#5a78d8' },  // the queue: Heute nicht
  { len: 5, cast: '#d04ae0' },  // the dancefloor
  { len: 5, cast: '#ff9a4a' }   // sunrise over the Spree
];
const FILM = SCENES.reduce((a, s) => a + s.len, 0);

// the audience: 10 rows of 6 deckchairs, a few left empty
const ROWS = 10, COLS = 6;
const SKIN = ['#f3c9a8', '#e2b08c', '#c98d6a', '#8d5a3b', '#f0c7a0', '#5a3a22'];
const HAIR = ['#111111', '#2a2420', '#5a3a22', '#c9a24a', '#b04a2a', '#c9c9c9', '#ff8cc4', '#5ec8ff', '#d9b25c'];
const TOPS = ['#c94a3a', '#3d5f94', '#58b368', '#ffd23f', '#f3eee3', '#14121c', '#7a3fd1', '#ff8c42', '#2bb3a3'];
const FABRIC = ['#3d6fb6', '#c4162a', '#2bb3a3', '#f2c14e', '#58b368'];
type Seat = { look: Look; fabric: string; blanket: string | null; popcorn: boolean; laughs: boolean; dances: boolean } | null;
const SEATS: Seat[] = [];
for (let i = 0; i < ROWS * COLS; i++) {
  const h = hash(i + 7);
  if (h % 9 === 0) { SEATS.push(null); continue; }
  SEATS.push({
    look: { skin: SKIN[h % SKIN.length], hair: HAIR[(h >>> 4) % HAIR.length], top: TOPS[(h >>> 8) % TOPS.length], legs: '#26242e', long: (h >>> 12) % 3 === 0, hat: (h >>> 14) % 11 === 0 ? '#f3eee3' : undefined },
    fabric: FABRIC[(h >>> 16) % FABRIC.length],
    blanket: (h >>> 19) % 5 === 0 ? TOPS[(h >>> 21) % TOPS.length] : null,
    popcorn: (h >>> 23) % 7 === 0,
    laughs: (h >>> 25) % 5 < 2,
    dances: (h >>> 27) % 4 === 0
  });
}
const USHER: Look = { skin: '#e2b08c', hair: '#2a2420', top: '#14121c', legs: '#26242e', hat: '#c4162a' };
const QUEUE: Look[] = [
  { skin: '#8d5a3b', hair: '#111111', top: '#ffd23f', legs: '#2b3f6b' },
  { skin: '#f3c9a8', hair: '#ff8cc4', top: '#3d5f94', legs: '#26242e', long: true }
];

/** A tiny figure on the screen, 4 px wide, 10 tall. */
function fig(x: number, y: number, body: string, head: string) {
  ctx.fillStyle = head; ctx.fillRect(x + 1, y, 3, 3);
  ctx.fillStyle = body; ctx.fillRect(x, y + 3, 5, 5); ctx.fillRect(x, y + 8, 2, 2); ctx.fillRect(x + 3, y + 8, 2, 2);
}
function subtitle(text: string, sx: number, sy: number) {
  const w = pixelTextWidth(text), x = Math.round(sx + 48 - w / 2);
  pixelText(ctx, text, x + 1, sy + 47, INK); pixelText(ctx, text, x, sy + 46, '#fff6c8');
}

/** One frame of the film into the 96×54 screen at sx, sy; returns the colour it throws back. */
function film(sx: number, sy: number, now: number, moving: boolean): string {
  let t = moving ? (now / 1000) % FILM : 4.5, scene = 0;
  while (t >= SCENES[scene].len) { t -= SCENES[scene].len; scene++; }
  const R = (x: number, y: number, w: number, h: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(sx + x, sy + y, w, h); };
  if (scene === 0) {
    // the countdown leader: 3, 2, 1, with the sweep going round
    R(0, 0, 96, 54, '#c8c2b0');
    const cx = sx + 48, cy = sy + 27, a = (t % 1) * Math.PI * 2 - Math.PI / 2;
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, 30, -Math.PI / 2, a); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.stroke();
    R(0, 27, 96, 1, INK); R(48, 0, 1, 54, INK);
    ctx.save(); ctx.translate(cx - 4, cy - 7); ctx.scale(3, 3); pixelText(ctx, String(3 - Math.floor(t)), 0, 0, INK); ctx.restore();
  } else if (scene === 1) {
    // the title over a night sky
    R(0, 0, 96, 54, '#07060c');
    for (let i = 0; i < 22; i++) { const h = hash(i + 99); if (!moving || (Math.floor(now / 300) + i) % 5) R(h % 96, (h >>> 8) % 54, 1, 1, i % 4 ? '#8a8aa8' : '#fff'); }
    ctx.save(); ctx.globalAlpha = Math.min(1, t * 1.5); ctx.translate(sx + 13, sy + 13); ctx.scale(2, 2); pixelText(ctx, 'TÜRSTEHER', 0, 0, '#f3eee3'); ctx.restore();
    ctx.globalAlpha = Math.min(1, Math.max(0, t - 0.8) * 1.5); pixelText(ctx, 'THE MOVIE', sx + 31, sy + 31, '#ffd23f'); ctx.globalAlpha = 1;
  } else if (scene === 2) {
    // the queue outside a grey concrete block; the first in line gets turned away
    R(0, 0, 96, 40, '#141a36'); R(0, 40, 96, 14, '#2a2830');
    R(60, 8, 34, 32, '#5a5a64'); for (let i = 0; i < 4; i++) R(63 + i * 8, 12, 4, 3, '#3a3a44');
    R(66, 28, 7, 12, '#07060c'); R(69, 28, 1, 12, '#c4162a');
    const shake = t > 1.8 && t < 3 && moving ? (Math.floor(now / 90) % 2 ? 1 : -1) : 0;
    fig(sx + 75, sy + 30, '#07060c', '#c98d6a'); R(76 + shake, 30, 3, 1, '#c98d6a');   // the bouncer, shaking his head
    for (let i = 1; i < 7; i++) fig(sx + 50 - i * 7 + (moving && (Math.floor(now / 500) + i) % 3 === 0 ? 1 : 0), sy + 31, TOPS[i % TOPS.length], SKIN[i % SKIN.length]);
    const fx = t < 1.5 ? 54 + t * 5 : t < 3.5 ? 61 : 61 - (t - 3.5) * 40;
    fig(sx + Math.round(fx), sy + 31, '#ff5e7a', '#f3c9a8');
    if (t > 1.8 && t < 4.2) subtitle('HEUTE NICHT', sx, sy);
  } else if (scene === 3) {
    // the dancefloor: lasers, a crowd with its hands up, a flash on the beat
    R(0, 0, 96, 54, '#0b0614');
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 2 + (i - 2.5) * 0.35 + Math.sin(now / 600 + i) * 0.3;
      ctx.strokeStyle = i % 2 ? 'rgba(80,255,140,.8)' : 'rgba(255,70,220,.8)';
      ctx.beginPath(); ctx.moveTo(sx + 48, sy + 1); ctx.lineTo(sx + 48 + Math.cos(a) * 80, sy + 1 + Math.sin(a) * 80); ctx.stroke();
    }
    const beat = Math.floor(now / 250);
    for (let i = 0; i < 13; i++) {
      const up = (beat + i) % 2, x = 2 + i * 7;
      R(x, 36 - up * 2, 6, 18, '#1d1426'); R(x + 1, 33 - up * 2, 4, 4, '#2a1f38');
      if ((i + beat) % 3 === 0) { R(x, 28 - up * 2, 1, 6, '#1d1426'); R(x + 5, 28 - up * 2, 1, 6, '#1d1426'); }
    }
    if (beat % 8 === 0 && now % 250 < 70) R(0, 0, 96, 54, 'rgba(255,255,255,.45)');
    subtitle('ONE MORE TRACK', sx, sy);
  } else {
    // sunrise over the Spree, the Fernsehturm against it
    const BANDS = ['#2a1f4a', '#4a2a5a', '#7a3a60', '#b4505a', '#e07a4a', '#ff9a4a'];
    BANDS.forEach((c, i) => R(0, i * 7, 96, 7, c)); R(0, 38, 96, 2, '#ffb86a');
    const sunY = 38 - Math.round((t / 5) * 12);
    ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(sx + 62, sy + sunY, 8, 0, Math.PI * 2); ctx.fill();
    R(24, 10, 2, 30, '#1a1226'); ctx.fillStyle = '#1a1226'; ctx.beginPath(); ctx.arc(sx + 25, sy + 16, 3.5, 0, Math.PI * 2); ctx.fill(); R(25, 3, 1, 9, '#1a1226');
    R(0, 32, 40, 8, '#1a1226'); R(78, 30, 18, 10, '#1a1226');                           // the city
    R(0, 40, 96, 14, '#2a3a6a');
    for (let i = 0; i < 5; i++) R(56 + (moving ? Math.round(Math.sin(now / 300 + i) * 2) : 0), 41 + i * 3, 12 - i * 2, 1, '#ffb04a');
    subtitle('WAIT IS IT MONDAY', sx, sy);
  }
  if (moving) {
    // old film: a flicker, and a scratch now and then
    const f = Math.floor(now / 80), h = hash(f);
    if (h % 4 === 0) R(0, 0, 96, 54, 'rgba(0,0,0,.08)');
    if (h % 5 === 0) R((h >>> 8) % 96, 0, 1, 54, 'rgba(255,255,240,.35)');
    if (h % 7 === 0) R((h >>> 12) % 92, (h >>> 4) % 50, 2, 2, 'rgba(0,0,0,.5)');
  }
  return SCENES[scene].cast;
}

export function drawKinoLife(now: number, camX: number, camY: number) {
  const X = KINO.x * T - camX, Y = KINO.y * T - camY, W = KINO.w * T;
  if (X > RT.VW || Y > RT.VH || X + W < 0 || Y + KINO.h * T < 0) return;
  const moving = !reduceMotion, t = now / 1000;
  const sx = X + 8, sy = Y + 6, lensX = X + 58, lensY = Y + 262, screenB = Y + 60;
  // the picture, clipped to the screen
  ctx.save(); ctx.beginPath(); ctx.rect(sx, sy, 96, 54); ctx.clip();
  const cast = film(sx, sy, now, moving);
  // someone stands up into the beam: their shadow on the screen, bigger the nearer they are to the projector
  const period = Math.floor(now / 15000), standing = moving && now % 15000 < 2500;
  let stander = -1;
  if (standing) { for (let k = 0; k < SEATS.length; k++) { const i = (hash(period) + k) % SEATS.length; if (SEATS[i]) { stander = i; break; } } }
  if (stander >= 0) {
    const r = Math.floor(stander / COLS), c = stander % COLS, hx = X + 26 + c * 15, hy = Y + 96 + r * 16 - 4;
    const s = Math.min(3, (lensY - screenB) / Math.max(20, lensY - hy)), shx = lensX + (hx - lensX) * s, w = Math.round(7 * s);
    ctx.fillStyle = 'rgba(0,0,0,.75)';
    ctx.fillRect(Math.round(shx - w / 2), sy + 54 - Math.round(w * 1.6), w, Math.round(w * 1.1));
    ctx.fillRect(Math.round(shx - w), sy + 54 - Math.round(w * 0.6), w * 2, Math.round(w * 0.6));
  }
  ctx.restore();
  // the screen's glow on the stage and on the marquee
  ctx.fillStyle = rgba(cast, 0.1); ctx.fillRect(X + 4, Y + 62, W - 8, 32);
  // the marquee bulbs, chasing
  for (let i = 0; i < 21; i++) {
    const on = !moving || (i + Math.floor(now / 140)) % 3 !== 0;
    ctx.fillStyle = on ? '#fff2a8' : '#6a4a1a'; ctx.fillRect(X + 6 + i * 5, Y + 73, 2, 1); ctx.fillRect(X + 6 + i * 5, Y + 89, 2, 1);
  }
  // the audience in their deckchairs, from behind
  const scene2 = moving && (t % FILM) > 7 + 1.8 && (t % FILM) < 7 + 4.2, dance = moving && (t % FILM) > 12 && (t % FILM) < 17;
  SEATS.forEach((seat, i) => {
    const r = Math.floor(i / COLS), c = i % COLS, x = X + 18 + c * 15, y = Y + 96 + r * 16;
    if (!seat) {
      ctx.fillStyle = INK; ctx.fillRect(x + 2, y + 4, 12, 12);
      for (let k = 0; k < 5; k++) { ctx.fillStyle = k % 2 ? '#f3eee3' : FABRIC[(r + c) % FABRIC.length]; ctx.fillRect(x + 3 + k * 2, y + 5, 2, 10); }
      return;
    }
    const up = i === stander;
    let bob = 0;
    if (!up && moving) {
      if (scene2 && seat.laughs) bob = (Math.floor(now / 110) + i) % 2 ? -1 : 0;
      else if (dance && seat.dances) bob = (Math.floor(now / 250) + r) % 2 ? -1 : 0;
      else if (Math.sin(t * 0.7 + i * 1.7) > 0.98) bob = -1;
    }
    if (up) { ctx.fillStyle = INK; ctx.fillRect(x + 2, y + 9, 12, 7); }
    person(ctx, x, y - 2 + bob - (up ? 7 : 0), 'up', 0, seat.look);
    if (!up) {
      ctx.fillStyle = INK; ctx.fillRect(x + 2, y + 9, 12, 7);
      for (let k = 0; k < 5; k++) { ctx.fillStyle = k % 2 ? '#f3eee3' : seat.fabric; ctx.fillRect(x + 3 + k * 2, y + 10, 2, 5); }
      if (seat.blanket) { ctx.fillStyle = seat.blanket; ctx.fillRect(x + 3, y + 9, 10, 2); }
    }
    if (seat.popcorn) { ctx.fillStyle = INK; ctx.fillRect(x + 12, y + 3, 5, 6); ctx.fillStyle = '#f3eee3'; ctx.fillRect(x + 13, y + 4, 3, 4); ctx.fillStyle = '#c4162a'; ctx.fillRect(x + 14, y + 4, 1, 4); ctx.fillStyle = '#fff8c8'; ctx.fillRect(x + 13, y + 3, 3, 1); }
  });
  // the queue at the popcorn kiosk, and the usher walking the aisle with a torch
  person(ctx, X + 2, Y + 228, 'down', 0, QUEUE[0]);
  person(ctx, X + 2, Y + 244, 'down', 0, QUEUE[1]);
  const k = moving ? Math.sin(t * 0.25) * 0.5 + 0.5 : 0.3, goingDown = Math.cos(t * 0.25) > 0;
  const uy = Y + 98 + Math.round(k * 104), udir: Dir = moving ? (goingDown ? 'down' : 'up') : 'right';
  ctx.fillStyle = 'rgba(255,230,150,.3)';
  ctx.beginPath();
  if (udir === 'down') { ctx.moveTo(X + 10, uy + 14); ctx.lineTo(X + 4, uy + 28); ctx.lineTo(X + 17, uy + 28); }
  else if (udir === 'up') { ctx.moveTo(X + 10, uy); ctx.lineTo(X + 4, uy - 12); ctx.lineTo(X + 17, uy - 12); }
  else { ctx.moveTo(X + 14, uy + 10); ctx.lineTo(X + 22, uy + 6); ctx.lineTo(X + 22, uy + 15); }
  ctx.fill();
  person(ctx, X + 2, uy, udir, moving ? (Math.floor(now / 260) % 2) + 1 : 0, USHER);
  // the projector beam, over everyone's heads, with dust floating in it
  const flick = moving ? (hash(Math.floor(now / 80)) % 4) * 0.01 : 0;
  const g = ctx.createLinearGradient(lensX, lensY, lensX, screenB);
  g.addColorStop(0, rgba(cast, 0.34 + flick)); g.addColorStop(1, rgba(cast, 0.1));
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(lensX - 2, lensY); ctx.lineTo(sx, screenB); ctx.lineTo(sx + 96, screenB); ctx.lineTo(lensX + 2, lensY); ctx.closePath(); ctx.fill();
  // a brighter core down the middle, and the two edges of the beam
  ctx.fillStyle = rgba('#fff8e0', 0.12 + flick);
  ctx.beginPath(); ctx.moveTo(lensX - 1, lensY); ctx.lineTo(sx + 30, screenB); ctx.lineTo(sx + 66, screenB); ctx.lineTo(lensX + 1, lensY); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = rgba('#fff8e0', 0.18); ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(lensX - 2, lensY); ctx.lineTo(sx, screenB); ctx.moveTo(lensX + 2, lensY); ctx.lineTo(sx + 96, screenB); ctx.stroke();
  ctx.restore();
  for (let i = 0; i < 16; i++) {
    const h = hash(i + 300), u = moving ? ((t * 0.03 + (h % 1000) / 1000) % 1) : (h % 1000) / 1000, v = ((h >>> 10) % 200) / 100 - 1;
    const dx = lensX + (sx + 48 + v * 44 - lensX) * u, dy = lensY + (screenB - lensY) * u;
    if (!moving || (Math.floor(now / 200) + i) % 4) { ctx.fillStyle = 'rgba(255,250,230,.55)'; ctx.fillRect(Math.round(dx), Math.round(dy), 1, 1); }
  }
  // the lens
  ctx.fillStyle = INK; ctx.fillRect(lensX - 3, lensY - 1, 6, 4);
  ctx.fillStyle = moving && hash(Math.floor(now / 80)) % 6 === 0 ? '#fff2c8' : '#fffbe8'; ctx.fillRect(lensX - 2, lensY, 4, 2);
}

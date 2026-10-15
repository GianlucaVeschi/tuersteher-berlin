import { RT } from '../core/runtime';
import { INTERIORS } from '../data/interiors';
import { person } from '../render/sprites';
import { INK, $, reduceMotion } from '../util';
import type { Look } from '../types';

/* ================= THE HEIDEGLÜHEN DJ SET ================= */
// A Guitar Hero-style rhythm game: you stand in the booth, the dancefloor in front of you in
// perspective. Records slide down three lanes towards the hit line; hit them on time (left, middle,
// right) and the crowd goes wild. 30 seconds. Keep the crowd's energy up to win.

const SET_S = 30, BPM = 122, BEAT = 60 / BPM, LEAD = 1.5;
const GOOD = 0.14, PERFECT = 0.06;
const LANE_COL = ['#ff8c42', '#ffd23f', '#ff5e7a'];

interface Note { lane: number; t: number; done?: 'hit' | 'miss' }
interface Dancer { x: number; z: number; img: HTMLCanvasElement[]; phase: number }

const root = $('#djgame');
const cv = $<HTMLCanvasElement>('#djCanvas');
const g = cv.getContext('2d')!;

/** Two frames of a dancer (facing you), drawn once and scaled. */
function frames(look: Look): HTMLCanvasElement[] {
  return [0, 1].map(f => {
    const c = document.createElement('canvas'); c.width = 16; c.height = 16;
    person(c.getContext('2d')!, 0, 0, 'down', f + 1, look);
    return c;
  });
}
const pick = <V>(a: V[]) => a[Math.floor(Math.random() * a.length)];

/** Plays the set. Resolves true if the crowd was still with you after 30 seconds. */
export function playDjSet(): Promise<boolean> {
  return new Promise(resolve => {
    const r = root.parentElement!.getBoundingClientRect();
    const W = 240, H = Math.max(150, Math.min(420, Math.round(W * r.height / Math.max(1, r.width))));
    cv.width = W; cv.height = H; g.imageSmoothingEnabled = false;
    // the crowd on the wooden floor (top part), the lane "highway" over the booth (bottom part)
    const CROWD_HOR = Math.round(H * 0.16), CROWD_NEAR = Math.round(H * 0.5);
    const HW_FAR = Math.round(H * 0.52), HIT_Y = Math.round(H * 0.86);

    const pal = INTERIORS.heidegluehen.dancerPalette;
    const dancers: Dancer[] = [];
    for (let i = 0; i < 22; i++) {
      const look: Look = pal
        ? { skin: pick(['#f3c9a8', '#e2b08c', '#c98d6a', '#8d5a3b', '#f0c7a0']), hair: pick(pal.hair), top: pick(pal.tops), legs: pick(pal.legs), long: Math.random() < 0.4 }
        : { skin: '#e2b08c', hair: '#2a2420', top: '#c94a3a', legs: '#2b3f6b' };
      dancers.push({ x: Math.random() * 2 - 1, z: Math.random(), img: frames(look), phase: Math.random() * 4 });
    }
    dancers.sort((a, b) => a.z - b.z);

    // the chart: one record per beat, sometimes two in a row, busier as the set goes on
    const notes: Note[] = [];
    for (let t = 2.5; t < SET_S - 0.5; t += BEAT) {
      const busy = t / SET_S;
      notes.push({ lane: Math.floor(Math.random() * 3), t });
      if (Math.random() < 0.2 + busy * 0.35) notes.push({ lane: Math.floor(Math.random() * 3), t: t + BEAT / 2 });
    }

    let t = -2.4, energy = 40, combo = 0, best = 0, hits = 0, misses = 0, last = performance.now();
    let flash = '', flashT = 0, phase: 'intro' | 'play' | 'win' | 'lose' = 'intro', endT = 0;
    const laneFlash = [0, 0, 0];

    function tap(lane: number) {
      if (phase === 'win' || phase === 'lose') { if (endT > 1) finish(); return; }
      if (phase !== 'play') return;
      laneFlash[lane] = 0.15;
      let bestN: Note | null = null, bestD = 9;
      for (const n of notes) if (!n.done && n.lane === lane) { const d = Math.abs(n.t - t); if (d < bestD) { bestD = d; bestN = n; } }
      if (bestN && bestD <= GOOD) {
        bestN.done = 'hit'; hits++; combo++; best = Math.max(best, combo);
        const perfect = bestD <= PERFECT;
        energy = Math.min(100, energy + (perfect ? 5 : 3));
        flash = perfect ? 'PERFECT' : 'GOOD'; flashT = 0.5;
      } else {
        // pressing with nothing there: a little scratch, a little penalty
        energy = Math.max(0, energy - 2); combo = 0; flash = 'SCRATCH'; flashT = 0.4;
      }
    }
    RT.runner = {
      music: 'heide',
      dir(d) { tap(d === 'left' ? 0 : d === 'right' ? 2 : 1); },
      jump() { tap(1); }
    };
    // touch: tap the left, middle or right third of the screen
    const down = (ev: PointerEvent) => {
      ev.preventDefault();
      const b = cv.getBoundingClientRect();
      tap(Math.max(0, Math.min(2, Math.floor((ev.clientX - b.left) / b.width * 3))));
    };
    root.addEventListener('pointerdown', down);

    // the highway in perspective: lanes converge towards the crowd
    const hwX = (lane: number, y: number) => {
      const k = (y - HW_FAR) / (HIT_Y - HW_FAR); // 0 far .. 1 at the hit line
      const half = W * (0.16 + 0.22 * k);
      return W / 2 + (lane - 1) * half * 0.66;
    };
    const noteY = (dt: number) => {
      const u = Math.max(0, Math.min(1, 1 - dt / LEAD)); // 0 just spawned .. 1 at the hit line
      return HW_FAR + (HIT_Y - HW_FAR) * u * u;
    };

    function step(dt: number) {
      t += dt;
      laneFlash.forEach((v, i) => { laneFlash[i] = Math.max(0, v - dt); });
      flashT = Math.max(0, flashT - dt);
      if (phase === 'intro' && t >= 0) phase = 'play';
      if (phase !== 'play') { endT += dt; return; }
      for (const n of notes) if (!n.done && t - n.t > GOOD) { n.done = 'miss'; misses++; combo = 0; energy = Math.max(0, energy - 5); flash = 'MISS'; flashT = 0.4; }
      energy = Math.max(0, energy - dt * 0.6); // the crowd drifts off if you stop feeding it
      if (t >= SET_S) { phase = energy >= 50 ? 'win' : 'lose'; endT = 0; }
    }

    function text(s: string, x0: number, y0: number, size: number, col: string) {
      g.font = `${size}px "Press Start 2P", monospace`; g.textAlign = 'center'; g.textBaseline = 'top';
      g.fillStyle = INK; g.fillText(s, x0 + 1, y0 + 1); g.fillStyle = col; g.fillText(s, x0, y0);
    }

    function draw(now: number) {
      const tt = now / 1000, fx = !reduceMotion, beat = (Math.max(0, t) / BEAT) % 1;
      // sky through the glass roof, getting lighter as the set goes on (sunrise over the harbour)
      const dawn = Math.max(0, Math.min(1, t / SET_S));
      const sky = g.createLinearGradient(0, 0, 0, CROWD_HOR + 8);
      sky.addColorStop(0, `rgb(${20 + dawn * 60},${18 + dawn * 40},${50 + dawn * 40})`);
      sky.addColorStop(1, `rgb(${120 + dawn * 120},${60 + dawn * 90},${70 + dawn * 30})`);
      g.fillStyle = sky; g.fillRect(0, 0, W, CROWD_HOR + 8);
      g.fillStyle = 'rgba(200,235,250,.25)'; for (let x = 0; x < W; x += 30) g.fillRect(x, 0, 1, CROWD_HOR + 8);
      // fairy lights along the roof edge
      for (let i = 0; i < 24; i++) { const on = !fx || (Math.floor(tt * 2) + i) % 3; if (on) { g.fillStyle = ['#ffd23f', '#ff5e7a', '#5ec8ff', '#b6f36b'][i % 4]; g.fillRect(i * 10 + 4, CROWD_HOR + 2 + Math.sin(i) * 2, 2, 2); } }
      // the wooden dancefloor in perspective
      const floor = g.createLinearGradient(0, CROWD_HOR, 0, CROWD_NEAR);
      floor.addColorStop(0, '#4a3420'); floor.addColorStop(1, '#7a5434');
      g.fillStyle = floor; g.fillRect(0, CROWD_HOR + 8, W, CROWD_NEAR - CROWD_HOR);
      for (let k = 1; k < 8; k++) { const y = CROWD_HOR + 8 + (CROWD_NEAR - CROWD_HOR) * (k * k) / 64; g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, y, W, 1); }
      // the crowd: bigger and lower the closer they are; they bounce harder with more energy
      const e = energy / 100;
      for (const d of dancers) {
        const s = 0.5 + d.z * 1.6, size = 16 * s * (Math.min(H, 210) / 160);
        const X = W / 2 + d.x * W * (0.35 + d.z * 0.3), Y = CROWD_HOR + 10 + (CROWD_NEAR - CROWD_HOR - 14) * (0.15 + d.z * 0.85);
        const bounce = fx ? Math.abs(Math.sin((tt / BEAT + d.phase) * Math.PI)) * (1 + e * 5) * s : 0;
        const fr = d.img[Math.floor(tt / BEAT + d.phase) % 2];
        g.drawImage(fr, X - size / 2, Y - size - bounce, size, size);
        // hands in the air when the crowd is with you
        if (e > 0.65) { g.fillStyle = INK; g.fillRect(X - size * 0.32, Y - size * 1.05 - bounce, Math.max(1, size * 0.08), size * 0.25); g.fillRect(X + size * 0.24, Y - size * 1.05 - bounce, Math.max(1, size * 0.08), size * 0.25); }
      }
      // the booth: dark panel, two turntables and a mixer
      g.fillStyle = '#1c1a23'; g.fillRect(0, CROWD_NEAR, W, H - CROWD_NEAR);
      g.fillStyle = '#2a2833'; g.fillRect(0, CROWD_NEAR, W, 3);
      // the highway
      g.fillStyle = 'rgba(0,0,0,.35)';
      g.beginPath(); g.moveTo(hwX(0, HW_FAR) - 14, HW_FAR); g.lineTo(hwX(2, HW_FAR) + 14, HW_FAR); g.lineTo(hwX(2, H) + 30, H); g.lineTo(hwX(0, H) - 30, H); g.closePath(); g.fill();
      for (let l = 0; l < 3; l++) {
        g.strokeStyle = laneFlash[l] > 0 ? LANE_COL[l] : 'rgba(255,255,255,.18)'; g.lineWidth = laneFlash[l] > 0 ? 2 : 1;
        g.beginPath(); g.moveTo(hwX(l, HW_FAR), HW_FAR); g.lineTo(hwX(l, H), H); g.stroke();
      }
      // beat lines scrolling down
      for (let k = 0; k < 4; k++) {
        const bt = Math.floor(t / BEAT) + k + 1 - beat * 0;
        const y = noteY(bt * BEAT - t);
        if (y > HW_FAR && y < H) { g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(hwX(0, y) - 12, y, hwX(2, y) - hwX(0, y) + 24, 1); }
      }
      // hit line with three pads
      g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(hwX(0, HIT_Y) - 20, HIT_Y, hwX(2, HIT_Y) - hwX(0, HIT_Y) + 40, 1);
      for (let l = 0; l < 3; l++) {
        const x = hwX(l, HIT_Y);
        g.fillStyle = INK; g.beginPath(); g.arc(x, HIT_Y, 10, 0, Math.PI * 2); g.fill();
        g.strokeStyle = LANE_COL[l]; g.lineWidth = 2; g.beginPath(); g.arc(x, HIT_Y, 8, 0, Math.PI * 2); g.stroke();
        if (laneFlash[l] > 0) { g.fillStyle = LANE_COL[l]; g.globalAlpha = laneFlash[l] / 0.15; g.beginPath(); g.arc(x, HIT_Y, 8, 0, Math.PI * 2); g.fill(); g.globalAlpha = 1; }
      }
      // records coming down: little vinyls in the lane colour
      for (const n of notes) {
        if (n.done === 'hit') continue;
        const dt = n.t - t;
        if (dt > LEAD || dt < -0.3) continue;
        const y = noteY(dt), x = hwX(n.lane, y), rad = 4 + 7 * ((y - HW_FAR) / (HIT_Y - HW_FAR));
        g.fillStyle = INK; g.beginPath(); g.arc(x, y, rad + 1, 0, Math.PI * 2); g.fill();
        g.fillStyle = n.done === 'miss' ? '#3a3542' : '#14121c'; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
        g.fillStyle = n.done === 'miss' ? '#5a5668' : LANE_COL[n.lane]; g.beginPath(); g.arc(x, y, rad * 0.45, 0, Math.PI * 2); g.fill();
      }
      hud();
    }

    function hud() {
      // the crowd meter
      g.fillStyle = INK; g.fillRect(6, 6, 62, 8);
      g.fillStyle = energy >= 50 ? '#b6f36b' : energy >= 25 ? '#ffd23f' : '#ff5e7a'; g.fillRect(7, 7, Math.round(60 * energy / 100), 6);
      g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(37, 6, 1, 8);
      text('CROWD', 37, 16, 5, '#f3eee3');
      if (phase === 'play') text(`${Math.max(0, Math.ceil(SET_S - t))}`, W - 18, 6, 10, '#ffd23f');
      if (combo >= 4 && phase === 'play') text(`${combo} COMBO`, W / 2, HW_FAR - 12, 6, '#ffd23f');
      if (flashT > 0 && phase === 'play') text(flash, W / 2, HIT_Y - 26, 7, flash === 'PERFECT' ? '#b6f36b' : flash === 'GOOD' ? '#ffd23f' : '#ff5e7a');
      if (phase === 'intro') {
        text('YOUR SET', W / 2, H * 0.2, 10, '#ff8cc4');
        text(String(Math.ceil(-t)), W / 2, H * 0.3, 16, '#ffd23f');
        text('HIT THE RECORDS ON THE LINE', W / 2, HIT_Y - 40, 5, '#f3eee3');
        text('◀  ▲/A  ▶   OR TAP', W / 2, HIT_Y - 30, 5, '#f3eee3');
      }
      if (phase === 'win') { text('THE FLOOR IS YOURS', W / 2, H * 0.2, 8, '#b6f36b'); text(`${hits} HITS · BEST COMBO ${best}`, W / 2, H * 0.2 + 14, 5, '#f3eee3'); }
      if (phase === 'lose') { text('THE FLOOR WANDERS OFF', W / 2, H * 0.2, 7, '#ff5e7a'); text(`${hits} HITS · ${misses} MISSED`, W / 2, H * 0.2 + 14, 5, '#f3eee3'); }
      if ((phase === 'win' || phase === 'lose') && endT > 1) text('PRESS A', W / 2, H * 0.36, 7, '#ffd23f');
    }

    let raf = 0, done = false;
    function finish() {
      if (done) return;
      done = true; cancelAnimationFrame(raf);
      root.removeEventListener('pointerdown', down);
      RT.runner = null;
      root.classList.remove('show');
      setTimeout(() => { root.hidden = true; resolve(phase === 'win'); }, reduceMotion ? 0 : 350);
    }
    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      step(dt); draw(now);
      if (!done) raf = requestAnimationFrame(frame);
    }
    root.hidden = false;
    requestAnimationFrame(() => root.classList.add('show'));
    last = performance.now();
    raf = requestAnimationFrame(frame);
  });
}

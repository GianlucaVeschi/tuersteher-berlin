import { RT } from '../core/runtime';
import { state } from '../core/state';
import { lookOf } from '../render/looks';
import { person } from '../render/sprites';
import { INK, $, reduceMotion } from '../util';
import type { Dir, Look } from '../types';

/* ================= THE MDMA RUNNER ================= */
// Taking the pill at Sisyphos turns the game into a pseudo-3D endless runner through an S-Bahn
// carriage (Temple Run style) for 30 seconds: three lanes, switch lanes and jump over things.
// Drawn on its own small canvas with a simple perspective projection; the pixels are scaled up crisp.

const RUN_S = 30;
const LANE_W = 1.1, CAR_W = 2.3, CEIL = 2.7, CAM_H = 2.35, PLAYER_Z = 5, FAR_Z = 42, NEAR_Z = 0.55;
const JUMP_S = 0.62, JUMP_PEAK = 1.15;

type Kind = 'kontrolleur' | 'pole' | 'bike' | 'crate' | 'water';
interface Thing { kind: Kind; lane: number; z: number; hit?: boolean }
const JUMPABLE: Record<Kind, boolean> = { kontrolleur: false, pole: false, bike: true, crate: true, water: true };

const root = $('#runner');
const cv = $<HTMLCanvasElement>('#runCanvas');
const g = cv.getContext('2d')!;
let W = 240, H = 160, F = 130, HOR = 58;

// sprites drawn once at 16x16 and scaled per depth
function sprite(look: Look, dir: Dir): HTMLCanvasElement {
  const c = document.createElement('canvas'); c.width = 16; c.height = 16;
  person(c.getContext('2d')!, 0, 0, dir, 0, look);
  return c;
}
const INSPECTORS: Look[] = [
  { skin: '#e2b08c', hair: '#3a2a20', top: '#2a2f3a', legs: '#26242e' },
  { skin: '#c98d6a', hair: '#111111', top: '#4a4f5a', legs: '#2b3f6b', beard: '#111111' },
  { skin: '#f0c7a0', hair: '#9a9a9a', top: '#3a3a4a', legs: '#26242e', bald: true }
];

const sx = (x: number, z: number) => W / 2 + x * F / z;
const sy = (y: number, z: number) => HOR + (CAM_H - y) * F / z;

/** A flat quad on the floor/ceiling/wall, given four world points. */
function quad(pts: [number, number, number][], fill: string) {
  g.fillStyle = fill; g.beginPath();
  pts.forEach(([x, y, z], i) => { const X = sx(x, z), Y = sy(y, z); if (i) g.lineTo(X, Y); else g.moveTo(X, Y); });
  g.closePath(); g.fill();
}
const hue = (t: number, off = 0, s = 90, l = 60) => `hsl(${Math.round((t * 60 + off) % 360)},${s}%,${l}%)`;

/** Plays the runner. Resolves true if you lasted the 30 seconds. */
export function playRunner(): Promise<boolean> {
  return new Promise(resolve => {
    const r = root.parentElement!.getBoundingClientRect();
    W = 240; H = Math.max(140, Math.min(420, Math.round(W * r.height / Math.max(1, r.width))));
    cv.width = W; cv.height = H; g.imageSmoothingEnabled = false; F = Math.max(W * 0.62, H * 0.42);
    // tall phone screens: lower the horizon so you run near the bottom, Temple Run style
    HOR = Math.round(Math.max(H * 0.3, H * 0.7 - CAM_H * F / PLAYER_Z));
    const me = sprite(lookOf(state.outfit), 'up');
    const insp = INSPECTORS.map(l => sprite(l, 'down'));

    let lane = 0, x = 0, jumpT = -1, hearts = 3, invuln = 0, dist = 0, t = -2.4, spawnIn = 0.6, shake = 0;
    let flash = '', flashT = 0, phase: 'intro' | 'run' | 'win' | 'lose' = 'intro', endT = 0, last = performance.now();
    const things: Thing[] = [];

    const jump = () => { if (phase === 'run' && jumpT < 0) jumpT = 0; else if (phase === 'win' || phase === 'lose') { if (endT > 1) finish(); } };
    const move = (d: number) => { if (phase === 'run') lane = Math.max(-1, Math.min(1, lane + d)); };
    RT.runner = {
      dir(d) { if (d === 'left') move(-1); else if (d === 'right') move(1); else if (d === 'up') jump(); },
      jump
    };
    // swipe on the screen: sideways switches lanes, up (or a tap) jumps
    let sw: { x: number; y: number } | null = null;
    const down = (ev: PointerEvent) => { ev.preventDefault(); sw = { x: ev.clientX, y: ev.clientY }; };
    const up = (ev: PointerEvent) => {
      if (!sw) return;
      const dx = ev.clientX - sw.x, dy = ev.clientY - sw.y; sw = null;
      if (Math.abs(dx) > 24 && Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : -1); else jump();
    };
    root.addEventListener('pointerdown', down);
    root.addEventListener('pointerup', up);

    function spawn() {
      const roll = Math.random(), far = FAR_Z;
      if (roll < 0.12 && hearts < 3) things.push({ kind: 'water', lane: Math.floor(Math.random() * 3) - 1, z: far });
      else if (roll < 0.3) {
        // two Kontrolleure side by side: one lane stays free
        const free = Math.floor(Math.random() * 3) - 1;
        [-1, 0, 1].filter(l => l !== free).forEach(l => things.push({ kind: 'kontrolleur', lane: l, z: far }));
      } else if (roll < 0.42 && t > 8) [-1, 0, 1].forEach(l => things.push({ kind: 'crate', lane: l, z: far })); // jump!
      else {
        const kinds: Kind[] = ['kontrolleur', 'pole', 'bike', 'crate'];
        things.push({ kind: kinds[Math.floor(Math.random() * kinds.length)], lane: Math.floor(Math.random() * 3) - 1, z: far });
      }
    }

    function hit(th: Thing) {
      th.hit = true;
      if (th.kind === 'water') { hearts = Math.min(3, hearts + 1); flash = 'WATER! +1'; flashT = 1; return; }
      if (invuln > 0) return;
      hearts--; invuln = 1.1; shake = 0.35;
      flash = th.kind === 'kontrolleur' ? 'FAHRSCHEIN, BITTE!' : th.kind === 'pole' ? 'BONK' : th.kind === 'bike' ? 'WHOSE BIKE IS THIS' : 'STERNI EVERYWHERE';
      flashT = 1.2;
      if (navigator.vibrate) { try { navigator.vibrate(80); } catch { /* not allowed */ } }
      if (hearts <= 0) { phase = 'lose'; endT = 0; }
    }

    function step(dt: number) {
      t += dt;
      if (phase === 'intro' && t >= 0) phase = 'run';
      const speed = phase === 'run' ? 10 + t * 0.28 : phase === 'intro' ? 6 : 3;
      dist += speed * dt;
      x += (lane * LANE_W - x) * Math.min(1, dt * 14);
      if (jumpT >= 0) { jumpT += dt / JUMP_S; if (jumpT >= 1) jumpT = -1; }
      invuln = Math.max(0, invuln - dt); shake = Math.max(0, shake - dt); flashT = Math.max(0, flashT - dt);
      if (phase !== 'run') { endT += dt; return; }
      spawnIn -= dt;
      if (spawnIn <= 0) { spawn(); spawnIn = Math.max(0.5, 1.15 - t * 0.02) * (0.8 + Math.random() * 0.4); }
      const jh = jumpT >= 0 ? 4 * JUMP_PEAK * jumpT * (1 - jumpT) : 0;
      const myLane = Math.round(x / LANE_W);
      for (const th of things) {
        th.z -= speed * dt;
        if (!th.hit && th.lane === myLane && Math.abs(th.z - PLAYER_Z) < 0.45 && !(JUMPABLE[th.kind] && th.kind !== 'water' && jh > 0.45)) hit(th);
      }
      for (let i = things.length - 1; i >= 0; i--) if (things[i].z < NEAR_Z) things.splice(i, 1);
      if (t >= RUN_S) { phase = 'win'; endT = 0; things.length = 0; }
    }

    function draw(now: number) {
      const tt = now / 1000, fx = !reduceMotion;
      g.save();
      if (shake && fx) g.translate(Math.round((Math.random() - 0.5) * 6), Math.round((Math.random() - 0.5) * 4));
      // far end of the carriage: the door to the next car, lights rushing past outside
      g.fillStyle = '#0d0b14'; g.fillRect(-4, -4, W + 8, H + 8);
      quad([[-CAR_W, 0, FAR_Z], [CAR_W, 0, FAR_Z], [CAR_W, CEIL, FAR_Z], [-CAR_W, CEIL, FAR_Z]], '#3a3542');
      quad([[-0.5, 0, FAR_Z], [0.5, 0, FAR_Z], [0.5, 2.1, FAR_Z], [-0.5, 2.1, FAR_Z]], '#1a1726');
      // floor in bands that scroll towards you
      const band = 1.6, off = dist % (band * 2);
      quad([[-CAR_W, 0, 0.12], [CAR_W, 0, 0.12], [CAR_W, 0, FAR_Z], [-CAR_W, 0, FAR_Z]], '#4a4552');
      for (let z = NEAR_Z - off + band * 2; z < FAR_Z; z += band * 2) {
        const z0 = Math.max(NEAR_Z, z), z1 = Math.min(FAR_Z, z + band);
        if (z1 > z0) quad([[-CAR_W, 0, z0], [CAR_W, 0, z0], [CAR_W, 0, z1], [-CAR_W, 0, z1]], '#57515f');
      }
      // lane lines, glowing on MDMA
      [-LANE_W / 2, LANE_W / 2].forEach((lx, i) => quad([[lx - 0.03, 0, NEAR_Z], [lx + 0.03, 0, NEAR_Z], [lx + 0.03, 0, FAR_Z], [lx - 0.03, 0, FAR_Z]], fx ? hue(tt, i * 120, 90, 65) : '#f2c14e'));
      // ceiling and the light strip in the middle
      quad([[-CAR_W, CEIL, 0.12], [CAR_W, CEIL, 0.12], [CAR_W, CEIL, FAR_Z], [-CAR_W, CEIL, FAR_Z]], '#d9d4c8');
      for (let z = NEAR_Z - (dist % 3) + 3; z < FAR_Z; z += 3) quad([[-0.35, CEIL, z], [0.35, CEIL, z], [0.35, CEIL, z + 1.4], [-0.35, CEIL, z + 1.4]], fx ? hue(tt * 1.5, z * 9, 100, 80) : '#fff8e0');
      // walls: windows with the night outside, the S-Bahn's red seats underneath
      for (const s of [-1, 1]) {
        const wx = s * CAR_W;
        quad([[wx, 0, 0.12], [wx, CEIL, 0.12], [wx, CEIL, FAR_Z], [wx, 0, FAR_Z]], '#c9c2b4');
        for (let z = NEAR_Z - (dist % 6) + 6; z < FAR_Z; z += 6) {
          quad([[wx, 1.0, z], [wx, 2.2, z], [wx, 2.2, z + 4.2], [wx, 1.0, z + 4.2]], '#14203a');
          // lights streaking past outside
          for (let k = 0; k < 3; k++) {
            const lz = z + ((k * 1.7 + dist * 0.9) % 4.2), ly = 1.25 + k * 0.32;
            quad([[wx, ly, lz], [wx, ly + 0.05, lz], [wx, ly + 0.05, Math.min(z + 4.2, lz + 1.2)], [wx, ly, Math.min(z + 4.2, lz + 1.2)]], fx ? hue(tt, k * 90 + s * 40, 90, 70) : '#ffe58a');
          }
          // seat block: red moquette with a little pattern
          const sxn = wx - s * 0.6;
          quad([[sxn, 0.5, z + 0.3], [wx, 0.5, z + 0.3], [wx, 0.5, z + 3.9], [sxn, 0.5, z + 3.9]], '#a3242c');
          quad([[sxn, 0, z + 0.3], [sxn, 0.5, z + 0.3], [sxn, 0.5, z + 3.9], [sxn, 0, z + 3.9]], '#7a1a22');
        }
      }
      // obstacles, far to near; the ones you've already passed are drawn over you
      const list = things.slice().sort((a, b) => b.z - a.z);
      const drawThings = (ahead: boolean) => { for (const th of list) {
        if ((th.z > PLAYER_Z) !== ahead) continue;
        if (th.hit && th.kind === 'water') continue;
        const z = th.z, lx = th.lane * LANE_W, X = sx(lx, z), Y = sy(0, z), u = F / z;
        if (th.kind === 'kontrolleur') {
          const img = insp[(th.lane + 1) % insp.length], h = 1.85 * u;
          g.drawImage(img, X - h / 2, Y - h * 1.05, h, h);
          // the badge they flash at you
          g.fillStyle = '#ffd23f'; g.fillRect(X + h * 0.18, Y - h * 0.55, h * 0.12, h * 0.08);
        } else if (th.kind === 'pole') {
          g.fillStyle = INK; g.fillRect(X - 0.07 * u, sy(CEIL, z), 0.14 * u, Y - sy(CEIL, z));
          g.fillStyle = '#f2c14e'; g.fillRect(X - 0.05 * u, sy(CEIL, z), 0.1 * u, Y - sy(CEIL, z));
        } else if (th.kind === 'bike') {
          g.strokeStyle = INK; g.lineWidth = Math.max(1, 0.07 * u);
          g.beginPath(); g.arc(X - 0.32 * u, Y - 0.22 * u, 0.2 * u, 0, Math.PI * 2); g.arc(X + 0.32 * u, Y - 0.22 * u, 0.2 * u, 0, Math.PI * 2); g.stroke();
          g.strokeStyle = '#3d8f6b'; g.beginPath(); g.moveTo(X - 0.32 * u, Y - 0.22 * u); g.lineTo(X, Y - 0.45 * u); g.lineTo(X + 0.32 * u, Y - 0.22 * u); g.lineTo(X - 0.05 * u, Y - 0.22 * u); g.closePath(); g.stroke();
        } else if (th.kind === 'crate') {
          const w = 0.8 * u, h = 0.45 * u;
          g.fillStyle = INK; g.fillRect(X - w / 2 - 1, Y - h - 1, w + 2, h + 2);
          g.fillStyle = '#c9a227'; g.fillRect(X - w / 2, Y - h, w, h);
          g.fillStyle = '#7a5a12'; g.fillRect(X - w / 2, Y - h * 0.55, w, Math.max(1, h * 0.12));
          g.fillStyle = '#3d6b2a'; for (let k = 0; k < 4; k++) g.fillRect(X - w / 2 + (k + 0.3) * w / 4, Y - h * 1.35, Math.max(1, w / 10), h * 0.4);
        } else {
          const h = 0.5 * u;
          g.fillStyle = INK; g.fillRect(X - h * 0.22, Y - h - 1, h * 0.44, h + 1);
          g.fillStyle = '#9fd6ff'; g.fillRect(X - h * 0.17, Y - h * 0.9, h * 0.34, h * 0.85);
          g.fillStyle = '#2f86ad'; g.fillRect(X - h * 0.1, Y - h * 1.05, h * 0.2, h * 0.18);
        }
      } };
      drawThings(true);
      // you, from behind: a shadow on the floor, legs running, up in the air when jumping
      const jh = jumpT >= 0 ? 4 * JUMP_PEAK * jumpT * (1 - jumpT) : 0;
      const pu = F / PLAYER_Z, PX0 = sx(x, PLAYER_Z), PY = sy(0, PLAYER_Z), ph = 1.7 * pu;
      g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(PX0, PY, ph * 0.28, ph * 0.07, 0, 0, Math.PI * 2); g.fill();
      if (!(invuln > 0 && Math.floor(tt * 12) % 2)) {
        const bob = phase === 'run' && jumpT < 0 ? Math.abs(Math.sin(tt * 14)) * ph * 0.03 : 0;
        g.drawImage(me, PX0 - ph / 2, sy(jh, PLAYER_Z) - ph * 1.02 - bob, ph, ph);
      }
      drawThings(false);
      g.restore();
      // MDMA: a warm pink pulse and little hearts floating up
      if (fx) {
        g.fillStyle = `rgba(255,94,160,${(0.07 + 0.05 * Math.sin(tt * 5)).toFixed(3)})`; g.fillRect(0, 0, W, H);
        for (let k = 0; k < 6; k++) {
          const hx = (k * 47 + tt * 13) % W, hy = H - ((tt * 30 + k * 37) % H);
          g.fillStyle = hue(tt, k * 60, 100, 70); g.fillRect(hx, hy, 2, 2); g.fillRect(hx + 3, hy, 2, 2); g.fillRect(hx, hy + 2, 5, 1); g.fillRect(hx + 1, hy + 3, 3, 1); g.fillRect(hx + 2, hy + 4, 1, 1);
        }
      }
      hud();
    }

    function text(s: string, x0: number, y0: number, size: number, col: string, align: CanvasTextAlign = 'center') {
      g.font = `${size}px "Press Start 2P", monospace`; g.textAlign = align; g.textBaseline = 'top';
      g.fillStyle = INK; g.fillText(s, x0 + 1, y0 + 1); g.fillStyle = col; g.fillText(s, x0, y0);
    }
    function hud() {
      for (let k = 0; k < 3; k++) {
        const hx = 6 + k * 11, hy = 6, c = k < hearts ? '#ff5e7a' : '#3a3542';
        g.fillStyle = INK; g.fillRect(hx - 1, hy - 1, 10, 9);
        g.fillStyle = c; g.fillRect(hx, hy, 3, 3); g.fillRect(hx + 5, hy, 3, 3); g.fillRect(hx, hy + 2, 8, 2); g.fillRect(hx + 1, hy + 4, 6, 1); g.fillRect(hx + 2, hy + 5, 4, 1); g.fillRect(hx + 3, hy + 6, 2, 1);
      }
      if (phase === 'run') text(`${Math.max(0, Math.ceil(RUN_S - t))}`, W / 2, 6, 10, '#ffd23f');
      if (phase === 'intro') {
        text('RINGBAHN RUSH', W / 2, H * 0.16, 10, '#ff8cc4');
        text(String(Math.ceil(-t)), W / 2, H * 0.3, 16, '#ffd23f');
        text('◀ ▶ SWITCH TRACK', W / 2, H * 0.72, 6, '#f3eee3');
        text('▲ / A JUMP', W / 2, H * 0.72 + 10, 6, '#f3eee3');
      }
      if (flashT > 0 && phase === 'run') text(flash, W / 2, H * 0.2, 7, flash.startsWith('WATER') ? '#9fd6ff' : '#ff5e7a');
      if (phase === 'win') { text('YOU MADE IT', W / 2, H * 0.25, 10, '#b6f36b'); text('30 SECONDS OF PURE LOVE', W / 2, H * 0.25 + 16, 6, '#f3eee3'); }
      if (phase === 'lose') { text('BUSTED', W / 2, H * 0.25, 12, '#ff5e7a'); text('THE KONTROLLEURE WIN', W / 2, H * 0.25 + 18, 6, '#f3eee3'); }
      if ((phase === 'win' || phase === 'lose') && endT > 1) text('PRESS A', W / 2, H * 0.6, 7, '#ffd23f');
    }

    let raf = 0, done = false;
    function finish() {
      if (done) return;
      done = true; cancelAnimationFrame(raf);
      root.removeEventListener('pointerdown', down); root.removeEventListener('pointerup', up);
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

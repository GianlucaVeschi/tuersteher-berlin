import { RT } from '../core/runtime';
import { person } from '../render/sprites';
import { INK, $, reduceMotion } from '../util';
import type { Dir, Look } from '../types';

/* ================= NEON GOLF ================= */
// The black-light minigolf in Görli as a one-minute speed round: sink as many holes as you can. Seen in 3D from
// behind the ball (the same simple floor projection as the runner), the camera following the ball down the lane.
// Aim with left/right, A starts the power meter, A again putts. Posts, a sliding door and a neon bouncer who
// shuffles across the lane get in the way. Five strokes and you pick it up. Resolves with what you sank.

const GAME_S = 60, MAX_STROKES = 5;
/** Half the lane's width, the ball's radius, camera height. */
const HW = 1.3, BALL = 0.09, CH = 1.5, POST = 0.2, CUP = 0.17;

interface Gate { z: number; w: number; amp: number; speed: number; bouncer?: boolean }
interface Hole { name: string; len: number; cup: [number, number]; posts?: [number, number][]; gates?: Gate[] }
const HOLES: Hole[] = [
  { name: 'STRAIGHT IN', len: 9, cup: [0, 8] },
  { name: 'THE POST', len: 10, cup: [0.55, 9], posts: [[0, 5]] },
  { name: 'SLIDING DOOR', len: 10, cup: [0, 9], gates: [{ z: 5.5, w: 1.3, amp: 0.75, speed: 1.6 }] },
  { name: 'SKULL ALLEY', len: 11, cup: [-0.7, 10], posts: [[0.55, 3.5], [-0.45, 6], [0.45, 8.2]] },
  { name: 'THE TURSTEHER', len: 10, cup: [0, 9], gates: [{ z: 6, w: 1, amp: 0.85, speed: 1.2, bouncer: true }] },
  { name: 'DOUBLE TROUBLE', len: 12, cup: [0.6, 11], gates: [{ z: 4.5, w: 1.1, amp: 0.8, speed: 1.4 }, { z: 8, w: 1.1, amp: 0.8, speed: -1.9 }] }
];
const NEON = ['#39ff14', '#ff2bd6', '#00e5ff', '#ffd23f'];
const BOUNCER: Look = { skin: '#8d5a3b', hair: '#111111', bald: true, top: '#14121c', legs: '#14121c', shades: true, big: true };

const root = $('#golf');
const cv = $<HTMLCanvasElement>('#golfCanvas');
const g = cv.getContext('2d')!;
let W = 240, H = 160, F = 130, HY = 40;

export interface GolfResult { holes: number; aces: number }

/** Plays the speed round. Resolves with the holes you sank and how many were holes in one. */
export function playGolf(): Promise<GolfResult> {
  return new Promise(resolve => {
    const r = root.parentElement!.getBoundingClientRect();
    W = 240; H = Math.max(140, Math.min(420, Math.round(W * r.height / Math.max(1, r.width))));
    cv.width = W; cv.height = H; g.imageSmoothingEnabled = false;
    F = Math.max(W * 0.7, H * 0.5); HY = Math.round(H * 0.3);
    const fx = !reduceMotion;
    // the bouncer, drawn once with the normal person sprite and scaled up
    const bSpr = document.createElement('canvas'); bSpr.width = 16; bSpr.height = 16;
    person(bSpr.getContext('2d')!, 0, 0, 'down', 0, BOUNCER);

    let t = -3, hi = 0, round = 0, played = 0, strokes = 0, sunk = 0, aces = 0;
    let phase: 'intro' | 'aim' | 'power' | 'roll' | 'sunk' | 'end' = 'intro', phaseT = 0, endT = 0;
    let bx = 0, bz = 0, vx = 0, vz = 0, aim = 0, power = 0, camZ = -3, camX = 0, drop = 0, lipped = false;
    let msg = '', msgCol = '#fff', msgT = 0, last = performance.now();
    const trail: [number, number][] = [];
    const held = new Set<Dir>();
    const hole = () => HOLES[hi];
    const gateX = (gt: Gate) => Math.sin(t * gt.speed * (1 + round * 0.25)) * gt.amp;
    const say = (s: string, col: string, secs = 1.3) => { msg = s; msgCol = col; msgT = secs; };

    function startHole() {
      bx = 0; bz = 0; vx = vz = 0; aim = 0; strokes = 0; drop = 0; trail.length = 0;
      phase = 'aim'; phaseT = 0; played++;
      say(`HOLE ${played} · ${hole().name}`, '#00e5ff', 1.6);
    }
    function nextHole() { hi++; if (hi >= HOLES.length) { hi = 0; round++; } startHole(); }

    const pressA = () => {
      if (phase === 'end') { if (endT > 1) finish(); return; }
      if (phase === 'aim') { phase = 'power'; phaseT = 0; }
      else if (phase === 'power') {
        const sp = 1.6 + power * 8.4;
        vx = Math.sin(aim) * sp; vz = Math.cos(aim) * sp; strokes++; lipped = false;
        phase = 'roll'; phaseT = 0;
      }
    };
    RT.runner = { music: 'lsd', dir(d) { held.add(d); }, release(d) { held.delete(d); }, jump: pressA };
    // touch: drag sideways to aim, tap for A
    let drag: { x: number; aim0: number; moved: boolean } | null = null;
    const down = (ev: PointerEvent) => { ev.preventDefault(); drag = { x: ev.clientX, aim0: aim, moved: false }; try { root.setPointerCapture(ev.pointerId); } catch { /* not supported */ } };
    const move = (ev: PointerEvent) => {
      if (!drag) return;
      const dx = ev.clientX - drag.x;
      if (Math.abs(dx) > 8) drag.moved = true;
      if (drag.moved && phase === 'aim') aim = Math.max(-0.7, Math.min(0.7, drag.aim0 + dx / 120));
    };
    const up = () => { if (drag && !drag.moved) pressA(); drag = null; };
    root.addEventListener('pointerdown', down); root.addEventListener('pointermove', move);
    root.addEventListener('pointerup', up); root.addEventListener('pointercancel', up);

    function physics(dt: number) {
      const h = hole(), sp = Math.hypot(vx, vz);
      // the felt slows the ball, faster balls a bit more
      const ns = Math.max(0, sp - (0.9 + 0.28 * sp) * dt);
      if (sp > 0) { vx *= ns / sp; vz *= ns / sp; }
      bx += vx * dt; bz += vz * dt;
      // the rails
      if (bx > HW - BALL) { bx = HW - BALL; vx = -Math.abs(vx) * 0.75; }
      if (bx < -HW + BALL) { bx = -HW + BALL; vx = Math.abs(vx) * 0.75; }
      if (bz > h.len - BALL) { bz = h.len - BALL; vz = -Math.abs(vz) * 0.7; }
      if (bz < -0.6 + BALL) { bz = -0.6 + BALL; vz = Math.abs(vz) * 0.7; }
      // posts: bounce off along the normal
      for (const [px, pz] of h.posts ?? []) {
        const dx = bx - px, dz = bz - pz, d = Math.hypot(dx, dz), min = POST + BALL;
        if (d < min && d > 0) {
          const nx = dx / d, nz = dz / d, dot = vx * nx + vz * nz;
          bx = px + nx * min; bz = pz + nz * min;
          if (dot < 0) { vx = (vx - 2 * dot * nx) * 0.85; vz = (vz - 2 * dot * nz) * 0.85; }
        }
      }
      // sliding doors and the bouncer: boxes across the lane
      for (const gt of h.gates ?? []) {
        const gx = gateX(gt), hx = gt.w / 2 + BALL, hz = 0.16 + BALL;
        const ox = hx - Math.abs(bx - gx), oz = hz - Math.abs(bz - gt.z);
        if (ox > 0 && oz > 0) {
          if (oz < ox) { bz = gt.z + Math.sign(bz - gt.z || -1) * hz; vz = -vz * 0.6; }
          else { bx = gx + Math.sign(bx - gx || 1) * hx; vx = -vx * 0.6 + Math.sign(bx - gx) * 1.2; }
          if (gt.bouncer) say('HEUTE NICHT', '#ff2bd6', 0.9);
        }
      }
      // the cup: slow enough and it drops, too fast and it lips out
      const cd = Math.hypot(bx - h.cup[0], bz - h.cup[1]), spd = Math.hypot(vx, vz);
      if (cd < CUP) {
        if (spd < 3.4) { phase = 'sunk'; phaseT = 0; vx = vz = 0; bx = h.cup[0]; bz = h.cup[1]; }
        else if (!lipped) { lipped = true; const a = (Math.random() - 0.5) * 1.2, c = Math.cos(a), s = Math.sin(a); [vx, vz] = [(vx * c - vz * s) * 0.8, (vx * s + vz * c) * 0.8]; say('LIPPED OUT', '#ffd23f', 0.8); }
      } else if (cd > CUP * 2) lipped = false;
    }

    function step(dt: number) {
      t += dt; phaseT += dt; msgT = Math.max(0, msgT - dt);
      if (phase === 'end') { endT += dt; return; }
      if (phase === 'intro') { if (t >= 0) startHole(); return; }
      if (t >= GAME_S) { phase = 'end'; endT = 0; msgT = 0; return; }
      if (phase === 'aim') {
        const a = (held.has('right') ? 1 : 0) - (held.has('left') ? 1 : 0);
        aim = Math.max(-0.7, Math.min(0.7, aim + a * 0.9 * dt));
      }
      // the power meter swings up and down until you putt
      if (phase === 'power') { const k = (phaseT / 0.75) % 2; power = k < 1 ? k : 2 - k; }
      if (phase === 'roll') {
        for (let i = 0; i < 4 && phase === 'roll'; i++) physics(dt / 4);
        if (fx && Math.floor(t * 30) !== Math.floor((t - dt) * 30)) { trail.push([bx, bz]); if (trail.length > 10) trail.shift(); }
        if (phase === 'roll' && Math.hypot(vx, vz) < 0.06) {
          vx = vz = 0; trail.length = 0;
          if (strokes >= MAX_STROKES) { say('PICK IT UP', '#ff5e7a'); phase = 'sunk'; phaseT = -10; }
          else { phase = 'aim'; phaseT = 0; aim = Math.max(-0.7, Math.min(0.7, Math.atan2(hole().cup[0] - bx, hole().cup[1] - bz))); }
        }
      }
      if (phase === 'sunk') {
        if (phaseT >= 0 && phaseT - dt < 0) {
          sunk++; if (strokes === 1) aces++;
          if (strokes === 1) say('HOLE IN ONE!', '#ffd23f', 1.4);
          else say(strokes === 2 ? 'NICE' : strokes === 3 ? 'OKAY' : 'FINALLY', '#39ff14', 1.2);
        }
        if (phaseT >= 0) drop = Math.min(1, drop + dt * 4);
        if (phaseT > 1.2 || (phaseT < -8.8)) nextHole();
      }
      // the camera follows the ball down the lane
      const tz = Math.max(-3, Math.min(hole().len - 4.5, bz - 3)), tx = bx * 0.5;
      camZ += (tz - camZ) * Math.min(1, dt * 3); camX += (tx - camX) * Math.min(1, dt * 3);
    }

    // projection: a point on the floor (or y above it) at x, z
    const dep = (z: number) => Math.max(0.25, z - camZ);
    const sx = (x: number, z: number) => W / 2 + (x - camX) * F / dep(z);
    const sy = (z: number, y = 0) => HY + (CH - y) * F / dep(z);
    function quad(pts: [number, number, number][], fill: string) {
      g.fillStyle = fill; g.beginPath();
      pts.forEach(([x, y, z], i) => { const X = sx(x, z), Y = sy(z, y); if (i) g.lineTo(X, Y); else g.moveTo(X, Y); });
      g.closePath(); g.fill();
    }

    function draw(now: number) {
      const tt = now / 1000, h = hole(), near = camZ + 0.3, far = h.len + 0.2;
      // the hall under UV: dark violet, paint glowing on the walls
      const grad = g.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#07040f'); grad.addColorStop(0.5, '#160a2c'); grad.addColorStop(1, '#0c0618');
      g.fillStyle = grad; g.fillRect(0, 0, W, H);
      for (let i = 0; i < 30; i++) { const k = (i * 97) % 211; if (!fx || (Math.floor(tt * 3) + i) % 7) { g.fillStyle = NEON[i % 4]; g.fillRect((k * 7) % W, (k * 3) % HY, 1, 1); } }
      // painted planets and jellyfish on the side walls, passing as you go down the lane
      for (let z = Math.ceil(near / 3) * 3; z < far + 6; z += 3) for (const s of [-1, 1]) {
        const k = Math.abs(Math.round(z / 3) + (s > 0 ? 1 : 0)) % 4, X = sx(s * 2.6, z), Y = sy(z, 1.2), u = F / dep(z);
        g.fillStyle = NEON[k]; g.globalAlpha = 0.85;
        if (k % 2) { g.beginPath(); g.arc(X, Y, 0.35 * u, 0, Math.PI * 2); g.fill(); g.fillStyle = '#160a2c'; g.fillRect(X - 0.5 * u, Y - 0.04 * u, u, 0.08 * u); }
        else { g.beginPath(); g.arc(X, Y, 0.3 * u, Math.PI, 0); g.fill(); for (let l = -2; l <= 2; l++) g.fillRect(X + l * 0.11 * u, Y, Math.max(1, 0.04 * u), (0.3 + (fx ? Math.sin(tt * 3 + l) * 0.08 : 0)) * u); }
        g.globalAlpha = 1;
      }
      // the lane: dark felt with glowing stripes, neon rails, the end wall
      quad([[-HW, 0, near], [HW, 0, near], [HW, 0, far], [-HW, 0, far]], '#1d0f3a');
      for (let z = Math.ceil(near); z < far; z += 2) quad([[-HW, 0, z], [HW, 0, z], [HW, 0, Math.min(far, z + 1)], [-HW, 0, Math.min(far, z + 1)]], '#241446');
      for (const s of [-1, 1]) {
        quad([[s * HW, 0, near], [s * (HW + 0.12), 0.14, near], [s * (HW + 0.12), 0.14, far], [s * HW, 0, far]], '#39ff14');
        quad([[s * HW, 0, near], [s * HW, 0.14, near], [s * HW, 0.14, far], [s * HW, 0, far]], 'rgba(57,255,20,.45)');
      }
      quad([[-HW - 0.12, 0, far], [HW + 0.12, 0, far], [HW + 0.12, 0.3, far], [-HW - 0.12, 0.3, far]], '#ff2bd6');
      // things on the lane, far to near
      type D = { z: number; draw: () => void };
      const items: D[] = [];
      items.push({ z: h.cup[1], draw: () => {
        const X = sx(h.cup[0], h.cup[1]), Y = sy(h.cup[1]), u = F / dep(h.cup[1]);
        g.fillStyle = 'rgba(255,43,214,.35)'; g.beginPath(); g.ellipse(X, Y, CUP * 1.6 * u, CUP * 0.6 * u, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = INK; g.beginPath(); g.ellipse(X, Y, CUP * u, CUP * 0.38 * u, 0, 0, Math.PI * 2); g.fill();
        // the flag
        const top = sy(h.cup[1], 0.9), wave = fx ? Math.sin(tt * 5) * 0.04 * u : 0;
        g.fillStyle = '#f3eee3'; g.fillRect(X, top, Math.max(1, 0.02 * u), Y - top - 1);
        g.fillStyle = '#ffd23f'; g.beginPath(); g.moveTo(X + 1, top); g.lineTo(X + 0.3 * u, top + 0.08 * u + wave); g.lineTo(X + 1, top + 0.16 * u); g.closePath(); g.fill();
      } });
      for (const [px, pz] of h.posts ?? []) items.push({ z: pz, draw: () => {
        const X = sx(px, pz), u = F / dep(pz), top = sy(pz, 0.45), bot = sy(pz), w = POST * u;
        g.fillStyle = '#00e5ff'; g.fillRect(X - w, top, w * 2, bot - top);
        g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(X - w * 0.6, top, Math.max(1, w * 0.3), bot - top);
        g.fillStyle = '#8ff6ff'; g.beginPath(); g.ellipse(X, top, w, w * 0.35, 0, 0, Math.PI * 2); g.fill();
        // a glowing skull painted on it
        g.fillStyle = '#160a2c'; g.fillRect(X - w * 0.45, top + (bot - top) * 0.35, w * 0.3, w * 0.3); g.fillRect(X + w * 0.15, top + (bot - top) * 0.35, w * 0.3, w * 0.3);
      } });
      for (const gt of h.gates ?? []) items.push({ z: gt.z, draw: () => {
        const gx = gateX(gt), u = F / dep(gt.z), x0 = sx(gx - gt.w / 2, gt.z), x1 = sx(gx + gt.w / 2, gt.z), bot = sy(gt.z);
        if (gt.bouncer) {
          const hgt = 1.1 * u, wd = x1 - x0;
          g.fillStyle = 'rgba(255,43,214,.3)'; g.fillRect(x0 - 2, bot - hgt - 2, wd + 4, hgt + 4);
          g.drawImage(bSpr, x0, bot - hgt, wd, hgt);
        } else {
          const top = sy(gt.z, 0.35);
          g.fillStyle = '#ff2bd6'; g.fillRect(x0, top, x1 - x0, bot - top);
          g.fillStyle = '#ffd23f'; for (let k = 0; k < 4; k++) g.fillRect(x0 + (x1 - x0) * (k + 0.3) / 4, top + 1, Math.max(1, (x1 - x0) / 10), bot - top - 2);
        }
      } });
      items.push({ z: bz, draw: () => {
        if (drop >= 1) return;
        // the trail, the ball glowing pink, its shadow
        trail.forEach(([tx, tz], i) => { const u = F / dep(tz); g.fillStyle = `rgba(255,94,200,${(i / trail.length * 0.4).toFixed(2)})`; g.beginPath(); g.arc(sx(tx, tz), sy(tz, BALL), BALL * u * 0.8, 0, Math.PI * 2); g.fill(); });
        const X = sx(bx, bz), u = F / dep(bz), Y = sy(bz, BALL * (1 - drop * 2)), rad = Math.max(1.5, BALL * u * (1 - drop * 0.5));
        g.fillStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.ellipse(X, sy(bz), rad, rad * 0.4, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = 'rgba(255,94,200,.35)'; g.beginPath(); g.arc(X, Y, rad * 2, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#ff5ec8'; g.beginPath(); g.arc(X, Y, rad, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#fff'; g.fillRect(X - rad * 0.5, Y - rad * 0.5, Math.max(1, rad * 0.4), Math.max(1, rad * 0.4));
      } });
      items.sort((a, c) => c.z - a.z).forEach(d => d.draw());
      // aiming: dots along the line, longer with more power
      if (phase === 'aim' || phase === 'power') {
        const len = phase === 'power' ? 0.6 + power * 3 : 2.2;
        for (let k = 1; k <= 9; k++) {
          const d = (k / 9) * len, ax = bx + Math.sin(aim) * d, az = bz + Math.cos(aim) * d;
          if (Math.abs(ax) > HW) break;
          g.fillStyle = phase === 'power' ? (power > 0.75 ? '#ff5e7a' : power > 0.4 ? '#ffd23f' : '#39ff14') : '#f3eee3';
          const s = Math.max(1, 0.05 * F / dep(az)); g.fillRect(sx(ax, az) - s / 2, sy(az) - s / 2, s, s);
        }
        // the putter head behind the ball, pulled back with the power
        const back = 0.15 + (phase === 'power' ? power * 0.35 : 0), cz = bz - Math.cos(aim) * back, cx2 = bx - Math.sin(aim) * back, u = F / dep(cz);
        g.fillStyle = '#c9ced8'; g.fillRect(sx(cx2, cz) - 0.12 * u, sy(cz, 0.08), 0.24 * u, Math.max(2, 0.08 * u));
        g.fillStyle = '#8a9098'; g.fillRect(sx(cx2, cz) - Math.max(1, 0.015 * u), sy(cz, 0.08) - 0.5 * u, Math.max(1, 0.03 * u), 0.5 * u);
      }
      hud(tt);
    }

    function text(s: string, x0: number, y0: number, size: number, col: string, align: CanvasTextAlign = 'center') {
      g.font = `${size}px "Press Start 2P", monospace`; g.textAlign = align; g.textBaseline = 'top';
      g.fillStyle = INK; g.fillText(s, x0 + 1, y0 + 1); g.fillStyle = col; g.fillText(s, x0, y0);
    }
    function hud(tt: number) {
      if (phase !== 'intro' && phase !== 'end') {
        text(`IN ${sunk}`, 6, 6, 7, '#39ff14', 'left');
        text(`${Math.max(0, Math.ceil(GAME_S - t))}`, W / 2, 6, 10, '#ffd23f');
        text(`SHOT ${Math.min(strokes + (phase === 'roll' || phase === 'sunk' ? 0 : 1), MAX_STROKES)}/${MAX_STROKES}`, W - 6, 6, 6, '#f3eee3', 'right');
        // the power meter on the right
        const mh = Math.round(H * 0.35), mx = W - 12, my = H - mh - 14;
        g.fillStyle = INK; g.fillRect(mx - 1, my - 1, 8, mh + 2); g.fillStyle = '#241446'; g.fillRect(mx, my, 6, mh);
        const p = phase === 'power' ? power : 0, ph = Math.round(mh * p);
        g.fillStyle = p > 0.75 ? '#ff5e7a' : p > 0.4 ? '#ffd23f' : '#39ff14'; g.fillRect(mx, my + mh - ph, 6, ph);
        if (phase === 'aim') text('A', mx + 3, my + mh + 3, 6, fx && Math.floor(tt * 3) % 2 ? '#ffd23f' : '#f3eee3');
      }
      if (msgT > 0 && phase !== 'end') text(msg, W / 2, H * 0.2, msg.length > 14 ? 6 : 8, msgCol);
      if (phase === 'intro') {
        text('NEON GOLF', W / 2, H * 0.14, 14, NEON[Math.floor(tt * 4) % 4]);
        text(String(Math.ceil(-t)), W / 2, H * 0.32, 16, '#ffd23f');
        text('◀ ▶ AIM', W / 2, H * 0.6, 6, '#f3eee3');
        text('A: POWER  A: PUTT', W / 2, H * 0.6 + 10, 6, '#f3eee3');
        text('SINK AS MANY AS YOU CAN', W / 2, H * 0.6 + 20, 6, '#f3eee3');
      }
      if (phase === 'end') {
        g.fillStyle = 'rgba(7,4,15,.7)'; g.fillRect(0, 0, W, H);
        text('TIME!', W / 2, H * 0.14, 12, '#ff2bd6');
        text(sunk >= 8 ? 'NEON LEGEND' : sunk >= 5 ? 'NOT BAD AT ALL' : sunk >= 2 ? 'FIRST DATE MATERIAL' : 'YOUR SOCKS GLOW THOUGH', W / 2, H * 0.32, 7, NEON[Math.floor(tt * 4) % 4]);
        text(`${sunk} ${sunk === 1 ? 'HOLE' : 'HOLES'}`, W / 2, H * 0.32 + 16, 10, '#fbf7ff');
        if (aces) text(`${aces} HOLE${aces === 1 ? '' : 'S'} IN ONE`, W / 2, H * 0.32 + 32, 6, '#ffd23f');
        if (endT > 1) text('PRESS A', W / 2, H * 0.72, 7, '#ffd23f');
      }
    }

    let raf = 0, done = false;
    function finish() {
      if (done) return;
      done = true; cancelAnimationFrame(raf);
      root.removeEventListener('pointerdown', down); root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerup', up); root.removeEventListener('pointercancel', up);
      RT.runner = null;
      root.classList.remove('show');
      setTimeout(() => { root.hidden = true; resolve({ holes: sunk, aces }); }, reduceMotion ? 0 : 350);
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

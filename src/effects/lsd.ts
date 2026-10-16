import { RT } from '../core/runtime';
import { state } from '../core/state';
import { lookOf } from '../render/looks';
import { INK, $, reduceMotion } from '../util';
import type { Dir } from '../types';

/* ================= THE LSD DIVE ================= */
// Half a tab at CDV and you "jump" into the Flutgraben: a 30-second first-person swim through a
// psychedelic canal. Steer up/down/left/right, catch the floating colours, ride past the unicorns, dodge
// the e-scooters and shopping carts on their way to the bottom (Berlin's canals really are full of them).
// Drawn on its own small canvas with a simple perspective projection, like the runner. Resolves with the
// number of colours caught; there is no losing, the trip just ends.

const TRIP_S = 30;
/** How far you can swim sideways (x) and up/down (y, positive is down), and where the bed and surface are. */
const BX = 2.1, BY = 1.2, BED = 2.1, SURFACE = -2.3, FAR_Z = 32, NEAR_Z = 0.5, HIT_Z = 1, SWIM = 2.6;

type Kind = 'orb' | 'unicorn' | 'scooter' | 'cart';
interface Thing { kind: Kind; x: number; y: number; z: number; hue: number; vx: number; hit?: boolean }
const RADIUS: Record<Kind, number> = { orb: 0.5, unicorn: 0.85, scooter: 0.6, cart: 0.7 };

const root = $('#lsd');
const cv = $<HTMLCanvasElement>('#lsdCanvas');
const g = cv.getContext('2d')!;
// the scene is drawn here first, then copied onto the screen in wobbling strips
const buf = document.createElement('canvas'), b = buf.getContext('2d')!;
let W = 240, H = 160, F = 130;

/** A white pixel unicorn with a rainbow mane, 24×16, two frames of galloping legs. */
function unicornSprite(frame: number): HTMLCanvasElement {
  const c = document.createElement('canvas'); c.width = 24; c.height = 16;
  const u = c.getContext('2d')!;
  const P = (x: number, y: number, w: number, h: number, col: string) => { u.fillStyle = col; u.fillRect(x, y, w, h); };
  // outline, then body, neck and head facing right
  P(3, 6, 16, 6, INK); P(15, 2, 6, 6, INK); P(19, 4, 4, 3, INK);
  P(4, 7, 14, 4, '#fbf7ff'); P(16, 3, 4, 5, '#fbf7ff'); P(19, 5, 3, 1, '#fbf7ff');
  P(20, 4, 1, 1, INK); // eye
  P(21, 0, 1, 3, '#ffd23f'); P(20, 1, 1, 1, '#ffd23f'); // the horn
  ['#ff5e7a', '#ff9f43', '#ffd23f', '#6be38b', '#4ea8de', '#c28cff'].forEach((col, i) => { P(14 - i, 2 + i, 2, 2, col); P(1 + (i % 3), 6 + i, 3, 1, col); }); // mane and tail
  const legs = frame ? [[5, 1], [8, -1], [13, 1], [16, -1]] : [[5, -1], [8, 1], [13, -1], [16, 1]];
  legs.forEach(([x, d]) => { P(x + d, 11, 2, 4, INK); P(x + d, 11, 1, 3, '#fbf7ff'); P(x + d, 14, 2, 1, '#c9a24a'); }); // golden hooves
  return c;
}

/** Plays the dive. Resolves with how many colours you caught. */
export function playLsd(): Promise<number> {
  return new Promise(resolve => {
    const r = root.parentElement!.getBoundingClientRect();
    W = 240; H = Math.max(140, Math.min(420, Math.round(W * r.height / Math.max(1, r.width))));
    cv.width = buf.width = W; cv.height = buf.height = H;
    g.imageSmoothingEnabled = false; b.imageSmoothingEnabled = false;
    F = Math.max(W * 0.62, H * 0.42);
    const fx = !reduceMotion;
    const look = lookOf(state.outfit);
    const uni = [unicornSprite(0), unicornSprite(1)];

    let cx = 0, cy = 0, vx = 0, vy = 0, t = -2.4, dist = 0, colours = 0, shake = 0;
    let orbIn = 0.4, uniIn = 2.5, junkIn = 2, flash = '', flashCol = '#fff', flashT = 0;
    let phase: 'intro' | 'swim' | 'end' = 'intro', endT = 0, last = performance.now();
    const things: Thing[] = [];
    const held = new Set<Dir>();

    const pressA = () => { if (phase === 'end' && endT > 1) finish(); };
    RT.runner = { music: 'lsd', dir(d) { held.add(d); }, release(d) { held.delete(d); }, jump: pressA };
    // touch: drag anywhere like a joystick, tap to continue at the end
    let drag: { x: number; y: number; dx: number; dy: number } | null = null;
    const down = (ev: PointerEvent) => { ev.preventDefault(); drag = { x: ev.clientX, y: ev.clientY, dx: 0, dy: 0 }; try { root.setPointerCapture(ev.pointerId); } catch { /* not supported */ } };
    const move = (ev: PointerEvent) => { if (drag) { drag.dx = ev.clientX - drag.x; drag.dy = ev.clientY - drag.y; } };
    const up = () => { if (drag && Math.abs(drag.dx) < 8 && Math.abs(drag.dy) < 8) pressA(); drag = null; };
    root.addEventListener('pointerdown', down); root.addEventListener('pointermove', move);
    root.addEventListener('pointerup', up); root.addEventListener('pointercancel', up);

    const rx = () => (Math.random() * 2 - 1) * BX, ry = () => (Math.random() * 2 - 1) * BY;
    function step(dt: number) {
      t += dt;
      if (phase === 'intro' && t >= 0) phase = 'swim';
      const speed = phase === 'swim' ? 7 + t * 0.12 : 4;
      dist += speed * dt;
      // steering: keys or the drag, with a little drift so it feels like water
      let ax = (held.has('right') ? 1 : 0) - (held.has('left') ? 1 : 0), ay = (held.has('down') ? 1 : 0) - (held.has('up') ? 1 : 0);
      if (drag) { ax = Math.max(-1, Math.min(1, drag.dx / 40)); ay = Math.max(-1, Math.min(1, drag.dy / 40)); }
      vx += (ax * SWIM - vx) * Math.min(1, dt * 5); vy += (ay * SWIM - vy) * Math.min(1, dt * 5);
      cx = Math.max(-BX, Math.min(BX, cx + vx * dt)); cy = Math.max(-BY, Math.min(BY, cy + vy * dt));
      shake = Math.max(0, shake - dt); flashT = Math.max(0, flashT - dt);
      if (phase !== 'swim') { endT += dt; return; }
      // colours: single ones, and now and then a whole rainbow arc to swim along
      orbIn -= dt; uniIn -= dt; junkIn -= dt;
      if (orbIn <= 0) {
        if (Math.random() < 0.25) {
          const x0 = rx() * 0.6, y0 = ry() * 0.6, sxn = Math.random() < 0.5 ? 1 : -1;
          for (let k = 0; k < 6; k++) things.push({ kind: 'orb', x: x0 + sxn * Math.sin(k / 2) * 0.9, y: y0 - Math.sin(k / 5 * Math.PI) * 0.7, z: FAR_Z + k * 1.4, hue: k * 55, vx: 0 });
          orbIn = 1.6;
        } else { things.push({ kind: 'orb', x: rx(), y: ry(), z: FAR_Z, hue: Math.random() * 360, vx: 0 }); orbIn = 0.35 + Math.random() * 0.3; }
      }
      if (uniIn <= 0) { const s = Math.random() < 0.5 ? 1 : -1; things.push({ kind: 'unicorn', x: -s * (BX + 1), y: ry(), z: FAR_Z * 0.7, hue: 0, vx: s * 0.9 }); uniIn = 3.5 + Math.random() * 2; }
      if (junkIn <= 0 && t > 3) { things.push({ kind: Math.random() < 0.55 ? 'scooter' : 'cart', x: rx(), y: ry(), z: FAR_Z, hue: 0, vx: 0 }); junkIn = Math.max(0.7, 1.6 - t * 0.03) * (0.8 + Math.random() * 0.4); }
      for (const th of things) {
        const before = th.z;
        th.z -= speed * dt; th.x += th.vx * dt;
        if (th.hit || before < HIT_Z || th.z >= HIT_Z) continue;
        if (Math.abs(th.x - cx) > RADIUS[th.kind] || Math.abs(th.y - cy) > RADIUS[th.kind]) continue;
        th.hit = true;
        if (th.kind === 'orb') { colours++; if (!flashT || flash.startsWith('+')) { flash = '+1'; flashCol = `hsl(${th.hue},100%,70%)`; flashT = 0.4; } }
        else if (th.kind === 'unicorn') { colours += 5; flash = 'UNICORN! +5'; flashCol = '#fbf7ff'; flashT = 1.2; }
        else {
          colours = Math.max(0, colours - 3); shake = 0.35; flashCol = '#ff5e7a'; flashT = 1.2;
          flash = th.kind === 'scooter' ? 'E-SCOOTER! -3' : 'SHOPPING CART! -3';
          if (navigator.vibrate) { try { navigator.vibrate(80); } catch { /* not allowed */ } }
        }
      }
      for (let i = things.length - 1; i >= 0; i--) if (things[i].z < NEAR_Z || (things[i].kind === 'orb' && things[i].hit)) things.splice(i, 1);
      if (t >= TRIP_S) { phase = 'end'; endT = 0; things.length = 0; }
    }

    // projection relative to where you are swimming
    const sx = (x: number, z: number) => W / 2 + (x - cx) * F / z;
    const sy = (y: number, z: number) => H / 2 + (y - cy) * F / z;
    function quad(pts: [number, number, number][], fill: string) {
      b.fillStyle = fill; b.beginPath();
      pts.forEach(([x, y, z], i) => { const X = sx(x, z), Y = sy(y, z); if (i) b.lineTo(X, Y); else b.moveTo(X, Y); });
      b.closePath(); b.fill();
    }
    const hsl = (h: number, s: number, l: number, a = 1) => `hsla(${Math.round(((h % 360) + 360) % 360)},${s}%,${l}%,${a})`;

    function draw(now: number) {
      const tt = now / 1000, base = fx ? 170 + tt * 25 : 175; // the water slowly cycles through every colour
      // water: light near the surface, deep below
      const grad = b.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, hsl(base, 70, 55)); grad.addColorStop(0.5, hsl(base + 40, 75, 30)); grad.addColorStop(1, hsl(base + 80, 80, 14));
      b.fillStyle = grad; b.fillRect(0, 0, W, H);
      // the surface: a shimmering ceiling with sun rays coming down
      quad([[-30, SURFACE, NEAR_Z], [30, SURFACE, NEAR_Z], [30, SURFACE, FAR_Z], [-30, SURFACE, FAR_Z]], hsl(base - 20, 80, 70, 0.5));
      for (let z = NEAR_Z + 2 - (dist % 4); z < FAR_Z; z += 4) quad([[-30, SURFACE, z], [30, SURFACE, z], [30, SURFACE, z + 1.2], [-30, SURFACE, z + 1.2]], hsl(base, 90, 85, 0.35));
      for (let k = 0; k < 5; k++) {
        const x0 = ((k * 53 + tt * 6) % (W + 60)) - 30, w = 10 + (k % 3) * 6;
        b.fillStyle = hsl(base + k * 30, 90, 85, 0.07); b.beginPath(); b.moveTo(x0, 0); b.lineTo(x0 + w, 0); b.lineTo(x0 + w * 3 - 20, H); b.lineTo(x0 - 20, H); b.closePath(); b.fill();
      }
      // the canal bed in bands rushing towards you
      quad([[-30, BED, NEAR_Z], [30, BED, NEAR_Z], [30, BED, FAR_Z], [-30, BED, FAR_Z]], hsl(base + 60, 50, 22));
      for (let z = NEAR_Z + 3 - (dist % 3); z < FAR_Z; z += 3) quad([[-30, BED, z], [30, BED, z], [30, BED, z + 1.4], [-30, BED, z + 1.4]], hsl(base + 100, 55, 28));
      // seaweed swaying on both sides
      for (let z = NEAR_Z + 5 - (dist % 5); z < FAR_Z; z += 5) for (const s of [-1, 1]) {
        const X = sx(s * 3.4, z), u = F / z, sway = fx ? Math.sin(tt * 2 + z) * 0.25 * u : 0;
        b.fillStyle = hsl(base + 140 + s * 30, 70, 40);
        for (let k = 0; k < 6; k++) b.fillRect(X + sway * (k / 6) - 0.06 * u, sy(BED - k * 0.3, z) - 0.3 * u, Math.max(1, 0.12 * u), 0.32 * u);
      }
      // the things, far to near
      things.slice().sort((a, c) => c.z - a.z).forEach(th => {
        if (th.hit && th.kind !== 'unicorn') return;
        const X = sx(th.x, th.z), Y = sy(th.y, th.z), u = F / th.z;
        if (th.kind === 'orb') {
          const h = fx ? th.hue + tt * 120 : th.hue, rad = 0.22 * u;
          b.fillStyle = hsl(h, 100, 65, 0.35); b.beginPath(); b.arc(X, Y, rad * 1.8, 0, Math.PI * 2); b.fill();
          b.fillStyle = hsl(h, 100, 60); b.beginPath(); b.arc(X, Y, rad, 0, Math.PI * 2); b.fill();
          b.fillStyle = 'rgba(255,255,255,.8)'; b.fillRect(X - rad * 0.5, Y - rad * 0.5, Math.max(1, rad * 0.4), Math.max(1, rad * 0.4));
        } else if (th.kind === 'unicorn') {
          const w = 1.6 * u, img = uni[Math.floor(tt * 6) % 2];
          b.save(); b.translate(X, Y + (fx ? Math.sin(tt * 5) * 0.08 * u : 0));
          if (th.vx < 0) b.scale(-1, 1);
          b.drawImage(img, -w / 2, -w / 3, w, w * 2 / 3);
          b.restore();
          // a little rainbow trail of bubbles behind it
          for (let k = 1; k < 5; k++) { b.fillStyle = hsl(k * 60 + tt * 90, 100, 70, 0.6); b.fillRect(X - Math.sign(th.vx) * (w / 2 + k * 0.18 * u), Y + Math.sin(tt * 4 + k) * 0.1 * u, Math.max(1, 0.08 * u), Math.max(1, 0.08 * u)); }
        } else if (th.kind === 'scooter') {
          // an e-scooter sinking slowly, green deck, long stem, handlebars
          const p = (x: number, y: number, w: number, h: number, col: string) => { b.fillStyle = col; b.fillRect(X + x * u, Y + y * u, Math.max(1, w * u), Math.max(1, h * u)); };
          p(-0.5, 0.25, 1, 0.12, INK); p(-0.48, 0.26, 0.96, 0.08, '#4ec94e');
          p(0.32, -0.55, 0.08, 0.82, INK); p(0.18, -0.58, 0.36, 0.07, INK);
          p(-0.52, 0.36, 0.18, 0.18, INK); p(0.32, 0.36, 0.18, 0.18, INK);
        } else {
          // a shopping cart: wire basket on wheels
          const w = 1.1 * u, h = 0.7 * u, x0 = X - w / 2, y0 = Y - h / 2;
          b.strokeStyle = '#c9ced8'; b.lineWidth = Math.max(1, 0.05 * u);
          b.strokeRect(x0, y0, w, h);
          for (let k = 1; k < 5; k++) { b.beginPath(); b.moveTo(x0 + k * w / 5, y0); b.lineTo(x0 + k * w / 5, y0 + h); b.stroke(); }
          b.beginPath(); b.moveTo(x0, y0 + h / 2); b.lineTo(x0 + w, y0 + h / 2); b.stroke();
          b.fillStyle = INK; b.fillRect(x0, y0 + h, Math.max(1, 0.15 * u), Math.max(1, 0.15 * u)); b.fillRect(x0 + w - 0.15 * u, y0 + h, Math.max(1, 0.15 * u), Math.max(1, 0.15 * u));
        }
      });
      // bubbles drifting up past you
      for (let k = 0; k < 14; k++) {
        const bx = (k * 37 + Math.sin(tt + k) * 6) % W, by = H - ((tt * (25 + k * 3) + k * 41) % (H + 10));
        b.fillStyle = 'rgba(255,255,255,.5)'; b.fillRect(bx, by, k % 3 ? 1 : 2, k % 3 ? 1 : 2);
      }
      // your hands doing the breaststroke
      const stroke = phase === 'end' ? 0 : (Math.sin(tt * 4) + 1) / 2, hw = 18, hy = H - 16 + stroke * 6;
      for (const s of [-1, 1]) {
        const hx = W / 2 + s * (10 + stroke * 34) - hw / 2;
        b.fillStyle = INK; b.fillRect(hx - 1, hy - 1, hw + 2, 12);
        b.fillStyle = look.top; b.fillRect(s < 0 ? hx : hx + 8, hy + 2, 10, 9);
        b.fillStyle = look.skin; b.fillRect(s < 0 ? hx + 10 : hx, hy, 8, 8);
      }
      // the trip: a colour wash over everything
      if (fx) { b.fillStyle = hsl(tt * 90, 100, 60, 0.12); b.fillRect(0, 0, W, H); }

      // onto the screen: wobbling strips, like looking through water (and through LSD)
      g.fillStyle = '#05040a'; g.fillRect(0, 0, W, H);
      const jx = shake && fx ? Math.round((Math.random() - 0.5) * 6) : 0;
      if (fx) for (let y = 0; y < H; y += 2) g.drawImage(buf, 0, y, W, 2, Math.round(Math.sin(y * 0.07 + tt * 3) * 3) + jx, y, W, 2);
      else g.drawImage(buf, 0, 0);
      hud(tt);
    }

    function text(s: string, x0: number, y0: number, size: number, col: string, align: CanvasTextAlign = 'center') {
      g.font = `${size}px "Press Start 2P", monospace`; g.textAlign = align; g.textBaseline = 'top';
      g.fillStyle = INK; g.fillText(s, x0 + 1, y0 + 1); g.fillStyle = col; g.fillText(s, x0, y0);
    }
    function hud(tt: number) {
      // a rainbow square and the colour count
      ['#ff5e7a', '#ffd23f', '#6be38b', '#4ea8de'].forEach((col, i) => { g.fillStyle = col; g.fillRect(6 + i * 2, 6, 2, 8); });
      text(String(colours), 17, 6, 8, '#fbf7ff', 'left');
      if (phase === 'swim') text(`${Math.max(0, Math.ceil(TRIP_S - t))}`, W / 2, 6, 10, '#ffd23f');
      if (phase === 'intro') {
        text('DEEP TRIP', W / 2, H * 0.16, 12, hsl(tt * 120, 100, 70));
        text(String(Math.ceil(-t)), W / 2, H * 0.3, 16, '#ffd23f');
        text('◀ ▲ ▼ ▶ SWIM', W / 2, H * 0.68, 6, '#f3eee3');
        text('CATCH THE COLOURS', W / 2, H * 0.68 + 10, 6, '#f3eee3');
        text('RIDE THE UNICORNS', W / 2, H * 0.68 + 20, 6, '#f3eee3');
      }
      if (flashT > 0 && phase === 'swim') text(flash, W / 2, H * 0.2, 7, flashCol);
      if (phase === 'end') {
        text(colours >= 45 ? 'YOU SAW GOD' : colours >= 25 ? 'THE UNICORNS LOVE YOU' : 'JUST A BIT WET', W / 2, H * 0.22, 7, hsl(tt * 120, 100, 70));
        text(`${colours} COLOURS`, W / 2, H * 0.22 + 16, 10, '#fbf7ff');
        if (endT > 1) text('PRESS A', W / 2, H * 0.6, 7, '#ffd23f');
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
      setTimeout(() => { root.hidden = true; resolve(colours); }, reduceMotion ? 0 : 350);
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

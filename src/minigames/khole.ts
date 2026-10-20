import { RT } from '../core/runtime';
import { player } from '../core/state';
import { person } from '../render/sprites';
import { SOLID } from '../world/tiles';
import { blocked } from '../world/collision';
import { styleForScene } from '../audio/styles';
import { INK, $, reduceMotion } from '../util';
import type { Dir, Entity, Look } from '../types';

/* ================= THE K-HOLE: BERGHAIN IN 3D ================= */
// The K trip turns the club floor you're on into a first-person 3D world (a raycaster over the real
// tile map) for 30 seconds: walk and turn freely while the walls melt, the room wobbles, everything
// leaves ghost trails and the colours drift. Slow motion: you move at half speed. Afterwards you're
// back in 2D wherever you walked to.

const TRIP_S = 30, K_IN = 1.7, K_OUT = 3.3;
const FOV = 1.15, MOVE = 1.6, TURN = 1.9, RADIUS = 0.22;

const root = $('#khole');
const cv = $<HTMLCanvasElement>('#kCanvas');
const g = cv.getContext('2d')!;
const trail = document.createElement('canvas'), tg = trail.getContext('2d')!;

// wall colours per interior tile id (concrete, stalls, pillars, art, bars, speakers, booth, doors)
const WALL: Record<number, [number, number, number]> = {
  40: [128, 124, 136], 48: [150, 154, 164], 49: [170, 174, 184], 50: [70, 70, 84], 51: [90, 150, 130], 52: [190, 110, 90],
  53: [160, 116, 76], 54: [217, 230, 224], 55: [90, 84, 104], 56: [120, 120, 132], 57: [80, 78, 92], 58: [60, 58, 70],
  59: [96, 92, 110], 60: [60, 56, 72], 62: [40, 38, 48]
};
const DIR_ANGLE: Record<Dir, number> = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };

const spriteCache = new Map<Entity, HTMLCanvasElement[]>();
function spriteOf(e: Entity, look: Look): HTMLCanvasElement[] {
  let s = spriteCache.get(e);
  if (!s) {
    s = [1, 2].map(f => { const c = document.createElement('canvas'); c.width = 16; c.height = 16; person(c.getContext('2d')!, 0, 0, 'down', f, look); return c; });
    spriteCache.set(e, s);
  }
  return s;
}

/** The 30-second K-hole. Resolves when you come back. */
export function playKHole(): Promise<void> {
  return new Promise(resolve => {
    const r = root.parentElement!.getBoundingClientRect();
    const W = 240, H = Math.max(140, Math.min(420, Math.round(W * r.height / Math.max(1, r.width))));
    cv.width = trail.width = W; cv.height = trail.height = H;
    g.imageSmoothingEnabled = false;
    const map = RT.map, MW = RT.MW, MH = RT.MH;
    const solid = (x: number, y: number) => x < 0 || y < 0 || x >= MW || y >= MH || SOLID.has(map[Math.floor(y)][Math.floor(x)]);

    let px = player.x + 0.5, py = player.y + 0.5, ang = DIR_ANGLE[player.dir];
    // start facing the most open direction, so the first thing you see is the room, not a stall wall
    const reach = (a: number) => { let d = 0; while (d < 20 && !solid(px + Math.cos(a) * d, py + Math.sin(a) * d)) d += 0.1; return d; };
    let bestD = reach(ang);
    for (let i = 1; i < 16; i++) { const a = ang + i * Math.PI / 8, d = reach(a); if (d > bestD + 0.5) { bestD = d; ang = a; } }
    let t = 0, last = performance.now(), done = false, raf = 0;
    const held = new Set<Dir>();
    const zbuf = new Float32Array(W);

    RT.runner = {
      music: styleForScene(RT.scene).id,
      dir(d) { held.add(d); },
      release(d) { held.delete(d); },
      jump() { /* A does nothing in here. You're too busy floating. */ }
    };
    // touch: drag anywhere like a joystick (up/down walks, left/right turns)
    let drag: { x: number; y: number; dx: number; dy: number } | null = null;
    const down = (ev: PointerEvent) => { ev.preventDefault(); drag = { x: ev.clientX, y: ev.clientY, dx: 0, dy: 0 }; try { root.setPointerCapture(ev.pointerId); } catch { /* not supported */ } };
    const move = (ev: PointerEvent) => { if (drag) { drag.dx = ev.clientX - drag.x; drag.dy = ev.clientY - drag.y; } };
    const up = () => { drag = null; };
    root.addEventListener('pointerdown', down); root.addEventListener('pointermove', move);
    root.addEventListener('pointerup', up); root.addEventListener('pointercancel', up);

    // how strong the trip is right now: kicks in, holds, wears off
    const level = () => Math.min(1, t / K_IN) * Math.min(1, Math.max(0, TRIP_S - t) / K_OUT);

    function step(dt: number) {
      t += dt;
      let fwd = 0, turn = 0;
      if (held.has('up')) fwd += 1;
      if (held.has('down')) fwd -= 1;
      if (held.has('left')) turn -= 1;
      if (held.has('right')) turn += 1;
      if (drag) { fwd -= Math.max(-1, Math.min(1, drag.dy / 50)); turn += Math.max(-1, Math.min(1, drag.dx / 50)); }
      // the room keeps drifting a little on its own
      const k = level();
      ang += (turn * TURN + (reduceMotion ? 0 : Math.sin(t * 0.7) * 0.25 * k)) * dt;
      const sp = fwd * MOVE * dt;
      const nx = px + Math.cos(ang) * sp, ny = py + Math.sin(ang) * sp;
      if (!solid(nx + Math.sign(nx - px) * RADIUS, py)) px = nx;
      if (!solid(px, ny + Math.sign(ny - py) * RADIUS)) py = ny;
      if (t >= TRIP_S) finish();
    }

    function draw(now: number) {
      const k = reduceMotion ? 0.3 : level(), tt = now / 1000;
      const horizon = H / 2 + Math.sin(tt * 0.9) * H * 0.06 * k;
      // ceiling and floor
      const ce = g.createLinearGradient(0, 0, 0, horizon);
      ce.addColorStop(0, '#2a2636'); ce.addColorStop(1, '#0e0d14');
      g.fillStyle = ce; g.fillRect(0, 0, W, horizon);
      const fl = g.createLinearGradient(0, horizon, 0, H);
      fl.addColorStop(0, '#1c1a24'); fl.addColorStop(1, '#4a4656');
      g.fillStyle = fl; g.fillRect(0, horizon, W, H - horizon);
      // walls: one ray per column (DDA through the tile grid)
      for (let x = 0; x < W; x++) {
        const ra = ang + (x / W - 0.5) * FOV;
        const dx = Math.cos(ra), dy = Math.sin(ra);
        let mx = Math.floor(px), my = Math.floor(py);
        const ddx = Math.abs(1 / dx), ddy = Math.abs(1 / dy);
        const sxs = dx < 0 ? -1 : 1, sys = dy < 0 ? -1 : 1;
        let sdx = dx < 0 ? (px - mx) * ddx : (mx + 1 - px) * ddx, sdy = dy < 0 ? (py - my) * ddy : (my + 1 - py) * ddy;
        let side = 0, tile = 40, hit = false;
        for (let i = 0; i < 64 && !hit; i++) {
          if (sdx < sdy) { sdx += ddx; mx += sxs; side = 0; } else { sdy += ddy; my += sys; side = 1; }
          if (mx < 0 || my < 0 || mx >= MW || my >= MH) { hit = true; tile = 40; break; }
          const tl = map[my][mx];
          if (SOLID.has(tl)) { hit = true; tile = tl; }
        }
        const raw = side === 0 ? sdx - ddx : sdy - ddy;
        const dist = raw * Math.cos(ra - ang);
        // where along the wall face the ray hit (0..1), for panel seams
        const wx = side === 0 ? py + raw * dy : px + raw * dx, frac = wx - Math.floor(wx);
        zbuf[x] = dist;
        // melting: wall heights breathe and drip in waves
        const melt = 1 + (Math.sin(x * 0.06 + tt * 2.2) * 0.18 + Math.sin(x * 0.17 - tt * 3.1) * 0.06) * k;
        const h = Math.min(H * 4, (H / Math.max(0.05, dist)) * melt);
        const drip = Math.max(0, Math.sin(x * 0.03 + tt * 1.3)) * 14 * k;
        const [cr, cgc, cb] = WALL[tile] ?? [80, 78, 90];
        const shade = Math.max(0.3, 1 - dist / 24) * (side ? 0.8 : 1);
        g.fillStyle = `rgb(${Math.round(cr * shade)},${Math.round(cgc * shade)},${Math.round(cb * shade)})`;
        const top = horizon - h / 2 + drip;
        g.fillRect(x, top, 1, h);
        // concrete panel seams, and darker edges where the wall meets floor and ceiling
        if (frac < 0.04 || Math.abs(frac - 0.5) < 0.02) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x, top, 1, h); }
        g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(x, top, 1, Math.max(1, h * 0.04)); g.fillRect(x, top + h * 0.96, 1, Math.max(1, h * 0.04));
      }
      // people as billboards, far to near, hidden behind walls via the z-buffer
      const list = RT.ents.filter(e => e.look && e.kind !== 'bottle').map(e => ({ e, d: Math.hypot(e.x + 0.5 - px, e.y + 0.5 - py) })).sort((a, b) => b.d - a.d);
      for (const { e, d } of list) {
        const a = Math.atan2(e.y + 0.5 - py, e.x + 0.5 - px) - ang;
        const rel = Math.atan2(Math.sin(a), Math.cos(a));
        if (Math.abs(rel) > FOV * 0.7 || d < 0.3) continue;
        const perp = d * Math.cos(rel);
        const size = H / perp * 0.9, sx = W / 2 + Math.tan(rel) / Math.tan(FOV / 2) * W / 2;
        const frames = spriteOf(e, e.look!);
        const img = frames[Math.floor(tt * 3 + (e.phase ?? 0)) % 2];
        const bob = e.dance ? Math.abs(Math.sin(tt * 4 + (e.phase ?? 0))) * size * 0.06 : 0;
        const x0 = Math.round(sx - size / 2), y0 = horizon + size * 0.5 - size - bob;
        for (let c = 0; c < size; c++) {
          const X = x0 + c;
          if (X < 0 || X >= W || zbuf[X] < perp) continue;
          g.drawImage(img, Math.floor(c / size * 16), 0, 1, 16, X, y0, 1, size);
        }
      }
      // ghost trails: the last frames linger
      if (k > 0.05) { g.globalAlpha = 0.5 * k; g.drawImage(trail, 0, 0); g.globalAlpha = 1; }
      tg.clearRect(0, 0, W, H); tg.drawImage(cv, 0, 0);
      // HUD
      g.font = '8px "Press Start 2P", monospace'; g.textAlign = 'right'; g.textBaseline = 'top';
      const left = String(Math.max(0, Math.ceil(TRIP_S - t)));
      g.fillStyle = INK; g.fillText(left, W - 5, 6); g.fillStyle = '#c9b2ff'; g.fillText(left, W - 6, 5);
      if (t < 3) {
        g.textAlign = 'center'; g.font = '6px "Press Start 2P", monospace';
        const msg = '▲▼ WALK  ◀▶ TURN';
        g.fillStyle = INK; g.fillText(msg, W / 2 + 1, H - 15); g.fillStyle = '#f3eee3'; g.fillText(msg, W / 2, H - 16);
      }
      // colour drift and blur on the whole picture
      cv.style.filter = reduceMotion ? 'saturate(1.3)' : `blur(${(1.4 * k).toFixed(2)}px) hue-rotate(${Math.round(tt * 40) % 360}deg) saturate(${(1 + 1.5 * k).toFixed(2)}) contrast(${(1 + 0.3 * k).toFixed(2)})`;
    }

    function finish() {
      if (done) return;
      done = true; cancelAnimationFrame(raf);
      root.removeEventListener('pointerdown', down); root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerup', up); root.removeEventListener('pointercancel', up);
      RT.runner = null;
      // you come round wherever you walked to (if there's room to stand)
      const tx = Math.floor(px), ty = Math.floor(py);
      if (!blocked(tx, ty)) { player.x = player.tx = tx; player.y = player.ty = ty; }
      const a = ((ang % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      player.dir = a < Math.PI / 4 || a >= 7 * Math.PI / 4 ? 'right' : a < 3 * Math.PI / 4 ? 'down' : a < 5 * Math.PI / 4 ? 'left' : 'up';
      player.moving = false;
      root.classList.remove('show');
      setTimeout(() => { root.hidden = true; cv.style.filter = ''; resolve(); }, reduceMotion ? 0 : 350);
    }
    function frame(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      step(dt); if (!done) { draw(now); raf = requestAnimationFrame(frame); }
    }
    root.hidden = false;
    requestAnimationFrame(() => root.classList.add('show'));
    raf = requestAnimationFrame(frame);
  });
}

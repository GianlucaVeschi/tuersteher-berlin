import { RT } from '../core/runtime';
import { SCENES } from '../world/scenes';
import { TOWER } from '../world/city';
import { CLUBS } from '../data/clubs';
import { B, R, T, W as WATER } from '../world/tiles';
import { pixelText, pixelTextWidth } from '../render/pixelFont';
import { INK, $, reduceMotion } from '../util';
import type { Dir } from '../types';

/* ================= THE FERNSEHTURM: PANORAMA FROM THE TOP ================= */
// Not a game, a view: the lift goes up to the Panoramastage (203 m) and you turn round inside the
// sphere. The street map itself is the ground (its prerendered canvas, darkened to night, with lit
// windows and street lamps), seen in perspective from high above the tower's footprint; beyond the
// edge of the map, made-up city blocks run on to the horizon. A skyline goes all the way round with
// the landmarks roughly where they are from Alexanderplatz, the clubs' names float over the clubs,
// the sphere's window frames turn with you. ◀ ▶ (or drag) to turn, ▲ ▼ to look down or up, A to
// ride back down. No timer: stay as long as you like.

const FOV = 1.2;
/** Eye height over the map, in tiles (one tile is roughly 25 m here; it's the look that counts). */
const EYE = 8;
const TURN = 0.9, AUTO = 0.06;
const SKY_TOP = [10, 12, 34], SKY_LOW = [58, 44, 92], HAZE = [46, 40, 70];

const root = $('#tower');
const cv = $<HTMLCanvasElement>('#towerCanvas');
const g = cv.getContext('2d')!;

/** Landmarks off the map, by compass bearing from the tower (0 = north, clockwise), with a silhouette. */
interface Mark { name: string; bearing: number; kind: 'dom' | 'gate' | 'reichstag' | 'column' | 'funkturm' | 'slab' | 'molecule' }
const MARKS: Mark[] = [
  { name: 'BERLINER DOM', bearing: 255, kind: 'dom' },
  { name: 'BRANDENBURGER TOR', bearing: 262, kind: 'gate' },
  { name: 'REICHSTAG', bearing: 275, kind: 'reichstag' },
  { name: 'SIEGESSÄULE', bearing: 258, kind: 'column' },
  { name: 'FUNKTURM', bearing: 266, kind: 'funkturm' },
  { name: 'PARK INN', bearing: 15, kind: 'slab' },
  { name: 'TREPTOWER', bearing: 128, kind: 'slab' },
  { name: 'MOLECULE MAN', bearing: 120, kind: 'molecule' }
];

// ---- the night texture of the street map, made once ----
let tex: Uint32Array | null = null, texW = 0, texH = 0;
function nightTexture() {
  if (tex) return;
  const city = SCENES.city;
  const src = city.canvas;
  texW = src.width; texH = src.height;
  const c = document.createElement('canvas'); c.width = texW; c.height = texH;
  const cg = c.getContext('2d')!;
  cg.drawImage(src, 0, 0);
  const img = cg.getImageData(0, 0, texW, texH);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    // night: darker, bluer
    d[i] = d[i] * 0.42; d[i + 1] = d[i + 1] * 0.45; d[i + 2] = Math.min(255, d[i + 2] * 0.6 + 18);
  }
  cg.putImageData(img, 0, 0);
  // lights: windows on the buildings, lamps along the streets, a shimmer on the river
  let seed = 4242;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let y = 0; y < city.h; y++) for (let x = 0; x < city.w; x++) {
    const t = city.map[y][x];
    if (t === B) for (let k = 0; k < 5; k++) { if (rnd() < 0.55) { cg.fillStyle = rnd() < 0.8 ? '#ffd27a' : '#bfe0ff'; cg.fillRect(x * T + 2 + Math.floor(rnd() * 12), y * T + 2 + Math.floor(rnd() * 12), 2, 2); } }
    if (t === R && (x + y) % 3 === 0) { cg.fillStyle = '#ffb347'; cg.fillRect(x * T + 7, y * T + 7, 2, 2); }
    if (t === WATER && rnd() < 0.3) { cg.fillStyle = '#4a6aa8'; cg.fillRect(x * T + Math.floor(rnd() * 14), y * T + Math.floor(rnd() * 14), 3, 1); }
  }
  CLUBS.forEach(cl => { cg.fillStyle = cl.glow; cg.fillRect(cl.dx * T + 3, cl.doorY * T + 2, 10, 14); });
  tex = new Uint32Array(cg.getImageData(0, 0, texW, texH).data.buffer);
}

// little-endian RGBA packed into one 32-bit pixel
const pack = (r: number, gg: number, b: number) => (255 << 24) | (Math.max(0, Math.min(255, b | 0)) << 16) | (Math.max(0, Math.min(255, gg | 0)) << 8) | Math.max(0, Math.min(255, r | 0));
const hash = (x: number, y: number) => { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };

/** The made-up city beyond the map: blocks of 6 tiles with a street between them, roofs, lit windows, a park now and then. */
function outerCity(wx: number, wy: number): [number, number, number] {
  const bx = Math.floor(wx / 7), by = Math.floor(wy / 7), lx = wx - bx * 7, ly = wy - by * 7;
  if (lx < 1 || ly < 1) {
    // street, with a lamp now and then
    const fx = wx - Math.floor(wx), fy = wy - Math.floor(wy);
    return (Math.floor(wx * 2) + Math.floor(wy * 2)) % 5 === 0 && fx > 0.4 && fx < 0.6 && fy > 0.4 && fy < 0.6 ? [255, 180, 80] : [34, 34, 46];
  }
  const kind = hash(bx, by);
  if (kind < 0.12) return [18, 40, 26];                       // a park
  const cx = Math.floor(wx * 3), cy = Math.floor(wy * 3);
  if (hash(cx, cy) < 0.18 && kind > 0.3) return hash(cy, cx) < 0.8 ? [255, 210, 122] : [190, 224, 255]; // a lit window
  const shade = 40 + Math.floor(kind * 30);
  return [shade, shade - 4, shade + 10];
}

/** The skyline all the way round, 4 px per degree, drawn once. */
let sky: HTMLCanvasElement | null = null;
const SKY_W = 1440, SKY_H = 48;
function skyline() {
  if (sky) return sky;
  sky = document.createElement('canvas'); sky.width = SKY_W; sky.height = SKY_H;
  const s = sky.getContext('2d')!;
  // ordinary blocks: flat roofs at different heights, lit windows
  for (let x = 0; x < SKY_W;) {
    const w = 6 + Math.floor(hash(x, 1) * 16), h = 4 + Math.floor(hash(x, 2) * 12);
    s.fillStyle = '#141224'; s.fillRect(x, SKY_H - h, w, h);
    for (let wy = SKY_H - h + 2; wy < SKY_H - 1; wy += 3) for (let wx = x + 1; wx < x + w - 1; wx += 2) if (hash(wx, wy) < 0.25) { s.fillStyle = hash(wy, wx) < 0.8 ? '#e8b860' : '#9cc4f0'; s.fillRect(wx, wy, 1, 1); }
    x += w + Math.floor(hash(x, 3) * 3);
  }
  for (const m of MARKS) {
    const x = Math.round(m.bearing * 4);
    s.fillStyle = '#1c1930';
    if (m.kind === 'dom') { s.fillRect(x - 10, SKY_H - 14, 20, 14); s.beginPath(); s.arc(x, SKY_H - 14, 7, Math.PI, 0); s.fill(); s.fillStyle = '#3f6a5a'; s.fillRect(x - 1, SKY_H - 24, 2, 4); }
    if (m.kind === 'gate') { s.fillRect(x - 9, SKY_H - 12, 18, 3); for (let c = -8; c <= 8; c += 4) s.fillRect(x + c, SKY_H - 9, 2, 9); s.fillStyle = '#d9b25c'; s.fillRect(x - 2, SKY_H - 15, 4, 3); }
    if (m.kind === 'reichstag') { s.fillRect(x - 12, SKY_H - 11, 24, 11); s.fillStyle = '#9fd6ff'; s.beginPath(); s.arc(x, SKY_H - 11, 5, Math.PI, 0); s.fill(); }
    if (m.kind === 'column') { s.fillRect(x - 1, SKY_H - 22, 3, 22); s.fillStyle = '#ffd23f'; s.fillRect(x - 1, SKY_H - 25, 3, 3); }
    if (m.kind === 'funkturm') { s.fillRect(x - 3, SKY_H - 8, 6, 8); s.fillRect(x - 1, SKY_H - 30, 2, 22); s.fillRect(x - 2, SKY_H - 24, 4, 2); s.fillStyle = '#ff3b3b'; s.fillRect(x - 1, SKY_H - 32, 2, 2); }
    if (m.kind === 'slab') { s.fillRect(x - 4, SKY_H - 30, 9, 30); for (let wy = SKY_H - 28; wy < SKY_H; wy += 3) for (let wx = x - 3; wx < x + 4; wx += 2) if (hash(wx, wy) < 0.4) { s.fillStyle = '#e8b860'; s.fillRect(wx, wy, 1, 1); } }
    if (m.kind === 'molecule') { s.fillStyle = '#c0c8d8'; for (const o of [-4, 0, 4]) s.fillRect(x + o, SKY_H - 14, 2, 14); s.fillStyle = '#1c1930'; s.fillRect(x - 3, SKY_H - 9, 8, 2); }
  }
  return sky;
}

/** Up to the Panoramastage. Resolves when you ride back down. */
export function playTower(): Promise<void> {
  return new Promise(resolve => {
    nightTexture();
    const strip = skyline();
    const r = root.parentElement!.getBoundingClientRect();
    const W = 240, H = Math.max(140, Math.min(420, Math.round(W * r.height / Math.max(1, r.width))));
    cv.width = W; cv.height = H;
    g.imageSmoothingEnabled = false;
    const img = g.createImageData(W, H), buf = new Uint32Array(img.data.buffer);
    const F = W / 2 / Math.tan(FOV / 2);

    // the eye: over the middle of the tower's footprint, in tiles
    const ex = TOWER.x + TOWER.w / 2, ey = TOWER.y + TOWER.h / 2;
    const city = SCENES.city;
    // start looking south-west, over the Spree and most of the clubs
    let ang = Math.PI * 1.15, pitch = 0, idle = 0, last = performance.now(), done = false, raf = 0, t = 0;
    const held = new Set<Dir>();

    RT.runner = {
      music: 'city',
      dir(d) { held.add(d); idle = 0; },
      release(d) { held.delete(d); },
      jump() { finish(); }
    };
    let drag: { x: number; y: number; ang: number; pitch: number } | null = null;
    const down = (ev: PointerEvent) => { ev.preventDefault(); drag = { x: ev.clientX, y: ev.clientY, ang, pitch }; idle = 0; try { root.setPointerCapture(ev.pointerId); } catch { /* not supported */ } };
    const move = (ev: PointerEvent) => { if (!drag) return; const k = W / Math.max(1, root.clientWidth); ang = drag.ang - (ev.clientX - drag.x) * k * FOV / W; pitch = Math.max(-0.35, Math.min(0.25, drag.pitch + (ev.clientY - drag.y) * k / H)); };
    const up = () => { drag = null; };
    root.addEventListener('pointerdown', down); root.addEventListener('pointermove', move);
    root.addEventListener('pointerup', up); root.addEventListener('pointercancel', up);

    function step(dt: number) {
      t += dt; idle += dt;
      if (held.has('left')) ang -= TURN * dt;
      if (held.has('right')) ang += TURN * dt;
      if (held.has('up')) pitch = Math.min(0.25, pitch + 0.5 * dt);
      if (held.has('down')) pitch = Math.max(-0.35, pitch - 0.5 * dt);
      // left alone, the view drifts slowly round, like the sphere does
      if (!held.size && !drag && idle > 4 && !reduceMotion) ang += AUTO * dt;
    }

    function draw(now: number) {
      // compass: ang 0 = north (up on the map), clockwise
      const hy = Math.round(H * (0.34 - pitch));
      const cos = Math.cos(ang), sin = Math.sin(ang);
      // sky
      for (let y = 0; y < Math.max(0, hy); y++) {
        const k = y / Math.max(1, hy), px = pack(SKY_TOP[0] + (SKY_LOW[0] - SKY_TOP[0]) * k, SKY_TOP[1] + (SKY_LOW[1] - SKY_TOP[1]) * k, SKY_TOP[2] + (SKY_LOW[2] - SKY_TOP[2]) * k);
        buf.fill(px, y * W, (y + 1) * W);
      }
      // ground: every row below the horizon is a line on the map at a known distance
      for (let y = Math.max(0, hy + 1); y < H; y++) {
        const dist = EYE * F / (y - hy);
        const fog = Math.min(1, Math.max(0, (dist - 18) / 70));
        for (let x = 0; x < W; x++) {
          const side = (x - W / 2) / F;
          // forward (sin, -cos) is the view direction; right is (cos, sin)
          const wx = ex + (sin + cos * side) * dist, wy = ey + (-cos + sin * side) * dist;
          let rr: number, gg: number, bb: number;
          if (wx >= 0 && wy >= 0 && wx < city.w && wy < city.h && tex) {
            const p = tex[Math.floor(wy * T) * texW + Math.floor(wx * T)];
            rr = p & 255; gg = (p >>> 8) & 255; bb = (p >>> 16) & 255;
          } else [rr, gg, bb] = outerCity(wx, wy);
          buf[y * W + x] = pack(rr + (HAZE[0] - rr) * fog, gg + (HAZE[1] - gg) * fog, bb + (HAZE[2] - bb) * fog);
        }
      }
      g.putImageData(img, 0, 0);
      // stars
      for (let i = 0; i < 40; i++) {
        const sx = ((hash(i, 7) * 2 * Math.PI - ang) / FOV + 0.5) * W, sy = hash(7, i) * (hy - 14);
        if (sx >= 0 && sx < W && sy > 0 && (reduceMotion || Math.sin(now / 500 + i) > -0.6)) { g.fillStyle = '#e8e8ff'; g.fillRect(Math.round(((sx % W) + W) % W), Math.round(sy), 1, 1); }
      }
      // the skyline on the horizon, all the way round
      const deg = ((ang * 180 / Math.PI) % 360 + 360) % 360, span = FOV * 180 / Math.PI;
      const sx0 = (deg - span / 2) * 4, sw = span * 4, sh = SKY_H * (W / sw);
      for (const off of [-SKY_W, 0, SKY_W]) {
        const a = Math.max(0, sx0 - off), b = Math.min(SKY_W, sx0 + sw - off);
        if (b > a) g.drawImage(strip, a, 0, b - a, SKY_H, (a + off - sx0) * W / sw, hy - sh + 2, (b - a) * W / sw, sh);
      }
      // labels: the landmarks on the horizon, the clubs on the ground
      const label = (text: string, x: number, y: number, col: string) => {
        const w = pixelTextWidth(text) + 4, lx = Math.round(Math.max(1, Math.min(W - w - 1, x - w / 2)));
        g.fillStyle = 'rgba(12,10,20,.75)'; g.fillRect(lx, Math.round(y), w, 9);
        pixelText(g, text, lx + 2, Math.round(y) + 2, col);
      };
      for (const m of MARKS) {
        let d = m.bearing - deg; d = ((d + 540) % 360) - 180;
        if (Math.abs(d) < span / 2 - 4 && Math.abs(d) < 20) label(m.name, W / 2 + d / span * W, hy - sh - 8, '#ffe58a');
      }
      for (const c of CLUBS) {
        const vx = c.dx + 0.5 - ex, vy = c.by - ey;
        const f = vx * sin - vy * cos, s = vx * cos + vy * sin;
        if (f < 1) continue;
        const sx = W / 2 + s / f * F, sy = hy + EYE * F / f;
        if (sx < -20 || sx > W + 20 || sy > H) continue;
        g.fillStyle = c.glow; g.fillRect(Math.round(sx), Math.round(sy) - 10, 1, 10);
        label(c.name.toUpperCase(), sx, sy - 19, '#ffffff');
      }
      // inside the sphere: the slanted window frames turn with you, the ring of the deck below
      // thin steel frames, slanted with the curve of the sphere
      for (let i = 0; i < 12; i++) {
        let d = i * 30 - deg; d = ((d + 540) % 360) - 180;
        if (Math.abs(d) > span / 2 + 6) continue;
        const x = W / 2 + d / span * W;
        g.fillStyle = INK; g.beginPath(); g.moveTo(x - 2, 0); g.lineTo(x, 0); g.lineTo(x + 2, H - 18); g.lineTo(x, H - 18); g.fill();
        g.fillStyle = 'rgba(160,160,180,.35)'; g.fillRect(Math.round(x), Math.round(H * 0.45), 1, 2);
      }
      g.fillStyle = INK;
      g.fillRect(0, 0, W, 6); g.fillStyle = '#2a2838'; g.fillRect(0, 6, W, 2);
      g.fillStyle = '#26242e'; g.fillRect(0, H - 18, W, 18); g.fillStyle = '#4a4656'; g.fillRect(0, H - 18, W, 2);
      // compass and hint on the deck rail
      const dirs = ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'];
      pixelText(g, dirs[Math.round(deg / 45) % 8].padEnd(2, ' '), 4, H - 12, '#ffe58a');
      const hint = 'PANORAMASTAGE 203 M   A ZURÜCK';
      pixelText(g, hint, W - pixelTextWidth(hint) - 4, H - 12, '#c9c4d6');
    }

    function finish() {
      if (done) return;
      done = true; cancelAnimationFrame(raf);
      root.removeEventListener('pointerdown', down); root.removeEventListener('pointermove', move);
      root.removeEventListener('pointerup', up); root.removeEventListener('pointercancel', up);
      RT.runner = null;
      root.classList.remove('show');
      setTimeout(() => { root.hidden = true; resolve(); }, reduceMotion ? 0 : 350);
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

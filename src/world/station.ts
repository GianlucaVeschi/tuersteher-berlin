import { RT } from '../core/runtime';
import { player } from '../core/state';
import { train } from '../render/draw';
import { zoomLevel } from '../render/zoom';
import { blocked } from './collision';
import { SCENES } from './scenes';
import { BR, CITY_W, PL, R, S, T } from './tiles';
import { wait } from '../util';
import type { Dir, Entity, Look } from '../types';

/* ================= S-BAHN: WARSCHAUER STRASSE ================= */
// The train runs along the tracks (row 1), stops at the platform for a few seconds, then leaves.
// People wait on the platform and board; others get off and run towards the clubs, then vanish.

/** The platform: tiles x0..x1 on row y, right next to the tracks. */
export const STATION = { x0: 35, x1: 42, y: 2 };
const CARS = 3, CAR_W = 44, SPEED = 0.11, DWELL = 4500;
/** Train position (left edge) when it stands centred on the platform. */
const STOP_X = ((STATION.x0 + STATION.x1 + 1) / 2) * T - (CARS * CAR_W) / 2;
/** Slows down over the last 200 px before the stop, speeds up again over the first 200 px after it. */
const speed = () => SPEED * Math.min(1, Math.max(0.2, Math.abs(STOP_X - train.x) / 200));

/** Called every frame from the game loop. */
export function updateTrain(dt: number) {
  if (train.wait > 0) { train.wait -= dt; return; }
  if (train.dwell > 0) { train.dwell -= dt; if (train.dwell <= 0) depart(); return; }
  const before = train.x;
  train.x += dt * speed();
  if (!train.served && before < STOP_X && train.x >= STOP_X) {
    train.x = STOP_X; train.served = true; train.dwell = DWELL;
    arrive();
  }
  if (train.x > CITY_W * T + 20) {
    train.x = 13 * T - 140; train.served = false;
    train.wait = 7000 + Math.random() * 9000;
  }
}

/* ---------- passengers ---------- */
const SKINS = ['#f3c9a8', '#f0c7a0', '#e2b08c', '#d9a27c', '#c98d6a', '#8d5a3b'];
const HAIR = ['#111111', '#2a2420', '#5a3a22', '#c9a24a', '#b04a2a', '#ff5fa2', '#b6f36b'];
const TOPS = ['#1b1b22', '#4ea8de', '#e04f5f', '#f2c14e', '#58b368', '#c28cff', '#0c0c12'];
const WAITING_LINES = [
  'Commuter: The S-Bahn is late. The S-Bahn is always late.',
  "Raver: Next one's mine. Two stops and I'm at Ostkreuz.",
  'Tourist: Is this the train to the airport? … No? Okay.',
  'Local: Warschauer at 2am. Half of Berlin is on this platform.'
];
const RUNNING_LINES = ["Raver: Can't talk! The queue is getting longer!", 'Raver: Berghain! Which way is Berghain?!', 'Tourist: Is it this way? EVERYONE is going this way!'];
const pickOf = <X>(a: X[]) => a[Math.floor(Math.random() * a.length)];
const randomLook = (): Look => ({ skin: pickOf(SKINS), hair: pickOf(HAIR), top: pickOf(TOPS), legs: pickOf(['#1b1b22', '#2b3f6b', '#3a3a4a']), long: Math.random() < 0.4, shades: Math.random() < 0.2 });

/** Street people only move while you're on the street: blocked() and the slide animation work on the current scene. */
const onStreet = () => RT.scene === 'city';
const city = () => SCENES.city.ents;
const free = (x: number, y: number) => !blocked(x, y) && !(player.x === x && player.y === y) && !(player.tx === x && player.ty === y);
function remove(e: Entity) { const l = city(), i = l.indexOf(e); if (i >= 0) l.splice(i, 1); }
async function fadeOut(e: Entity) { for (let a = 1; a > 0; a -= 0.15) { e.alpha = a; await wait(40); } remove(e); }

/** A few people waiting on the platform. */
function spawnWaiting() {
  if (!onStreet()) return;
  const n = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < n * 3 && city().filter(e => e.passenger === 'waiting').length < n; i++) {
    const x = STATION.x0 + Math.floor(Math.random() * (STATION.x1 - STATION.x0));
    if (free(x, STATION.y)) city().push({ kind: 'npc', passenger: 'waiting', x, y: STATION.y, dir: 'up', look: randomLook(), lines: [pickOf(WAITING_LINES)] });
  }
}

/** The train is in: waiting people step in, a few others get out and run off. */
function arrive() {
  if (!onStreet()) return;
  city().filter(e => e.passenger === 'waiting').forEach(e => void board(e));
  const n = 2 + Math.floor(Math.random() * 2);
  for (let i = 0, made = 0; i < 12 && made < n; i++) {
    const x = STATION.x0 + Math.floor(Math.random() * (STATION.x1 - STATION.x0));
    if (!free(x, STATION.y)) continue;
    const e: Entity = { kind: 'npc', passenger: 'running', x, y: STATION.y, dir: 'down', look: randomLook(), lines: [pickOf(RUNNING_LINES)], oy: -10 };
    city().push(e);
    made++;
    void run(e, 300 + made * 350);
  }
}
async function board(e: Entity) {
  e.passenger = 'boarding'; e.dir = 'up';
  await wait(200 + Math.random() * 800);
  e.oy = -10;
  await fadeOut(e);
}
/** Out of the view: far enough from you that the camera can't see them (with some margin). */
const outOfView = (e: Entity) => {
  const z = zoomLevel(); // zoomed out you see more of the city
  return Math.abs(e.x - player.x) > RT.VW / z / T / 2 + 2 || Math.abs(e.y - player.y) > RT.VH / z / T / 2 + 2;
};
/** Prefer pavement: keep to roads and sidewalks, cut over grass only when nothing else is free. */
const paved = (x: number, y: number) => { const t = RT.map[y]?.[x]; return t === R || t === S || t === BR || t === PL; };
/** Run off towards the clubs, down the road or along the street, until they're out of view. */
async function run(e: Entity, delay: number) {
  await wait(delay);
  const dirs: Dir[] = ['down', 'down', 'left', 'right'];
  let dir: Dir = pickOf(dirs);
  for (let i = 0; i < 120 && onStreet() && !outOfView(e); i++) {
    // keep going the same way; now and then turn into a side street
    const order: Dir[] = Math.random() < 0.15 ? [...dirs.filter(d => d !== dir), dir] : [dir, ...dirs.filter(d => d !== dir)];
    const ok = (d: Dir) => { const [dx, dy] = STEP[d]; return free(e.x + dx, e.y + dy) && d !== OPPOSITE[dir]; };
    const next = order.find(d => ok(d) && paved(e.x + STEP[d][0], e.y + STEP[d][1])) ?? order.find(ok);
    if (!next) break;
    dir = next;
    const [dx, dy] = STEP[dir];
    e.x += dx; e.y += dy; e.ox = -16 * dx; e.oy = -16 * dy; e.dir = dir;
    await wait(170);
  }
  // gone round the corner: nobody sees them leave. If they got stuck in view, they fade instead.
  if (outOfView(e) || !onStreet()) remove(e); else await fadeOut(e);
}
const OPPOSITE: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };
const STEP: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

/** The train leaves; new people turn up on the platform a bit later. */
function depart() { setTimeout(spawnWaiting, 2500 + Math.random() * 3000); }

/** The first people on the platform, when the game starts. */
export function initStation() { spawnWaiting(); }

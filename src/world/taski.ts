import { RT } from '../core/runtime';
import { player } from '../core/state';
import { ask, say } from '../ui/dialog';
import { blocked } from './collision';
import { SCENES } from './scenes';
import { BR, R } from './tiles';
import { wait } from '../util';
import type { Dir, Entity } from '../types';

/* ================= TASKI, THE WOLT RIDER ================= */
// Taski rides his bike up and down the streets all night with a Wolt box on his back (data/npcs.ts,
// id 'taski'). He stops when you're right next to him, so you can talk. After 20 hours at Sisyphos he
// walked out, got into a Miles (the car-sharing cars everyone in Berlin calls "a Miles") and tried to drive it
// across the train tracks. The car did not make it. Now he is paying it off one delivery at a time.

const STEP_MS = 190;
const DIRS: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const BACK: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };
/** after a chat he rides off and doesn't stop for you again straight away */
let ignoreUntil = 0;

const road = (x: number, y: number) => { const t = RT.map[y]?.[x]; return t === R || t === BR; };
const free = (x: number, y: number) => road(x, y) && !blocked(x, y) && !(player.x === x && player.y === y) && !(player.tx === x && player.ty === y);
const taski = () => SCENES.city.ents.find(e => e.npcId === 'taski');

/** Starts the ride. Called once from main.ts. */
export function initTaski() { void ride(); }

async function ride() {
  let dir: Dir = 'right';
  // start on the nearest road tile
  const e0 = taski();
  if (e0 && RT.scene === 'city' && !road(e0.x, e0.y)) {
    for (let r = 1; r < 12 && !road(e0.x, e0.y); r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (road(e0.x + dx, e0.y + dy) && !road(e0.x, e0.y)) { e0.x += dx; e0.y += dy; }
    }
  }
  for (;;) {
    await wait(STEP_MS);
    const e = taski();
    // street people only move while you're on the street (blocked() works on the current scene)
    if (!e || RT.scene !== 'city' || RT.busy || RT.titleOn) continue;
    // right next to you: he brakes and waits, so you can talk to him
    if (performance.now() > ignoreUntil && Math.abs(e.x - player.x) + Math.abs(e.y - player.y) <= 1) {
      e.dir = player.x < e.x ? 'left' : player.x > e.x ? 'right' : player.y < e.y ? 'up' : 'down';
      continue;
    }
    // keep riding the same way; at crossings sometimes turn; turn back only at a dead end
    const others = (Object.keys(DIRS) as Dir[]).filter(d => d !== dir && d !== BACK[dir]).sort(() => Math.random() - 0.5);
    const order: Dir[] = Math.random() < 0.2 ? [...others, dir, BACK[dir]] : [dir, ...others, BACK[dir]];
    const next = order.find(d => free(e.x + DIRS[d][0], e.y + DIRS[d][1]));
    if (!next) continue;
    dir = next;
    const [dx, dy] = DIRS[dir];
    e.x += dx; e.y += dy; e.ox = -16 * dx; e.oy = -16 * dy; e.dir = dir;
  }
}

const STORIES = [
  'Taski: I delivered a pizza to a man in a bathtub. On Warschauer Straße. He tipped in Ritter Sport.',
  'Taski: The pigeons at Kotti have a union. They voted against me.',
  'Taski: I brought sushi to the Berghain bouncer. He looked at it and said "not tonight". To the sushi.',
  'Taski: Someone ordered one ice cube. I delivered water. Five stars.',
  'Taski: I rode the Ringbahn three laps. With the bike. Inside the train.',
  'Taski: My flatmate is a DJ. One gig, in 2017. For a dog.',
  'Taski: I found a sofa floating in the Landwehrkanal. Sat on it for an hour. Best hour of my year.',
  'Taski: A swan at the Admiralbrücke hates me. Personally. Every night.'
];
const pickStory = (not?: string) => { let s: string; do s = STORIES[Math.floor(Math.random() * STORIES.length)]; while (s === not && STORIES.length > 1); return s; };
let told = false;

/** Talking to Taski: a random story, the accident, and could you spare 5 euros (or a bit of weed)? */
export async function taskiTalk(e: Entity | null) {
  let story = pickStory();
  await say('Taski: YO! Taski, Wolt. ' + story.replace('Taski: ', ''));
  if (!told) {
    await say('Taski: After 20 hours at Sisyphos I took a Miles and drove it over the train tracks. Car: dead.');
    await say('Taski: Now I pay it off with deliveries. I will NOT make it to the end of the month.');
    told = true;
  }
  for (let i = 0; i < 3; i++) {
    const a = await ask('Taski: Got 5 euros? Or a bit of weed?', ['Here, 5 euros', 'Sorry, no', 'Another story']);
    if (a === 0) { await say('Taski: BRO. You saved my month. Well, my day.'); break; }
    if (a === 1) { await say('Taski: All good. Only 19 days left. ...I can do 19 days.'); break; }
    story = pickStory(story);
    await say(story);
  }
  if (e) ignoreUntil = performance.now() + 6000;
}

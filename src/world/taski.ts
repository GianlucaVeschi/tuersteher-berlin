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
  'Taski: Last week I delivered a pizza to a man in a bathtub. On the street. Just a bathtub, on Warschauer Straße. He tipped me in Ritter Sport.',
  'Taski: Did you know the pigeons in Kreuzberg have a union? I saw a meeting on a roof at Kotti. They voted against me.',
  'Taski: I once delivered sushi to the Berghain bouncer. He looked at the sushi for ten seconds and said "not tonight". To the sushi.',
  'Taski: My cousin swapped his car for a goat in Brandenburg. The goat is doing better than the car ever did. It has Instagram now.',
  'Taski: Yesterday somebody ordered one single ice cube. Delivery fee 3,99. I brought it. It was water when I arrived. Five stars.',
  'Taski: The Späti guy on the corner is a wizard. He knows what I want before I walk in. ...Okay, it is always a Sterni. Maybe not a wizard.',
  'Taski: I rode the whole Ringbahn once. With the bike. Inside the train. Three laps. Nobody said anything. Berlin, man.',
  'Taski: My flatmate is a DJ. He has played one gig, in 2017. For a dog. The dog loved it. They still text.',
  'Taski: I found a whole sofa floating in the Landwehrkanal. I sat on it. It kept floating. Best hour of my year.',
  'Taski: A tourist asked me where the Wall is. I said: everywhere, bro. In our hearts. He gave me ten euros. Best investment of his life.',
  'Taski: I delivered a kebab to a wedding in Görli. The groom ate it. The bride married me instead. Just kidding. She married the kebab.',
  'Taski: There is a swan at the Admiralbrücke that hates me personally. Every night it waits for me. I do not know what I did. I have a feeling it knows.'
];
const pickStory = (not?: string) => { let s: string; do s = STORIES[Math.floor(Math.random() * STORIES.length)]; while (s === not && STORIES.length > 1); return s; };
let told = false;

/** Talking to Taski: a random story, the accident, and could you spare 5 euros (or a bit of weed)? */
export async function taskiTalk(e: Entity | null) {
  await say('Taski: YO! Taski. Wolt. Can\'t stop long, three orders are getting cold. ...Okay, I can stop.');
  let story = pickStory();
  await say(story);
  if (!told) {
    await say('Taski: You know why I do this? Twenty hours at Sisyphos. TWENTY. Then I walked out and opened a Miles.');
    await say('Taski: I thought: shortcut. Straight over the train tracks. How hard can it be?');
    await say('Taski: Very hard. The car got stuck on the rails, both front wheels gone, the bottom ripped open. Totally broken. I walked home.');
    await say('Taski: Miles sent me the bill. Now I pay it off, one delivery at a time. And it is only the 12th. I am NOT making it to the end of the month.');
    told = true;
  } else await say('Taski: Still paying off that Miles, by the way. Pro tip: they are not made for train tracks. Nothing is made for train tracks. Except trains.');
  for (let i = 0; i < 3; i++) {
    const a = await ask('Taski: So... you got 5 euros? Or a bit of weed? Either works. Both works better.', ['Here, 5 euros', 'No weed, sorry', 'Tell me another story']);
    if (a === 0) { await say('Taski: BRO. You saved my month. Well. My day. Well. The next ten minutes.'); break; }
    if (a === 1) { await say('Taski: All good, all good. Month ends in 19 days. I can do 19 days.'); await say('(He can not do 19 days.)'); break; }
    story = pickStory(story);
    await say(story);
  }
  await say('Taski: Okay, gotta go! If you see a swan at the Admiralbrücke: you never saw me.');
  if (e) ignoreUntil = performance.now() + 6000;
}

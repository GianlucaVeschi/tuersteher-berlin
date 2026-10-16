import { completeQuest, questDone } from './quests';
import { ask, closeBox, say } from '../ui/dialog';
import { renderCard } from '../ui/card';
import { save } from '../core/save';
import { fade, leaveClub, toast } from '../interiors/transitions';
import { playLsd } from '../effects/lsd';
import { RT } from '../core/runtime';
import { DIRS, MOVE, player, state } from '../core/state';
import { get } from '../world/grid';
import { blocked } from '../world/collision';
import { ICH } from '../world/tiles';
import { $, reduceMotion, wait } from '../util';
import type { Dir, Entity } from '../types';

/* ---- Club der Visionäre: the deck under the willow, cash only, a weekend that ends on Monday ---- */
// Researched: a former boathouse on the Flutgraben (Am Flutgraben 1, Alt-Treptow), started around 2001
// by Gregor Kraemer (who comes from jazz). One small, partly roofed wooden dancefloor on the water under
// a weeping willow, the Sonnenraum as the small indoor room, cash at the bar, a relaxed door. On busy
// summer weekends it can run Friday to Monday; in winter the parties move to the Hoppetosse, its sister
// ship nearby. A fire took part of the wooden outdoor area on 15 June 2019; Save CDV crowdfunding in 2020.

const DAYS = ['sat', 'sun', 'mon'];
const DAY_DANCE = [
  '(Saturday afternoon. Sun through the willow, a kick drum like a slow heartbeat. Nobody is in a hurry.)',
  '(Sunday, sunset over the Flutgraben. The DJ who was supposed to stop two hours ago is still playing.)',
  '(Monday morning. The birds are louder than the hi-hats. Someone fresh walks in for their first drink of the weekend.)'
];
const DAY_NAMES = ['SATURDAY', 'SUNDAY', 'MONDAY'];

/** Days danced through on the deck (Saturday, Sunday, Monday). */
export const cdvDays = () => DAYS.filter(d => state.danced['cdv:' + d]).length;

/** Dancing at CDV: on the deck every dance moves the weekend on a day, until it's Monday morning. */
export async function cdvDance(fl: string) {
  if (fl === 'sonnen') { await say('(You try to dance to jazz. The drummer nods: close enough.)'); return; }
  const n = cdvDays();
  if (n >= DAYS.length) { await say('(Clicks, a rolling bassline, small changes over a long time. Minimal is patience.)'); return; }
  state.danced['cdv:' + DAYS[n]] = true; save(); renderCard();
  await say(DAY_DANCE[n]);
  if (n + 1 >= DAYS.length) await completeQuest('cdv', 'monday');
  else toast(`${DAY_NAMES[n]} · ${n + 1}/${DAYS.length}`);
}

/** The bar: cash only. Without cash you have to find someone to lend you some. */
export async function cdvBar(_e: Entity | null, clubId: string) {
  const a = await ask('Bar: What can I get you?', ['Club-Mate', 'A beer', 'Just water']);
  if (a === 2) {
    await say('Bar: Water is free. Tap is right there.');
    return;
  }
  if (state.cdvCash !== 2 && !questDone(clubId, 'drink')) {
    await ask('Bar: Four euro.', ['Tap my card', 'Pay with my phone']);
    await say('Bar: No cards here, love. Cash. Always has been.');
    if (state.cdvCash === 0) { state.cdvCash = 1; save(); renderCard(); }
    await say('(No cash machine anywhere near the deck. Maybe one of the regulars can help.)');
    return;
  }
  await say(a === 0 ? '(Ice cold Club-Mate, paid in coins. The bartender actually smiles.)' : '(A cold beer by the water, paid in cash like it\'s 2001.)');
  if (state.cdvCash === 2) { state.cdvCash = 3; save(); }
  await completeQuest(clubId, 'drink');
}

/** Ines, a regular since the early days: lends you cash, tells you how it all started. */
export async function ines(_e: Entity | null, clubId: string) {
  if (state.cdvCash === 1) {
    await say('Ines: You tried to pay by card? At CDV? Oh, sweetie.');
    await say("Ines: Here, ten euro. Pay me back next summer. I'm always on this bench.");
    state.cdvCash = 2; save(); renderCard();
    toast('GOT 10 € CASH');
    return;
  }
  if (questDone(clubId, 'ines')) { await say('Ines: Mayday party, every year. Make sure you come.'); return; }
  await say("Ines: I've been coming here since the beginning. Around 2001. An old boathouse on the Flutgraben, a few friends, a sound system.");
  await say('Ines: Gregor, who started it, comes from jazz. That is why there is jazz in the Sonnenraum.');
  await say('Ines: Villalobos, Zip, Sonja Moonear, Sammy Dee... they all played on this little deck. Fifty people dancing and it feels full.');
  await say('Ines: In summer it opens in the afternoon and nobody knows when it closes. In winter we all go over to the Hoppetosse.');
  await completeQuest(clubId, 'ines');
}

/** Tom by the newer boards: the 2019 fire and how the regulars saved the club. */
export async function planks(_e: Entity | null, clubId: string) {
  if (questDone(clubId, 'planks')) { await say('Tom: New planks, same willow. That is all that matters.'); return; }
  await say('(Some of the deck boards here are lighter than the rest. Newer.)');
  await say('Tom: Early morning, 15 June 2019. A fire took out part of the wooden outdoor area.');
  await say('Tom: The fire brigade complained about gas bottles and dodgy wiring. The club said the main deck was fine, and the parties moved over to the Hoppetosse for a while.');
  await say('Tom: Then 2020 and Covid. The Save CDV crowdfunding went past fifty thousand euro. Half the people on this deck chipped in.');
  await completeQuest(clubId, 'planks');
}

/** The weeping willow over the deck. */
export async function willow(_e: Entity | null, clubId: string) {
  if (questDone(clubId, 'willow')) { await say('(The willow. Still the best seat in Berlin.)'); return; }
  await say('(You sit down under the weeping willow. Its branches hang almost into the water.)');
  await say('(Light comes through the leaves in little pieces. The bass sounds far away from here.)');
  await completeQuest(clubId, 'willow');
}

/** The jazz trio in the Sonnenraum needs someone on the hi-hat. */
export async function jazz(_e: Entity | null, clubId: string) {
  if (questDone(clubId, 'jazz')) { await say('Bassist: Come back any time. We play until the last guest goes home.'); return; }
  await say('Bassist: Our drummer needs a break. Can you keep the hi-hat going?');
  const a = await ask('Where does the hi-hat go in swing?', ['On 2 and 4', 'On 1 and 3', 'On every beat, as loud as possible', 'Wherever it wants']);
  if (a !== 0) {
    await say(a === 1 ? "Bassist: On 1 and 3? That's a marching band, friend. Try again." : 'Bassist: Hmm. Listen a little longer, then try again.');
    return;
  }
  await say('(You click the hi-hat on 2 and 4. The trio smiles. For eight bars you are a jazz musician.)');
  await say('Bassist: Long pieces, small changes. Jazz and minimal are closer than people think.');
  await completeQuest(clubId, 'jazz');
}

/** Stamp card hints that change with progress. */
export function cdvHint(id: string, base: string): string {
  if (id === 'drink' && state.cdvCash === 1) return 'The bar wants cash. Maybe a regular on a bench can help.';
  if (id === 'drink' && state.cdvCash === 2) return 'You have 10 € in cash. Back to the bar.';
  if (id === 'monday') return `${cdvDays()}/3 days. ` + base;
  return base;
}

/* ---- The LSD dive: Flo by the water, a "jump" into the Flutgraben, waking up on the dancefloor ---- */
// Dramatised: nobody at CDV is known for handing out acid. The joke is that you never left the deck.

/** Flo, by the water near the willow. Has a little tin of paper squares. */
export async function flo(e: Entity | null, clubId: string) {
  if (!e) return;
  if (questDone(clubId, 'lsd')) {
    await say('Flo: You again? Security has a photo of you now. Behind the bar, next to the CASH ONLY sign.');
    const a = await ask('Flo: ...Another half?', ['One more dive', 'Water, please']);
    if (a === 1) { await say('Flo: Wise. The unicorns will wait.'); return; }
    await trip(clubId, true);
    return;
  }
  await say('Flo: Psst. Hey. You look like someone who needs to see some colours.');
  await say('(He opens a little tin. Tiny squares of paper, each with a smiley on it.)');
  await say('Flo: Pappe. Half a tab. Start low, go slow. And whatever happens: stay away from the water.');
  const a = await ask('', ['Take it', 'No thanks']);
  if (a === 1) { await say('Flo: Respect. Get a Club-Mate instead. Cash only, though.'); return; }
  await trip(clubId, false);
}

const FLOOR = new Set([ICH['w'], ICH['e']]), WATER = ICH['q'];
const STEPS = Object.entries(DIRS) as [Dir, [number, number]][];
const nextToWater = (x: number, y: number) => STEPS.some(([, [dx, dy]]) => get(x + dx, y + dy) === WATER);
const walkable = (x: number, y: number) => FLOOR.has(get(x, y)) && !blocked(x, y);

/** One slow, wobbly step (the frame loop moves the player while a script has control). */
async function stagger(dir: Dir) {
  const [dx, dy] = DIRS[dir];
  player.dir = dir;
  if (!walkable(player.x + dx, player.y + dy)) { await wait(200); return; }
  player.tx = player.x + dx; player.ty = player.y + dy; player.moving = true; player.t = 0; player.n++; player.dur = MOVE * 2.2;
  while (player.moving) await wait(30);
}

/** Shortest way over the deck to a plank at the edge of the water (breadth-first). */
function pathToWater(): Dir[] {
  const key = (x: number, y: number) => x + ',' + y;
  const from = new Map<string, [string, Dir] | null>([[key(player.x, player.y), null]]);
  const queue: [number, number][] = [[player.x, player.y]];
  while (queue.length) {
    const [x, y] = queue.shift()!;
    if (nextToWater(x, y)) {
      const path: Dir[] = [];
      for (let k = key(x, y), f = from.get(k); f; k = f[0], f = from.get(k)) path.unshift(f[1]);
      return path;
    }
    for (const [d, [dx, dy]] of STEPS) {
      const nx = x + dx, ny = y + dy;
      if (from.has(key(nx, ny)) || !walkable(nx, ny)) continue;
      from.set(key(nx, ny), [key(x, y), d]);
      queue.push([nx, ny]);
    }
  }
  return [];
}

/** The colours on the game screen while it kicks in. */
function tripFilter(on: boolean) {
  const cv = $<HTMLCanvasElement>('#game');
  if (!on) { cv.style.filter = ''; return; }
  cv.style.filter = reduceMotion ? 'saturate(1.8)' : 'saturate(2.2) hue-rotate(0deg)';
  if (reduceMotion) return;
  const t0 = performance.now();
  const spin = () => { if (!cv.style.filter) return; cv.style.filter = `saturate(2.2) hue-rotate(${Math.round((performance.now() - t0) / 8) % 360}deg)`; requestAnimationFrame(spin); };
  requestAnimationFrame(spin);
}

/** The middle of the dancefloor, or the nearest free spot to it. */
function floorMiddle(): [number, number] {
  for (let r = 0; r < 6; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    const x = 16 + dx, y = 7 + dy;
    if (get(x, y) === ICH['e'] && !blocked(x, y)) return [x, y];
  }
  return [player.x, player.y];
}

/** Take the tab: lose control, "jump" into the canal, dive, wake up, get thrown out. A replay doesn't change the quest. */
async function trip(clubId: string, replay: boolean) {
  await say('(You put it on your tongue. It tastes like paper. For an hour, nothing happens.)');
  await say('(Then the willow starts breathing. The planks ripple. The kick drum has a colour, and the colour is warm.)');
  closeBox();
  tripFilter(true);
  // a few steps that aren't really yours, then straight for the water
  for (let i = 0; i < 3; i++) await stagger(STEPS[Math.floor(Math.random() * 4)][0]);
  await say('(The Flutgraben is glittering. It looks like a warm bed. It looks SO soft.)');
  closeBox();
  for (const d of pathToWater()) await stagger(d);
  const water = STEPS.find(([, [dx, dy]]) => get(player.x + dx, player.y + dy) === WATER);
  if (water) player.dir = water[0];
  await say('(You climb onto the edge of the deck, spread your arms and JUMP.)');
  closeBox();
  toast('SPLASH!');
  await fade(true);
  tripFilter(false);
  const colours = await playLsd();
  // you never left the deck
  [player.x, player.y] = floorMiddle(); player.tx = player.x; player.ty = player.y; player.moving = false;
  RT.lying = true;
  await fade(false);
  await say('(You open your eyes. You are lying flat on your back in the middle of the dancefloor.)');
  await say(`(Bone dry. You never left the deck. You caught ${colours} colours. Your hands are empty.)`);
  // security comes over from the entrance
  const sec: Entity = { kind: 'npc', name: 'Security', x: 14, y: 13, dir: 'up', look: { skin: '#c98d6a', hair: '#111111', top: '#111111', legs: '#1b1b22', bald: true, beard: '#111111' } };
  RT.ents.push(sec);
  for (let i = 0; i < 16 && Math.abs(sec.x - player.x) + Math.abs(sec.y - (player.y + 1)) > 0; i++) {
    const sx = Math.sign(player.x - sec.x), sy = Math.sign(player.y + 1 - sec.y);
    if (sy && !blocked(sec.x, sec.y + sy)) { sec.y += sy; sec.oy = -16 * sy; sec.dir = sy > 0 ? 'down' : 'up'; }
    else if (sx && !blocked(sec.x + sx, sec.y)) { sec.x += sx; sec.ox = -16 * sx; sec.dir = sx > 0 ? 'right' : 'left'; }
    else break;
    await wait(reduceMotion ? 0 : 260);
  }
  sec.dir = 'up';
  await say('Security: Okay, mermaid. Up you get.');
  await say('Security: Twenty minutes of breaststroke on the dancefloor. You kicked the DJ. Twice.');
  RT.lying = false; player.dir = 'down';
  await say('Security: Out. Fresh air, some water. Come back next weekend.');
  if (!replay) await completeQuest(clubId, 'lsd');
  closeBox();
  RT.ents.splice(RT.ents.indexOf(sec), 1);
  await leaveClub(clubId);
  RT.busy = true; // leaveClub hands control back; the last line is still ours
  await say('(The door of CDV closes behind you. Somewhere under the water, a unicorn waves goodbye.)');
}

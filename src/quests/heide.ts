import { completeQuest } from './quests';
import { ask, closeBox, say } from '../ui/dialog';
import { renderCard } from '../ui/card';
import { save } from '../core/save';
import { fade, toast } from '../interiors/transitions';
import { DIRS, player, state } from '../core/state';
import { reduceMotion, wait } from '../util';
import { playDjSet } from '../minigames';
import { RT } from '../core/runtime';
import { ICH } from '../world/tiles';
import { SCENES } from '../world/scenes';
import type { Entity } from '../types';

/* ---- Heideglühen: sneak onto the DJ's decks while Woody the booker is away, karaoke behind the toilets, the fire,
        the rotating seats ---- */
// The night runs on its own clock: it starts at 03:30 and moves on as you dance, sing and sit by the fire.
const HG_LAST = 11 * 60;
const anyOf = <V>(a: V[]) => a[Math.floor(Math.random() * a.length)];

export const hgClock = (m = state.hgTime) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

/** Time passes (dancing, singing, sitting by the fire). */
export function hgTick(minutes: number) {
  const before = state.hgTime;
  state.hgTime = Math.min(before + minutes, HG_LAST);
  save(); renderCard();
  toast(hgClock());
}

/** Dancing at Heideglühen passes the time. */
export async function hgDance() {
  await say(anyOf([
    '(Warm house music under the glass roof. Someone hugs you for no reason.)',
    '(A piano chord, a big bassline, and the whole wooden floor bounces.)',
    '(You dance until your cheeks hurt from smiling.)'
  ]));
  hgTick(20);
}

// where the player stands in the DJ booth in the wooden house during the set, and where they go after
const BOOTH: [number, number] = [10, 1];
const AFTER: [number, number] = [10, 3];

/** The resident DJ. Main quest: he'd let you play, but only if Woody isn't watching. */
export async function hgDj(e: Entity | null, clubId: string) {
  if (state.hgStage === 3) {
    // replay the set
    await say('DJ: Look who it is. Woody still thinks it was me playing.');
    const again = await ask("DJ: He's off by the fire again. Another set?", ['Give me the decks', 'Not now']);
    if (again === 1) { await say('DJ: Any time.'); return; }
    await playSet(e, clubId, true);
    return;
  }
  if (state.hgStage === 0) {
    await say('DJ: (one ear in the headphones) Hm?');
    const a = await ask('', ['Can I play a few tracks?', 'Great set!']);
    if (a === 1) { await say('DJ: Danke! Long way to go still.'); return; }
    await say('DJ: Ha. Bold. I like bold. Honestly? Yes.');
    await say("DJ: But see the bald guy by the dancefloor? Woody. The booker. If he sees a stranger on my decks, I'm done here.");
    await say('DJ: Get him off the dancefloor for a bit. Then come back, quick.');
    state.hgStage = 1; save(); renderCard();
    return;
  }
  if (state.hgStage === 1) { await say("DJ: Woody's still watching. Get him away from the floor first."); return; }
  await say("DJ: Woody's gone? Go, go, go. Thirty seconds, then he's back.");
  await playSet(e, clubId, false);
}

/** Into the booth, the 30-second set, back out. A replay doesn't change the quest. */
async function playSet(e: Entity | null, clubId: string, replay: boolean) {
  closeBox();
  await fade(true);
  [player.x, player.y] = BOOTH; player.tx = player.x; player.ty = player.y; player.dir = 'down'; player.moving = false;
  if (e) e.dir = 'right';
  await fade(false);
  const won = await playDjSet();
  if (won && replay) {
    await say('(The floor goes off again. The DJ just grins and hands you a water.)');
  } else if (won) {
    await say('(The sun comes up over the Westhafen. The whole floor screams. The DJ hugs you.)');
    await say('Woody: (back from the fire, smelling of smoke) That last half hour was the best of the night. Who was that?');
    await say("DJ: (straight face) Me, Woody. Always me.");
    state.hgStage = 3; save();
    await completeQuest(clubId, 'b2b');
  } else {
    await say('(The floor drifts off to the bar. And Woody is walking back from the fire.)');
    await say('DJ: Headphones! Now! ...Try again when he goes for a smoke.');
  }
  closeBox();
  await fade(true);
  [player.x, player.y] = AFTER; player.tx = player.x; player.ty = player.y; player.dir = 'up';
  await wait(reduceMotion ? 0 : 200);
  await fade(false);
}

/** Woody, the booker: bald, in the scene for decades, never leaves the dancefloor. Almost never. */
export async function woody(e: Entity | null, clubId: string) {
  if (state.hgStage >= 2) {
    await say(anyOf([
      "Woody: (by the fire) Where's this joint, then? ...Never mind. Someone's sharing. Lucky me.",
      'Woody: First party I ever booked had one speaker and a diesel generator. Best night of my life.',
      'Woody: This place started in a potato garden on Heidestraße. Sometimes I still miss the potatoes.',
      "Woody: Thirty years of dancefloors and I still get goosebumps when the first chord hits."
    ]));
    return;
  }
  await say('Woody: Woody. I do the booking here.');
  await say("Woody: Been in this scene longer than some of these kids have been alive. I keep an eye on the floor. And on the booth.");
  if (state.hgStage === 0) { await say('Woody: Grab a spot by the fire. The good stuff starts around sunrise.'); hgTick(10); return; }
  const a = await ask('', ['Someone by the fire wants to share a huge joint with you', 'They need you at the door', 'Nice party!']);
  if (a === 1) { await say('Woody: The door can look after itself. I am watching this floor.'); return; }
  if (a === 2) { await say('Woody: It is. Enjoy it.'); return; }
  await say('Woody: (eyebrows up) A big one? For me?');
  await say("Woody: ...Five minutes. Nobody touches anything.");
  closeBox();
  await fade(true);
  if (e && e.movedTo) { e.x = e.movedTo[0]; e.y = e.movedTo[1]; }
  // ...and out in the yard, by the fire
  SCENES['heidegluehen:hof']?.ents.forEach(w => { if (w.onlyAfter === 'woody' && w.home) { w.x = w.home.x; w.y = w.home.y; } });
  state.hgStage = 2; save();
  await fade(false);
  await completeQuest(clubId, 'woody');
  hgTick(10);
}

/** The karaoke machine between the sinks. */
export async function karaoke(_e: Entity | null, clubId: string) {
  await say('(A karaoke machine in a little wooden room behind the toilets. Of course there is one. A small queue is waiting for the mic.)');
  const a = await ask('Pick a song:', ['Robin S – Show Me Love', 'Whitney Houston – I Wanna Dance with Somebody', 'Haddaway – What Is Love', 'Hand the mic on']);
  if (a === 3) { await say('(Someone grabs the mic and goes straight for a power ballad.)'); return; }
  await say([
    '(You belt it out. The wooden walls give you free reverb.)',
    '(You hit the high notes. Mostly. The queue starts a conga line.)',
    '(You do the head bob. Everyone does the head bob.)'
  ][a]);
  await say('(The whole toilet queue joins in on the chorus.)');
  await completeQuest(clubId, 'karaoke');
  hgTick(30);
}

/** Sitting by a fire pit. */
export async function fire(_e: Entity | null, clubId: string) {
  await say('(You sit down by the fire pit. Someone hands you a blanket and a cup of tea.)');
  await say(anyOf([
    '(A stranger tells you about the first time they heard house music. It was in a car park in 1994.)',
    '(Sparks fly up into the dark. The bass from the dancefloor feels warm from here.)',
    '(Two people next to you argue about the best Chicago house record. Neither of them is wrong.)'
  ]));
  await completeQuest(clubId, 'fire');
  hgTick(20);
}

/** The rotating seats in the yard: you squeeze in with the people already on it and go round for a while. */
export async function spin(_e: Entity | null, _clubId: string) {
  // the seat is the 2×2 block you're facing; find its top-left tile
  const [dx, dy] = DIRS[player.dir], SEAT = ICH['ß'];
  let x = player.x + dx, y = player.y + dy;
  if (RT.map[y]?.[x] !== SEAT) return;
  while (RT.map[y]?.[x - 1] === SEAT) x--;
  while (RT.map[y - 1]?.[x] === SEAT) y--;
  RT.spin = { x, y };
  try {
    await say('(You squeeze in between two strangers. The seat starts to turn, slowly.)');
    await say(anyOf([
      'Raver: Welcome aboard. Lighter? No? Sit, then. It goes round, that is all it does.',
      'Raver: First time on the carousel? Hold your drink. Hold it.',
      'Raver: I have been going round for an hour. I think. Time works differently on here.'
    ]));
    await say('(The yard slides past: the stage, the big tribune, the wooden house. And again. And again.)');
    hgTick(10);
  } finally { RT.spin = null; }
}

/** The jacuzzi out the back: you climb in for a while. */
export async function jacuzzi(_e: Entity | null, _clubId: string) {
  await say('(You climb into the jacuzzi. It is hot. Very hot. Two strangers make room without opening their eyes.)');
  await say(anyOf([
    'Raver: Clothes? Clothes are optional. Mostly.',
    'Raver: Five more minutes. I have been saying that since four.',
    'Raver: Listen. You can hear the bass through the water.'
  ]));
  hgTick(15);
}

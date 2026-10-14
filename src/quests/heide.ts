import { completeQuest } from './quests';
import { ask, closeBox, say } from '../ui/dialog';
import { renderCard } from '../ui/card';
import { save } from '../core/save';
import { fade, toast } from '../interiors/transitions';
import { player, state } from '../core/state';
import { reduceMotion, shuffle, wait } from '../util';
import type { Entity } from '../types';

/* ---- Heideglühen: the 5am back to back, Woody the booker, karaoke in the toilets, fire pits ---- */
// The night runs on its own clock: it starts at 03:30 and moves on as you dance, sing and sit by the fire.
export const HG_FIVE = 5 * 60;
const HG_LAST = 11 * 60;
const anyOf = <V>(a: V[]) => a[Math.floor(Math.random() * a.length)];

export const hgClock = (m = state.hgTime) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

/** Time passes. Announces five o'clock once Woody has said yes. */
export function hgTick(minutes: number) {
  const before = state.hgTime;
  state.hgTime = Math.min(before + minutes, HG_LAST);
  save(); renderCard();
  const five = before < HG_FIVE && state.hgTime >= HG_FIVE && state.hgStage === 2;
  toast(five ? `${hgClock()} · FIVE O'CLOCK. FIND THE DJ` : hgClock());
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

// where the player stands in the DJ booth during the set, and where they go after
const BOOTH: [number, number] = [11, 2];
const AFTER: [number, number] = [10, 4];

/** The resident DJ. Main quest: get Woody's yes, then play back to back at 5am. */
export async function hgDj(e: Entity | null, clubId: string) {
  if (state.hgStage === 3) { await say('DJ: Look who it is. My favourite back-to-back partner.'); return; }
  if (state.hgStage === 0) {
    await say('DJ: (one ear in the headphones) Hm?');
    const a = await ask('', ['Can I play back to back with you?', 'Great set!']);
    if (a === 1) { await say('DJ: Danke! Long way to go still.'); return; }
    await say('DJ: Ha. Bold. I like bold.');
    await say("DJ: But I don't decide who touches these decks. Woody does. He's the booker.");
    await say('DJ: Bald guy, been around forever. Usually by the fire.');
    state.hgStage = 1; save(); renderCard();
    return;
  }
  if (state.hgStage === 1) { await say('DJ: Talked to Woody yet? No Woody, no decks.'); return; }
  if (state.hgTime < HG_FIVE) {
    await say(`DJ: Woody said yes? Then five o'clock. Not a minute earlier. It's ${hgClock()}.`);
    await say("DJ: Go dance, sing something in the toilets, sit by the fire. I'm not going anywhere.");
    return;
  }
  await backToBack(e, clubId);
}

const ROUNDS = [
  { q: 'Your first record. The floor is warm, the sky still dark:', a: ['Mr. Fingers – Can You Feel It', 'Scooter – Hyper Hyper', 'Rammstein – Du hast'],
    good: '(A deep bassline rolls in. Heads start nodding.)' },
  { q: 'The DJ nods at you. Something with vocals now:', a: ['Robin S – Show Me Love', 'Helene Fischer – Atemlos durch die Nacht', 'Nickelback – How You Remind Me'],
    good: '(The whole floor sings the hook. Someone climbs on a bench.)' },
  { q: 'First light over the harbour. Bring it home:', a: ['Crystal Waters – Gypsy Woman', 'Darude – Sandstorm', 'Nena – 99 Luftballons'],
    good: '(Even the bar staff are dancing.)' }
];
const MISSES = ['(The floor goes quiet. Somebody checks their phone.)', '(The DJ winces and quietly cues the next record, just in case.)', '(A man by the fire shouts: "WHAT IS THIS?")'];

async function backToBack(e: Entity | null, clubId: string) {
  await say("DJ: Five o'clock. Get up here, partner.");
  closeBox();
  await fade(true);
  [player.x, player.y] = BOOTH; player.tx = player.x; player.ty = player.y; player.dir = 'down'; player.moving = false;
  if (e) e.dir = 'down';
  await fade(false);
  let hits = 0;
  for (const r of ROUNDS) {
    const opts = shuffle(r.a.map((t, i) => ({ t, ok: i === 0 })));
    const c = await ask(r.q, opts.map(o => o.t));
    if (opts[c].ok) { hits++; await say(r.good); } else await say(anyOf(MISSES));
  }
  if (hits >= 2) {
    await say('(The sun comes up over the Westhafen. The crowd cheers for both of you.)');
    await say("DJ: Not bad at all. Woody was right about you.");
    state.hgStage = 3; save();
    await completeQuest(clubId, 'b2b');
  } else {
    await say("DJ: Hm. Maybe stick to dancing tonight. Come back and try again.");
  }
  closeBox();
  await fade(true);
  [player.x, player.y] = AFTER; player.tx = player.x; player.ty = player.y; player.dir = 'up';
  await wait(reduceMotion ? 0 : 200);
  await fade(false);
}

/** Woody, the booker: bald, in the scene for decades. His yes opens the decks. */
export async function woody(_e: Entity | null, clubId: string) {
  if (state.hgStage >= 2) {
    await say(anyOf([
      'Woody: First party I ever booked had one speaker and a diesel generator. Best night of my life.',
      'Woody: How do I stay up? Water, a nap behind the bar, and loving the music. In that order.',
      'Woody: This place started in a potato garden on Heidestraße. Sometimes I still miss the potatoes.',
      "Woody: Thirty years of dancefloors and I still get goosebumps when the first chord hits."
    ]));
    return;
  }
  await say("Woody: Woody. I do the booking here.");
  await say("Woody: Been in this scene longer than some of these kids have been alive. Warehouses, fields, boats. I've seen it all.");
  if (state.hgStage === 0) { await say('Woody: Grab a spot by the fire. The good stuff starts around sunrise.'); hgTick(10); return; }
  await say('Woody: So you want to play with our resident. At five. Everyone wants five.');
  const a = await ask("Woody: What's your first record at five in the morning?", ['Something deep and warm, a house classic', 'The hardest techno I have', 'A Schlager remix', 'My own SoundCloud demo']);
  if (a !== 0) {
    await say(['', 'Woody: At a house club. At sunrise. No.', 'Woody: (stares at you for a very long time)', 'Woody: Everybody has a SoundCloud demo.'][a]);
    await say('Woody: Come back when you know what this place is about.');
    return;
  }
  const b = await ask('Woody: And when the floor goes quiet?', ['Read the room, play something they know', 'Turn it up louder', 'Blame the sound system', 'Play my demo again']);
  if (b !== 0) { await say('Woody: Wrong answer. The floor is always right. Think about it.'); return; }
  await say("Woody: (runs a hand over his bald head) Alright. Five o'clock. Tell him Woody says yes.");
  state.hgStage = 2; save();
  await completeQuest(clubId, 'woody');
  if (state.hgTime >= HG_FIVE) await say("Woody: Oh, and it's already past five. Go!");
  else hgTick(15);
}

/** The karaoke machine between the sinks. */
export async function karaoke(_e: Entity | null, clubId: string) {
  await say('(A karaoke machine between the sinks. Of course there is one. A small queue is waiting for the mic.)');
  const a = await ask('Pick a song:', ['Robin S – Show Me Love', 'Whitney Houston – I Wanna Dance with Somebody', 'Haddaway – What Is Love', 'Hand the mic on']);
  if (a === 3) { await say('(Someone grabs the mic and goes straight for a power ballad.)'); return; }
  await say([
    '(You belt it out. The tiles give you free reverb.)',
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

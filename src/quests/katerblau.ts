import { completeQuest, questDone } from './quests';
import { roomsDanced } from './sisyphos';
import { ask, say } from '../ui/dialog';
import { renderCard } from '../ui/card';
import { save } from '../core/save';
import { toast } from '../interiors/transitions';
import { state } from '../core/state';
import type { Entity } from '../types';

/* ---- Kater Blau: the Bar25 family, glitter, confetti, the Spree, two indoor floors ---- */
// Researched: Bar25 ran on this spot from 2003/04 until September 2010 (closing with a five-day party,
// pushed out by the Mediaspree development); famous for costume and confetti parties. The crew moved
// across the river to Kater Holzig in an old soap factory (2011 to early 2014), then came back as
// Kater Blau in 2014, part of the Holzmarkt cooperative quarter (the name: a timber market here
// 300 years ago). Parties run Friday to Monday; the floors are Heinz Hopper (classic techno) and the
// Acid Arch (more alternative, live sets). Colourful, glittery outfits are welcome at the door.

const FLOORS = ['hopper', 'arch'];
const FLOOR_DANCE: Record<string, string> = {
  hopper: '(Heinz Hopper: a straight techno kick on a wooden floor. The whole room bounces.)',
  arch: '(The Acid Arch: a live act twists a 303 into knots. The UV makes your teeth glow.)',
  garden: '(Barefoot in the sand by the Spree, fairy lights overhead. Somebody throws confetti for no reason.)'
};

/** Dancing at Kater Blau: dance on Heinz Hopper and in the Acid Arch for the floors quest. */
export async function kbDance(fl: string) {
  await say(FLOOR_DANCE[fl] || '(You dance. It is Sunday afternoon. Probably.)');
  if (!FLOORS.includes(fl)) return;
  if (!state.danced['katerblau:' + fl]) { state.danced['katerblau:' + fl] = true; save(); renderCard(); }
  const n = FLOORS.filter(f => state.danced['katerblau:' + f]).length;
  if (n >= FLOORS.length) await completeQuest('katerblau', 'floors');
  else toast(`DANCED ON ${n}/${FLOORS.length} FLOORS`);
}
export const kbFloorsDanced = () => roomsDanced('katerblau');

/** Hanne, here since Bar25: the family history. */
export async function bar25(_e: Entity | null, clubId: string) {
  if (questDone(clubId, 'bar25')) { await say('Hanne: Different name, same family. That is all that matters.'); return; }
  await say('Hanne: Before this was Kater Blau, it was Bar25. Right here, on the river. A wooden village, costumes, confetti, parties for two days straight.');
  await say('Hanne: September 2010 it had to close. The land was being sold off for the big Mediaspree plans. The closing party went on for five days.');
  await say('Hanne: So the crew moved across the river, into an old soap factory: Kater Holzig. Until early 2014.');
  await say('Hanne: Then they came back home. Kater Blau, part of the Holzmarkt cooperative. Three hundred years ago this was a timber market, hence the name.');
  await completeQuest(clubId, 'bar25');
}

/** The glitter booth in the garden. */
export async function glitter(_e: Entity | null, clubId: string) {
  if (questDone(clubId, 'glitter')) { await say('Glitter fairy: You are still sparkling. Glitter is forever. Sorry.'); return; }
  await say('Glitter fairy: Hello, darling! Nobody walks around Kater Blau unglittered.');
  const a = await ask('Glitter fairy: Which colour?', ['Gold', 'Rainbow', 'Holographic silver', 'No thanks, I am fine']);
  if (a === 3) { await say('Glitter fairy: (gasps) ...Come back when you are ready.'); return; }
  await say(['(Gold glitter on your cheekbones. You look like a disco trophy.)', '(Rainbow glitter everywhere. Including places you will find next week.)', '(Holographic silver. You catch every single light in the garden.)'][a]);
  await completeQuest(clubId, 'glitter');
}

/** Mimi on Heinz Hopper and her confetti cannon. */
export async function confetti(_e: Entity | null, clubId: string) {
  if (questDone(clubId, 'confetti')) { await say('Mimi: Best drop of the weekend. Thank you, partner in crime.'); return; }
  await say('Mimi: Psst. Confetti cannon. Bar25 tradition. I need a second pair of hands.');
  const a = await ask('Mimi: When do we fire?', ['On the drop, when the kick comes back', 'Right now, in the quiet bit', "Straight into the DJ's face"]);
  if (a === 1) { await say('Mimi: In the quiet bit?! Nobody would even notice. Wait for the drop.'); return; }
  if (a === 2) { await say('Mimi: (stares) We are throwing a party, not starting a war.'); return; }
  await say('(The breakdown goes on forever. Then the kick comes back. You both pull the trigger.)');
  await say('(A cloud of paper snow falls over the whole floor. Four hundred people scream at once.)');
  await completeQuest(clubId, 'confetti');
}

/** Looking out over the Spree from the wooden deck. */
export async function spree(_e: Entity | null, clubId: string) {
  if (questDone(clubId, 'spree')) { await say('(The Spree glitters. A tour boat waves at you. You wave back.)'); return; }
  await say('(You lean on the railing of the wooden deck. The Spree is right below, the sky going pink.)');
  await say('(Across the water is where Kater Holzig used to be, in the old soap factory. Behind you, the bass from Heinz Hopper.)');
  await say('(The sun comes up over Friedrichshain. Somebody next to you whispers: "Monday."')
  await completeQuest(clubId, 'spree');
}

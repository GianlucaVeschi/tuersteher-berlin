import { completeQuest, questDone } from './quests';
import { roomsDanced } from './sisyphos';
import { ask, say } from '../ui/dialog';
import { renderCard } from '../ui/card';
import { save } from '../core/save';
import { toast } from '../interiors/transitions';
import { state } from '../core/state';
import type { Entity } from '../types';

/* ---- RSO: Griessmühle memories, the brewery bar, three floors ---- */
const RSO_FLOORS = ['robus', 'summe', 'opan'];
const RSO_DANCE: Record<string, string> = {
  robus: '(ROBUS: concrete, haze and a kick drum that goes on for hours.)',
  summe: '(SUMME: deeper, warmer, a little hypnotic. You close your eyes.)',
  opan: '(OPAN: open sky above the brewery, the first birds louder than the hi-hats.)'
};

/** Dancing at RSO: dance on ROBUS, SUMME and OPAN to finish the floors quest. */
export async function rsoDance(fl: string) {
  await say(RSO_DANCE[fl] || '(You dance. Nobody is going home soon.)');
  if (!RSO_FLOORS.includes(fl)) return;
  if (!state.danced['rso:' + fl]) { state.danced['rso:' + fl] = true; save(); renderCard(); }
  const n = RSO_FLOORS.filter(f => state.danced['rso:' + f]).length;
  if (n >= RSO_FLOORS.length) await completeQuest('rso', 'floors');
  else toast(`DANCED ON ${n}/${RSO_FLOORS.length} FLOORS`);
}
/** Hint progress for the floors quest. */
export const rsoFloorsDanced = () => roomsDanced('rso');

/** Kalle, an old Griessmühle regular, tells the story of the club before RSO. */
export async function griess(_e: Entity | null, clubId: string) {
  if (questDone(clubId, 'griess')) { await say('Kalle: Different building, same people. That is what counts.'); return; }
  await say('Kalle: You know where this crew comes from? Griessmühle. Neukölln, right on the canal by Sonnenallee.');
  await say('Kalle: An old pasta factory, not a mill, whatever the name says. Three dancefloors and a garden by the water.');
  await say('Kalle: Then the site got sold and the lease ran out. We marched, more than fifty thousand people signed the petition.');
  await say("Kalle: Last party was in February 2020. Cocktail d'Amore. Then they knocked the building down.");
  await say('Kalle: Same year the crew started again out here, in the old Bärenquell brewery. Revier Südost. RSO.');
  await completeQuest(clubId, 'griess');
}

/** The bar in the old brewery. */
export async function rsoBar(_e: Entity | null, clubId: string) {
  const a = await ask('Bar: What do you want?', ['Club-Mate', 'A beer', 'Just water']);
  await say(['(Ice cold and very caffeinated. Fuel for a long weekend.)', '(A cold beer. Fitting, on the grounds of an old brewery.)', 'Bar: Good call. Water is free, refill whenever.'][a]);
  await completeQuest(clubId, 'drink');
}

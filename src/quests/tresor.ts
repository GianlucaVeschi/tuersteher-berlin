import { completeQuest, questDone } from './quests';
import { ask, say } from '../ui/dialog';
import type { Entity } from '../types';

/* ---- Tresor: the Wertheim vault, the tunnel, the Detroit connection, the camera sticker ---- */
// Researched: opened 1991 in the old bank vault of the Wertheim department store on Leipziger Straße
// (Dimitri Hegemann and friends); house upstairs in Globus, hard techno in the vault. Tresor Records'
// first release was X-101 "Sonic Destroyer" (Underground Resistance). Hard Wax brought the Detroit DJs over.
// Closed there in 2005, reopened in 2007 in the old Kraftwerk power station on Köpenicker Straße, with
// some of the original safe-deposit boxes in the basement and a long tunnel down to it.

/** The wall of old safe-deposit boxes in the vault. */
export async function boxes(_e: Entity | null, clubId: string) {
  if (questDone(clubId, 'boxes')) { await say('(The old deposit boxes rattle very slightly with every kick drum.)'); return; }
  await say('(Rows of old steel safe-deposit boxes, still with their tiny keyholes.)');
  await say('(They come from the bank vault of the Wertheim department store on Leipziger Straße, once one of the biggest in Europe. The Nazis took it from its Jewish owners.)');
  await say("(The building didn't survive the war. Its vault stayed underground, forgotten for decades, near the no man's land by the Wall.)");
  await say('(In 1991 Dimitri Hegemann and friends opened a club in it and called it Tresor: German for "safe". When that site closed in 2005, some of the boxes came along to this old power station.)');
  await completeQuest(clubId, 'boxes');
}

/** Jens, a regular since the first year, and the Detroit connection. */
export async function detroit(_e: Entity | null, clubId: string) {
  if (questDone(clubId, 'detroit')) { await say('Jens: Berlin and Detroit. Two cities that fell apart and danced anyway.'); return; }
  await say('Jens: I was here the first year. 1991, in the old vault on Leipziger Straße. No decor. Fog, strobes and orange warning lights.');
  await say('Jens: The DJs came from Detroit. Hard Wax, the record shop, brought them over: Blake Baxter, Jeff Mills, Underground Resistance, Juan Atkins.');
  const a = await ask('Jens: So. What was the first ever record on Tresor Records?', ['X-101, "Sonic Destroyer"', 'New Order, "Blue Monday"', 'Daft Punk, "Around the World"', 'Darude, "Sandstorm"']);
  if (a !== 0) { await say(a === 3 ? 'Jens: (stares at you through the fog for a very long time)' : 'Jens: No. Do your homework and come back.'); return; }
  await say('Jens: Respect. Underground Resistance: Mike Banks, Jeff Mills and Robert Hood. That record started the label.');
  await completeQuest(clubId, 'detroit');
}

/** Someone in the vault peeled the sticker off his phone camera. */
export async function sticker(_e: Entity | null, clubId: string) {
  if (questDone(clubId, 'sticker')) { await say('Tourist: I am just dancing now. It is better, honestly.'); return; }
  await say('(A guy in a brand-new black shirt has peeled the sticker off his phone camera and is filming the DJ.)');
  const a = await ask('', ['Tell him to put the sticker back on', 'Film too, it looks amazing', 'Ignore it']);
  if (a === 1) { await say('(Security appears out of the fog before you even press record. You decide that was a terrible idea.)'); return; }
  if (a === 2) { await say('(The guy keeps filming. Someone is going to get thrown out tonight.)'); return; }
  await say('Tourist: Oh. Sorry. I did not know it was a whole thing.');
  await say('(He sticks it back on. Two regulars nod at you through the fog.)');
  await completeQuest(clubId, 'sticker');
}

/** Arriving in the vault through the tunnel. */
export async function tresorVault(clubId: string) {
  if (questDone(clubId, 'tunnel')) return;
  await say('(Thirty metres of concrete tunnel, the kick drum louder with every step. Then fog, a strobe, and the vault.)');
  await completeQuest(clubId, 'tunnel');
}

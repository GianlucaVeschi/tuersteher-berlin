import { completeQuest, questDone } from './quests';
import { ask, say } from '../ui/dialog';
import { renderCard } from '../ui/card';
import { save } from '../core/save';
import { toast } from '../interiors/transitions';
import { state } from '../core/state';
import type { Entity } from '../types';

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

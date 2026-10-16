import { ask, say } from '../ui/dialog';
import type { Entity } from '../types';

/* ---- The Landwehrkanal places: La Maison (café on Paul-Lincke-Ufer) and Ankerklause (sailors' pub) ---- */
// Researched: La Maison is a café and boulangerie at Paul-Lincke-Ufer 17 with a canal-side terrace,
// spritz in the afternoon and orange wine on tap. Ankerklause sits at Kottbusser Brücke in a former
// ticket office for excursion steamers (a bar since 1995): half pub, half sailor's fantasy, wood
// panelling, coloured lights, maritime junk and a famous jukebox (rock, sleaze, beat), plus a glass veranda
// over the canal with window boxes full of geraniums. It is always packed; everything in here is about how
// hard it is to get a table (dramatised, but only a little).

/** The counter at La Maison. */
export async function maison(_e: Entity | null) {
  await say('Baker: Bonjour! What can I get you?');
  const a = await ask('', ['A croissant, still warm', 'An Aperol spritz for the terrace', 'Orange wine, from the tap', 'Just looking']);
  await say([
    '(Flaky, buttery, perfect. You get crumbs on everyone around you.)',
    '(You take it out to the canal. The sun is low, the swans are judgmental.)',
    '(Orange wine on tap. Cloudy, funky, very Kreuzberg. You pretend to taste apricot.)',
    'Baker: Take your time. Everybody here does.'
  ][a]);
}

/** The bar at the Ankerklause. */
export async function ankerBar(_e: Entity | null) {
  await say('Barkeeper: Ahoi. If it is about a table: no. If it is about a drink: what will it be, sailor?');
  const a = await ask('', ['A Pils', 'A Korn, like a real sailor', 'Coffee, it is morning somewhere', 'Water']);
  await say([
    '(A cold Pils. You drink it standing up, like everyone without a table. Which is everyone.)',
    '(One Korn. The regular next to you salutes: "Twelve years I waited for a table. Then I became a regular at the bar instead.")',
    'Barkeeper: Coffee? The Sunday breakfast tables are booked by people who are not born yet.',
    'Barkeeper: Water is free. Tables are not. Tables are not even for sale.'
  ][a]);
}

/** The famous Ankerklause jukebox. */
export async function jukebox() {
  await say('(The jukebox glows red and gold. A note is taped to it: "PLAYING A SONG DOES NOT GET YOU A TABLE.")');
  const a = await ask('Pick a record:', ['Motörhead – Ace of Spades', 'The Cramps – Human Fly', 'The Kinks – You Really Got Me', 'Hans Albers – La Paloma']);
  await say([
    '(The whole bar headbangs at once. In the chaos a chair comes free for one second. Then it is gone.)',
    '(Someone in a leather jacket does the fly dance on the spot where a table used to be. Nobody remembers when.)',
    '(Three strangers play air guitar together. They met in the queue for a table, back in 2011.)',
    '(An old sailor closes his eyes and sings every word. He has had the corner table since 1995. He is never leaving it.)'
  ][a]);
}

/** The waiter in the veranda over the canal. You will not get a table. */
export async function ankerTable(_e: Entity | null) {
  await say('Waiter: The veranda? Over the canal? Tonight?');
  await say('(He looks at you like you just asked for one of his kidneys.)');
  const a = await ask('', ['Just a small table, please', 'I can wait', 'I know the owner']);
  await say([
    'Waiter: Small, big, round, square. All taken. Since about 1995.',
    'Waiter: Lovely. The waiting list is in that book. You are number 213. Come back next summer. Not this one, the next one.',
    'Waiter: Everybody knows the owner. The owner does not have a table either.'
  ][a]);
  await say('(Through the glass: the canal, the swans, the lights on the bridge. You watch it standing up, like a real local.)');
}

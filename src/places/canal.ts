import { ask, say } from '../ui/dialog';
import type { Entity } from '../types';

/* ---- The Landwehrkanal places: La Maison (café on Paul-Lincke-Ufer) and Ankerklause (sailors' pub) ---- */
// Researched: La Maison is a café and boulangerie at Paul-Lincke-Ufer 17 with a canal-side terrace,
// spritz in the afternoon and orange wine on tap. Ankerklause sits at Kottbusser Brücke in a former
// ticket office for excursion steamers (a bar since 1995): half pub, half sailor's fantasy, wood
// panelling, coloured lights, maritime junk and a famous jukebox (rock, sleaze, beat).

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
  await say('Barkeeper: Ahoi. What will it be, sailor?');
  const a = await ask('', ['A Pils', 'A Korn, like a real sailor', 'Coffee, it is morning somewhere', 'Water']);
  await say([
    '(A cold Pils under a ceiling full of fishing nets and fairy lights.)',
    '(One Korn. The regular next to you salutes. You are part of the crew now.)',
    '(Strong filter coffee in a chipped mug with an anchor on it.)',
    'Barkeeper: Water is free. We are on a canal, after all.'
  ][a]);
}

/** The famous Ankerklause jukebox. */
export async function jukebox() {
  await say('(The jukebox glows red and gold. Rock, sleaze and beat, nothing newer than you are.)');
  const a = await ask('Pick a record:', ['Motörhead – Ace of Spades', 'The Cramps – Human Fly', 'The Kinks – You Really Got Me', 'Hans Albers – La Paloma']);
  await say([
    '(The whole bar headbangs at once. A glass falls over. Nobody minds.)',
    '(Someone in a leather jacket starts doing the fly dance by the window.)',
    '(Three strangers play air guitar together. The barkeeper joins on air drums.)',
    '(An old sailor at the bar closes his eyes and sings every word. You were not ready for this.)'
  ][a]);
}

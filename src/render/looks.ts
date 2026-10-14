import { RT } from '../core/runtime';
import { state } from '../core/state';
import { BASE_LOOK, OUTFITS, charById } from '../data/outfits';
import type { Character, Look } from '../types';

/** A character's body combined with an outfit (their own starting outfit if none is given). */
export const lookFor = (ch: Character | null, outfitId?: string): Look =>
  Object.assign({ top: '#000', legs: '#000' }, BASE_LOOK, ch ? ch.body : {}, OUTFITS[outfitId || (ch ? ch.outfit : 'tourist')].look);
/** The player's look in a given outfit. At KitKat after the Garderobe they're down to underwear. */
export const lookOf = (id: string): Look => {
  const L = lookFor(charById(state.char), id);
  if (!(state.kkStripped && RT.scene.startsWith('kitkat:'))) return L;
  return Object.assign({}, L, { top: L.skin, legs: '#0c0c12', stripes: undefined, sparkle: undefined, shirt: undefined, tie: undefined, hat: undefined, shine: undefined, harness: L.harness });
};


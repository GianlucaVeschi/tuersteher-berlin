import { RT } from '../core/runtime';
import { state } from '../core/state';
import { BASE_LOOK, OUTFITS, charById } from '../data/outfits';
export const lookFor = (ch, outfitId) => Object.assign({}, BASE_LOOK, ch ? ch.body : {}, OUTFITS[outfitId || (ch ? ch.outfit : 'tourist')].look);
export const lookOf = id => {
  const L = lookFor(charById(state.char), id);
  if (!(state.kkStripped && typeof RT.scene !== 'undefined' && RT.scene.startsWith('kitkat:'))) return L;
  return Object.assign({}, L, { top: L.skin, legs: '#0c0c12', stripes: undefined, sparkle: undefined, shirt: undefined, tie: undefined, hat: undefined, shine: undefined, harness: L.harness });
};

// Dress codes: `ok` = at least one of these tags required; `no` = none of these tags allowed.

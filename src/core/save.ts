import { D } from '../world/tiles';
import { get } from '../world/grid';
import { blocked } from '../world/collision';
import { RT } from './runtime';
import { OUTFITS, charById } from '../data/outfits';
import { ZOOMS, zoom } from '../render/zoom';
import { newPfand, player, state } from './state';
import { CLUBS } from '../data/clubs';
import { inClub, sceneClub } from '../world/scenes';
export function save() {
  try { localStorage.setItem('tuersteher-save', JSON.stringify(snapshot())); } catch (e) { /* storage unavailable */ }
}
export function snapshot() {
  // Inside a club we save the spot outside its door, so a reload puts you back on the street.
  const club = inClub() ? CLUBS.find(c => c.id === sceneClub()) : null;
  const pos = club ? { x: club.dx, y: club.by, dir: 'down' } : { x: player.x, y: player.y, dir: player.dir };
  return { stamps: state.stamps, intro: state.intro, finale: state.finale, outfit: state.outfit, char: state.char,
    zoom: { i: zoom.i, fit: zoom.fit }, quests: state.quests, visited: state.visited, sunrise: state.sunrise, coatNo: state.coatNo, kStage: state.kStage, pfand: state.pfand, heard: state.heard, danced: state.danced, kkStripped: state.kkStripped, x: pos.x, y: pos.y, dir: pos.dir };
}
export function applySave(s) {
  if (!s) return;
  state.stamps = s.stamps || {};
  state.intro = !!s.intro;
  state.finale = !!s.finale;
  state.outfit = OUTFITS[s.outfit] ? s.outfit : 'tourist';
  state.char = charById(s.char) ? s.char : null;
  if (s.zoom && ZOOMS[s.zoom.i]) { zoom.i = s.zoom.i; zoom.fit = !!s.zoom.fit; }
  state.quests = s.quests || {}; state.visited = s.visited || {}; state.sunrise = s.sunrise || {}; state.coatNo = s.coatNo || 0; state.kStage = s.kStage || 0;
  state.pfand = Object.assign(newPfand(), s.pfand || {}); state.heard = s.heard || {}; state.danced = s.danced || {}; state.kkStripped = !!s.kkStripped;
  // bottles in your hands are lost if you reload while carrying them outside a club
  if (!s.pfand) state.pfand.taken = {};
  RT.ents.forEach(e => { if (e.kind === 'bouncer' && state.stamps[e.club.id]) e.x = e.club.dx + 1; });
  if (Number.isInteger(s.x) && Number.isInteger(s.y) && !blocked(s.x, s.y) && get(s.x, s.y) !== D) {
    player.x = player.tx = s.x; player.y = player.ty = s.y; player.dir = s.dir || 'down';
  }
}
export const stampCount = () => CLUBS.filter(c => state.stamps[c.id]).length;

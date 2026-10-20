import { PLACES } from '../data/places';
import { D } from '../world/tiles';
import { get } from '../world/grid';
import { blocked } from '../world/collision';
import { RT } from './runtime';
import { OUTFITS, charById } from '../data/outfits';
import { ZOOMS, zoom } from '../render/zoom';
import { HG_START, newPfand, player, state } from './state';
import { CLUBS } from '../data/clubs';
import { inClub, sceneClub } from '../world/scenes';
import { OFF_MAP } from '../world/city';
import { HAIRSTYLES } from '../data/hair';
import type { SaveData } from '../types';

const KEY = 'tuersteher-save';
/** Street map layout version. 2: Görli moved to the middle (canal and park north, Tresor/KitKat/CDV/Heideglühen south). */
const MAP_VERSION = 2;
/** Moves a row of the old layout (canal and Görli at the bottom) to the same spot on today's map. */
const fromMap1 = (y: number) => y <= 26 ? y : y <= 42 ? y + 30 : y <= 70 ? y - 14 : y + 2;
export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(snapshot())); } catch { /* storage unavailable */ }
}
/** Reads the saved game, or null if there is none (or storage is blocked). */
export function loadSave(): SaveData | null {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
}
export function snapshot(): SaveData {
  // Inside a club or place we save the spot outside its door, so a reload puts you back on the street.
  const club = inClub() ? CLUBS.find(c => c.id === sceneClub()) || PLACES.find(p => p.id === sceneClub()) : null;
  const pos = club ? { x: club.dx, y: club.by, dir: 'down' as const } : { x: player.x, y: player.y, dir: player.dir };
  return { stamps: state.stamps, intro: state.intro, finale: state.finale, outfit: state.outfit, char: state.char,
    zoom: { i: zoom.i, fit: zoom.fit }, quests: state.quests, visited: state.visited, sunrise: state.sunrise, coatNo: state.coatNo, kStage: state.kStage, mdStage: state.mdStage, pfand: state.pfand, heard: state.heard, danced: state.danced, kkStripped: state.kkStripped, gone: state.gone, hgTime: state.hgTime, hgStage: state.hgStage, cdvCash: state.cdvCash, hair: state.hair, name: state.name, playMs: state.playMs, finishPlayMs: state.finishPlayMs, onlineFinished: state.onlineFinished, x: pos.x, y: pos.y, dir: pos.dir, map: MAP_VERSION };
}
export function applySave(s: SaveData | null) {
  if (!s) return;
  state.stamps = s.stamps || {};
  state.intro = !!s.intro;
  state.finale = !!s.finale;
  state.outfit = s.outfit && OUTFITS[s.outfit] ? s.outfit : 'tourist';
  state.char = charById(s.char ?? null)?.id ?? null; // old character ids map to the new ones
  if (s.zoom && ZOOMS[s.zoom.i]) { zoom.i = s.zoom.i; zoom.fit = !!s.zoom.fit; }
  state.quests = s.quests || {}; state.visited = s.visited || {}; state.sunrise = s.sunrise || {}; state.coatNo = s.coatNo || 0; state.kStage = s.kStage || 0; state.mdStage = s.mdStage || 0;
  state.pfand = Object.assign(newPfand(), s.pfand || {}); state.heard = s.heard || {}; state.danced = s.danced || {}; state.kkStripped = !!s.kkStripped; state.gone = s.gone || {};
  state.hgTime = s.hgTime || HG_START; state.hgStage = s.hgStage || 0; state.cdvCash = s.cdvCash || 0; state.hair = s.hair && HAIRSTYLES[s.hair] ? s.hair : null;
  state.name = s.name || null; state.playMs = s.playMs || 0; state.finishPlayMs = s.finishPlayMs ?? null; state.onlineFinished = !!s.onlineFinished;
  // bottles in your hands are lost if you reload while carrying them outside a club
  if (!s.pfand) state.pfand.taken = {};
  RT.ents.forEach(e => { if (e.club && state.stamps[e.club.id]) e.x = e.club.dx + 1; });
  RT.ents.forEach(e => { if (e.npcId && state.gone[e.npcId]) e.x = OFF_MAP; });
  const y = s.y !== undefined && s.map !== MAP_VERSION ? fromMap1(s.y) : s.y;
  if (s.x !== undefined && y !== undefined && Number.isInteger(s.x) && Number.isInteger(y) && !blocked(s.x, y) && get(s.x, y) !== D) {
    player.x = player.tx = s.x; player.y = player.ty = y; player.dir = s.dir || 'down';
  }
}
export const stampCount = () => CLUBS.filter(c => state.stamps[c.id]).length;

import { questDone } from './quests';
import { state } from '../core/state';
import type { Entity } from '../types';

/* ---- The red "!" over people in clubs who still have a side quest for you ---- */
// Which quest each person's handler (`act`) leads to. A function when it depends on progress,
// e.g. Mila only matters once the toilet guy has sent you to her. null: nothing for you right now.
const ACT_QUEST: Record<string, string | ((e: Entity) => string | null)> = {
  bar: 'drink', rsoBar: 'drink', pfandBar: 'pfand', coat: 'coat', ice: 'ice',
  toiletGuy: 'toilet', mila: () => (state.kStage === 1 ? 'toilet' : null), sascha: 'darkroom',
  juggler: 'juggle', sauna: 'sauna', story: e => (e.story && !state.heard[e.story] ? 'stories' : null),
  ronny: 'mdma', poolHat: () => (state.mdStage === 1 ? 'mdma' : null),
  kkGarderobe: 'garderobe', marco: 'spank', pile: e => (e.join && e.join !== 'busy' ? 'orgy' : null),
  griess: 'griess',
  hgDj: () => (state.hgStage === 1 ? null : 'b2b'), woody: () => (state.hgStage === 1 ? 'woody' : null),
  cdvBar: 'drink', ines: () => (state.cdvCash === 1 ? 'drink' : 'ines'), planks: 'planks', jazz: 'jazz'
};

/** True if this person in a club still has an unfinished side quest for you. */
export function hasQuest(e: Entity, clubId: string): boolean {
  const q = e.act ? ACT_QUEST[e.act] : undefined;
  if (!q) return false;
  const id = typeof q === 'function' ? q(e) : q;
  return !!id && !questDone(clubId, id);
}

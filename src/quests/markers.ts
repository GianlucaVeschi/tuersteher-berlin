import { questDone } from './quests';
import type { Entity } from '../types';

/* ---- The red "!" over people in clubs who start a mini game you haven't finished ---- */
// Only real mini games get one (not every quest): the K trip at Berghain, the MDMA runner at Sisyphos
// and the DJ set at Heideglühen.
// Maps a handler name (`act`) to the quest it finishes.
const ACT_QUEST: Record<string, string> = { toiletGuy: 'toilet', ronny: 'mdma', hgDj: 'b2b' };

/** True if this person in a club starts a mini game you haven't finished yet. */
export function hasQuest(e: Entity, clubId: string): boolean {
  const id = e.act ? ACT_QUEST[e.act] : undefined;
  return !!id && !questDone(clubId, id);
}

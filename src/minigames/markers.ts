import { questDone } from '../quests/quests';
import { state } from '../core/state';
import type { Entity } from '../types';

/* ---- The red "!" over people in clubs who start a mini game you haven't finished ---- */
// Only real mini games get one (not every quest): the K trip at Berghain, the MDMA runner at Sisyphos,
// the DJ set at Heideglühen and the LSD dive at CDV. Neon Golf is in a place, not a club, so it has no quest:
// the desk at the minigolf has the "!" until you have played a round.
// Maps a handler name (`act`) to the quest it finishes.
const ACT_QUEST: Record<string, string> = { toiletGuy: 'toilet', ronny: 'mdma', hgDj: 'b2b', flo: 'lsd' };

/** True if this person in a club starts a mini game you haven't finished yet. */
export function hasQuest(e: Entity, clubId: string): boolean {
  if (e.act === 'golfDesk') return state.golfBest === null;
  const id = e.act ? ACT_QUEST[e.act] : undefined;
  return !!id && !questDone(clubId, id);
}

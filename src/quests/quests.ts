import { track } from '../core/monitoring';
import { syncSoon } from '../online/sync';
import type { QuestDef } from '../types';
import { RT } from '../core/runtime';
import { closeBox, say } from '../ui/dialog';
import { save } from '../core/save';
import { renderCard } from '../ui/card';
import { toast } from '../interiors/transitions';
import { state } from '../core/state';
import { INTERIORS } from '../data/interiors';
import { tresorVault } from './tresor';
/* ---- side quests ---- */
export const QUEST_LIST = (clubId: string): QuestDef[] => (INTERIORS[clubId] && INTERIORS[clubId].quests) || [];
export const questDone = (clubId: string, id: string) => !!state.quests[clubId + ':' + id];
export const questCount = (clubId: string) => QUEST_LIST(clubId).filter(q => questDone(clubId, q.id)).length;
/** Quests done in all clubs and places. Counts only quests that exist today: old saves can hold
 *  keys that were never on any list (a bar drink in a place without quests). */
export const totalQuestsDone = () => Object.keys(INTERIORS).reduce((n, id) => n + questCount(id), 0);
export async function completeQuest(clubId: string, id: string) {
  // shared acts (a bar, a toilet) also run in places without that quest: nothing to complete there
  const q = QUEST_LIST(clubId).find(x => x.id === id);
  if (!q || questDone(clubId, id)) return;
  state.quests[clubId + ':' + id] = true;
  track('quest_completed', { club: clubId, quest: id });
  syncSoon();
  toast('QUEST DONE · ' + q.title);
  renderCard(); save();
  if (questCount(clubId) === QUEST_LIST(clubId).length) {
    await say(`(You did everything ${INTERIORS[clubId].name} has to offer. Almost. Nobody does everything.)`);
  }
}
/** Panorama Bar: after three other quests the blinds go up. */
export async function onFloorEnter(clubId: string, floorId: string) {
  if (clubId === 'tresor' && floorId === 'vault') {
    RT.busy = true;
    try { await tresorVault(clubId); } finally { closeBox(); RT.busy = false; }
    return;
  }
  if (floorId !== 'pb' || state.sunrise[clubId]) return;
  const others = QUEST_LIST(clubId).filter(q => q.id !== 'sunrise' && questDone(clubId, q.id)).length;
  if (others < 3) return;
  RT.busy = true;
  await say('(The music drops. The metal blinds start to rise…)');
  state.sunrise[clubId] = true; save();
  await say('(Daylight floods Panorama Bar. The whole room screams.)');
  await say('(Dance now! Press A on the dancefloor.)');
  closeBox();
  RT.busy = false;
}

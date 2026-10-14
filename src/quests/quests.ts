import { RT } from '../core/runtime';
import { closeBox, say } from '../ui/dialog';
import { save } from '../core/save';
import { renderCard } from '../ui/card';
import { toast } from '../interiors/transitions';
import { state } from '../core/state';
import { INTERIORS } from '../data/interiors';
/* ---- side quests ---- */
export const QUEST_LIST = clubId => (INTERIORS[clubId] && INTERIORS[clubId].quests) || [];
export const questDone = (clubId, id) => !!state.quests[clubId + ':' + id];
export const questCount = clubId => QUEST_LIST(clubId).filter(q => questDone(clubId, q.id)).length;
export async function completeQuest(clubId, id) {
  if (questDone(clubId, id)) return;
  state.quests[clubId + ':' + id] = true;
  const q = QUEST_LIST(clubId).find(x => x.id === id);
  toast('QUEST DONE · ' + (q ? q.title : id));
  renderCard(); save();
  if (questCount(clubId) === QUEST_LIST(clubId).length) {
    await say(`(You did everything ${INTERIORS[clubId].name} has to offer. Almost. Nobody does everything.)`);
  }
}
export async function onFloorEnter(clubId, floorId) {
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

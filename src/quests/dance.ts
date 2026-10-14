import { completeQuest } from './quests';
import { closeBox, say } from '../ui/dialog';
import { DANCE_HOOKS } from './sisyphos';
import { sceneClub, sceneFloor } from '../world/scenes';
import { pick, reduceMotion, wait } from '../util';
import { player, state } from '../core/state';
import { RT } from '../core/runtime';
export async function danceHere() {
  RT.busy = true;
  const dirs = ['down', 'left', 'up', 'right'];
  for (let i = 0; i < 8; i++) { player.dir = dirs[i % 4]; await wait(reduceMotion ? 0 : 110); }
  player.dir = 'down';
  const clubId = sceneClub(), fl = sceneFloor();
  if (DANCE_HOOKS[clubId]) { await DANCE_HOOKS[clubId](fl); closeBox(); RT.busy = false; return; }
  if (fl === 'pb' && state.sunrise[clubId]) {
    await say('(Sunlight on your face, house music in your ears. This is it.)');
    await completeQuest(clubId, 'sunrise');
  } else if (fl === 'pb') {
    await say('(Nice groove. The blinds are still down.)');
  } else {
    await say(pick(['(You lose yourself in the kick drum.)', '(Eyes closed. The bass goes straight through you.)', '(Someone next to you yells "YES". You agree.)']));
    await completeQuest(clubId, 'dance');
  }
  closeBox();
  RT.busy = false;
}

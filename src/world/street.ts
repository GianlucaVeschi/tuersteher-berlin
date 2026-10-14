import { track } from '../core/monitoring';
import type { Act, Entity } from '../types';
import { blocked } from './collision';
import { OFF_MAP } from './city';
import { save } from '../core/save';
import { DIRS, state } from '../core/state';
import { wait } from '../util';
import { ask, closeBox, say } from '../ui/dialog';

/** Custom behaviour for street NPCs, by the `act` name in data/npcs.ts. Club quests live in quests/acts.ts. */
export const STREET_ACTS: Record<string, Act> = {
  // Mustafa's Gemüse Kebap: everyone queues for the Gemüse Kebap, nobody comes for the falafel
  async mustafa() {
    const a = await ask('Mustafa: Next! Gemüse Kebap or Falafel?', ['Gemüse Kebap', 'Falafel']);
    if (a === 0) {
      await say('Mustafa: Ah, of course! With everything?');
      await say('(Grilled vegetables, feta, a squeeze of lemon. Worth every minute of the queue.)');
    } else {
      await say('Mustafa: … Falafel?');
      await say('(He looks at you like you asked Berghain for the guest list.)');
      await say("Mustafa: Okay. Falafel. I'm a little disappointed, but okay.");
    }
  }
};

/** Talking to someone from data/npcs.ts: their act or lines, then walking off if they `leave`. */
export async function streetTalk(e: Entity) {
  if (e.npcId) track('npc_talked', { npc: e.npcId });
  if (e.act && STREET_ACTS[e.act]) await STREET_ACTS[e.act](e, '');
  else for (const l of e.lines || []) await say(l);
  if (e.leave && e.npcId) {
    state.gone[e.npcId] = true; save();
    closeBox();
    walkOff(e, e.leave);
  }
}

/** Walks an NPC a few tiles sideways, fades them out, then parks them off the map. */
async function walkOff(e: Entity, dir: 'left' | 'right') {
  const dx = DIRS[dir][0];
  e.dir = dir;
  for (let i = 0; i < 6 && !blocked(e.x + dx, e.y); i++) {
    e.x += dx; e.ox = -16 * dx;
    await wait(220);
  }
  for (let a = 1; a > 0; a -= 0.1) { e.alpha = a; await wait(40); }
  e.x = OFF_MAP; e.alpha = 1; e.ox = 0;
}

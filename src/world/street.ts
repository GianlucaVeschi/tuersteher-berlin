import type { Act, Entity } from '../types';
import { blocked } from './collision';
import { OFF_MAP } from './city';
import { save } from '../core/save';
import { DIRS, state } from '../core/state';
import { wait } from '../util';
import { closeBox, say } from '../ui/dialog';

/** Custom behaviour for street NPCs, by the `act` name in data/npcs.ts. Club quests live in quests/acts.ts. */
export const STREET_ACTS: Record<string, Act> = {};

/** Talking to someone from data/npcs.ts: their act or lines, then walking off if they `leave`. */
export async function streetTalk(e: Entity) {
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

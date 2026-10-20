import { track } from '../core/monitoring';
import type { Act, Entity } from '../types';
import { blocked } from './collision';
import { OFF_MAP } from './city';
import { save } from '../core/save';
import { DIRS, held, player, state } from '../core/state';
import { wait } from '../util';
import { RT } from '../core/runtime';
import { CITY_H } from './tiles';
import { farm, gorli, gorliGrill, hoops, kick, kuhle, railway, skate } from '../places/goerli';
import { ask, closeBox, say } from '../ui/dialog';
import { taskiTalk } from './taski';

/** Custom behaviour for street NPCs, by the `act` name in data/npcs.ts. Club quests live in quests/acts.ts. */
export const STREET_ACTS: Record<string, Act> = {
  // Görlitzer Park (places/goerli.ts)
  gorli, railway, farm, hoops, kick, skate, gorliGrill, kuhle,
  // Jesus outside Heideglühen: went behind the decks once, Hausverbot ever since. Starts crying.
  async jesus(e) {
    await say("Jesus: Hey. Yes, Jesus is my real name. My mum is from Sevilla.");
    await say("Jesus: Going in? Listen to me. Whatever you do, don't go behind the decks.");
    await say('Jesus: I did, once. Ten minutes before closing. The DJ went for a pee and I thought: now or never.');
    await say('Jesus: I jumped behind the decks and quickly played a few of my own tracks. Three of them. The crowd loved it. I swear they loved it.');
    await say('Jesus: Then the DJ came back. Two guys carried me out by the elbows.');
    await say('Jesus: Hausverbot. For life.');
    await say('Jesus: Every weekend I come and stand here. I can hear the fire crackling in there. I can smell the wood...');
    if (e?.look) e.look.tears = true;
    await say('(Jesus starts crying.)');
  },
  // Taski, the Wolt rider (world/taski.ts)
  taski: taskiTalk,
  // the busker on the Admiralbrücke
  async busker() {
    await say('Busker: Any requests? I know three songs. Well. Two and a half.');
    const a = await ask('', ['Wonderwall', 'Something you wrote yourself', 'Manu Chao']);
    if (a === 0) { await say('(He sighs the sigh of a man who has played Wonderwall four hundred times this summer. He plays it anyway.)'); await say('(The whole bridge sings along. Badly. Beautifully.)'); return; }
    if (a === 1) { await say('Busker: Really? Nobody asks that.'); await say('(A quiet song about a girl from Neukölln. Someone on a bollard wipes a tear.)'); return; }
    await say('(Clandestino. Of course. Three Italian tourists start dancing on the cobblestones.)');
  },
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
  },
  // heading south out of town: you stop, refuse, and turn back
  async munich() {
    held.length = 0;
    player.dir = 'down';
    await say('You: München? BAAAAAAH!');
    await say('You: Not a grandad yet..... HELL NO!');
    await say("You: Let's keep the party going!");
    closeBox();
    // back up to the sidewalk, facing the city
    player.y = player.ty = RT.MH - 4; player.x = player.tx; player.dir = 'up';
  },
  // heading east out of town towards Cottbus: same idea, turn back
  async cottbus() {
    held.length = 0;
    player.dir = 'right';
    await say('You: AHHH! Cottbus?? I\'ve heard that\'s full of naz....');
    await say('You: FCK AFD, ya know?');
    await say("You: Let's better go back and keep the party going!");
    closeBox();
    // back along the street, facing the city
    player.x = player.tx = 69; player.y = player.ty; player.dir = 'left';
  },
  // heading west out of town towards Hannover
  async hannover() {
    held.length = 0;
    player.dir = 'left';
    await say('You: Hannover? Mmmm... Never heard of it!');
    await say("You: Let's better keep the party going!");
    closeBox();
    player.x = player.tx = 2; player.y = player.ty; player.dir = 'right';
  }
};

/** Areas of the street that run a STREET_ACTS handler when you step into them: [x0, y0, x1, y1]. */
export const STREET_TRIGGERS: { area: [number, number, number, number]; act: string }[] = [
  // the road south, past the München sign: you're not leaving Berlin tonight
  { area: [9, CITY_H - 3, 12, CITY_H - 1], act: 'munich' },
  // the main street east, past the Cottbus sign
  { area: [70, 39, 71, 42], act: 'cottbus' },
  // the street west, past the Hannover sign
  { area: [0, 29, 1, 32], act: 'hannover' }
];
/** The trigger at (x, y), if any. */
export const streetTrigger = (x: number, y: number) =>
  STREET_TRIGGERS.find(({ area: [x0, y0, x1, y1] }) => x >= x0 && x <= x1 && y >= y0 && y <= y1);

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

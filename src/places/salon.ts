import { HAIRSTYLES } from '../data/hair';
import { player, state } from '../core/state';
import { save } from '../core/save';
import { renderCard } from '../ui/card';
import { ask, closeBox, say } from '../ui/dialog';
import { fade, toast } from '../interiors/transitions';
import { reduceMotion, wait } from '../util';
import { RT } from '../core/runtime';
import { blocked } from '../world/collision';
import type { Entity } from '../types';

/* Antonio's salon (data/interiors.ts → salon). Antonio is the trendiest hairdresser in town and
   very loud about it; he talks you into a haircut before the party. */

/** The free chair you sit in, facing the mirror, and where you stand up afterwards. */
const SEAT: [number, number] = [6, 1], STAND: [number, number] = [6, 2];

const STYLE_LINES: Record<string, string> = {
  punky: 'Antonio: ¡PUNKY! A pink mohawk! The Sex Pistols are crying with envy!',
  blond: 'Antonio: Long and blond, like a rock star from 1985. ¡Precioso!',
  buzz: 'Antonio: Buzz cut! Clean, sharp, techno. The bouncers will love it.'
};

export async function antonio(_e: Entity | null) {
  if (!state.hair) {
    await say("Antonio: ¡HOLAAAA! ¡Bienvenidos! WELCOME, WELCOME, WELCOME to Antonio's!");
    await say('Antonio: I am Antonio. The trendiest hairdresser in Berlin. In Europe! In the whole UNIVERSE!');
    await say('Antonio: Last weekend? Sisyphos. Thirty-one hours! I cut three people ON the dancefloor. With my party scissors!');
    await say('(He grabs a stack of records off the counter and fans them out like a winning hand.)');
    await say('Antonio: And LOOK. Fresh from the Mauerpark flea market this morning: Italo, Spanish disco, a white-label Raffaella Carrà edit. Nobody has it. NOBODY!');
    await say("Antonio: Next year? Antonio's in Madrid. Antonio's in Ibiza. A salon in every club toilet in Berlin! I already talked to the bouncers. Well. Almost.");
    await say('Antonio: But you… ¡ay, ay, ay! You cannot go to a party with THAT hair.');
    await say("Antonio: A haircut before the party. It's the law. MY law! ¡Vamos, vamos!");
  } else {
    await say('Antonio: ¡MIRA, MIRA! Look at you! A STAR!');
    await say('Antonio: I told the DJ about your hair. He is making a remix of it. Another change? Antonio never gets bored!');
  }
  const a = await ask('', ['Sit in the chair', 'Maybe later']);
  if (a === 1) { await say('Antonio: LATER?! The party does not wait! Come back before the bouncer sees you!'); return; }
  await haircut();
}

/** Walking in: Antonio drops everything and comes straight to you. */
export async function salonEnter() {
  const e = RT.ents.find(en => en.act === 'antonio');
  if (!e) return;
  if (e.home) { e.x = e.home.x; e.y = e.home.y; }
  // walk to the tile in front of you, one step at a time (sideways first, then up or down)
  const tx = player.x, ty = player.y - 1;
  for (let i = 0; i < 12 && (e.x !== tx || e.y !== ty); i++) {
    const sx = Math.sign(tx - e.x), sy = Math.sign(ty - e.y);
    if (sx && !blocked(e.x + sx, e.y)) { e.x += sx; e.ox = -16 * sx; e.dir = sx > 0 ? 'right' : 'left'; }
    else if (sy && !blocked(e.x, e.y + sy)) { e.y += sy; e.oy = -16 * sy; e.dir = sy > 0 ? 'down' : 'up'; }
    else break;
    await wait(reduceMotion ? 0 : 220);
  }
  e.dir = 'down'; player.dir = 'up';
  await antonio(e);
}

/** Pressing A at a free chair. */
export async function salonChair() {
  await say('Antonio: ¡Eh, eh! You want to sit? Sit, sit, sit!');
  await haircut();
}

async function haircut() {
  closeBox();
  await fade(true);
  [player.x, player.y] = SEAT; player.tx = player.x; player.ty = player.y; player.dir = 'up'; player.moving = false;
  await fade(false);
  const ids = Object.keys(HAIRSTYLES);
  const a = await ask('Antonio: Look in the mirror. Now tell Antonio: what are we doing?', [...ids.map(id => HAIRSTYLES[id].name), 'Just a trim']);
  const id = ids[a] ?? null;
  closeBox();
  await fade(true);
  await wait(reduceMotion ? 200 : 900);
  state.hair = id;
  save(); renderCard();
  await fade(false);
  await say('(Snip, snip. Antonio dances while he cuts. The DJ drops a disco remix.)');
  await say(id ? STYLE_LINES[id] : 'Antonio: Only a trim? Okay, okay. Classic is also trendy. Antonio respects.');
  if (id) toast('NEW LOOK · ' + HAIRSTYLES[id].name.toUpperCase());
  [player.x, player.y] = STAND; player.tx = player.x; player.ty = player.y; player.dir = 'down';
  await say('Antonio: Now go! Dance! Get into every club! And tell them Antonio did your hair!');
}

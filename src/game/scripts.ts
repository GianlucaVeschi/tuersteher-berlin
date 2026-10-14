import type { Club, Entity } from '../types';
import { danceHere } from '../quests/dance';
import { ACTS } from '../quests/acts';
import { streetTalk } from '../world/street';
import { inClub, sceneClub } from '../world/scenes';
import { pickBottle } from '../quests/sisyphos';
import { get } from '../world/grid';
import { COUNTERS, DANCES, ICHAR } from '../world/tiles';
import { RT } from '../core/runtime';
import { blocked, covers } from '../world/collision';
import { CLUBS, FINALE, INTRO } from '../data/clubs';
import { enterClub } from '../interiors/transitions';
import { INTERIORS } from '../data/interiors';
import { showInside } from '../ui/inside';
import { save, stampCount } from '../core/save';
import { renderCard } from '../ui/card';
import { reduceMotion, shuffle, wait } from '../util';
import { DRESS, dressOK } from '../data/outfits';
import { ask, closeBox, say } from '../ui/dialog';
import { DIRS, MOVE, OPP, player, state } from '../core/state';
/* ================= SCRIPTS ================= */

/** The door: dress check, then the bouncer's questions. */
export async function bouncerTalk(e: Entity) {
  const c = e.club;
  if (!c) return;
  if (state.stamps[c.id]) { await say(c.again); return; }
  await say('(The bouncer looks you up and down.)');
  if (!dressOK(c.id, state.outfit)) {
    await say(DRESS[c.id].no_line);
    await say('(Dress code: ' + DRESS[c.id].hint + ')');
    closeBox();
    pushBack();
    return;
  }
  for (const l of c.greet) await say(l);
  const qs = shuffle(c.pool).slice(0, c.need);
  for (let i = 0; i < qs.length; i++) {
    const q = qs[i];
    const opts = shuffle(q.a.map((t, j) => ({ t, ok: j === 0 })));
    const label = qs.length > 1 ? `(${i + 1}/${qs.length}) ` : '';
    const choice = await ask(label + q.q, opts.map(o => o.t));
    if (!opts[choice].ok) {
      await say(c.reject);
      await say('(' + q.fact + ')');
      closeBox();
      pushBack();
      return;
    }
  }
  for (const l of c.accept) await say(l);
  closeBox();
  state.stamps[c.id] = true;
  e.x = c.dx + 1; e.ox = -16; e.dir = 'left';
  renderCard(); save();
  await wait(reduceMotion ? 0 : 320);
  await showInside(c, true);
  e.dir = 'down';
  if (INTERIORS && INTERIORS[c.id]) { await enterClub(c, true); await maybeFinale(); return; }
  player.x = player.tx = c.dx; player.y = player.ty = c.by; player.dir = 'down';
  save();
  await maybeFinale();
}
export async function maybeFinale() {
  if (stampCount() === CLUBS.length && !state.finale) {
    state.finale = true; save();
    for (const l of FINALE) await say(l);
    closeBox();
  }
}
export function pushBack() {
  if (navigator.vibrate) { try { navigator.vibrate(60); } catch (e) {} }
  const [dx, dy] = DIRS[OPP[player.dir]];
  const nx = player.x + dx, ny = player.y + dy;
  if (!blocked(nx, ny)) { player.tx = nx; player.ty = ny; player.moving = true; player.t = 0; player.n++; player.dur = MOVE; }
}

export async function interact() {
  const [dx, dy] = DIRS[player.dir];
  const tx = player.x + dx, ty = player.y + dy;
  let e = RT.ents.find(en => covers(en, tx, ty));
  // staff behind a counter: talk across it
  if (!e && COUNTERS.has(get(tx, ty))) e = RT.ents.find(en => covers(en, tx + dx, ty + dy));
  if (e && e.kind === 'bottle') { if (e.bid && !state.pfand.taken[e.bid]) pickBottle(e); return; }
  if (!e && inClub()) {
    const clubId = sceneClub(), ch = ICHAR[get(tx, ty)];
    const tileAct = INTERIORS[clubId].examineActs?.[ch];
    if (tileAct && ACTS[tileAct]) {
      RT.busy = true;
      try { await ACTS[tileAct](null, clubId); } finally { closeBox(); RT.busy = false; }
      return;
    }
    let lines = INTERIORS[clubId].examine[ch];
    if (ch === 'W' && state.sunrise[clubId]) lines = ['The blinds are up. Morning sun pours into the room.'];
    if (lines) {
      RT.busy = true;
      try { for (const l of lines) await say(l); } finally { closeBox(); RT.busy = false; }
      return;
    }
    if (DANCES.has(get(player.x, player.y))) await danceHere();
    return;
  }
  if (!e) return;
  RT.busy = true;
  if (e.kind !== 'sign') e.dir = OPP[player.dir];
  try {
    if (e.kind === 'bouncer') await bouncerTalk(e);
    else if (e.npcId) await streetTalk(e);
    else if (e.act && ACTS[e.act]) await ACTS[e.act](e, inClub() ? sceneClub() : '');
    else for (const l of e.lines || []) await say(l);
  } finally { closeBox(); RT.busy = false; }
}
export async function enterDoor(c: Club) {
  if (INTERIORS[c.id]) { await enterClub(c, false); return; }
  RT.busy = true;
  await showInside(c, false);
  player.x = player.tx = c.dx; player.y = player.ty = c.by; player.dir = 'down';
  save();
  RT.busy = false;
}
export async function runIntro() {
  RT.busy = true;
  for (const l of INTRO) await say(l);
  closeBox();
  state.intro = true; save();
  RT.busy = false;
}

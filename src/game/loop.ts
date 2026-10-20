import { updateHud } from '../ui/hud';
import { updateTrain } from '../world/station';
import { STREET_ACTS, streetTrigger } from '../world/street';
import { closeBox } from '../ui/dialog';
import { syncTick } from '../online/sync';
import { updateMusic } from '../audio/music';
import type { Dir } from '../types';
import { prerender } from '../render/cityTiles';
import { zoom, zoomUI } from '../render/zoom';
import { renderCard } from '../ui/card';
import { draw, train } from '../render/draw';
import { applySave, loadSave, save } from '../core/save';
import { openShop } from '../ui/shop';
import { darkroomScene } from '../quests/acts';
import { pickBottle } from '../quests/sisyphos';
import { enterPlace, goFloor, leaveClub } from '../interiors/transitions';
import { D, DARK, EXIT, ICHAR, SPIRAL, STAIRS_DOWN, STAIRS_UP, STAIRS_UP_SIDE, T, isDoorTile } from '../world/tiles';
import { INTERIORS } from '../data/interiors';
import { get } from '../world/grid';
import { inClub, sceneClub, sceneFloor } from '../world/scenes';
import { followStep } from '../interiors/follower';
import { blocked, clubAtDoor, placeAtDoor, shopAtDoor } from '../world/collision';
import { enterDoor, runIntro } from './scripts';
import { openCreator, openNamePrompt } from '../ui/creator';
import { DIRS, MOVE, RUN, held, player, running, state } from '../core/state';
import { $, wait } from '../util';
import { RT } from '../core/runtime';
/* ================= LOOP ================= */
export function startGame() {
  RT.titleOn = false; $('#title').hidden = true;
  if (!state.char) { openCreator(); return; }
  if (!state.name) { openNamePrompt(); return; }
  RT.busy = false;
  if (!state.intro) runIntro();
}
let saveTimer = 0;
export function tryMove(dir: Dir) {
  player.dir = dir;
  const [dx, dy] = DIRS[dir];
  const nx = player.x + dx, ny = player.y + dy;
  if (blocked(nx, ny)) return;
  followStep(player.x, player.y);
  player.tx = nx; player.ty = ny; player.moving = true; player.t = 0; player.n++;
  player.dur = running() ? RUN : MOVE;
}
export function arrive() {
  if (inClub()) {
    const t = get(player.x, player.y), clubId = sceneClub(), fl = INTERIORS[clubId].floors[sceneFloor()];
    if ((t === STAIRS_UP || t === STAIRS_UP_SIDE) && fl.up) { goFloor(clubId, fl.up.to, fl.up.at); return; }
    if (t === STAIRS_DOWN && fl.down) { goFloor(clubId, fl.down.to, fl.down.at); return; }
    if (t === SPIRAL && fl.spiral) { goFloor(clubId, fl.spiral.to, fl.spiral.at); return; }
    if (t === EXIT && fl.exit) { leaveClub(clubId); return; }
    if (isDoorTile(t) && fl.doors && fl.doors[ICHAR[t]]) { const d = fl.doors[ICHAR[t]]; goFloor(clubId, d.to, d.at); return; }
    const b = RT.ents.find(en => en.kind === 'bottle' && en.x === player.x && en.y === player.y && en.bid && !state.pfand.taken[en.bid]);
    if (b) pickBottle(b);
    if (t === DARK && RT.follower && RT.follower.quest === 'darkroom') { darkroomScene(); return; }
    return;
  }
  if (get(player.x, player.y) === D) {
    const c = clubAtDoor(player.x, player.y);
    if (c) { enterDoor(c); return; }
    const sh = shopAtDoor(player.x, player.y);
    if (sh) { openShop(sh); return; }
    const pl = placeAtDoor(player.x, player.y);
    if (pl) { enterPlace(pl); return; }
  }
  // street triggers (the road out of town, …): run their handler, nothing else moves meanwhile
  const trig = streetTrigger(player.x, player.y);
  if (trig && STREET_ACTS[trig.act]) {
    RT.busy = true;
    void STREET_ACTS[trig.act](null, '').finally(() => { closeBox(); RT.busy = false; });
    return;
  }
  if (++saveTimer % 8 === 0) save();
}
export function update(dt: number) {
  if (player.moving) {
    player.t += dt;
    if (player.t >= player.dur) {
      player.x = player.tx; player.y = player.ty; player.moving = false; player.t = 0;
      arrive();
    }
  }
  if (!player.moving && !RT.busy && !RT.titleOn && !zoom.fit && held.length) tryMove(held[held.length - 1]);
  const ease = (o: number) => o > 0 ? Math.max(0, o - dt * 0.08) : Math.min(0, o + dt * 0.08);
  RT.ents.forEach(e => { if (e.ox) e.ox = ease(e.ox); if (e.oy) e.oy = ease(e.oy); });
  updateTrain(dt);
}
let last = performance.now();
export function frame(now: number) {
  const raw = Math.min(50, now - last); last = now;
  const dt = raw;
  RT.clock += dt;
  update(dt);
  updateMusic();
  // active play time: only while the game is open, in front, and you've joined the guest list
  if (!RT.titleOn && state.name && document.visibilityState === 'visible' && document.hasFocus()) state.playMs += raw;
  syncTick();
  // keep the loop alive even if one frame fails to draw
  try { draw(RT.clock); updateHud(); } catch (err) { console.error(err); }
  requestAnimationFrame(frame);
}

export function start() {
  applySave(loadSave());
  renderCard();
  zoomUI();
  if (state.intro) {
    $('#titlePress').textContent = 'PRESS A · CONTINUE';
  }
  train.x = 13 * T - 140;
  const fontReady = (document.fonts && document.fonts.load) ? document.fonts.load('8px "Press Start 2P"') : Promise.resolve();
  Promise.race([fontReady, wait(1500)]).catch(() => {}).then(() => {
    prerender();
    requestAnimationFrame(t => { last = t; RT.clock = t; frame(t); });
  });
}

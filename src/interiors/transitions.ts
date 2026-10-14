import { CLUBS } from '../data/clubs';
import { save } from '../core/save';
import { renderCard } from '../ui/card';
import { closeBox, say } from '../ui/dialog';
import { showInside } from '../ui/inside';
import { onFloorEnter } from '../quests/quests';
import { placeFollower, releaseFollower } from './follower';
import { player, state } from '../core/state';
import { RT } from '../core/runtime';
import { INTERIORS } from '../data/interiors';
import { inClub, sceneClub, sceneFloor, useScene } from '../world/scenes';
import { $, reduceMotion, wait } from '../util';
/* ---- transitions ---- */
export const fadeEl = $('#fade'), floorCard = $('#floorCard'), floorTag = $('#floorTag'), toastEl = $('#toast');
export async function fade(on) { fadeEl.classList.toggle('on', on); await wait(reduceMotion ? 0 : 240); }
export let floorCardTimer = null;
export function showFloorCard(title, sub) {
  floorCard.innerHTML = '<b></b><span></span>';
  floorCard.querySelector('b').textContent = title;
  floorCard.querySelector('span').textContent = sub;
  floorCard.hidden = false; floorCard.classList.remove('out');
  clearTimeout(floorCardTimer);
  floorCardTimer = setTimeout(() => { floorCard.classList.add('out'); floorCardTimer = setTimeout(() => { floorCard.hidden = true; }, 400); }, 1400);
}
export let toastTimer = null;
export function toast(text) {
  toastEl.textContent = text; toastEl.hidden = false; toastEl.classList.remove('out');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.classList.add('out'); toastTimer = setTimeout(() => { toastEl.hidden = true; }, 400); }, 2600);
}
export function updateFloorTag() {
  if (!inClub()) { floorTag.hidden = true; return; }
  const fl = INTERIORS[sceneClub()].floors[sceneFloor()];
  floorTag.textContent = INTERIORS[sceneClub()].name.toUpperCase() + ' · ' + fl.short;
  floorTag.hidden = false;
}
export async function goFloor(clubId, floorId, spawnKey) {
  RT.busy = true;
  await fade(true);
  const fl = INTERIORS[clubId].floors[floorId];
  const [x, y, dir] = fl.spawn[spawnKey];
  useScene(clubId + ':' + floorId);
  player.x = player.tx = x; player.y = player.ty = y; player.dir = dir; player.moving = false;
  placeFollower();
  updateFloorTag();
  showFloorCard(fl.short, fl.label);
  await fade(false);
  RT.busy = false;
  await onFloorEnter(clubId, floorId);
}
export async function enterClub(c, overlayShown) {
  RT.busy = true;
  if (!overlayShown && !state.visited[c.id]) await showInside(c, false);
  const first = !state.visited[c.id];
  state.visited[c.id] = true;
  await goFloor(c.id, Object.keys(INTERIORS[c.id].floors)[0], 'street');
  if (first) {
    RT.busy = true;
    const welcome = INTERIORS[c.id].welcome || ['Security: Phone.', '(He puts stickers over your phone cameras. No photos in here.)', 'Security: Viel Spaß.', '(Side quests unlocked. Check your stamp card.)'];
    for (const l of welcome) await say(l);
    closeBox();
    renderCard(); save();
    RT.busy = false;
  }
}
export async function leaveClub(clubId) {
  const c = CLUBS.find(cl => cl.id === clubId);
  RT.busy = true;
  if (RT.follower) { await say(`(${RT.follower.name} stays inside. They'll wait for you at Panorama Bar.)`); closeBox(); releaseFollower(); }
  await fade(true);
  useScene('city');
  player.x = player.tx = c.dx; player.y = player.ty = c.by; player.dir = 'down'; player.moving = false;
  updateFloorTag();
  save();
  await fade(false);
  RT.busy = false;
}

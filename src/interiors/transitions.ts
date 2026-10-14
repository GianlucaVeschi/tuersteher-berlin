import { track } from '../core/monitoring';
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
import type { Club } from '../types';
/* ---- transitions ---- */
export const fadeEl = $('#fade'), floorCard = $('#floorCard'), floorTag = $('#floorTag'), toastEl = $('#toast');
/** Fade the screen to black (on) or back (off). */
export async function fade(on: boolean) { fadeEl.classList.toggle('on', on); await wait(reduceMotion ? 0 : 240); }
let floorCardTimer: ReturnType<typeof setTimeout> | undefined;
/** Big floor name shown for a moment after taking the stairs. */
export function showFloorCard(title: string, sub: string) {
  floorCard.innerHTML = '<b></b><span></span>';
  floorCard.querySelector('b')!.textContent = title;
  floorCard.querySelector('span')!.textContent = sub;
  floorCard.hidden = false; floorCard.classList.remove('out');
  clearTimeout(floorCardTimer);
  floorCardTimer = setTimeout(() => { floorCard.classList.add('out'); floorCardTimer = setTimeout(() => { floorCard.hidden = true; }, 400); }, 1400);
}
let toastTimer: ReturnType<typeof setTimeout> | undefined;
/** Short notice at the top of the screen. */
export function toast(text: string) {
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
/** Move to another floor of a club, arriving at the given spawn point. */
export async function goFloor(clubId: string, floorId: string, spawnKey: string) {
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
/** Walk into a club with an interior (the first floor's 'street' spawn). */
export async function enterClub(c: Club, overlayShown: boolean) {
  RT.busy = true;
  if (!overlayShown && !state.visited[c.id]) await showInside(c, false);
  const first = !state.visited[c.id];
  state.visited[c.id] = true;
  track('club_entered', { club: c.id, first });
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
/** Back out onto the street in front of the club's door. */
export async function leaveClub(clubId: string) {
  const c = CLUBS.find(cl => cl.id === clubId);
  if (!c) return;
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

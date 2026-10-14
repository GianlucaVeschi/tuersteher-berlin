import { SCENES } from '../world/scenes';
import { blocked } from '../world/collision';
import { T } from '../world/tiles';
import { RT } from '../core/runtime';
import { DIRS, OPP, player } from '../core/state';
/* ---- follower (someone walking behind you) ---- */
export function followerPx() {
  if (!player.moving) return [RT.follower.x * T, RT.follower.y * T];
  const k = player.t / player.dur;
  return [Math.round((RT.follower.px + (RT.follower.x - RT.follower.px) * k) * T), Math.round((RT.follower.py + (RT.follower.y - RT.follower.py) * k) * T)];
}
export function followStep(oldX, oldY) {
  if (!RT.follower) return;
  RT.follower.px = RT.follower.x; RT.follower.py = RT.follower.y;
  RT.follower.x = oldX; RT.follower.y = oldY;
  const dx = RT.follower.x - RT.follower.px, dy = RT.follower.y - RT.follower.py;
  if (dx || dy) RT.follower.dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
}
export function placeFollower() {
  if (!RT.follower) return;
  const [dx, dy] = DIRS[OPP[player.dir]];
  let fx = player.x + dx, fy = player.y + dy;
  if (blocked(fx, fy)) { fx = player.x; fy = player.y; }
  RT.follower.x = RT.follower.px = fx; RT.follower.y = RT.follower.py = fy; RT.follower.dir = player.dir;
}
export function releaseFollower() {
  if (!RT.follower) return;
  const sc = SCENES[RT.follower.homeScene];
  if (sc && !sc.ents.includes(RT.follower.ent)) { RT.follower.ent.x = RT.follower.ent.home.x; RT.follower.ent.y = RT.follower.ent.home.y; sc.ents.push(RT.follower.ent); }
  RT.follower = null;
}

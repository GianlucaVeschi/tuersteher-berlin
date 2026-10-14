import { SCENES } from '../world/scenes';
import { blocked } from '../world/collision';
import { T } from '../world/tiles';
import { RT } from '../core/runtime';
import { DIRS, OPP, player } from '../core/state';

/* ---- follower (someone walking behind you) ---- */
/** Follower position in pixels, moving in step with the player. */
export function followerPx(): [number, number] {
  const f = RT.follower;
  if (!f) return [0, 0];
  if (!player.moving) return [f.x * T, f.y * T];
  const k = player.t / player.dur;
  return [Math.round((f.px + (f.x - f.px) * k) * T), Math.round((f.py + (f.y - f.py) * k) * T)];
}
/** The follower steps onto the tile the player just left. */
export function followStep(oldX: number, oldY: number) {
  const f = RT.follower;
  if (!f) return;
  f.px = f.x; f.py = f.y;
  f.x = oldX; f.y = oldY;
  const dx = f.x - f.px, dy = f.y - f.py;
  if (dx || dy) f.dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
}
/** After a floor change: stand behind the player (or on them if that tile is blocked). */
export function placeFollower() {
  const f = RT.follower;
  if (!f) return;
  const [dx, dy] = DIRS[OPP[player.dir]];
  let fx = player.x + dx, fy = player.y + dy;
  if (blocked(fx, fy)) { fx = player.x; fy = player.y; }
  f.x = f.px = fx; f.y = f.py = fy; f.dir = player.dir;
}
/** The follower goes back to where you met them. */
export function releaseFollower() {
  const f = RT.follower;
  if (!f) return;
  const sc = SCENES[f.homeScene];
  const ent = f.ent;
  if (sc && !sc.ents.includes(ent)) {
    if (ent.home) { ent.x = ent.home.x; ent.y = ent.home.y; }
    sc.ents.push(ent);
  }
  RT.follower = null;
}

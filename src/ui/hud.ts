import { MOBILE, cvs } from '../render/canvas';
import { playerOnScreen } from '../render/draw';
import { $ } from '../util';

/* Desktop: the corner HUD (stamps, room) sits over the map. When you walk under it, it fades out,
   so it never hides a door, stairs or a person. Phones keep their own layout. */
const hud = $('#hud');

/** Called every frame after drawing. */
export function updateHud() {
  if (MOBILE.matches) { hud.classList.remove('dim'); return; }
  const c = cvs.getBoundingClientRect(), r = hud.getBoundingClientRect();
  if (!c.width || !r.width) return;
  const x = c.left + playerOnScreen.x * c.width, y = c.top + playerOnScreen.y * c.height;
  const margin = c.width * 0.06; // roughly a tile and a half around it
  hud.classList.toggle('dim', x > r.left - margin && x < r.right + margin && y > r.top - margin && y < r.bottom + margin);
}

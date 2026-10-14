import { RT } from '../core/runtime';
import { $ } from '../util';
/* ================= INSIDE ================= */
export const inside = $('#inside');
export function showInside(c, fresh) {
  return new Promise(resolve => {
    inside.style.setProperty('--club', c.glow);
    $('#inClub').textContent = c.name.toUpperCase();
    $('#inText').textContent = c.inside;
    $('#inStamp').hidden = !fresh;
    inside.hidden = false;
    RT.insideResolve = () => { inside.hidden = true; RT.insideResolve = null; resolve(); };
  });
}

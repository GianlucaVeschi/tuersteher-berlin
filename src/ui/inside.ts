import { RT } from '../core/runtime';
import { $ } from '../util';
import type { Club } from '../types';

/* ================= INSIDE ================= */
export const inside = $('#inside');
/** The short "you're in" scene with light beams; fresh shows the +1 STEMPEL badge. Resolves on A. */
export function showInside(c: Club, fresh: boolean): Promise<void> {
  return new Promise(resolve => {
    inside.style.setProperty('--club', c.glow);
    $('#inClub').textContent = c.name.toUpperCase();
    $('#inText').textContent = c.inside;
    $('#inStamp').hidden = !fresh;
    inside.hidden = false;
    RT.insideResolve = () => { inside.hidden = true; RT.insideResolve = null; resolve(); };
  });
}

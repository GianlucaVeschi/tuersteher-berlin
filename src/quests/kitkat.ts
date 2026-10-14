import type { Dir, Entity, Look } from '../types';
import { RT } from '../core/runtime';
import { state } from '../core/state';
import { lookOf } from '../render/looks';
import { person } from '../render/sprites';
import { $, INK, reduceMotion, wait } from '../util';
import { ctx, screenEl } from '../render/canvas';
import { T } from '../world/tiles';
/* ---- KitKat: groups on beds, Marco, the photo booth ---- */
export function drawPile(e: Entity, X: number, Y: number, now: number, lights: boolean) {
  // a bed (or a dark corner) with several people tangled together, rocking slowly
  const looks = e.looks || [], phase = e.phase ?? 0;
  const W = (e.w || 1) * T, n = looks.length, beat = lights ? now / 430 : 0;
  ctx.fillStyle = INK; ctx.fillRect(X - 1, Y + 3, W + 2, 13);
  ctx.fillStyle = e.sheet || '#5a0a1a'; ctx.fillRect(X, Y + 4, W, 11);
  ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(X, Y + 4, W, 2);
  looks.forEach((L, i) => {
    const bob = Math.round(Math.sin(beat * Math.PI + i * 1.9 + phase) * 1.5);
    const cx = X + 8 + i * (W - 16) / Math.max(1, n - 1);
    ctx.save();
    ctx.translate(Math.round(cx), Y + 9 + bob);
    ctx.rotate(i % 2 ? -Math.PI / 2 : Math.PI / 2);
    person(ctx, -8, -9, i % 3 === 1 ? 'up' : 'down', 0, L);
    ctx.restore();
  });
  // a blanket over the middle: it's understood, not shown
  ctx.fillStyle = e.sheet || '#5a0a1a'; ctx.fillRect(X + 3, Y + 10, W - 6, 5);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(X + 3, Y + 10, W - 6, 1);
  // little hearts drifting up
  if (lights) for (let i = 0; i < 3; i++) {
    const t = ((now / 1700) + i / 3 + phase) % 1;
    const hx = Math.round(X + W / 2 + Math.sin(t * 6 + i) * W / 3), hy = Math.round(Y + 2 - t * 20);
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = '#ff5fa2'; ctx.fillRect(hx - 2, hy, 2, 2); ctx.fillRect(hx + 1, hy, 2, 2); ctx.fillRect(hx - 2, hy + 1, 5, 2); ctx.fillRect(hx - 1, hy + 3, 3, 1); ctx.fillRect(hx, hy + 4, 1, 1);
    ctx.globalAlpha = 1;
  }
}
export const PILE_LINES: Record<string, { look: string; hi: string; ok?: string; after?: string }> = {
  yes: { look: '(A tangle of bodies under a blanket, moving to their own rhythm. Someone looks up and smiles.)', hi: 'Them: Hi, cutie. Want to join us?',
    ok: 'Them: Everyone? … Yes, yes and yes. Come here.', after: '(A while later you crawl back out, grinning and slightly out of breath.)' },
  no: { look: '(A tight knot of bodies in the dark. Somebody shifts and looks over at you.)', hi: 'Them: Hey. Something you wanted?',
    ok: "Them: Sweet of you to ask, but we're a closed group tonight. Have fun out there!" },
  busy: { look: '(Two people, very busy, very much in their own world.)', hi: 'Them: (breathless) …not now, darling. Maybe later.' }
};
export async function spankFx(gentle: boolean) {
  const sm = $('#smack');
  sm.textContent = gentle ? 'pat.' : 'SMACK!';
  sm.hidden = false; sm.classList.remove('go'); void sm.offsetWidth; sm.classList.add('go');
  if (!reduceMotion) { screenEl.classList.remove('shake'); void screenEl.offsetWidth; screenEl.classList.add('shake'); }
  if (navigator.vibrate) { try { navigator.vibrate(gentle ? 40 : [80, 40, 120]); } catch (err) {} }
  await wait(800);
  sm.hidden = true; screenEl.classList.remove('shake');
}
export const MARCO_LOOK: Look = { skin: '#d9a27c', hair: '#2a2420', beard: '#2a2420', top: '#d9a27c', legs: '#0c0c12', harness: true, shine: '#7a7a99' };
/** The four-frame photo booth strip with you and Marco (scale 1 on screen, 8 for the PNG download). */
export function drawPhotoStrip(cv: HTMLCanvasElement, scale = 1) {
  const g = cv.getContext('2d')!, s = scale;
  cv.width = 56 * s; cv.height = 200 * s;
  g.imageSmoothingEnabled = false;
  g.setTransform(s, 0, 0, s, 0, 0);
  const sprite = document.createElement('canvas'); sprite.width = 16; sprite.height = 18;
  const sg = sprite.getContext('2d')!;
  const drawP = (L: Look, dir: Dir, x: number, y: number) => { sg.clearRect(0, 0, 16, 18); person(sg, 0, 2, dir, 0, L); g.drawImage(sprite, 0, 0, 16, 18, x, y, 32, 36); };
  const me = lookOf(state.outfit);
  g.fillStyle = '#f3eee3'; g.fillRect(0, 0, 56, 200);
  for (let f = 0; f < 4; f++) {
    const fy = 4 + f * 44;
    g.fillStyle = '#6a0a18'; g.fillRect(4, fy, 48, 40);
    for (let i = 6; i < 52; i += 5) { g.fillStyle = '#4a0610'; g.fillRect(i, fy, 1, 34); g.fillStyle = '#8a1a28'; g.fillRect(i + 2, fy, 1, 34); }
    g.fillStyle = '#2a0a10'; g.fillRect(4, fy + 34, 48, 6);
    if (f === 0) { drawP(me, 'down', 2, fy + 3); drawP(MARCO_LOOK, 'down', 22, fy + 3); }
    if (f === 1) { drawP(me, 'down', 2, fy + 3); drawP(MARCO_LOOK, 'left', 22, fy + 3); g.fillStyle = MARCO_LOOK.skin; g.fillRect(24, fy + 6, 5, 5); g.fillStyle = '#ffffff'; g.fillRect(31, fy + 4, 4, 1); g.fillRect(32, fy + 7, 4, 1); }
    if (f === 2) {
      drawP(Object.assign({}, me, { blush: true }), 'up', 2, fy + 3); drawP(MARCO_LOOK, 'left', 22, fy + 3);
      g.fillStyle = '#fff200'; [[14, 8], [10, 14], [18, 16], [12, 22]].forEach(([a, b]) => { g.fillRect(4 + a, fy + b, 3, 1); g.fillRect(5 + a, fy + b - 1, 1, 3); });
      g.font = '8px "Press Start 2P", monospace'; g.textBaseline = 'top'; g.fillStyle = INK; g.fillText('SMACK', 9, fy + 27); g.fillStyle = '#ffffff'; g.fillText('SMACK', 8, fy + 26);
    }
    if (f === 3) {
      drawP(Object.assign({}, me, { blush: true }), 'down', 2, fy + 3); drawP(MARCO_LOOK, 'down', 22, fy + 3);
      g.fillStyle = '#ff5fa2'; const hx = 25, hy = fy + 4; g.fillRect(hx, hy, 3, 2); g.fillRect(hx + 4, hy, 3, 2); g.fillRect(hx, hy + 2, 7, 2); g.fillRect(hx + 1, hy + 4, 5, 1); g.fillRect(hx + 2, hy + 5, 3, 1); g.fillRect(hx + 3, hy + 6, 1, 1);
    }
  }
  g.font = '8px "Press Start 2P", monospace'; g.textBaseline = 'top'; g.fillStyle = '#a3161a'; g.fillText('KITKAT', 4, 183);
  g.setTransform(1, 0, 0, 1, 0, 0);
}
export function showPhotoStrip() {
  return new Promise<void>(resolve => {
    const el = $('#photo');
    drawPhotoStrip($<HTMLCanvasElement>('#photoCanvas'), 1);
    el.hidden = false;
    RT.photoResolve = () => { el.hidden = true; RT.photoResolve = null; resolve(); };
  });
}

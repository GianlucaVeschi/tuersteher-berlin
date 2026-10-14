import { runIntro } from '../game/scripts';
import { save } from '../core/save';
import { renderCard } from './card';
import { state } from '../core/state';
import { lookFor } from '../render/looks';
import { person } from '../render/sprites';
import { CHARACTERS, OUTFITS, TAG_LABEL } from '../data/outfits';
import { RT } from '../core/runtime';
import { $ } from '../util';
import type { Character, CreatorState, Dir } from '../types';

/* ================= CHARACTER CREATOR ================= */
// Step 1: man or woman. Step 2: one of four starting characters.
export const creatorEl = $('#creator'), crList = $('#crList');
export function openCreator() {
  RT.busy = true;
  RT.creator = { step: 1, sel: 0, gender: 'man' };
  creatorEl.hidden = false;
  renderCreator();
}
function creatorOptions(cr: CreatorState): { label: string; ch: Character }[] {
  if (cr.step === 1) return [{ label: 'Man', ch: CHARACTERS.man[0] }, { label: 'Woman', ch: CHARACTERS.woman[0] }];
  return CHARACTERS[cr.gender].map(ch => ({ label: ch.name, ch }));
}
function renderCreator() {
  const cr = RT.creator;
  if (!cr) return;
  const opts = creatorOptions(cr);
  $('#crStep').textContent = `NEW GAME · ${cr.step}/2`;
  $('#crQ').textContent = cr.step === 1 ? "Who's going out tonight?" : 'Pick your character';
  crList.dataset.n = String(opts.length);
  crList.innerHTML = '';
  opts.forEach((o, i) => {
    const li = document.createElement('li');
    li.innerHTML = '<canvas width="16" height="16"></canvas><span></span>';
    li.querySelector('span')!.textContent = o.label;
    const g = li.querySelector('canvas')!.getContext('2d')!;
    person(g, 0, 0, 'down', 0, lookFor(o.ch));
    li.classList.toggle('sel', i === cr.sel);
    li.addEventListener('click', () => { if (!RT.creator) return; RT.creator.sel = i; creatorA(); });
    crList.appendChild(li);
  });
  const cur = opts[cr.sel];
  if (cr.step === 1) $('#crDesc').textContent = 'You pick a look next. You can change clothes later in shops.';
  else {
    const o = OUTFITS[cur.ch.outfit];
    $('#crDesc').textContent = `${cur.ch.desc} Starts in: ${o.name} (${o.tags.map(t => TAG_LABEL[t]).join(', ')}).`;
  }
}
export function creatorMove(dir: Dir) {
  const cr = RT.creator;
  if (!cr) return;
  const n = creatorOptions(cr).length;
  cr.sel = (cr.sel + (dir === 'left' || dir === 'up' ? -1 : 1) + n) % n;
  renderCreator();
}
export function creatorA() {
  const cr = RT.creator;
  if (!cr) return;
  if (cr.step === 1) {
    cr.gender = cr.sel === 0 ? 'man' : 'woman';
    cr.step = 2; cr.sel = 0;
    renderCreator();
    return;
  }
  const ch = CHARACTERS[cr.gender][cr.sel];
  state.char = ch.id;
  state.outfit = ch.outfit;
  RT.creator = null; creatorEl.hidden = true;
  renderCard(); save();
  RT.busy = false;
  if (!state.intro) runIntro();
}
export function creatorB() {
  const cr = RT.creator;
  if (cr && cr.step === 2) { cr.step = 1; cr.sel = cr.gender === 'man' ? 0 : 1; renderCreator(); }
}

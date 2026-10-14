import { runIntro } from '../game/scripts';
import { save } from '../core/save';
import { renderCard } from './card';
import { state } from '../core/state';
import { lookFor } from '../render/looks';
import { person } from '../render/sprites';
import { CHARACTERS, OUTFITS, TAG_LABEL } from '../data/outfits';
import { RT } from '../core/runtime';
import { $ } from '../util';
/* ================= CHARACTER CREATOR ================= */
export const creatorEl = $('#creator'), crList = $('#crList');
export function openCreator() {
  RT.busy = true;
  RT.creator = { step: 1, sel: 0, gender: 'man' };
  creatorEl.hidden = false;
  renderCreator();
}
export function creatorOptions() {
  if (RT.creator.step === 1) return [{ label: 'Man', ch: CHARACTERS.man[0] }, { label: 'Woman', ch: CHARACTERS.woman[0] }];
  return CHARACTERS[RT.creator.gender].map(ch => ({ label: ch.name, ch }));
}
export function renderCreator() {
  const opts = creatorOptions();
  $('#crStep').textContent = `NEW GAME · ${RT.creator.step}/2`;
  $('#crQ').textContent = RT.creator.step === 1 ? "Who's going out tonight?" : 'Pick your character';
  crList.dataset.n = opts.length;
  crList.innerHTML = '';
  opts.forEach((o, i) => {
    const li = document.createElement('li');
    li.innerHTML = '<canvas width="16" height="16"></canvas><span></span>';
    li.querySelector('span').textContent = o.label;
    const g = li.querySelector('canvas').getContext('2d');
    person(g, 0, 0, 'down', 0, lookFor(o.ch));
    li.classList.toggle('sel', i === RT.creator.sel);
    li.addEventListener('click', () => { if (!RT.creator) return; RT.creator.sel = i; creatorA(); });
    crList.appendChild(li);
  });
  const cur = opts[RT.creator.sel];
  if (RT.creator.step === 1) $('#crDesc').textContent = 'You pick a look next. You can change clothes later in shops.';
  else {
    const o = OUTFITS[cur.ch.outfit];
    $('#crDesc').textContent = `${cur.ch.desc} Starts in: ${o.name} (${o.tags.map(t => TAG_LABEL[t]).join(', ')}).`;
  }
}
export function creatorMove(dir) {
  const n = creatorOptions().length;
  RT.creator.sel = (RT.creator.sel + (dir === 'left' || dir === 'up' ? -1 : 1) + n) % n;
  renderCreator();
}
export function creatorA() {
  if (RT.creator.step === 1) {
    RT.creator.gender = RT.creator.sel === 0 ? 'man' : 'woman';
    RT.creator.step = 2; RT.creator.sel = 0;
    renderCreator();
    return;
  }
  const ch = CHARACTERS[RT.creator.gender][RT.creator.sel];
  state.char = ch.id;
  state.outfit = ch.outfit;
  RT.creator = null; creatorEl.hidden = true;
  renderCard(); save();
  RT.busy = false;
  if (!state.intro) runIntro();
}
export function creatorB() {
  if (RT.creator.step === 2) { RT.creator.step = 1; RT.creator.sel = RT.creator.gender === 'man' ? 0 : 1; renderCreator(); }
}

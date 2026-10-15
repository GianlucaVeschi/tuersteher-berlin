import { track } from '../core/monitoring';
import { runIntro } from '../game/scripts';
import { save } from '../core/save';
import { renderCard } from './card';
import { state } from '../core/state';
import { lookFor } from '../render/looks';
import { person } from '../render/sprites';
import { CHARACTERS, GENDERS, OUTFITS, TAG_LABEL } from '../data/outfits';
import { RT } from '../core/runtime';
import { $ } from '../util';
import type { Character, CreatorState, Dir } from '../types';
import { checkName } from '../online/names';
import { syncFinish, syncNow } from '../online/sync';

/* ================= CHARACTER CREATOR ================= */
// Step 1: man, woman or non-binary. Step 2: one of four starting characters. Step 3: your name for the guest list.
export const creatorEl = $('#creator'), crList = $('#crList');
const nameBox = $('#crNameBox'), nameInput = $<HTMLInputElement>('#crName'), nameErr = $('#crNameErr');
export function openCreator() {
  RT.busy = true;
  RT.creator = { step: 1, sel: 0, gender: 'man' };
  creatorEl.hidden = false;
  renderCreator();
}
function creatorOptions(cr: CreatorState): { label: string; ch: Character }[] {
  if (cr.step === 1) return GENDERS.map(g => ({ label: g.label, ch: CHARACTERS[g.id][0] }));
  return CHARACTERS[cr.gender].map(ch => ({ label: ch.name, ch }));
}
/** Existing players without a name (from before the guest list) only get the name step. */
export function openNamePrompt() {
  RT.busy = true;
  RT.creator = { step: 3, sel: 0, gender: 'man', nameOnly: true };
  creatorEl.hidden = false;
  renderCreator();
}
function renderCreator() {
  const cr = RT.creator;
  if (!cr) return;
  const naming = cr.step === 3;
  crList.hidden = naming; nameBox.hidden = !naming;
  if (naming) {
    $('#crStep').textContent = cr.nameOnly ? 'GUEST LIST' : 'NEW GAME · 3/3';
    $('#crQ').textContent = "What's your name?";
    $('#crDesc').textContent = 'It goes on the public guest list with your progress. It doesn\'t have to be unique.';
    nameErr.textContent = '';
    nameInput.value = state.name || '';
    setTimeout(() => nameInput.focus(), 0);
    return;
  }
  const opts = creatorOptions(cr);
  $('#crStep').textContent = `NEW GAME · ${cr.step}/3`;
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
  if (!cr || cr.step === 3) return;
  const n = creatorOptions(cr).length;
  cr.sel = (cr.sel + (dir === 'left' || dir === 'up' ? -1 : 1) + n) % n;
  renderCreator();
}
export function creatorA() {
  const cr = RT.creator;
  if (!cr) return;
  if (cr.step === 1) {
    cr.gender = GENDERS[cr.sel].id;
    cr.step = 2; cr.sel = 0;
    renderCreator();
    return;
  }
  if (cr.step === 2) {
    const ch = CHARACTERS[cr.gender][cr.sel];
    state.char = ch.id;
    state.outfit = ch.outfit;
    track('character_selected', { character: ch.id });
    cr.step = 3;
    renderCreator();
    return;
  }
  // step 3: the name
  const res = checkName(nameInput.value);
  if (!res.ok) { nameErr.textContent = res.reason; nameInput.focus(); return; }
  state.name = res.name;
  nameInput.blur();
  RT.creator = null; creatorEl.hidden = true;
  renderCard(); save();
  // join the guest list (and record an old finish, from before the guest list existed)
  if (state.finale && !state.onlineFinished) syncFinish(true); else syncNow();
  RT.busy = false;
  if (!state.intro) runIntro();
}
export function creatorB() {
  const cr = RT.creator;
  if (cr && cr.step === 3 && !cr.nameOnly) { cr.step = 2; cr.sel = CHARACTERS[cr.gender].findIndex(c => c.id === state.char); if (cr.sel < 0) cr.sel = 0; renderCreator(); return; }
  if (cr && cr.step === 2) { cr.step = 1; cr.sel = Math.max(0, GENDERS.findIndex(g => g.id === cr.gender)); renderCreator(); }
}

/** Enter in the name field confirms; Escape goes back. */
export function initCreator() {
  nameInput.addEventListener('keydown', ev => {
    if (ev.key === 'Enter') { ev.preventDefault(); creatorA(); }
    else if (ev.key === 'Escape') { ev.preventDefault(); creatorB(); }
  });
}

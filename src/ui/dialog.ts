import { pressA } from '../input';
import { RT } from '../core/runtime';
import { $, reduceMotion } from '../util';
import type { Dir } from '../types';

/* ================= DIALOG ================= */
export const dialog = $('#dialog'), dtext = $('#dtext'), dchoices = $('#dchoices'), dmore = $('#dmore');

/** Types the text out letter by letter (instantly with reduced motion), then calls done. */
export function typeText(text: string, done: () => void) {
  if (RT.typing) clearInterval(RT.typing.id);
  dtext.textContent = '';
  if (reduceMotion) { dtext.textContent = text; RT.typing = null; done(); return; }
  let i = 0;
  const id = setInterval(() => {
    i++; dtext.textContent = text.slice(0, i);
    if (i >= text.length) { clearInterval(id); RT.typing = null; done(); }
  }, 20);
  RT.typing = { id, finish: () => { clearInterval(id); dtext.textContent = text; RT.typing = null; done(); } };
}

/** Shows a line of text and waits for A. The box stays open until closeBox(). */
export function say(text: string): Promise<void> {
  return new Promise(resolve => {
    dialog.hidden = false; dchoices.hidden = true; dmore.hidden = true;
    RT.ui = { mode: 'say', ready: false, resolve: () => resolve(), n: 0, sel: 0 };
    typeText(text, () => { if (RT.ui) { RT.ui.ready = true; dmore.hidden = false; } });
  });
}

/** Shows a question with choices and resolves with the index picked. */
export function ask(text: string, opts: string[]): Promise<number> {
  return new Promise(resolve => {
    dialog.hidden = false; dchoices.hidden = true; dmore.hidden = true;
    RT.ui = { mode: 'ask', ready: false, resolve, n: opts.length, sel: 0 };
    dchoices.innerHTML = '';
    opts.forEach((o, i) => {
      const li = document.createElement('li');
      li.textContent = o;
      li.addEventListener('click', () => { if (RT.ui && RT.ui.mode === 'ask' && RT.ui.ready) { RT.ui.sel = i; renderChoices(); pressA(); } });
      dchoices.appendChild(li);
    });
    typeText(text, () => { if (RT.ui) { RT.ui.ready = true; dchoices.hidden = false; renderChoices(); } });
  });
}

export function renderChoices() {
  const sel = RT.ui ? RT.ui.sel : -1;
  [...dchoices.children].forEach((li, i) => li.classList.toggle('sel', i === sel));
}
export function closeBox() { dialog.hidden = true; RT.ui = null; }

/** A pressed while the box is open: finish typing, continue, or confirm the choice. */
export function uiA() {
  if (RT.typing) { RT.typing.finish(); return; }
  if (!RT.ui || !RT.ui.ready) return;
  const u = RT.ui;
  RT.ui = null;
  u.resolve(u.mode === 'ask' ? u.sel : 0);
}
export function uiMove(dir: Dir) {
  const u = RT.ui;
  if (!u || u.mode !== 'ask' || !u.ready) return;
  if (dir === 'up') u.sel = (u.sel - 1 + u.n) % u.n;
  if (dir === 'down') u.sel = (u.sel + 1) % u.n;
  renderChoices();
}

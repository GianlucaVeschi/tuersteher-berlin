import { pressA } from '../input';
import { RT } from '../core/runtime';
import { $, reduceMotion } from '../util';
/* ================= DIALOG ================= */
export const dialog = $('#dialog'), dtext = $('#dtext'), dchoices = $('#dchoices'), dmore = $('#dmore');
export function typeText(text, done) {
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
export function say(text) {
  return new Promise(resolve => {
    dialog.hidden = false; dchoices.hidden = true; dmore.hidden = true;
    RT.ui = { mode: 'say', ready: false, resolve };
    typeText(text, () => { if (RT.ui) { RT.ui.ready = true; dmore.hidden = false; } });
  });
}
export function ask(text, opts) {
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
export function renderChoices() { [...dchoices.children].forEach((li, i) => li.classList.toggle('sel', i === RT.ui.sel)); }
export function closeBox() { dialog.hidden = true; RT.ui = null; }
export function uiA() {
  if (RT.typing) { RT.typing.finish(); return; }
  if (!RT.ui || !RT.ui.ready) return;
  const u = RT.ui;
  if (u.mode === 'say') { RT.ui = null; u.resolve(); }
  else { RT.ui = null; u.resolve(u.sel); }
}
export function uiMove(dir) {
  if (!RT.ui || RT.ui.mode !== 'ask' || !RT.ui.ready) return;
  if (dir === 'up') RT.ui.sel = (RT.ui.sel - 1 + RT.ui.n) % RT.ui.n;
  if (dir === 'down') RT.ui.sel = (RT.ui.sel + 1) % RT.ui.n;
  renderChoices();
}

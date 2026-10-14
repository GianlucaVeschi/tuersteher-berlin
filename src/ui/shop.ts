import { save } from '../core/save';
import { renderCard } from './card';
import { CLUBS } from '../data/clubs';
import { player, state } from '../core/state';
import { OUTFITS, TAG_LABEL, charById, dressOK } from '../data/outfits';
import { RT } from '../core/runtime';
import { lookOf } from '../render/looks';
import { person } from '../render/sprites';
import { $ } from '../util';
/* ================= SHOP ================= */
export const shopEl = $('#shop'), shopList = $('#shopList'), shopMsg = $('#shopMsg'), shopTags = $('#shopTags'), shopFits = $('#shopFits');
export const previewCtx = $('#shopPreview').getContext('2d');
export function drawMini(g, id) {
  g.clearRect(0, 0, 16, 16);
  person(g, 0, 0, 'down', 0, lookOf(id));
}
export function openShop(sh) {
  RT.busy = true;
  RT.shopUI = { shop: sh, sel: 0 };
  $('#shopName').textContent = sh.name.toUpperCase();
  $('#shopArea').textContent = sh.area;
  shopMsg.textContent = sh.line;
  shopList.innerHTML = '';
  const own = charById(state.char);
  const entries = (own && !sh.items.includes(own.outfit) ? [own.outfit] : []).concat(sh.items, '__leave');
  entries.forEach((id, i) => {
    const li = document.createElement('li');
    if (id === '__leave') {
      li.innerHTML = '<span class="mini"></span><span class="nm">Leave shop</span>';
    } else {
      li.innerHTML = '<canvas class="mini" width="16" height="16"></canvas><span class="nm"></span>';
      li.querySelector('.nm').textContent = OUTFITS[id].name;
      drawMini(li.querySelector('canvas').getContext('2d'), id);
    }
    li.addEventListener('click', () => { if (!RT.shopUI) return; RT.shopUI.sel = i; renderShop(); shopA(); });
    shopList.appendChild(li);
  });
  RT.shopUI.entries = entries;
  shopEl.hidden = false;
  renderShop();
}
export function renderShop() {
  const { entries, sel } = RT.shopUI;
  [...shopList.children].forEach((li, i) => {
    li.classList.toggle('sel', i === sel);
    li.classList.toggle('worn', entries[i] === state.outfit);
  });
  const id = entries[sel] === '__leave' ? state.outfit : entries[sel];
  drawMini(previewCtx, id);
  shopTags.textContent = OUTFITS[id].tags.map(t => TAG_LABEL[t]).join(' · ');
  const fits = CLUBS.filter(c => dressOK(c.id, id)).map(c => c.name);
  shopFits.textContent = fits.length ? 'Gets you past: ' + fits.join(', ') : 'No club will take this.';
}
export function shopMove(dir) {
  if (!RT.shopUI) return;
  const n = RT.shopUI.entries.length;
  if (dir === 'up' || dir === 'left') RT.shopUI.sel = (RT.shopUI.sel - 1 + n) % n;
  if (dir === 'down' || dir === 'right') RT.shopUI.sel = (RT.shopUI.sel + 1) % n;
  renderShop();
}
export function shopA() {
  if (!RT.shopUI) return;
  const id = RT.shopUI.entries[RT.shopUI.sel];
  if (id === '__leave') { leaveShop(); return; }
  if (state.outfit === id) { shopMsg.textContent = "You're already wearing that."; return; }
  state.outfit = id;
  shopMsg.textContent = 'You change in the fitting room: ' + OUTFITS[id].name + '.';
  renderShop(); renderCard(); save();
}
export function leaveShop() {
  const sh = RT.shopUI.shop;
  RT.shopUI = null; shopEl.hidden = true;
  player.x = player.tx = sh.dx; player.y = player.ty = sh.by; player.dir = 'down';
  save();
  RT.busy = false;
}

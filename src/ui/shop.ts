import { track } from '../core/monitoring';
import { save } from '../core/save';
import { renderCard } from './card';
import { CLUBS } from '../data/clubs';
import { player, state } from '../core/state';
import { OUTFITS, TAG_LABEL, charById, dressOK } from '../data/outfits';
import { RT } from '../core/runtime';
import { lookOf } from '../render/looks';
import { person } from '../render/sprites';
import { $ } from '../util';
import type { Dir, Shop } from '../types';

const LEAVE = '__leave';
/* ================= SHOP ================= */
export const shopEl = $('#shop'), shopList = $('#shopList'), shopMsg = $('#shopMsg'), shopTags = $('#shopTags'), shopFits = $('#shopFits');
export const previewCtx = $<HTMLCanvasElement>('#shopPreview').getContext('2d')!;
/** The player in a given outfit, as a 16x16 icon. */
export function drawMini(g: CanvasRenderingContext2D, id: string) {
  g.clearRect(0, 0, 16, 16);
  person(g, 0, 0, 'down', 0, lookOf(id));
}
export function openShop(sh: Shop) {
  RT.busy = true;
  const own = charById(state.char);
  // your own starting clothes are always on offer, then the shop's stock
  const entries = (own && !sh.items.includes(own.outfit) ? [own.outfit] : []).concat(sh.items, LEAVE);
  RT.shopUI = { shop: sh, sel: 0, entries };
  $('#shopName').textContent = sh.name.toUpperCase();
  $('#shopArea').textContent = sh.area;
  shopMsg.textContent = sh.line;
  shopList.innerHTML = '';
  entries.forEach((id, i) => {
    const li = document.createElement('li');
    if (id === LEAVE) {
      li.innerHTML = '<span class="mini"></span><span class="nm">Leave shop</span>';
    } else {
      li.innerHTML = '<canvas class="mini" width="16" height="16"></canvas><span class="nm"></span>';
      li.querySelector('.nm')!.textContent = OUTFITS[id].name;
      drawMini(li.querySelector('canvas')!.getContext('2d')!, id);
    }
    li.addEventListener('click', () => { if (!RT.shopUI) return; RT.shopUI.sel = i; renderShop(); shopA(); });
    shopList.appendChild(li);
  });
  shopEl.hidden = false;
  renderShop();
}
export function renderShop() {
  if (!RT.shopUI) return;
  const { entries, sel } = RT.shopUI;
  [...shopList.children].forEach((li, i) => {
    li.classList.toggle('sel', i === sel);
    li.classList.toggle('worn', entries[i] === state.outfit);
  });
  // the list scrolls inside its box: keep the selected outfit in view
  shopList.children[sel]?.scrollIntoView({ block: 'nearest' });
  const id = entries[sel] === LEAVE ? state.outfit : entries[sel];
  drawMini(previewCtx, id);
  shopTags.textContent = OUTFITS[id].tags.map(t => TAG_LABEL[t]).join(' · ');
  const fits = CLUBS.filter(c => dressOK(c.id, id)).map(c => c.name);
  shopFits.textContent = fits.length ? 'Gets you past: ' + fits.join(', ') : 'No club will take this.';
}
export function shopMove(dir: Dir) {
  const ui = RT.shopUI;
  if (!ui) return;
  const n = ui.entries.length;
  if (dir === 'up' || dir === 'left') ui.sel = (ui.sel - 1 + n) % n;
  if (dir === 'down' || dir === 'right') ui.sel = (ui.sel + 1) % n;
  renderShop();
}
export function shopA() {
  if (!RT.shopUI) return;
  const id = RT.shopUI.entries[RT.shopUI.sel];
  if (id === LEAVE) { leaveShop(); return; }
  if (state.outfit === id) { shopMsg.textContent = "You're already wearing that."; return; }
  state.outfit = id;
  track('outfit_changed', { outfit: id, shop: RT.shopUI.shop.id });
  shopMsg.textContent = 'You change in the fitting room: ' + OUTFITS[id].name + '.';
  renderShop(); renderCard(); save();
}
export function leaveShop() {
  if (!RT.shopUI) return;
  const sh = RT.shopUI.shop;
  RT.shopUI = null; shopEl.hidden = true;
  player.x = player.tx = sh.dx; player.y = player.ty = sh.by; player.dir = 'down';
  save();
  RT.busy = false;
}

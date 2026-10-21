import { showCardQuests } from './ui/card';
import { closeMissions, missionsOpen } from './ui/missions';
import { openPlayers } from './ui/players';
import { playEnding } from './ui/ending';
import { musicDebug, toggleSound } from './audio/music';
import { drawPhotoStrip } from './quests/kitkat';
import { inside } from './ui/inside';
import { $ } from './util';
import { cvs } from './render/canvas';
import { placeFollower } from './interiors/follower';
import { CLUBS } from './data/clubs';
import { enterClub } from './interiors/transitions';
import { save } from './core/save';
import { toggleMap, zoom, zoomIn, zoomOut } from './render/zoom';
import { interact } from './game/scripts';
import { held, player, state } from './core/state';
import { uiA, uiMove } from './ui/dialog';
import { leaveShop, shopA, shopMove } from './ui/shop';
import { creatorA, creatorB, creatorMove } from './ui/creator';
import { startGame } from './game/loop';
import { RT } from './core/runtime';
import type { Dir } from './types';

declare global {
  interface Window { __game?: unknown }
}

/* ================= INPUT ================= */
export function pressA() {
  if (RT.runner) { RT.runner.jump(); return; }
  if (RT.titleOn) { startGame(); return; }
  if (RT.creator) { creatorA(); return; }
  if (RT.photoResolve) { RT.photoResolve(); return; }
  if (RT.insideResolve) { RT.insideResolve(); return; }
  if (RT.shopUI) { shopA(); return; }
  if (RT.ui || RT.typing) { uiA(); return; }
  if (RT.busy || player.moving || zoom.fit) return;
  interact();
}
export function pressB() {
  if (RT.runner) return;
  if (missionsOpen()) { closeMissions(); return; }
  if (RT.creator) { creatorB(); return; }
  if (RT.photoResolve) { RT.photoResolve(); return; }
  if (RT.insideResolve) { RT.insideResolve(); return; }
  if (RT.shopUI) { leaveShop(); return; }
  if (RT.typing) { RT.typing.finish(); return; }
  if (RT.ui && RT.ui.mode === 'say') { uiA(); return; }
  // nothing else open: B leaves the whole-map view
  if (zoom.fit && !RT.ui) toggleMap();
}
export function pressDir(dir: Dir) {
  if (RT.runner) { RT.runner.dir(dir); return; }
  if (RT.creator) { creatorMove(dir); return; }
  if (RT.shopUI) { shopMove(dir); return; }
  if (!held.includes(dir)) held.push(dir);
  if (RT.ui) uiMove(dir);
}
export function releaseDir(dir: Dir) { RT.runner?.release?.(dir); const i = held.indexOf(dir); if (i >= 0) held.splice(i, 1); }

const KEYMAP: Record<string, Dir> = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
const isRunKey = (code: string) => code === 'Tab' || code === 'ShiftLeft' || code === 'ShiftRight';

function onKeyDown(ev: KeyboardEvent) {
  const target = ev.target instanceof HTMLElement ? ev.target : null;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
  const dir = KEYMAP[ev.code];
  if (dir) {
    ev.preventDefault();
    if (!ev.repeat) pressDir(dir);
    else if (RT.creator) creatorMove(dir);
    else if (RT.shopUI) shopMove(dir);
    else if (RT.ui) uiMove(dir);
    return;
  }
  if (isRunKey(ev.code)) {
    // let Tab move focus normally inside the stamp card
    if (ev.code === 'Tab' && target && target.closest('.card')) return;
    ev.preventDefault(); RT.runKey = true; return;
  }
  if (['KeyZ', 'Enter', 'Space'].includes(ev.code)) {
    if (ev.code === 'Space' || ev.code === 'Enter') {
      if (target && target.tagName === 'BUTTON' && target.id === 'reset') return;
      ev.preventDefault();
    }
    if (!ev.repeat) pressA();
    return;
  }
  if (ev.code === 'Equal' || ev.code === 'NumpadAdd') { ev.preventDefault(); zoomIn(); return; }
  if (ev.code === 'Minus' || ev.code === 'NumpadSubtract') { ev.preventDefault(); zoomOut(); return; }
  if (ev.code === 'KeyM' && !ev.repeat) { toggleMap(); return; }
  if (ev.code === 'KeyN' && !ev.repeat) { toggleSound(); return; }
  if (ev.code === 'KeyG' && !ev.repeat) { openPlayers(); return; }
  if (['KeyX', 'Escape', 'Backspace'].includes(ev.code)) { ev.preventDefault(); if (!ev.repeat) pressB(); }
}

/* Touch on the map: drag to walk (like a joystick), tap for A. */
function endTouch() {
  if (!RT.touch) return;
  if (RT.touch.dir) releaseDir(RT.touch.dir);
  else if (!RT.touch.menu) pressA();
  RT.touch = null;
}

/* Joystick: hold it and slide your thumb to walk, change direction without lifting, past the rim to run. */
function initStick() {
  const stick = $('#stick'), knob = $('#stickKnob');
  let id: number | null = null, dir: Dir | null = null;
  const set = (d: Dir | null) => {
    if (d === dir) return;
    if (dir) releaseDir(dir);
    dir = d;
    if (d) pressDir(d);
  };
  const move = (ev: PointerEvent) => {
    const r = stick.getBoundingClientRect(), R = r.width / 2;
    const dx = ev.clientX - (r.left + R), dy = ev.clientY - (r.top + R), d = Math.hypot(dx, dy);
    const k = Math.min(1, (R * 0.5) / (d || 1));
    knob.style.transform = `translate(${dx * k}px, ${dy * k}px)`;
    RT.runStick = d > R * 1.05;
    set(d < R * 0.22 ? null : Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  };
  const end = () => {
    id = null; set(null); RT.runStick = false;
    knob.style.transform = ''; stick.classList.remove('on');
  };
  stick.addEventListener('pointerdown', ev => {
    ev.preventDefault();
    id = ev.pointerId; stick.classList.add('on');
    try { stick.setPointerCapture(ev.pointerId); } catch { /* not supported */ }
    move(ev);
  });
  stick.addEventListener('pointermove', ev => { if (ev.pointerId === id) move(ev); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => stick.addEventListener(t, ev => { if ((ev as PointerEvent).pointerId === id) end(); }));
  stick.addEventListener('contextmenu', ev => ev.preventDefault());
}

/* Stamp card sheet (mobile). */
const cardEl = $('#card');
function setCard(open: boolean) {
  cardEl.classList.toggle('open', open);
  $('#cardBtn').setAttribute('aria-expanded', String(open));
  if (open) { held.length = 0; showCardQuests(); }
}

let wheelAt = 0;

/** iPhones zoom the whole page on a pinch (say a thumb on the joystick and another finger on the
 *  screen) or a double tap, and Safari ignores user-scalable=no. Block both: Safari's own gesture
 *  events and any two-finger move (the card sheet still scrolls with one finger). Double taps are
 *  handled in CSS: touch-action none on the handheld, manipulation everywhere else. */
function blockPageZoom() {
  const stop = (ev: Event) => ev.preventDefault();
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(t => document.addEventListener(t, stop, { passive: false }));
  // a second finger landing is the start of a pinch: stop it there, not only once it moves
  // (buttons and the joystick listen to pointer events, which still fire)
  document.addEventListener('touchstart', ev => { if (ev.touches.length > 1) ev.preventDefault(); }, { passive: false });
  document.addEventListener('touchmove', ev => { if (ev.touches.length > 1) ev.preventDefault(); }, { passive: false });
}

/** Wires up keyboard, touch, mouse wheel and on-screen buttons. */
export function initInput() {
  blockPageZoom();
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', ev => {
    if (isRunKey(ev.code)) RT.runKey = false;
    const dir = KEYMAP[ev.code]; if (dir) releaseDir(dir);
  });
  window.addEventListener('blur', () => { held.length = 0; RT.runKey = false; RT.runBtn = false; RT.runStick = false; });
  // Keep the latest position when the tab is hidden or closed.
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });
  window.addEventListener('pagehide', save);
  // Open the page with ?debug to inspect game state from the browser console (window.__game).
  if (/[?&]debug\b/.test(location.search)) window.__game = {
    player, state, held, get busy() { return RT.busy; }, get scene() { return RT.scene; }, get follower() { return RT.follower; },
    music: musicDebug,
    ending: () => playEnding(),
    enterClub: (id: string) => { const c = CLUBS.find(cl => cl.id === id); if (c) enterClub(c, true); },
    tp(x: number, y: number, dir?: Dir) { player.x = player.tx = x; player.y = player.ty = y; player.moving = false; if (dir) player.dir = dir; placeFollower(); }
  };

  cvs.addEventListener('pointerdown', ev => {
    if (ev.pointerType === 'mouse') return;
    ev.preventDefault();
    RT.touch = { x: ev.clientX, y: ev.clientY, dir: null };
    try { cvs.setPointerCapture(ev.pointerId); } catch { /* not supported */ }
  });
  cvs.addEventListener('pointermove', ev => {
    const touch = RT.touch;
    if (!touch) return;
    const dx = ev.clientX - touch.x, dy = ev.clientY - touch.y;
    touch.far = Math.hypot(dx, dy) > 70;
    if (Math.hypot(dx, dy) < 18) return;
    const dir: Dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    if (dir === touch.dir) return;
    if (touch.dir) releaseDir(touch.dir);
    touch.dir = dir;
    pressDir(dir);
    // In menus each drag step moves the cursor once: re-anchor so the next swipe counts again.
    if (RT.ui || RT.shopUI) { touch.x = ev.clientX; touch.y = ev.clientY; releaseDir(dir); touch.dir = null; touch.menu = true; }
  });
  cvs.addEventListener('pointerup', endTouch);
  cvs.addEventListener('pointercancel', () => { if (RT.touch && RT.touch.dir) releaseDir(RT.touch.dir); RT.touch = null; });
  cvs.addEventListener('contextmenu', ev => ev.preventDefault());
  // Tapping the text box advances it.
  $('#dialog').addEventListener('click', ev => {
    if (ev.target instanceof Element && ev.target.closest('li')) return;
    if (RT.ui && RT.ui.mode === 'ask' && !RT.typing) return;
    pressA();
  });

  $('#cardBtn').addEventListener('click', () => setCard(!cardEl.classList.contains('open')));
  $('#cardClose').addEventListener('click', () => setCard(false));
  window.addEventListener('keydown', ev => { if (ev.code === 'Escape' && cardEl.classList.contains('open')) setCard(false); }, true);

  initStick();
  ([['#btnA', pressA], ['#btnB', pressB]] as const).forEach(([sel, fn]) => {
    const btn = $(sel);
    // holding B also makes you run
    btn.addEventListener('pointerdown', ev => { ev.preventDefault(); btn.classList.add('on'); if (sel === '#btnB') RT.runBtn = true; fn(); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => btn.addEventListener(t, () => { btn.classList.remove('on'); if (sel === '#btnB') RT.runBtn = false; }));
    btn.addEventListener('keydown', ev => { if (ev.code === 'Enter' || ev.code === 'Space') { ev.stopPropagation(); ev.preventDefault(); fn(); } });
  });
  $('#title').addEventListener('click', () => { if (RT.titleOn) startGame(); });
  $('#zoomIn').addEventListener('click', zoomIn);
  $('#zoomOut').addEventListener('click', zoomOut);
  $('#zoomMap').addEventListener('click', toggleMap);
  cvs.addEventListener('wheel', ev => {
    ev.preventDefault();
    if (performance.now() - wheelAt < 180) return;
    wheelAt = performance.now();
    if (ev.deltaY < 0) zoomIn(); else if (ev.deltaY > 0) zoomOut();
  }, { passive: false });
  inside.addEventListener('click', () => { if (RT.insideResolve) RT.insideResolve(); });
  // photo booth strip: save a big copy as PNG, or close
  $('#photoClose').addEventListener('click', () => { if (RT.photoResolve) RT.photoResolve(); });
  $('#photoSave').addEventListener('click', () => {
    const big = document.createElement('canvas');
    drawPhotoStrip(big, 8);
    const a = document.createElement('a');
    a.href = big.toDataURL('image/png'); a.download = 'kitkat-photo-booth.png';
    document.body.appendChild(a); a.click(); a.remove();
  });
}

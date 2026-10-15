import { forgetPlayer } from '../online/api';
import { closeBox } from './dialog';
import { inside } from './inside';
import { creatorEl } from './creator';
import { RT } from '../core/runtime';
import { updateFloorTag } from '../interiors/transitions';
import { SCENES, inClub, useScene } from '../world/scenes';
import { releaseFollower } from '../interiors/follower';
import { questHint } from '../quests/sisyphos';
import { QUEST_LIST, questCount, questDone } from '../quests/quests';
import { INTERIORS } from '../data/interiors';
import { drawMini, shopEl } from './shop';
import { save, stampCount } from '../core/save';
import { DRESS, OUTFITS, dressOK } from '../data/outfits';
import { shade } from '../render/sprites';
import { HG_START, START, newPfand, player, state } from '../core/state';
import { CLUBS } from '../data/clubs';
import { $ } from '../util';
/* ================= STAMP CARD ================= */
export function renderCard() {
  const ol = $('#stamps');
  ol.innerHTML = '';
  CLUBS.forEach(c => {
    const done = !!state.stamps[c.id];
    const li = document.createElement('li');
    li.innerHTML = `<span class="st${done ? ' done' : ''}" style="--c:${shade(c.glow, 0.62)}">${done ? c.initials : '?'}</span>
      <div><b></b><small></small></div>`;
    li.querySelector('b')!.textContent = c.name;
    li.querySelector('small')!.textContent = `${c.area} · ${c.need} questions${done ? ' · in' : ''}`;
    const dc = document.createElement('small'); dc.className = 'dress' + (dressOK(c.id, state.outfit) ? ' ok' : '');
    dc.textContent = (dressOK(c.id, state.outfit) ? '✓ ' : '✗ ') + DRESS[c.id].hint;
    li.querySelector('div')!.appendChild(dc);
    ol.appendChild(li);
  });
  const n = stampCount();
  $('#count').textContent = String(n);
  $('#countTotal').textContent = String(CLUBS.length);
  $('#cardBtnCount').textContent = `${n}/${CLUBS.length}`;
  drawMini($<HTMLCanvasElement>('#mbarMini').getContext('2d')!, state.outfit);
  $('#wearing').textContent = OUTFITS[state.outfit].name;
  drawMini($<HTMLCanvasElement>('#wearingMini').getContext('2d')!, state.outfit);
  $('#hud').textContent = `STEMPEL ${n}/${CLUBS.length}`;
  // side quests for every club you have been inside
  const qs = $('#quests'), ql = $('#questList');
  const clubsIn = Object.keys(INTERIORS).filter(id => state.visited[id]);
  qs.hidden = !clubsIn.length;
  if (!qs.hidden) {
    ql.innerHTML = '';
    let total = 0, doneAll = 0;
    clubsIn.forEach(clubId => QUEST_LIST(clubId).forEach((q, qi) => {
      total++; if (questDone(clubId, q.id)) doneAll++;
      if (qi === 0) {
        const h = document.createElement('li'); h.className = 'qclub';
        h.textContent = `${INTERIORS[clubId].name} · ${questCount(clubId)}/${QUEST_LIST(clubId).length}`;
        ql.appendChild(h);
      }
      const done = questDone(clubId, q.id);
      const li = document.createElement('li');
      li.className = done ? 'done' : '';
      li.innerHTML = '<span class="qmark"></span><div><b></b><small></small></div>';
      li.querySelector('.qmark')!.textContent = done ? '✓' : '○';
      li.querySelector('b')!.textContent = q.title;
      li.querySelector('small')!.textContent = done ? 'Done' : questHint(clubId, q);
      ql.appendChild(li);
    }));
    $('#questCount').textContent = `${doneAll}/${total}`;
  }
}
const resetBtn = $<HTMLButtonElement>('#reset');
let armTimer: ReturnType<typeof setTimeout> | undefined;
/** "Start over": the first click arms the button, the second one wipes all progress. */
export function initCard() {
resetBtn.addEventListener('click', () => {
  if (!resetBtn.classList.contains('armed')) {
    resetBtn.classList.add('armed'); resetBtn.textContent = 'Click again to erase stamps';
    clearTimeout(armTimer);
    armTimer = setTimeout(() => { resetBtn.classList.remove('armed'); resetBtn.textContent = 'Start over'; }, 3000);
    return;
  }
  clearTimeout(armTimer);
  resetBtn.classList.remove('armed'); resetBtn.textContent = 'Start over';
  resetGame();
});
}

/** Wipes all progress and goes back to the title screen. */
export function resetGame() {
  state.stamps = {}; state.intro = false; state.finale = false; state.outfit = 'tourist'; state.char = null;
  state.quests = {}; state.visited = {}; state.sunrise = {}; state.coatNo = 0; state.kStage = 0; state.mdStage = 0; state.pfand = newPfand(); state.heard = {}; state.danced = {}; state.kkStripped = false; state.gone = {}; state.hgTime = HG_START; state.hgStage = 0; state.cdvCash = 0; state.hair = null;
  // a new game is a new entry on the guest list
  state.name = null; state.playMs = 0; state.finishPlayMs = null; state.onlineFinished = false; forgetPlayer();
  releaseFollower();
  Object.values(SCENES).forEach(sc => sc.ents.forEach(e => { if (e.home && e.movedWhen) { e.x = e.home.x; e.y = e.home.y; } })); if (inClub()) useScene('city'); updateFloorTag();
  if (RT.creator) { RT.creator = null; creatorEl.hidden = true; }
  if (RT.shopUI) { RT.shopUI = null; shopEl.hidden = true; }
  RT.ents.forEach(e => { if (e.club) { e.x = e.club.dx; e.ox = 0; e.dir = 'down'; } });
  // street NPCs who walked off come back
  RT.ents.forEach(e => { if (e.npcId && e.home) { e.x = e.home.x; e.y = e.home.y; e.ox = 0; e.alpha = 1; } });
  player.x = player.tx = START.x; player.y = player.ty = START.y; player.dir = START.dir; player.moving = false;
  if (RT.insideResolve) { inside.hidden = true; RT.insideResolve = null; RT.overlayClub = null; }
  closeBox(); if (RT.typing) { clearInterval(RT.typing.id); RT.typing = null; }
  RT.busy = true; RT.titleOn = true; $('#title').hidden = false;
  $('#titlePress').textContent = 'PRESS A';
  renderCard(); save();
}

import { RT } from '../core/runtime';
import { held, state } from '../core/state';
import { INTERIORS } from '../data/interiors';
import { QUEST_LIST, questCount, questDone } from '../quests/quests';
import { questHint } from '../quests/sisyphos';
import { inClub, sceneClub } from '../world/scenes';
import { $ } from '../util';

/* ================= MISSIONS (phones) ================= */
// On desktop the side quests sit in the stamp card next to the game. On phones the card is a sheet
// behind the top-bar badge, so a QUESTS button on the game screen opens this panel instead: the club
// you're in first (with live hints), then every other club you've been inside.

const btn = $<HTMLButtonElement>('#questsBtn');
const panel = $('#missions');
const list = $('#missionsList');
let open = false;
let wasBusy = false;

/** Clubs with side quests you've been inside, the one you're in first. */
function clubsToShow(): string[] {
  const here = inClub() ? sceneClub() : '';
  const visited = Object.keys(INTERIORS).filter(id => state.visited[id] && QUEST_LIST(id).length);
  return here && QUEST_LIST(here).length ? [here, ...visited.filter(id => id !== here)] : visited;
}

/** The button's label: this club's progress inside a club, everything on the street. */
export function updateQuestsBtn() {
  const here = inClub() ? sceneClub() : '';
  if (here && QUEST_LIST(here).length) {
    btn.textContent = `QUESTS ${questCount(here)}/${QUEST_LIST(here).length}`;
    btn.hidden = false;
    return;
  }
  const clubs = clubsToShow();
  btn.hidden = !clubs.length;
  const done = clubs.reduce((n, id) => n + questCount(id), 0), total = clubs.reduce((n, id) => n + QUEST_LIST(id).length, 0);
  btn.textContent = `QUESTS ${done}/${total}`;
}

function render() {
  list.innerHTML = '';
  const clubs = clubsToShow();
  if (!clubs.length) {
    const li = document.createElement('li'); li.className = 'mq-empty';
    li.textContent = 'Get inside a club to unlock its side quests.';
    list.appendChild(li);
    return;
  }
  clubs.forEach((clubId, ci) => {
    const h = document.createElement('li'); h.className = 'mq-club' + (ci === 0 && inClub() && sceneClub() === clubId ? ' here' : '');
    h.textContent = `${INTERIORS[clubId].name} · ${questCount(clubId)}/${QUEST_LIST(clubId).length}`;
    list.appendChild(h);
    QUEST_LIST(clubId).forEach(q => {
      const done = questDone(clubId, q.id);
      const li = document.createElement('li'); li.className = 'mq' + (done ? ' done' : '');
      li.innerHTML = '<span class="mq-mark"></span><div><b></b><small></small></div>';
      li.querySelector('.mq-mark')!.textContent = done ? '✓' : '○';
      li.querySelector('b')!.textContent = q.title;
      li.querySelector('small')!.textContent = done ? 'Done' : questHint(clubId, q);
      list.appendChild(li);
    });
  });
}

export function openMissions() {
  if (open || RT.runner) return;
  open = true;
  wasBusy = RT.busy; RT.busy = true; held.length = 0;
  render();
  panel.hidden = false;
  list.scrollTop = 0;
  $('#missionsClose').focus();
}
export function closeMissions() {
  if (!open) return;
  open = false;
  panel.hidden = true;
  RT.busy = wasBusy;
}
export const missionsOpen = () => open;

export function initMissions() {
  btn.addEventListener('click', ev => { ev.stopPropagation(); openMissions(); });
  $('#missionsClose').addEventListener('click', closeMissions);
  panel.addEventListener('click', ev => { if (ev.target === panel) closeMissions(); });
  // while it's open, keys belong to it: Escape / X / B close, nothing reaches the game
  window.addEventListener('keydown', ev => {
    if (!open) return;
    if (['Escape', 'KeyX', 'Backspace'].includes(ev.code)) { ev.preventDefault(); closeMissions(); }
    if (!(ev.target instanceof HTMLButtonElement && (ev.code === 'Enter' || ev.code === 'Space' || ev.code === 'Tab'))) ev.stopImmediatePropagation();
  }, true);
  updateQuestsBtn();
}

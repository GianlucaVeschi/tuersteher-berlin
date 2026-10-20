import { RT } from '../core/runtime';
import { held } from '../core/state';
import { CLUBS } from '../data/clubs';
import { INTERIORS } from '../data/interiors';
import { charById } from '../data/outfits';
import { lookFor } from '../render/looks';
import { person } from '../render/sprites';
import { listPlayers, myUid, type PlayerRow } from '../online/api';
import { $ } from '../util';

/* ================= THE GUEST LIST ================= */
// Who finished (fastest first), who is furthest still out, who just arrived; the section headers count the people shown.

const panel = $('#players');
const body = $('#playersBody');
const statusEl = $('#playersStatus');
let open = false;
let wasBusy = false;

const TOTAL_QUESTS = Object.values(INTERIORS).reduce((n, c) => n + c.quests.length, 0);
const shortId = (uid: string) => '#' + uid.slice(0, 4).toLowerCase();

function fmtDur(ms: number): string {
  const min = Math.round(ms / 60000);
  if (min < 1) return 'under a minute';
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60), m = min % 60;
  if (h < 48) return m ? `${h} h ${m} min` : `${h} h`;
  return `${Math.floor(h / 24)} days ${h % 24} h`;
}
function fmtAgo(iso: string | null): string {
  if (!iso) return '';
  const s = (Date.now() - Date.parse(iso)) / 1000;
  if (s < 90) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} days ago`;
}
const fmtDate = (iso: string | null) => iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '–';

function row(p: PlayerRow, me: string | null): HTMLElement {
  const li = document.createElement('li');
  li.className = 'pl-row' + (p.uid === me ? ' me' : '');
  const cv = document.createElement('canvas');
  cv.width = 16; cv.height = 16; cv.className = 'pl-sprite';
  const ch = charById(p.char);
  if (ch) person(cv.getContext('2d')!, 0, 0, 'down', 0, lookFor(ch));
  const who = document.createElement('div');
  who.className = 'pl-who';
  const nm = document.createElement('b'); nm.textContent = p.name;
  const id = document.createElement('span'); id.className = 'pl-id'; id.textContent = shortId(p.uid) + (p.uid === me ? ' · you' : '');
  const since = document.createElement('small'); since.textContent = 'Arrived ' + fmtDate(p.createdAt);
  who.append(nm, id, since);
  const stats = document.createElement('div');
  stats.className = 'pl-stats';
  const clubs = document.createElement('span'); clubs.textContent = `${p.stamps}/${CLUBS.length} clubs`;
  const quests = document.createElement('span'); quests.textContent = `${Math.min(p.quests, TOTAL_QUESTS)}/${TOTAL_QUESTS} quests`; // old entries counted stray keys
  stats.append(clubs, quests);
  const st = document.createElement('div');
  st.className = 'pl-status';
  if (p.finishedAt) {
    st.classList.add('done');
    st.textContent = p.finishPlayMs !== null ? `✓ Finished in ${fmtDur(p.finishPlayMs)} of play` : '✓ Finished (before the guest list)';
    if (p.createdAt) {
      const s = document.createElement('small');
      s.textContent = `${fmtDur(Date.parse(p.finishedAt) - Date.parse(p.createdAt))} after arriving`;
      st.append(s);
    }
  } else {
    st.textContent = p.stamps || p.quests ? `Partying · ${fmtDur(p.playMs)} so far` : 'Just entered a name';
    const s = document.createElement('small'); s.textContent = 'Seen ' + fmtAgo(p.lastSeen);
    st.append(s);
  }
  li.append(cv, who, stats, st);
  return li;
}

function section(title: string, rows: PlayerRow[], me: string | null) {
  if (!rows.length) return;
  const h = document.createElement('h3'); h.textContent = `${title} · ${rows.length}`;
  const ol = document.createElement('ol'); ol.className = 'pl-list';
  rows.forEach(p => ol.append(row(p, me)));
  body.append(h, ol);
}

async function load() {
  statusEl.textContent = 'Checking the guest list…';
  body.innerHTML = '';
  try {
    const { rows, total, finished: finishedTotal } = await listPlayers();
    const me = myUid();
    const t = (iso: string | null) => (iso ? Date.parse(iso) : 0);
    const finished = rows.filter(r => r.finishedAt)
      .sort((a, b) => (a.finishPlayMs ?? Infinity) - (b.finishPlayMs ?? Infinity) || t(a.finishedAt) - t(b.finishedAt));
    const partying = rows.filter(r => !r.finishedAt && (r.stamps || r.quests))
      .sort((a, b) => b.stamps - a.stamps || b.quests - a.quests || t(b.lastSeen) - t(a.lastSeen));
    const arrived = rows.filter(r => !r.finishedAt && !r.stamps && !r.quests).sort((a, b) => t(b.createdAt) - t(a.createdAt));
    statusEl.textContent = total ? `${total} ${total === 1 ? 'person' : 'people'} on the list. ${finishedTotal} got into every club.` : 'Nobody here yet. Be the first.';
    section('Finished', finished, me);
    section('Still partying', partying, me);
    section('Just arrived', arrived, me);
  } catch (err) {
    console.warn('[guest list]', err);
    statusEl.textContent = "Couldn't reach the guest list. Check your connection and try again.";
  }
}

export function openPlayers() {
  if (open) return;
  open = true;
  wasBusy = RT.busy; RT.busy = true; held.length = 0;
  panel.hidden = false;
  $('#playersClose').focus();
  void load();
}
export function closePlayers() {
  if (!open) return;
  open = false;
  panel.hidden = true;
  RT.busy = wasBusy;
}
export const playersOpen = () => open;

export function initPlayers() {
  $('#playersBtn').addEventListener('click', openPlayers);
  $('#titlePlayers').addEventListener('click', ev => { ev.stopPropagation(); openPlayers(); });
  $('#playersClose').addEventListener('click', closePlayers);
  $('#playersRefresh').addEventListener('click', () => void load());
  panel.addEventListener('click', ev => { if (ev.target === panel) closePlayers(); });
  // while the list is open, keys belong to it: Escape closes, nothing reaches the game
  window.addEventListener('keydown', ev => {
    if (!open) return;
    if (ev.code === 'Escape') { ev.preventDefault(); closePlayers(); }
    if (!(ev.target instanceof HTMLButtonElement && (ev.code === 'Enter' || ev.code === 'Space' || ev.code === 'Tab'))) ev.stopImmediatePropagation();
  }, true);
}

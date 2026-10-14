import { state } from '../core/state';
import { CLUBS } from '../data/clubs';
import { writePlayer, type Plain } from './api';

/* ================= ONLINE SYNC ================= */
// Keeps your public entry on the guest list up to date: on joining, new stamps and quests,
// finishing, every couple of minutes while you play, and when you leave the page.

const HEARTBEAT = 120_000;
/** after a failed write, wait this long before the heartbeat tries again */
const RETRY = 30_000;
let timer: ReturnType<typeof setTimeout> | null = null;
let lastSync = 0;
/** last time a write was tried, failed or not (keeps the heartbeat from retrying every frame) */
let lastTry = 0;
let busy = false;
let finishPending = false;

/** Your entry, from the save. */
function fields(): Record<string, Plain> {
  const clubs = CLUBS.filter(c => state.stamps[c.id]).map(c => c.id);
  return {
    name: state.name || '?',
    char: state.char || '',
    clubs,
    stamps: clubs.length,
    quests: Math.min(100, Object.keys(state.quests).length),
    playMs: Math.round(state.playMs),
    finishPlayMs: state.finishPlayMs
  };
}

async function push(keepalive = false) {
  if (!state.name || busy) return;
  busy = true;
  lastTry = Date.now();
  const finish = finishPending;
  try {
    await writePlayer(fields(), { finish }, keepalive);
    if (finish) { finishPending = false; state.onlineFinished = true; }
    lastSync = Date.now();
  } catch (err) {
    console.warn('[guest list] sync failed', err);
  } finally {
    busy = false;
  }
}

/** Sync soon (several changes in a row become one write). */
export function syncSoon(delay = 2500) {
  if (!state.name) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => { timer = null; void push(); }, delay);
}
/** Sync right away (joining, finishing). */
export function syncNow() { if (timer) { clearTimeout(timer); timer = null; } void push(); }

/** All eight stamps: record the finish once, with the play time at that moment.
 *  legacy: finished before the guest list existed, so there is no play time to report. */
export function syncFinish(legacy = false) {
  if (state.onlineFinished) return;
  if (state.finishPlayMs === null && !legacy) state.finishPlayMs = Math.round(state.playMs);
  finishPending = true;
  syncNow();
}

/** Called every frame: a heartbeat every couple of minutes so "last seen" and play time stay fresh. */
export function syncTick() {
  const now = Date.now();
  if (state.name && !timer && !busy && now - lastSync > HEARTBEAT && now - lastTry > RETRY) syncSoon(0);
}

/** One last write when the page is hidden or closed. */
export function initSync() {
  const leave = () => { if (state.name && !busy) void push(true); };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') leave(); });
  window.addEventListener('pagehide', leave);
}

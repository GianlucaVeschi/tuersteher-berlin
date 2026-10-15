import { rsoDance, rsoFloorsDanced } from './rso';
import { hgDance } from './heide';
import { cdvDance, cdvHint } from './cdv';
import { MD_HINTS } from './mdma';
import type { BottleType, Entity, QuestDef } from '../types';
import { completeQuest } from './quests';
import { say } from '../ui/dialog';
import { K_HINTS } from '../effects/trip';
import { INK } from '../util';
import { ctx } from '../render/canvas';
import { renderCard } from '../ui/card';
import { save } from '../core/save';
import { toast } from '../interiors/transitions';
import { state } from '../core/state';
/* ---- Sisyphos: Pfand, stories, dancing in every room ---- */
// German bottle deposit: reusable beer bottles 8 ct, Club-Mate 15 ct, cans 25 ct.
export const PFAND: Record<BottleType, { name: string; cents: number }> = { beer: { name: 'beer bottle', cents: 8 }, mate: { name: 'Club-Mate bottle', cents: 15 }, can: { name: 'can', cents: 25 } };
export const PFAND_GOAL = 8, CARRY_MAX = 4;
export const euro = (c: number) => '€' + (c / 100).toFixed(2);
/** Picks up an empty bottle if your hands aren't full. */
export function pickBottle(e: Entity): boolean {
  const p = state.pfand;
  if (!e.bid || !e.type) return false;
  if (p.carry >= CARRY_MAX) { toast('HANDS FULL · BRING THEM TO A BAR'); return false; }
  p.taken[e.bid] = true; p.carry++; p.carryCents += PFAND[e.type].cents;
  toast(`+1 ${PFAND[e.type].name.toUpperCase()} · ${p.carry}/${CARRY_MAX} IN HANDS`);
  save(); renderCard();
  return true;
}
export function drawBottle(X: number, Y: number, type: BottleType, now: number) {
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(X + 5, Y + 13, 6, 2);
  if (type === 'can') {
    ctx.fillStyle = INK; ctx.fillRect(X + 5, Y + 6, 6, 8);
    ctx.fillStyle = '#c0c4cc'; ctx.fillRect(X + 6, Y + 7, 4, 6);
    ctx.fillStyle = '#ff5e7a'; ctx.fillRect(X + 6, Y + 9, 4, 2);
  } else {
    const glass = type === 'mate' ? '#2f6b3a' : '#6b3d1a';
    ctx.fillStyle = INK; ctx.fillRect(X + 5, Y + 6, 6, 8); ctx.fillRect(X + 6, Y + 3, 4, 4);
    ctx.fillStyle = glass; ctx.fillRect(X + 6, Y + 7, 4, 6); ctx.fillRect(X + 7, Y + 4, 2, 3);
    if (type === 'mate') { ctx.fillStyle = '#f2c14e'; ctx.fillRect(X + 6, Y + 9, 4, 2); }
  }
  // a glint so you spot them
  if (Math.floor(now / 400 + X) % 5 === 0) { ctx.fillStyle = '#fff'; ctx.fillRect(X + 7, Y + 7, 1, 2); }
}
/** Quest hint on the stamp card, with live progress for counting quests. */
export function questHint(clubId: string, q: QuestDef): string {
  if (clubId === 'berghain' && q.id === 'toilet' && K_HINTS[state.kStage]) return K_HINTS[state.kStage];
  if (clubId === 'cdv') return cdvHint(q.id, q.hint);
  if (q.id === 'mdma' && MD_HINTS[state.mdStage]) return MD_HINTS[state.mdStage];
  if (q.id === 'pfand') { const p = state.pfand; return `Returned ${p.returned}/${PFAND_GOAL} · in hands ${p.carry}/${CARRY_MAX} · ${euro(p.cents)} earned. Any bar takes them back.`; }
  if (q.id === 'stories') return `${Object.keys(state.heard).length}/3 heard. ` + q.hint;
  if (q.id === 'floors') return `${rsoFloorsDanced()}/3 floors. ` + q.hint;
  if (q.id === 'b2b') return hgHint(q.hint);
  if (q.id === 'hopper') return `${roomsDanced(clubId)}/4 rooms. ` + q.hint;
  return q.hint;
}
export const roomsDanced = (clubId: string) => Object.keys(state.danced).filter(k => k.startsWith(clubId + ':')).length;
export const SISY_DANCE: Record<string, string> = {
  strand: '(Barefoot in the sand, sun on your neck. Someone hands you a slice of watermelon.)',
  wg: "(Glass walls, plants, house music. In the Wintergarten it's always the good part of the afternoon.)",
  hh: '(The Hammahalle kick drum hits like a hammer. Fair enough.)',
  df: '(The whole Dampfer seems to sway like a ship. Or is that you?)',
  tn: '(Red lanterns swing above you. The Tunnel goes on forever.)'
};
/** Club-specific reactions to dancing (floor id as argument). */
export const DANCE_HOOKS: Record<string, (fl: string) => Promise<void>> = {
  rso: rsoDance,
  heidegluehen: hgDance,
  cdv: cdvDance,
  async sisyphos(fl) {
    await say(SISY_DANCE[fl] || '(You dance. Nobody is in a hurry here.)');
    if (!state.danced['sisyphos:' + fl]) { state.danced['sisyphos:' + fl] = true; save(); renderCard(); }
    const n = roomsDanced('sisyphos');
    if (n >= 4) await completeQuest('sisyphos', 'hopper');
    else toast(`DANCED IN ${n}/4 ROOMS`);
  }
};

/** Stamp card hint for the Heideglühen back to back, by how far you've got. */
function hgHint(base: string): string {
  if (state.hgStage === 1) return "Woody, the booker, is watching the booth from the dancefloor. Get him to leave it for a bit.";
  if (state.hgStage === 2) return "Woody is off by the fire. Back to the DJ, quick.";
  return base;
}

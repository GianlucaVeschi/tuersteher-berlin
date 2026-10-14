import { RT } from '../core/runtime';
import { state } from '../core/state';
import { save } from '../core/save';
import { CLUBS } from '../data/clubs';
import { lookOf } from '../render/looks';
import { person } from '../render/sprites';
import { euro } from '../quests/sisyphos';
import { ask, closeBox, say } from './dialog';
import { resetGame } from './card';
import { $, INK, circle, reduceMotion, wait } from '../util';

/* ================= THE ENDING ================= */
// After the last stamp: you wake up in your childhood bedroom back home, and the game roasts you.

const W = 192, H = 128;
const endEl = $('#ending');
const endTitle = $('#endTitle');
const cv = $<HTMLCanvasElement>('#endCanvas');
const g = cv.getContext('2d')!;
g.imageSmoothingEnabled = false;

const P = (x: number, y: number, w: number, h: number, c: string) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
type Pose = 'sleep' | 'sit' | 'stand';

/** Draws the bedroom at time t (ms since the ending started). */
function drawRoom(t: number, pose: Pose, ringing: boolean) {
  const dawn = reduceMotion ? 1 : Math.min(1, t / 3500);
  // wall with old wallpaper, wooden floor
  P(0, 0, W, 70, '#5a4a6a');
  for (let x = 0; x < W; x += 8) P(x, 0, 2, 70, '#64547a');
  P(0, 68, W, 2, '#3a2e44');
  P(0, 70, W, H - 70, '#7a5434');
  for (let y = 74; y < H; y += 6) P(0, y, W, 1, '#6a4628');
  // the window: night turning into morning
  const sky = g.createLinearGradient(0, 12, 0, 48);
  sky.addColorStop(0, `rgb(${30 + 160 * dawn},${40 + 120 * dawn},${90 + 80 * dawn})`);
  sky.addColorStop(1, `rgb(${60 + 195 * dawn},${50 + 140 * dawn},${70 + 40 * dawn})`);
  P(18, 10, 44, 40, INK); g.fillStyle = sky; g.fillRect(20, 12, 40, 36);
  circle(g, 40, Math.round(52 - 20 * dawn), 6, `rgba(255,${200 + 40 * dawn},120,${dawn})`);
  P(39, 12, 2, 36, '#e9e4d6'); P(20, 29, 40, 2, '#e9e4d6');
  P(16, 8, 48, 3, '#c94a3a'); P(14, 8, 6, 44, '#c94a3a'); P(60, 8, 6, 44, '#c94a3a');
  // posters from back when you dreamt about Berlin
  P(74, 12, 26, 34, INK); P(75, 13, 24, 32, '#0c0c12'); circle(g, 87, 28, 7, '#ff4d6d'); circle(g, 87, 28, 2, '#0c0c12');
  g.font = '8px "Press Start 2P", monospace'; g.textBaseline = 'top';
  g.fillStyle = '#fff2b0'; g.fillText('DJ', 80, 37);
  P(104, 16, 30, 22, INK); P(105, 17, 28, 20, '#2bb3a3'); g.fillStyle = INK; g.fillText('BER', 107, 20); g.fillText('LIN', 107, 28);
  // a desk with the cheap controller you bought in year one
  P(140, 52, 46, 4, '#6b4a2e'); P(142, 56, 3, 22, '#5a3d24'); P(181, 56, 3, 22, '#5a3d24');
  P(146, 46, 34, 6, INK); circle(g, 154, 49, 3, '#3a3a44'); circle(g, 172, 49, 3, '#3a3a44'); P(161, 47, 4, 4, '#ff8c42');
  // clothes on the floor, an empty Club-Mate
  P(150, 104, 18, 5, '#e04f5f'); P(156, 101, 10, 4, '#26243a');
  P(176, 96, 4, 10, '#2f6b3a'); P(176, 99, 4, 3, '#f2c14e');
  // the bed
  P(28, 76, 84, 32, INK); P(30, 78, 80, 28, '#e9e4d6');
  P(30, 74, 6, 36, '#5a3d24'); P(106, 80, 6, 30, '#5a3d24');
  P(36, 80, 18, 10, '#ffffff');
  // nightstand and the alarm clock
  const shake = ringing && !reduceMotion ? Math.round(Math.sin(t / 25)) : 0;
  P(114, 86, 18, 22, '#6b4a2e'); P(114, 86, 18, 2, '#7d5838');
  P(117 + shake, 78, 12, 8, INK); P(118 + shake, 79, 10, 6, '#1a1a1a');
  g.fillStyle = '#ff3b3b'; g.font = '8px monospace'; g.fillText('9:12', 118 + shake, 78);
  if (ringing) { g.fillStyle = '#fff2b0'; g.font = '8px "Press Start 2P", monospace'; g.fillText('RRRING', 108 + shake, 64); }

  // you
  const L = lookOf(state.outfit);
  if (pose === 'sleep') {
    g.save(); g.translate(44, 92); g.rotate(-Math.PI / 2); person(g, -8, -8, 'down', 0, L); g.restore();
    P(54, 86, 52, 18, '#3d5f94'); P(54, 86, 52, 2, '#5a7aa8');
    if (!ringing && !reduceMotion) {
      const z = (t / 600) % 1;
      g.globalAlpha = 1 - z; g.fillStyle = '#e9e4d6'; g.fillText('z', 54 + z * 10, 74 - z * 14); g.globalAlpha = 1;
    }
  } else if (pose === 'sit') {
    P(30, 92, 76, 14, '#3d5f94');
    person(g, 92, 74, 'down', 0, L);
  } else {
    P(30, 92, 76, 14, '#3d5f94');
    person(g, 120, 96, 'down', 0, L);
  }
  // morning light falling through the window
  g.fillStyle = `rgba(255,220,150,${0.18 * dawn})`;
  g.beginPath(); g.moveTo(20, 48); g.lineTo(60, 48); g.lineTo(110, H); g.lineTo(50, H); g.closePath(); g.fill();
}

/** The roast, built from what you actually did. */
function roast(): string[] {
  const lines = [
    "It's been seven years. You moved to Berlin to become a DJ.",
    'Your SoundCloud has 14 followers. Three of them are your mum.',
    `You got into all ${CLUBS.length} clubs. Your bank account never got in anywhere.`
  ];
  if (state.pfand.cents > 0) lines.push(`Your biggest income in seven years: ${euro(state.pfand.cents)} in Pfand bottles.`);
  if (state.hgStage === 3) lines.push('You did play one back to back. At five in the morning. Woody says it was "fine".');
  lines.push(
    "Your German is still 'Einen Club-Mate, bitte'.",
    "You're broke, you're back at your mum's, and she just asked what 'Heute nicht' means.",
    'But hey. At least you had fun.'
  );
  return lines;
}

let raf = 0;
/** Plays the whole ending. Resolves when the player picks what to do next. */
export async function playEnding() {
  RT.busy = true;
  RT.ending = true;
  const t0 = performance.now();
  let pose: Pose = 'sleep', ringing = false;
  const loop = (now: number) => { drawRoom(now - t0, pose, ringing); raf = requestAnimationFrame(loop); };
  endEl.hidden = false; endEl.classList.remove('show'); endTitle.hidden = true;
  raf = requestAnimationFrame(loop);
  void endEl.offsetWidth; endEl.classList.add('show');

  await wait(reduceMotion ? 300 : 2600);
  ringing = true;
  await wait(reduceMotion ? 300 : 1600);
  ringing = false; pose = 'sit';
  await say('(Your old childhood bedroom. The posters are still on the wall.)');
  closeBox();
  pose = 'stand';
  endTitle.hidden = false;
  await wait(reduceMotion ? 300 : 1800);
  await say('Congratulations. You completed Berlin.');
  for (const l of roast()) await say(l);
  const next = await ask('THE END. Berlin is still out there.', ['Back to Berlin', 'Start over']);
  closeBox();

  cancelAnimationFrame(raf);
  endEl.hidden = true; endTitle.hidden = true;
  RT.ending = false;
  save();
  if (next === 1) { resetGame(); return; }
  RT.busy = false;
}

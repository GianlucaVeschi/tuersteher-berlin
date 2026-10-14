import { RT } from '../core/runtime';
import { inClub } from '../world/scenes';
import { $ } from '../util';
import * as S from './synth';
import { STYLES, styleForClub, styleForScene, type Style } from './styles';

/* ================= MUSIC ================= */
// Every club floor has its own generated music (see styles.ts); the street has soft ambient.
// Browsers only allow sound after a click or key press, so nothing plays before that.

const PREF_KEY = 'tuersteher-sound';
/** fade-in of the new place's music, and the faster fade-out of the old one */
const FADE_IN = 1.5, FADE_OUT = 0.5;
const LOOKAHEAD = 0.12;

/** One running style: a sixteenth-note scheduler feeding its own gain, filter and effect sends. */
class Track {
  private out: GainNode;
  /** the reverb send's own fader: the reverb must fade out with the track too */
  private wetOut: GainNode;
  private input: GainNode;
  private wet: GainNode;
  private stabIn: GainNode;
  private timer: ReturnType<typeof setInterval> | null = null;
  private next = 0;
  private step = 0;
  private arpN = 0;
  private stopHiss: (() => void) | null = null;

  constructor(private style: Style, cutoff?: number) {
    const c = S.audioCtx();
    this.out = c.createGain();
    this.out.gain.value = 0.0001;
    this.out.connect(S.masterOut());
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = cutoff ?? style.cutoff ?? 20000;
    this.input = c.createGain();
    this.input.gain.value = style.level ?? 1;
    this.input.connect(lp).connect(this.out);
    // reverb send, filtered the same way so a muffled room stays muffled
    this.wet = c.createGain();
    this.wet.gain.value = style.space ?? 0.2;
    const wlp = c.createBiquadFilter();
    wlp.type = 'lowpass'; wlp.frequency.value = cutoff ?? style.cutoff ?? 20000;
    this.wetOut = c.createGain();
    this.wetOut.gain.value = 0.0001;
    this.wet.connect(wlp).connect(this.wetOut).connect(S.reverbIn());
    // stabs can also go through a dub echo
    this.stabIn = c.createGain();
    this.stabIn.connect(this.input);
    if (style.delay) {
      const d = c.createDelay(2), fb = c.createGain(), dlp = c.createBiquadFilter(), send = c.createGain();
      d.delayTime.value = (60 / style.bpm) * 0.75;
      fb.gain.value = 0.48; dlp.type = 'lowpass'; dlp.frequency.value = 1600; send.gain.value = style.delay;
      this.stabIn.connect(send).connect(d);
      d.connect(dlp).connect(fb).connect(d);
      dlp.connect(this.input);
    }
  }

  start() {
    const c = S.audioCtx();
    this.next = c.currentTime + 0.05;
    for (const g of [this.out, this.wetOut]) {
      g.gain.setValueAtTime(0.0001, c.currentTime);
      g.gain.linearRampToValueAtTime(1, c.currentTime + FADE_IN);
    }
    if (this.style.ambient) this.stopHiss = S.hiss({ dry: this.input, wet: this.wet }, c.currentTime, 0.012, 450);
    this.timer = setInterval(() => this.schedule(), 25);
    this.schedule();
  }

  /** Stops scheduling right away, fades the music and its reverb send, then disconnects everything. */
  stop() {
    const c = S.audioCtx();
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    for (const g of [this.out, this.wetOut]) {
      g.gain.cancelScheduledValues(c.currentTime);
      g.gain.setValueAtTime(Math.max(0.0001, g.gain.value), c.currentTime);
      g.gain.linearRampToValueAtTime(0.0001, c.currentTime + FADE_OUT);
    }
    setTimeout(() => {
      this.stopHiss?.();
      this.out.disconnect();
      this.wetOut.disconnect();
    }, FADE_OUT * 1000 + 100);
  }

  private schedule() {
    const c = S.audioCtx();
    while (this.next < c.currentTime + LOOKAHEAD) {
      this.play(this.step, this.next);
      const s16 = 60 / this.style.bpm / 4, sw = this.style.swing ?? 0;
      this.next += s16 * (this.step % 2 === 0 ? 1 + sw : 1 - sw);
      this.step++;
    }
  }

  private play(n: number, t: number) {
    const s = this.style, i = n % 16, bar = Math.floor(n / 16);
    const per = s.barsPerChord ?? 2;
    const chord = s.chords[Math.floor(bar / per) % s.chords.length];
    const voiced = (octave = 1) => chord.map(o => s.root + 12 + 12 * octave + o);
    const o: S.Out = { dry: this.input, wet: this.wet };
    const s16 = 60 / s.bpm / 4;
    if (s.ambient) { this.ambient(n, t, chord, o); return; }

    const vel = (p?: string) => (p ? (p[i] === 'x' ? 1 : p[i] === 'o' ? 0.5 : 0) : 0);
    const brk = !!s.breaks && bar % 16 >= 14;
    let v: number;
    if (!brk && (v = vel(s.kick))) S.kick(o, t, 0.9 * v, s.kickPitch, s.kickDecay, s.rumble ?? 0);
    if ((v = vel(s.clap))) S.clap(o, t, 0.45 * v);
    if ((v = vel(s.hat))) S.hat(o, t, 0.1 * v);
    if ((v = vel(s.ohat))) S.hat(o, t, 0.08 * v, true);
    if ((v = vel(s.rim))) S.rim(o, t, 0.07 * v);
    if (s.perc && s.perc[i] !== '.') S.tom(o, t, 0.16, s.perc[i] === 'x' ? 230 : 150);
    if (s.bass && !brk) {
      const st = s.bass.steps[i];
      if (st !== null && st !== undefined) S.bass(o, t, s.root + chord[0] + st, s16 * 0.9, s.bass.level ?? 0.25, { wave: s.bass.wave, cutoff: s.bass.cutoff, acid: s.bass.acid });
    }
    if (s.stab && (v = vel(s.stab.steps))) S.stab({ dry: this.stabIn, wet: this.wet }, t, voiced(s.stab.octave ?? 1), (s.stab.level ?? 0.1) * v, s.stab.cutoff, s.stab.decay, s.stab.wave);
    if (s.piano && (v = vel(s.piano.steps))) S.piano(o, t, voiced(s.piano.octave ?? 1), (s.piano.level ?? 0.15) * v);
    if (s.pad && i === 0 && bar % per === 0) S.pad(o, t, voiced(s.pad.octave ?? 1), s16 * 16 * per, s.pad.level ?? 0.03, s.pad.cutoff);
    if (s.arp && vel(s.arp.steps)) {
      const notes = voiced(s.arp.octave ?? 2);
      S.pluck(o, t, notes[this.arpN++ % notes.length], s.arp.level ?? 0.08, s.arp.marimba);
    }
  }

  /** No drums: a new pad chord every eight seconds, and now and then a bell from the chord. */
  private ambient(n: number, t: number, chord: number[], o: S.Out) {
    const s = this.style;
    const notes = chord.map(c => s.root + 12 + c);
    if (n % 32 === 0) S.pad(o, t, notes, 8.4, s.pad?.level ?? 0.05, s.pad?.cutoff ?? 900);
    if (n % 4 === 0 && Math.random() < 0.3) S.bell(o, t, notes[Math.floor(Math.random() * notes.length)] + 12, 0.07);
  }
}

let enabled = true;
let unlocked = false;
/** the first click was on the sound button itself: that click only starts the audio */
let skipToggle = false;
let current: Track | null = null;
let currentKey = '';

function readPref() { try { return localStorage.getItem(PREF_KEY) !== 'off'; } catch { return true; } }
function writePref() { try { localStorage.setItem(PREF_KEY, enabled ? 'on' : 'off'); } catch { /* storage blocked */ } }

let forced: string | null = null;
/** What should be playing right now. */
function target(): { id: string; cutoff?: number } {
  if (forced) return { id: forced };
  if (RT.titleOn || RT.creator) return { id: 'city' };
  if (RT.overlayClub) return styleForClub(RT.overlayClub);
  if (inClub()) return styleForScene(RT.scene);
  return { id: 'city' };
}

/** Called every frame: switches style (with a crossfade) when the place changes. */
export function updateMusic() {
  if (!unlocked || !enabled) return;
  const want = target();
  const key = want.id + '@' + (want.cutoff ?? '');
  if (key === currentKey) return;
  currentKey = key;
  current?.stop();
  const style = STYLES[want.id] ?? STYLES.city;
  current = new Track(style, want.cutoff);
  current.start();
}

/** ?debug helpers: force a style (null to go back to normal), read what's playing and how loud. */
export const musicDebug = {
  force(id: string | null) { forced = id; },
  get key() { return currentKey; },
  get state() { return S.audioCtx().state; },
  level: () => S.outputLevel(),
  styles: () => Object.keys(STYLES)
};

function stopAll() {
  current?.stop();
  current = null;
  currentKey = '';
}

function renderButton() {
  const b = $('#soundBtn');
  b.classList.toggle('off', !enabled);
  b.setAttribute('aria-pressed', String(enabled));
  b.setAttribute('aria-label', enabled ? 'Sound off' : 'Sound on');
}

/** Sound on/off (button, or N on the keyboard). Remembered per browser. */
export function toggleSound() {
  if (skipToggle) { skipToggle = false; return; }
  enabled = !enabled;
  writePref();
  renderButton();
  if (!enabled) { stopAll(); return; }
  if (unlocked) { void S.audioCtx().resume(); updateMusic(); }
}

/** Waits for the first click or key press, then starts the audio. */
export function initMusic() {
  enabled = readPref();
  renderButton();
  const unlock = (ev: Event) => {
    if (unlocked) return;
    unlocked = true;
    skipToggle = ev.target instanceof Element && !!ev.target.closest('#soundBtn');
    if (enabled) { void S.audioCtx().resume(); updateMusic(); }
  };
  window.addEventListener('pointerdown', unlock, { capture: true });
  window.addEventListener('keydown', unlock, { capture: true });
  $('#soundBtn').addEventListener('click', toggleSound);
  // pause the music while the tab is in the background
  document.addEventListener('visibilitychange', () => {
    if (!unlocked) return;
    if (document.visibilityState === 'hidden') void S.audioCtx().suspend();
    else if (enabled) void S.audioCtx().resume();
  });
}

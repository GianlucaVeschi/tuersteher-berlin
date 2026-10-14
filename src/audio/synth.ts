// Small Web Audio synth: drums and instruments made from oscillators and noise.
// Every voice is scheduled at an exact time `t` (AudioContext seconds) and cleans itself up.

let ac: AudioContext | null = null;
let master: GainNode;
let reverb: ConvolverNode;
let noise: AudioBuffer;

/** The shared audio context. Created on first use (after a click or key press, as browsers require). */
export function audioCtx(): AudioContext {
  if (ac) return ac;
  ac = new AudioContext();
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -14; comp.ratio.value = 4;
  master = ac.createGain();
  master.gain.value = 0.32;
  master.connect(comp).connect(ac.destination);
  noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  // a generated room: two seconds of decaying stereo noise
  reverb = ac.createConvolver();
  const len = Math.floor(ac.sampleRate * 2.2), ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  reverb.buffer = ir;
  const revGain = ac.createGain(); revGain.gain.value = 0.5;
  reverb.connect(revGain).connect(master);
  return ac;
}
export const masterOut = () => { audioCtx(); return master; };

let meter: AnalyserNode | null = null;
/** Peak and RMS of the music output right now (for ?debug checks). */
export function outputLevel(): { peak: number; rms: number } {
  const c = audioCtx();
  if (!meter) { meter = c.createAnalyser(); meter.fftSize = 2048; master.connect(meter); }
  const buf = new Float32Array(meter.fftSize);
  meter.getFloatTimeDomainData(buf);
  let peak = 0, sum = 0;
  for (const x of buf) { peak = Math.max(peak, Math.abs(x)); sum += x * x; }
  return { peak, rms: Math.sqrt(sum / buf.length) };
}
export const reverbIn = () => { audioCtx(); return reverb; };

export const midiHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

/** Where a voice goes: the track's dry input and its reverb send. */
export interface Out { dry: AudioNode; wet: AudioNode }

function env(g: GainNode, t: number, peak: number, attack: number, decay: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}
function noiseSrc(t: number, dur: number) {
  const c = audioCtx(), s = c.createBufferSource();
  s.buffer = noise;
  s.start(t, Math.random() * 0.5);
  s.stop(t + dur);
  return s;
}

/* ---------- drums ---------- */

/** Four-on-the-floor kick. rumble > 0 also sends a low, washed-out copy to the reverb (techno rumble). */
export function kick(o: Out, t: number, v: number, pitch = 48, decay = 0.42, rumble = 0) {
  const c = audioCtx(), osc = c.createOscillator(), g = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(pitch * 3.2, t);
  osc.frequency.exponentialRampToValueAtTime(pitch, t + 0.09);
  env(g, t, v, 0.004, decay);
  osc.connect(g).connect(o.dry);
  if (rumble > 0) {
    const lp = c.createBiquadFilter(), rg = c.createGain();
    lp.type = 'lowpass'; lp.frequency.value = 140; rg.gain.value = rumble;
    g.connect(lp).connect(rg).connect(o.wet);
  }
  osc.start(t); osc.stop(t + decay + 0.1);
}
export function clap(o: Out, t: number, v: number) {
  const c = audioCtx(), bp = c.createBiquadFilter(), g = c.createGain();
  bp.type = 'bandpass'; bp.frequency.value = 1300; bp.Q.value = 0.9;
  g.gain.setValueAtTime(0.0001, t);
  [0, 0.011, 0.023].forEach(d => { g.gain.setValueAtTime(v, t + d); g.gain.exponentialRampToValueAtTime(v * 0.3, t + d + 0.009); });
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  noiseSrc(t, 0.25).connect(bp).connect(g);
  g.connect(o.dry); g.connect(o.wet);
}
export function hat(o: Out, t: number, v: number, open = false) {
  const c = audioCtx(), hp = c.createBiquadFilter(), g = c.createGain();
  hp.type = 'highpass'; hp.frequency.value = 7200;
  env(g, t, v, 0.002, open ? 0.26 : 0.035);
  noiseSrc(t, open ? 0.35 : 0.08).connect(hp).connect(g).connect(o.dry);
}
/** Short click, for minimal grooves. */
export function rim(o: Out, t: number, v: number) {
  const c = audioCtx(), osc = c.createOscillator(), hp = c.createBiquadFilter(), g = c.createGain();
  osc.type = 'square'; osc.frequency.value = 1750;
  hp.type = 'highpass'; hp.frequency.value = 900;
  env(g, t, v, 0.001, 0.025);
  osc.connect(hp).connect(g).connect(o.dry);
  osc.start(t); osc.stop(t + 0.05);
}
/** A soft hand drum (bongo/conga-ish). */
export function tom(o: Out, t: number, v: number, hz: number) {
  const c = audioCtx(), osc = c.createOscillator(), g = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(hz * 1.6, t); osc.frequency.exponentialRampToValueAtTime(hz, t + 0.04);
  env(g, t, v, 0.003, 0.18);
  osc.connect(g); g.connect(o.dry); g.connect(o.wet);
  osc.start(t); osc.stop(t + 0.25);
}

/* ---------- tonal ---------- */

export interface BassOpts { wave?: OscillatorType; cutoff?: number; q?: number; acid?: boolean }
/** Bass note through a lowpass with a short filter sweep (a squelchy one when acid). */
export function bass(o: Out, t: number, midi: number, dur: number, v: number, opts: BassOpts = {}) {
  const c = audioCtx(), osc = c.createOscillator(), lp = c.createBiquadFilter(), g = c.createGain();
  const cut = opts.cutoff ?? 400;
  osc.type = opts.wave ?? 'sawtooth';
  osc.frequency.value = midiHz(midi);
  lp.type = 'lowpass'; lp.Q.value = opts.acid ? 14 : (opts.q ?? 2);
  lp.frequency.setValueAtTime(cut * (opts.acid ? 7 : 2.5), t);
  lp.frequency.exponentialRampToValueAtTime(cut, t + (opts.acid ? 0.16 : 0.08));
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + 0.006);
  g.gain.setValueAtTime(v, t + dur * 0.8);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(lp).connect(g).connect(o.dry);
  osc.start(t); osc.stop(t + dur + 0.05);
}
/** A short chord hit. */
export function stab(o: Out, t: number, notes: number[], v: number, cutoff = 1800, decay = 0.25, wave: OscillatorType = 'sawtooth') {
  const c = audioCtx(), lp = c.createBiquadFilter(), g = c.createGain();
  lp.type = 'lowpass'; lp.frequency.value = cutoff;
  env(g, t, v, 0.004, decay);
  lp.connect(g); g.connect(o.dry); g.connect(o.wet);
  notes.forEach((m, i) => {
    const osc = c.createOscillator();
    osc.type = wave; osc.frequency.value = midiHz(m); osc.detune.value = (i % 2 ? 6 : -6);
    osc.connect(lp); osc.start(t); osc.stop(t + decay + 0.1);
  });
}
/** House piano: bright attack, quick decay. */
export function piano(o: Out, t: number, notes: number[], v: number) {
  const c = audioCtx();
  notes.forEach(m => {
    const a = c.createOscillator(), b = c.createOscillator(), g = c.createGain(), bg = c.createGain();
    a.type = 'triangle'; a.frequency.value = midiHz(m);
    b.type = 'sine'; b.frequency.value = midiHz(m) * 2; bg.gain.value = 0.35;
    env(g, t, v / notes.length * 1.6, 0.003, 0.9);
    a.connect(g); b.connect(bg).connect(g);
    g.connect(o.dry); g.connect(o.wet);
    a.start(t); b.start(t); a.stop(t + 1); b.stop(t + 1);
  });
}
/** Long soft chord with a slow attack. */
export function pad(o: Out, t: number, notes: number[], dur: number, v: number, cutoff = 1200) {
  const c = audioCtx(), lp = c.createBiquadFilter(), g = c.createGain();
  lp.type = 'lowpass'; lp.frequency.value = cutoff;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(v, t + Math.min(1.2, dur * 0.4));
  g.gain.setValueAtTime(v, t + dur * 0.8);
  g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.6);
  lp.connect(g); g.connect(o.dry); g.connect(o.wet);
  notes.forEach(m => [-7, 7].forEach(dt => {
    const osc = c.createOscillator();
    osc.type = 'sawtooth'; osc.frequency.value = midiHz(m); osc.detune.value = dt;
    osc.connect(lp); osc.start(t); osc.stop(t + dur + 0.7);
  }));
}
/** Plucked note; marimba adds a woody overtone. */
export function pluck(o: Out, t: number, midi: number, v: number, marimba = false) {
  const c = audioCtx(), a = c.createOscillator(), g = c.createGain();
  a.type = marimba ? 'sine' : 'triangle'; a.frequency.value = midiHz(midi);
  env(g, t, v, 0.002, marimba ? 0.35 : 0.22);
  a.connect(g);
  if (marimba) {
    const b = c.createOscillator(), bg = c.createGain();
    b.type = 'sine'; b.frequency.value = midiHz(midi) * 4; bg.gain.value = 0.25;
    b.connect(bg).connect(g); b.start(t); b.stop(t + 0.4);
  }
  g.connect(o.dry); g.connect(o.wet);
  a.start(t); a.stop(t + 0.45);
}
/* Formants (resonances that make the vowel) of a soprano singing "ah", "oh", "oo" and "eh":
   [frequency in Hz, gain] for the first three. */
const VOWELS: Record<string, [number, number][]> = {
  a: [[800, 1], [1150, 0.5], [2900, 0.25]],
  o: [[450, 1], [800, 0.45], [2830, 0.15]],
  u: [[325, 1], [700, 0.25], [2530, 0.1]],
  e: [[400, 1], [1700, 0.45], [2700, 0.25]]
};
/** A synthesized diva "ooh/aah": two detuned saws through vowel formants, sliding up into the
 *  note, with vibrato that starts after the attack. No samples, so it sounds like a retro synth singer. */
export function voice(o: Out, t: number, midi: number, dur: number, v: number, vowel = 'a') {
  const c = audioCtx(), g = c.createGain(), mix = c.createGain(), hz = midiHz(midi);
  const lfo = c.createOscillator(), depth = c.createGain();
  lfo.frequency.value = 5.6; depth.gain.setValueAtTime(0, t); depth.gain.linearRampToValueAtTime(hz * 0.012, t + Math.min(0.35, dur * 0.6));
  lfo.connect(depth);
  (VOWELS[vowel] || VOWELS.a).forEach(([f, gain]) => {
    const bp = c.createBiquadFilter(), fg = c.createGain();
    bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 9; fg.gain.value = gain;
    mix.connect(bp).connect(fg).connect(g);
  });
  [-5, 5].forEach(dt => {
    const osc = c.createOscillator();
    osc.type = 'sawtooth'; osc.detune.value = dt;
    osc.frequency.setValueAtTime(hz * 0.97, t); osc.frequency.exponentialRampToValueAtTime(hz, t + 0.07);
    depth.connect(osc.frequency);
    osc.connect(mix); osc.start(t); osc.stop(t + dur + 0.35);
  });
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v * 3, t + 0.06);
  g.gain.setValueAtTime(v * 3, t + dur * 0.85);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.3);
  g.connect(o.dry); g.connect(o.wet);
  lfo.start(t); lfo.stop(t + dur + 0.35);
}
/** A soft bell, for the ambient street music. */
export function bell(o: Out, t: number, midi: number, v: number) {
  const c = audioCtx(), a = c.createOscillator(), b = c.createOscillator(), g = c.createGain(), bg = c.createGain();
  a.type = 'sine'; a.frequency.value = midiHz(midi);
  b.type = 'sine'; b.frequency.value = midiHz(midi) * 2.76; bg.gain.value = 0.18;
  env(g, t, v, 0.01, 3.2);
  a.connect(g); b.connect(bg).connect(g);
  g.connect(o.dry); g.connect(o.wet);
  a.start(t); b.start(t); a.stop(t + 3.4); b.stop(t + 3.4);
}
/** A quiet bed of filtered noise (wind, distant traffic). Returns a stop function. */
export function hiss(o: Out, t: number, v: number, hz = 500): () => void {
  const c = audioCtx(), s = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain();
  s.buffer = noise; s.loop = true;
  bp.type = 'bandpass'; bp.frequency.value = hz; bp.Q.value = 0.6;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 3);
  s.connect(bp).connect(g).connect(o.dry);
  s.start(t);
  return () => { try { s.stop(); } catch { /* already stopped */ } };
}

// One music style per club floor, generated live by audio/music.ts.
// Patterns are 16 steps (sixteenth notes) per bar: 'x' hit, 'o' soft hit, '.' rest.
// Chords are semitone offsets from `root` (the bass note's MIDI number); the first offset is the chord's bass note.
// Bass steps are semitones above the current chord's bass note, or null for a rest.

export interface Style {
  bpm: number;
  /** 0..0.3, delays every second sixteenth (house shuffle) */
  swing?: number;
  root: number;
  chords: number[][];
  /** bars per chord (default 2) */
  barsPerChord?: number;
  kick?: string; clap?: string; hat?: string; ohat?: string; rim?: string;
  /** hand drums: 'x' high, 'o' low */
  perc?: string;
  bass?: { steps: (number | null)[]; wave?: OscillatorType; cutoff?: number; level?: number; acid?: boolean };
  stab?: { steps: string; wave?: OscillatorType; cutoff?: number; decay?: number; level?: number; octave?: number };
  piano?: { steps: string; level?: number; octave?: number };
  pad?: { cutoff?: number; level?: number; octave?: number };
  /** a sung line (audio/synth.ts voice): one entry per sixteenth, looping. A number is a note
   *  (semitones above root + 12 × (octave + 1)), '-' holds the note before, null is a rest.
   *  `vowels` cycles through a/o/u/e, one letter per note. */
  vocal?: { notes: (number | '-' | null)[]; vowels?: string; level?: number; octave?: number };
  /** plays chord tones one after another */
  arp?: { steps: string; level?: number; octave?: number; marimba?: boolean };
  kickPitch?: number; kickDecay?: number;
  /** low reverb wash on the kick (big concrete rooms) */
  rumble?: number;
  /** reverb send, 0..1 */
  space?: number;
  /** dub echo on stabs, 0..1 */
  delay?: number;
  /** lowpass on the whole track: music heard through a wall */
  cutoff?: number;
  level?: number;
  /** no drums: slow pads, bells and a little wind (the street) */
  ambient?: boolean;
  /** drop the kick and bass for two bars every sixteen */
  breaks?: boolean;
}

const FOUR = 'x...x...x...x...';
const OFF = '..x...x...x...x.';
const SIXTEENTHS = 'oooooooooooooooo';
const ROLL: (number | null)[] = [null, 0, 0, null, null, 0, 0, null, null, 0, 0, null, null, 0, 0, null];
const HOUSE_BASS: (number | null)[] = [0, null, null, 0, null, null, 0, null, 0, null, null, 0, null, null, 12, null];

export const STYLES: Record<string, Style> = {
  // walking around the city at night: soft pads, a few bells, some wind
  city: {
    bpm: 60, ambient: true, root: 48, level: 0.7, space: 0.6,
    chords: [[0, 7, 11, 14, 16], [5, 9, 12, 16, 19], [-3, 4, 7, 11, 14], [2, 9, 12, 14, 17]],
    pad: { cutoff: 900, level: 0.05 }
  },

  // the ending: a quiet, bright morning back home
  home: {
    bpm: 60, ambient: true, root: 52, level: 0.7, space: 0.5,
    chords: [[0, 4, 7, 11, 14], [5, 9, 12, 16, 19], [-3, 4, 7, 12, 16], [7, 11, 14, 17, 21]],
    pad: { cutoff: 1100, level: 0.05 }
  },

  // Berghain main floor: relentless, dark, hypnotic techno with a rumbling kick in a concrete hall
  berghain: {
    bpm: 132, root: 41, breaks: true, space: 0.35, rumble: 0.7, kickPitch: 46, kickDecay: 0.5,
    chords: [[0, 3, 7, 10], [-4, 0, 3, 7]], barsPerChord: 4,
    kick: FOUR, clap: '........o.......', hat: OFF, ohat: '..............x.',
    bass: { steps: ROLL, wave: 'sawtooth', cutoff: 180, level: 0.32 },
    stab: { steps: '......x.........', cutoff: 900, decay: 0.35, level: 0.12, octave: 1 }
  },
  // Panorama Bar: house, disco and funk; warm chords, piano stabs, a shuffle
  panorama: {
    bpm: 123, swing: 0.12, root: 45, space: 0.25,
    chords: [[0, 3, 7, 10, 14], [-4, 0, 3, 7], [-2, 2, 5, 7], [-5, -2, 2, 5]],
    kick: FOUR, clap: '....x.......x...', hat: SIXTEENTHS, ohat: OFF,
    bass: { steps: HOUSE_BASS, wave: 'square', cutoff: 420, level: 0.22 },
    piano: { steps: '..x..x....x..x..', level: 0.16, octave: 1 },
    pad: { cutoff: 1400, level: 0.025, octave: 1 }
  },

  // Tresor: Detroit-rooted techno in the vault; minor-ninth stabs with long tails
  tresor: {
    bpm: 134, root: 36, space: 0.4, rumble: 0.4,
    chords: [[0, 3, 7, 10, 14], [-4, 0, 3, 7, 10]],
    kick: FOUR, clap: '....x.......x...', hat: SIXTEENTHS, ohat: OFF,
    bass: { steps: [0, null, null, 0, null, null, 0, null, null, 0, null, null, 0, null, null, 0], wave: 'sawtooth', cutoff: 260, level: 0.26 },
    stab: { steps: 'x.....x.....x...', cutoff: 1600, decay: 0.4, level: 0.1, octave: 1 },
    pad: { cutoff: 1100, level: 0.03, octave: 1 }
  },

  // Tresor's Globus: warm, deep house upstairs, before the techno in the vault
  globus: {
    bpm: 124, swing: 0.08, root: 43, space: 0.3,
    chords: [[0, 3, 7, 10], [5, 8, 12, 15], [-2, 2, 5, 9], [3, 7, 10, 14]],
    kick: FOUR, clap: '....x.......x...', hat: OFF, rim: '..o...o...o..o..',
    bass: { steps: HOUSE_BASS, wave: 'square', cutoff: 380, level: 0.22 },
    stab: { steps: 'x..x......x.....', cutoff: 1300, decay: 0.3, level: 0.08, octave: 1 },
    pad: { cutoff: 1200, level: 0.03, octave: 1 }
  },

  // KitKat: hedonistic disco-tinged electro, octave bass and bright chords
  kitkat: {
    bpm: 126, root: 38, space: 0.25, swing: 0.05,
    chords: [[0, 4, 7, 11], [5, 9, 12, 16]],
    kick: FOUR, clap: '....x.......x...', hat: 'x.x.x.x.x.x.x.x.', ohat: OFF,
    bass: { steps: [0, null, 12, null, 0, null, 12, null, 0, null, 12, null, 0, null, 12, null], wave: 'sawtooth', cutoff: 700, level: 0.2 },
    stab: { steps: '..x...x...x...x.', wave: 'square', cutoff: 2600, decay: 0.15, level: 0.07, octave: 1 }
  },
  kitkat_pool: {
    bpm: 118, root: 38, space: 0.45, swing: 0.1, cutoff: 2200,
    chords: [[0, 4, 7, 11], [5, 9, 12, 16]],
    kick: FOUR, clap: '....o.......o...', ohat: OFF, perc: '..x..o.x..x..o..',
    bass: { steps: HOUSE_BASS, wave: 'sine', cutoff: 500, level: 0.26 },
    pad: { cutoff: 1500, level: 0.04, octave: 1 }
  },
  // the dungeon: dark, pounding, EBM-style sixteenth bass
  kitkat_dungeon: {
    bpm: 124, root: 40, space: 0.3, rumble: 0.5,
    chords: [[0, 3, 7]], barsPerChord: 8,
    kick: FOUR, clap: '....x.......x...', hat: OFF,
    bass: { steps: [0, 0, 12, 0, 0, 0, 12, 0, 0, 0, 12, 0, 0, 3, 12, 0], wave: 'sawtooth', cutoff: 520, level: 0.2 },
    stab: { steps: '.......x.......x', cutoff: 1100, decay: 0.2, level: 0.08 }
  },

  // RSO: hypnotic deep techno in ROBUS, dub techno in SUMME, something melodic under the sky on OPAN
  rso_robus: {
    bpm: 134, root: 42, breaks: true, space: 0.35, rumble: 0.9, kickPitch: 44, kickDecay: 0.55,
    chords: [[0, 3, 7, 10]], barsPerChord: 8,
    kick: FOUR, hat: OFF, rim: '...o.....o...o..',
    bass: { steps: ROLL, wave: 'sine', cutoff: 160, level: 0.4 },
    stab: { steps: '...x............', cutoff: 700, decay: 0.3, level: 0.1, octave: 1 }, delay: 0.5
  },
  rso_summe: {
    bpm: 126, root: 43, space: 0.45, rumble: 0.4,
    chords: [[0, 3, 7, 10], [-2, 1, 5, 8]], barsPerChord: 4,
    kick: FOUR, hat: OFF, clap: '............o...',
    bass: { steps: [0, null, null, null, null, null, 0, null, null, null, 0, null, null, null, null, null], wave: 'sine', cutoff: 200, level: 0.36 },
    stab: { steps: '..x.....x.....x.', cutoff: 1000, decay: 0.22, level: 0.11, octave: 1 }, delay: 0.7,
    pad: { cutoff: 800, level: 0.03, octave: 1 }
  },
  rso_opan: {
    bpm: 124, root: 40, space: 0.4,
    chords: [[0, 3, 7, 10], [-4, 0, 3, 7], [-2, 2, 5, 9], [-5, -2, 2, 5]],
    kick: FOUR, clap: '....x.......x...', hat: SIXTEENTHS, ohat: OFF,
    bass: { steps: ROLL, wave: 'sawtooth', cutoff: 300, level: 0.26 },
    arp: { steps: 'x.xx.x.xx.x.x.xx', level: 0.07, octave: 2 },
    pad: { cutoff: 1300, level: 0.035, octave: 1 }
  },

  // Kater Blau: bouncy, playful tech house by the river
  katerblau: {
    bpm: 122, swing: 0.1, root: 43, space: 0.25,
    chords: [[0, 3, 7, 10], [5, 8, 12, 15]],
    kick: FOUR, clap: '....x.......x...', hat: OFF, rim: '.o..o..o.o..o..o', perc: 'x..o..x...o.x...',
    bass: { steps: [0, null, null, 12, null, 0, null, 7, 0, null, null, 12, null, 0, 10, null], wave: 'square', cutoff: 600, level: 0.22 },
    arp: { steps: '..x...x...x.x...', level: 0.07, octave: 2 }
  },

  // Antonio's salon: funky disco with a synthesized diva singing "ooh, aah" over it
  salon: {
    bpm: 118, swing: 0.06, root: 45, space: 0.3, delay: 0.2, barsPerChord: 1,
    chords: [[0, 3, 7, 10], [5, 8, 12, 15], [-2, 2, 5, 9], [3, 7, 10, 14]],
    kick: FOUR, clap: '....x.......x...', hat: SIXTEENTHS, ohat: OFF,
    // octave-jumping disco bass
    bass: { steps: [0, null, 12, null, 0, null, 12, null, 0, null, 12, null, 0, null, 10, 12], wave: 'sawtooth', cutoff: 700, level: 0.22 },
    // funk guitar chops on the offbeats
    stab: { steps: '..o.x..o..o.x..o', wave: 'square', cutoff: 2400, decay: 0.08, level: 0.06, octave: 1 },
    pad: { cutoff: 2200, level: 0.03, octave: 2 },
    vocal: {
      octave: 1, level: 0.06, vowels: 'aoaauoaaeo',
      notes: [
        null, null, null, null, 7, '-', '-', '-', 5, '-', 3, '-', '-', '-', null, null,
        null, null, 5, '-', 7, '-', 10, '-', '-', '-', '-', '-', null, null, null, null,
        null, null, null, null, 12, '-', '-', '-', 10, '-', 7, '-', 5, '-', null, null,
        3, '-', '-', '-', '-', '-', 0, '-', '-', '-', '-', '-', '-', '-', null, null
      ]
    }
  },

  // Sisyphos: a different house in every room
  sisy_strand: { // organic, melodic open-air house with marimba and hand drums
    bpm: 120, swing: 0.08, root: 38, space: 0.4,
    chords: [[0, 3, 7, 10, 14], [5, 9, 12, 16]],
    kick: FOUR, clap: '....o.......o...', ohat: OFF, perc: 'x..x.o..x..o.x..',
    bass: { steps: [0, null, null, null, null, null, 0, null, null, null, 7, null, null, null, 10, null], wave: 'sine', cutoff: 400, level: 0.3 },
    arp: { steps: 'x..x..x...x..x..', level: 0.1, octave: 2, marimba: true },
    pad: { cutoff: 1200, level: 0.03, octave: 1 }
  },
  sisy_wg: { // the Wintergarten: deep, soft house
    bpm: 118, swing: 0.12, root: 39, space: 0.35,
    chords: [[0, 3, 7, 10, 14], [-2, 2, 5, 9]],
    kick: FOUR, clap: '....x.......x...', hat: SIXTEENTHS, ohat: OFF,
    bass: { steps: [0, null, null, null, null, null, 0, null, null, null, 0, null, null, null, 7, null], wave: 'sine', cutoff: 380, level: 0.3 },
    piano: { steps: 'x.......x.....x.', level: 0.1, octave: 1 },
    pad: { cutoff: 1100, level: 0.04, octave: 1 }
  },
  sisy_hh: { // the Hammahalle: techno
    bpm: 130, root: 40, breaks: true, space: 0.3, rumble: 0.5,
    chords: [[0, 3, 7]], barsPerChord: 8,
    kick: FOUR, clap: '....x.......x...', hat: OFF, ohat: '..............x.',
    bass: { steps: ROLL, wave: 'sawtooth', cutoff: 220, level: 0.3 }
  },
  sisy_df: { // the Dampfer: deep tech house, rolling and swaying
    bpm: 124, swing: 0.06, root: 41, space: 0.3,
    chords: [[0, 3, 7, 10], [-2, 1, 5, 8]],
    kick: FOUR, clap: '....x.......x...', hat: OFF, rim: '...o..o....o..o.',
    bass: { steps: [null, 0, null, 0, null, 0, 12, null, null, 0, null, 0, null, 0, 10, null], wave: 'sawtooth', cutoff: 350, level: 0.26 },
    stab: { steps: '......x.......x.', cutoff: 1200, decay: 0.2, level: 0.09, octave: 1 }
  },
  sisy_tn: { // the Tunnel: acid techno under red lanterns
    bpm: 132, root: 36, space: 0.25,
    chords: [[0, 3, 7]], barsPerChord: 8,
    kick: FOUR, clap: '....x.......x...', hat: SIXTEENTHS, ohat: OFF,
    bass: { steps: [0, 0, 12, 0, 3, 0, 15, 0, 0, 12, 0, 10, 0, 7, 0, 12], wave: 'sawtooth', cutoff: 260, level: 0.2, acid: true }
  },
  sauna: { // behind the Dampfer: warm, slow, steamy
    bpm: 60, ambient: true, root: 45, level: 0.6, space: 0.7, cutoff: 1400,
    chords: [[0, 4, 7, 11, 14], [5, 9, 12, 16]],
    pad: { cutoff: 700, level: 0.05 }
  },

  // Club der Visionäre: clicky, sparse minimal on the canal deck
  cdv: {
    bpm: 122, swing: 0.06, root: 42, space: 0.2,
    chords: [[0, 3, 7]], barsPerChord: 8,
    kick: FOUR, rim: 'o.o..o.o.o..o.o.', hat: OFF,
    bass: { steps: [null, null, 0, null, null, null, null, 0, null, null, 0, null, null, null, null, null], wave: 'sine', cutoff: 300, level: 0.34 },
    arp: { steps: '.....x.......x..', level: 0.06, octave: 2 }
  },

  // the MDMA runner: euphoric trance, rolling bass and a sparkling arp
  runner: {
    bpm: 140, root: 38, space: 0.35,
    chords: [[0, 3, 7, 10], [-4, 3, 8, 12], [-2, 2, 5, 10], [-5, 2, 7, 10]], barsPerChord: 1,
    kick: FOUR, clap: '....x.......x...', ohat: OFF, hat: SIXTEENTHS,
    bass: { steps: [null, null, 0, 0, null, null, 0, 0, null, null, 0, 0, null, null, 12, 0], wave: 'sawtooth', cutoff: 520, level: 0.2 },
    arp: { steps: 'xxxxxxxxxxxxxxxx', level: 0.07, octave: 2 },
    pad: { cutoff: 1600, level: 0.04, octave: 1 }
  },

  // the LSD dive at CDV: slow, dubby and underwater (the whole track through a lowpass)
  lsd: {
    bpm: 100, swing: 0.06, root: 40, space: 0.6, delay: 0.5, cutoff: 1900,
    chords: [[0, 4, 7, 11], [5, 9, 12, 16], [2, 5, 9, 14], [7, 11, 14, 18]],
    kick: 'x.......x.......', hat: '..x...x...x...x.', perc: 'x..o..x...o.x...',
    bass: { steps: [0, null, null, 7, null, null, 12, null, 0, null, null, 7, null, 10, null, null], wave: 'sine', cutoff: 600, level: 0.25 },
    arp: { steps: 'x.x.x.x.x.x.x.x.', level: 0.08, octave: 2, marimba: true },
    pad: { cutoff: 2200, level: 0.07, octave: 1 }
  },

  // Heideglühen: warm classic house with piano chords around the fire
  heide: {
    bpm: 122, swing: 0.1, root: 36, space: 0.3,
    chords: [[5, 9, 12, 16], [4, 7, 11, 14], [2, 5, 9, 12], [7, 11, 14, 17]], barsPerChord: 1,
    kick: FOUR, clap: '....x.......x...', hat: SIXTEENTHS, ohat: OFF,
    bass: { steps: HOUSE_BASS, wave: 'square', cutoff: 450, level: 0.22 },
    piano: { steps: 'x..x..x...x..x..', level: 0.17, octave: 1 }
  }
};

/** Floors that sound like another style heard through a wall or a door. */
const MUFFLED: Record<string, [string, number]> = {
  'rso:keller': ['rso_robus', 360],
  'kitkat:sauna': ['kitkat_pool', 500],     // KitKat's sauna: the pool lounge through the wooden door        // ROBUS, through the ceiling
  'heidegluehen:hof': ['heide', 1500],     // the yard: the dance house through its open door
  'heidegluehen:hinten': ['heide', 650],   // out the back: the dancefloor through the back door
  'tresor:tunnel': ['tresor', 700],        // the tunnel: the vault getting louder ahead
  'sisyphos:eingang': ['sisy_strand', 600] // the queue: the Strand behind the door
};

/** Which style plays on each club floor. */
const FLOOR_STYLE: Record<string, string> = {
  'berghain:eg': 'rso_robus', 'berghain:mf': 'berghain', 'berghain:pb': 'panorama',
  'sisyphos:strand': 'sisy_strand', 'sisyphos:wg': 'sisy_wg', 'sisyphos:hh': 'sisy_hh', 'sisyphos:df': 'sisy_df', 'sisyphos:tn': 'sisy_tn', 'sisyphos:sa': 'sauna',
  'kitkat:main': 'kitkat', 'kitkat:pool': 'kitkat_pool', 'kitkat:dungeon': 'kitkat_dungeon',
  'rso:opan': 'rso_opan', 'rso:robus': 'rso_robus', 'rso:summe': 'rso_summe',
  'heidegluehen:haus': 'heide', 'heidegluehen:galerie': 'heide',
  'cdv:deck': 'cdv', 'cdv:raum': 'cdv',
  'tresor:globus': 'globus', 'tresor:vault': 'tresor',
  'katerblau:garden': 'katerblau', 'katerblau:hopper': 'rso_robus', 'katerblau:arch': 'sisy_tn',
  'salon:main': 'salon'
};
/** What plays during a club's short "inside" scene (clubs without an interior use their own style). */
const CLUB_STYLE: Record<string, string> = {
  berghain: 'berghain', tresor: 'tresor', kitkat: 'kitkat', rso: 'rso_opan',
  katerblau: 'katerblau', sisyphos: 'sisy_strand', cdv: 'cdv', heidegluehen: 'heide'
};

/** A style id plus an optional wall cutoff, for a scene or a club entrance. */
export function styleForScene(scene: string): { id: string; cutoff?: number } {
  const m = MUFFLED[scene];
  if (m) return { id: m[0], cutoff: m[1] };
  return { id: FLOOR_STYLE[scene] ?? 'city' };
}
export const styleForClub = (clubId: string) => ({ id: CLUB_STYLE[clubId] ?? 'city' });

/* ================= MAP ================= */
export const T = 16, CITY_W = 72, CITY_H = 76;
export const G = 0, R = 1, S = 2, W = 3, B = 4, TR = 5, BR = 6, C = 7, D = 8, F = 9, SA = 10, RL = 11, DK = 12, PL = 13;
// Görlitzer Park: wire fence, grill, towel, the Kuhle (the bowl lawn), basketball court, football pitch, skate park (with a ramp), old rails in the grass
export const FN = 14, GRL = 15, TW = 16, KU = 17, BK = 18, FB = 19, SK = 20, OT = 21;
// canal terraces: cobblestones, an Ankerklause table (polka-dot cloth, blue chairs), a La Maison bistro table, a folded parasol
export const TER = 22, ATB = 23, MTB = 24, UMB = 25;
export const SOLID = new Set<number>([W, B, TR, C, F, RL, FN, GRL, ATB, MTB, UMB]);
// Interior tiles, mapped from the ASCII legend in data/interiors.ts
export const ICH: Record<string, number> = { '#': 40, '.': 41, ',': 42, '^': 43, 'v': 44, 'x': 45, 'k': 46, 't': 47, '|': 48, 'P': 49, 'W': 50, 'A': 51, 'N': 52, 'C': 53, 'I': 54, '=': 55, 'c': 56, 'b': 57, 'S': 58, 'D': 59, 'L': 60, '_': 61, ' ': 62,
  // Sisyphos and other open-air / wooden clubs
  'a': 63, '~': 64, 'w': 65, 'g': 66, 'T': 67, 'B': 68, 'H': 69, 'u': 70, 'O': 71, 'F': 72, 'R': 73, 'G': 74, 'l': 75, 'h': 76, 'e': 77, 'o': 78, 'K': 79,
  // doorways between rooms: the same digit on both sides
  // KitKat
  'V': 90, 'p': 91, 'Y': 92, 'Z': 93, 'Q': 94, 'X': 95, 'J': 96, 'M': 97, 'n': 98, 'U': 100, 'i': 101,
  // Heideglühen
  'f': 102, 'm': 103,
  // Club der Visionäre
  'y': 104, 'z': 105, 'q': 106,
  // Antonio's salon
  'E': 107, 'r': 108, 'd': 109,
  // Tresor
  's': 110, 'j': 111,
  // Kater Blau
  '*': 112,
  // Ankerklause: jukebox, veranda window over the canal, graffiti wood wall, old armchair
  '%': 113, '[': 115, '!': 116, '(': 117,
  // Erkahn's Späti: beer fridge, chips shelf, tobacco wall, lino floor, the counter
  '<': 118, '>': 119, '?': 120, ':': 121, '+': 122,
  // the black-light minigolf
  '@': 114,
  // Berghain: the drop down to the Säule behind a railing; a staircase up (rising to the right); the
  // mezzanine railing; coat racks in the Garderobe; steps up to the mezzanine; the temple-like columns
  ';': 123, ']': 124, ')': 125, '$': 126, '}': 127, '{': 128,
  // Panorama Bar: a black leather sofa against the right wall
  '&': 129,
  // Berghain's Eisbar: the second staircase up (to it from the main floor), the chrome-tiled bar,
  // the glass ice case under its neon tube, a small round table
  '/': 130, '"': 131, '`': 132, 'ø': 133,
  // Berghain's smoking area: church windows with red glass, chains hanging from the ceiling
  '¤': 134, '§': 135,
  // Heideglühen: wooden tribune, steps up, stage, rotating seat, sofa platform up high and its stairs,
  // the open middle of the gallery, the ticket booth, the jacuzzi
  'ä': 136, 'ö': 137, 'ü': 138, 'ß': 139, '°': 140, '±': 141, '¶': 142, '®': 143, 'é': 144, 'ç': 145,
  // Club der Visionäre: free-standing sofas with their back up / down / left / right, the tiny dance room's
  // painted walls and painted floor
  'ê': 147, 'ë': 148, 'î': 149, 'ï': 150, 'Ô': 151, 'Õ': 152,
  // KitKat's pool: an inflatable mattress (two tiles long)
  'µ': 153,
  // KitKat's dungeon: spanking bench, stocks, bondage table, doctor's bed, suspension frame, whipping post,
  // the fire-breathing dragon on the wall
  'ò': 154, 'ó': 155, 'ô': 156, 'õ': 157, 'ù': 158, 'ú': 159, 'û': 160,
  // Sisyphos's entrance hallway: red walls, red-lit floor, the metal crowd barrier between the two queues
  'Ŕ': 161, 'ŗ': 162, 'ļ': 163,
  // Sisyphos's garden from above: the green circus tent with red stars, a baller box (a little DJ hut), a grey roof
  'ŧ': 164, 'ƀ': 165, 'Ř': 166,
  // and the souvenir shelves in its café, the big bonfire (2×2), the PIZZA sign board (3 wide)
  'ŝ': 167, 'ƒ': 168, 'ƥ': 169,
  // the garden's two little houses, each drawn as one picture: the sauna cabin (No. 15) and the café cottage
  'ʂ': 170, 'ĉ': 171,
  // and the old factory that holds the Hammahalle, the Dampfer and the Tunnel, drawn as one picture
  'ƃ': 172,
  '1': 81, '2': 82, '3': 83, '4': 84, '5': 85, '6': 86, '7': 87, '8': 88, '9': 89 };
export const ICHAR: Record<number, string> = Object.fromEntries(Object.entries(ICH).map(([k, v]) => [v, k]));
[40, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 62, 64, 67, 68, 69, 71, 72, 73, 74, 76, 78, 79, 90, 92, 93, 94, 95, 96, 97, 98, 100, 102, 103, 104, 106, 107, 108, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 122, 123, 125, 126, 128, 129, 131, 132, 133, 134, 135, 136, 138, 139, 140, 141, 142, 143, 144, 145, 147, 148, 149, 150, 151, 153, 154, 155, 156, 157, 158, 159, 160, 161, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172].forEach(c => SOLID.add(c));
export const COUNTERS = new Set([53, 54, 55, 56, 59, 122, 131, 132, 143]);
export const WALLISH = new Set([40, 50, 134, 51, 52, 60, 62, 68, 69, 74, 78, 79, 90, 107, 115, 116, 118, 120, 160, 161]);
export const DANCES = new Set([42, 63, 75, 77, 91, 109, 152]); // concrete, sand, red tunnel floor, wooden floor, pole stage, salon checkers
export const isDoorTile = (t: number) => t >= 81 && t <= 89;
export const STAIRS_UP = 43, STAIRS_DOWN = 44, EXIT = 45, DARK = 46, DANCE = 42;
/** a staircase up drawn as rising steps (climb it to the right) */
export const STAIRS_UP_SIDE = 124;
/** a second staircase up, to the floor in the floor's `up2` link (when `^` already goes somewhere else) */
export const STAIRS_UP2 = 130;

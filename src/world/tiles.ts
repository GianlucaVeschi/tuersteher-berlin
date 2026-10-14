/* ================= MAP ================= */
export const T = 16, CITY_W = 72, CITY_H = 46;
export const G = 0, R = 1, S = 2, W = 3, B = 4, TR = 5, BR = 6, C = 7, D = 8, F = 9, SA = 10, RL = 11, DK = 12;
export const SOLID = new Set<number>([W, B, TR, C, F, RL]);
// Interior tiles, mapped from the ASCII legend in data/interiors.ts
export const ICH: Record<string, number> = { '#': 40, '.': 41, ',': 42, '^': 43, 'v': 44, 'x': 45, 'k': 46, 't': 47, '|': 48, 'P': 49, 'W': 50, 'A': 51, 'N': 52, 'C': 53, 'I': 54, '=': 55, 'c': 56, 'b': 57, 'S': 58, 'D': 59, 'L': 60, '_': 61, ' ': 62,
  // Sisyphos and other open-air / wooden clubs
  'a': 63, '~': 64, 'w': 65, 'g': 66, 'T': 67, 'B': 68, 'H': 69, 'u': 70, 'O': 71, 'F': 72, 'R': 73, 'G': 74, 'l': 75, 'h': 76, 'e': 77, 'o': 78, 'K': 79,
  // doorways between rooms: the same digit on both sides
  // KitKat
  'V': 90, 'p': 91, 'Y': 92, 'Z': 93, 'Q': 94, 'X': 95, 'J': 96, 'M': 97, 'n': 98, 'U': 100, 'i': 101,
  '1': 81, '2': 82, '3': 83, '4': 84, '5': 85, '6': 86, '7': 87, '8': 88, '9': 89 };
export const ICHAR: Record<number, string> = Object.fromEntries(Object.entries(ICH).map(([k, v]) => [v, k]));
[40, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 62, 64, 67, 68, 69, 71, 72, 73, 74, 76, 78, 79, 90, 92, 93, 94, 95, 96, 97, 98, 100].forEach(c => SOLID.add(c));
export const COUNTERS = new Set([53, 54, 55, 56, 59]);
export const WALLISH = new Set([40, 50, 51, 52, 60, 62, 68, 69, 74, 78, 79, 90]);
export const DANCES = new Set([42, 63, 75, 77, 91]); // concrete, sand, red tunnel floor, wooden floor, pole stage
export const isDoorTile = (t: number) => t >= 81 && t <= 89;
export const STAIRS_UP = 43, STAIRS_DOWN = 44, EXIT = 45, DARK = 46, DANCE = 42;

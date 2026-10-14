import { G, TR } from './tiles';
import { RT } from '../core/runtime';

// The street map starts as grass; buildCity() paints everything else on top.
RT.map = Array.from({ length: RT.MH }, () => Array<number>(RT.MW).fill(G));

/** Tile at (x, y) in the current scene. Outside the map counts as a tree (solid). */
export const get = (x: number, y: number): number => (x < 0 || y < 0 || x >= RT.MW || y >= RT.MH) ? TR : RT.map[y][x];
export const set = (x: number, y: number, t: number) => { if (x >= 0 && y >= 0 && x < RT.MW && y < RT.MH) RT.map[y][x] = t; };
export const rect = (x0: number, y0: number, w: number, h: number, t: number) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) set(x, y, t); };

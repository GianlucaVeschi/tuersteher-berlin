import { RT } from './runtime';
import type { Dir, GameState, Pfand, Player } from '../types';

/* ================= STATE ================= */
export const DIRS: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
export const OPP: Record<Dir, Dir> = { up: 'down', down: 'up', left: 'right', right: 'left' };
/** ms per tile when walking / running */
export const MOVE = 170, RUN = 85;
export const running = () => RT.runKey || RT.runBtn || !!(RT.touch && RT.touch.far);
export const START: { x: number; y: number; dir: Dir } = { x: 40, y: 16, dir: 'down' };
export function newPfand(): Pfand { return { carry: 0, carryCents: 0, returned: 0, cents: 0, taken: {} }; }
/** Everything that gets saved. */
export const state: GameState = { stamps: {}, intro: false, finale: false, outfit: 'tourist', char: null, quests: {}, visited: {}, sunrise: {}, coatNo: 0, kStage: 0, pfand: newPfand(), heard: {}, danced: {}, kkStripped: false };
export const player: Player = { dur: MOVE, x: START.x, y: START.y, tx: START.x, ty: START.y, dir: START.dir, moving: false, t: 0, n: 0 };
/** direction keys currently held, most recent last */
export const held: Dir[] = [];

import { RT } from './runtime';
/* ================= STATE ================= */
export const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
export const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
export const MOVE = 170, RUN = 85;
export const running = () => RT.runKey || RT.runBtn || !!(RT.touch && RT.touch.far);
export const START = { x: 40, y: 16, dir: 'down' };
export const state = { stamps: {}, intro: false, finale: false, outfit: 'tourist', char: null, quests: {}, visited: {}, sunrise: {}, coatNo: 0, kStage: 0, pfand: newPfand(), heard: {}, danced: {}, kkStripped: false };
export function newPfand() { return { carry: 0, carryCents: 0, returned: 0, cents: 0, taken: {} }; }
export const player = { dur: 170, x: START.x, y: START.y, tx: START.x, ty: START.y, dir: START.dir, moving: false, t: 0, n: 0 };
export const held = [];

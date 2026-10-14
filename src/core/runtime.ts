// Shared mutable game state that many modules read and reassign.
// (ES module imports are read-only, so values that get reassigned live on this object.)
import { CITY_W, CITY_H } from '../world/tiles';

export const RT = {
  // current scene: the street or one club floor
  MW: CITY_W, MH: CITY_H,
  map: [] as number[][],
  ents: [] as any[],
  mc: null as unknown as HTMLCanvasElement,
  scene: 'city',
  // visible area in game pixels (desktop 384x256; phones size it in fitCanvas)
  VW: 384, VH: 256,
  seed: 1337,
  clock: 0,
  // input and flow
  runKey: false, runBtn: false,
  busy: true, titleOn: true,
  touch: null as any,
  // open UI
  ui: null as any, typing: null as any,
  insideResolve: null as null | (() => void),
  photoResolve: null as null | (() => void),
  shopUI: null as any,
  creator: null as any,
  follower: null as any,
  // timed effects
  tripUntil: 0, kStart: 0, kUntil: 0, steamUntil: 0,
};

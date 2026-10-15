// Shared mutable game state that many modules read and reassign.
// (ES module imports are read-only, so values that get reassigned live on this object.)
import { CITY_W, CITY_H } from '../world/tiles';
import type { CreatorState, DialogState, Entity, Follower, RunnerHooks, ShopUI, TouchState, Typing } from '../types';

export const RT = {
  // current scene: the street or one club floor (see world/scenes.ts)
  MW: CITY_W, MH: CITY_H,
  map: [] as number[][],
  ents: [] as Entity[],
  mc: null as unknown as HTMLCanvasElement,
  scene: 'city',
  // visible area in game pixels (desktop 384x256; phones size it in fitCanvas)
  VW: 384, VH: 256,
  /** seed for the map art's random numbers */
  seed: 1337,
  /** game time in ms (runs slower during the K effect) */
  clock: 0,
  // input and flow
  runKey: false, runBtn: false,
  /** joystick pushed past its rim: run */
  runStick: false,
  /** true while a script, menu or transition has control */
  busy: true,
  titleOn: true,
  touch: null as TouchState | null,
  // open UI
  ui: null as DialogState | null,
  typing: null as Typing | null,
  insideResolve: null as null | (() => void),
  photoResolve: null as null | (() => void),
  /** the MDMA runner minigame (effects/runner.ts) */
  runner: null as RunnerHooks | null,
  /** club whose short entrance scene is showing (picks the music) */
  overlayClub: null as string | null,
  /** the wake-up-at-home ending is playing */
  ending: false,
  shopUI: null as ShopUI | null,
  creator: null as CreatorState | null,
  follower: null as Follower | null,
  // timed effects (timestamps in ms)
  steamUntil: 0,
};

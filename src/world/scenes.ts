import { RT } from '../core/runtime';
import type { Scene } from '../types';

/* ================= SCENES ================= */
// The street ('city') and every club floor ('berghain:mf', …) is a scene.
export const SCENES: Record<string, Scene> = {};

/** Registers the street once it has been built and drawn. */
export function initCityScene() {
  SCENES.city = { id: 'city', map: RT.map, w: RT.MW, h: RT.MH, ents: RT.ents, canvas: RT.mc };
}
export function useScene(id: string) {
  const sc = SCENES[id];
  RT.scene = id; RT.map = sc.map; RT.MW = sc.w; RT.MH = sc.h; RT.ents = sc.ents; RT.mc = sc.canvas;
}
export const inClub = () => RT.scene !== 'city';
export const sceneClub = () => RT.scene.split(':')[0];
export const sceneFloor = () => RT.scene.split(':')[1];

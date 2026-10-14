import { CLUBS } from '../data/clubs';
import { SHOPS } from '../data/outfits';
import { RT } from '../core/runtime';
import { B, BR, C, D, DK, F, G, R, RL, S, SA, TR, W } from './tiles';
import { get, rect, set } from './grid';
import type { Building, Entity, Look, Road, ShopSign } from '../types';

export function pave(x: number, y: number, t: number) {
  const cur = get(x, y);
  if (cur === W || cur === BR) { set(x, y, BR); return; }
  if (t === S && cur === R) return;
  set(x, y, t);
}
export const roads: Road[] = [];
export function hroad(y: number, x0: number, x1: number) {
  for (let x = x0; x <= x1; x++) { pave(x, y - 1, S); pave(x, y, R); pave(x, y + 1, R); pave(x, y + 2, S); }
  roads.push({ h: true, y, a: x0, b: x1 });
}
export function vroad(x: number, y0: number, y1: number) {
  for (let y = y0; y <= y1; y++) { pave(x - 1, y, S); pave(x, y, R); pave(x + 1, y, R); pave(x + 2, y, S); }
  roads.push({ h: false, x, a: y0, b: y1 });
}

export const buildings: Building[] = [];
export function building(x: number, y: number, w: number, h: number, kind: Building['kind'], extra?: { v?: number; shop?: ShopSign }) {
  rect(x, y, w, h, B);
  buildings.push(Object.assign({ x, y, w, h, kind }, extra || {}));
}
// Fernsehturm: solid footprint is the plaza block; the tall part is drawn in front of sprites.
export const TOWER = { x: 41, y: 16, w: 6, h: 4, top: 9 };
const tree = (x: number, y: number) => { if (get(x, y) === G) set(x, y, TR); };

/** Lays out the street map: river, roads, buildings, clubs, trees, and the people on it. */
export function buildCity() {
  // Water: the Spree and the Flutgraben canal
  rect(0, 22, RT.MW, 5, W);
  rect(53, 27, 2, 19, W);
  // S-Bahn tracks
  rect(13, 1, RT.MW - 13, 1, RL);
  // Streets
  hroad(4, 10, RT.MW - 1);
  hroad(14, 0, RT.MW - 1);
  hroad(30, 0, RT.MW - 1);
  hroad(40, 0, RT.MW - 1);
  vroad(10, 0, RT.MH - 1);
  vroad(38, 3, RT.MH - 1);
  vroad(60, 3, RT.MH - 1);

  // Buildings
  building(TOWER.x, TOWER.y, TOWER.w, TOWER.h, 'tower');
  building(63, 7, 8, 6, 'station');
  SHOPS.forEach(sh => {
    building(sh.x, sh.y, sh.w, sh.h, 'altbau', { v: sh.v, shop: { label: sh.label, band: sh.band, ink: sh.ink, door: true } });
    set(sh.dx, sh.doorY, D);
  });
  building(41, 33, 4, 6, 'altbau', { v: 0, shop: { label: 'SPÄTI', band: '#1f6b4a', ink: '#ffe58a', door: false } });
  // Oberbaumbrücke towers
  building(37, 24, 1, 1, 'obtower');
  building(40, 24, 1, 1, 'obtower');

  // Sand, decks, East Side Gallery
  rect(15, 20, 13, 2, SA);
  rect(63, 20, 9, 2, SA);
  rect(51, 33, 2, 6, DK);
  rect(26, 18, 11, 1, F);

  // Clubs
  CLUBS.forEach(c => { rect(c.x, c.y, c.w, c.h, C); set(c.dx, c.doorY, D); });

  // Trees
  for (let x = 0; x < RT.MW; x++) { tree(x, 0); tree(x, 44); tree(x, 45); }
  for (let y = 0; y < RT.MH; y++) { tree(0, y); tree(RT.MW - 1, y); }
  [[1, 1], [3, 3], [5, 5], [2, 7], [6, 8], [3, 10], [5, 12], [7, 3], [8, 7], [7, 10], [1, 8], [1, 11], [2, 17], [5, 18], [3, 20], [7, 17], [14, 17], [16, 19],
   [42, 17], [45, 19], [48, 17], [51, 19], [54, 17], [57, 18], [44, 21], [52, 20],
   [56, 7], [57, 8], [58, 7], [56, 10], [58, 11], [57, 12], [36, 8], [36, 11], [25, 8],
   [3, 28], [9 - 1, 27], [16, 28], [22, 27], [28, 28], [34, 27], [44, 28], [49, 27], [57, 28], [64, 27], [69, 28],
   [55, 33], [56, 35], [58, 34], [57, 37], [55, 38], [1, 34], [1, 37],
   [63, 34], [65, 33], [67, 35], [69, 33], [64, 37], [66, 38], [70, 36], [68, 38],
   [20, 2], [30, 2], [44, 2], [55, 2], [41, 8], [43, 7], [46, 9], [42, 11], [45, 11], [44, 9], [66, 2], [12 + 3, 46 - 3], [45, 34], [36, 35]
  ].forEach(([x, y]) => tree(x, y));

  RT.ents = cityPeople();
}

/* ================= ENTITIES ================= */
export const LOOKS: Record<string, Look> = {
  spati: { skin: '#c98d6a', hair: '#1a1a1a', top: '#e0a83a', legs: '#2a2a35', beard: '#1a1a1a' },
  tourist1: { skin: '#f3c9a8', hair: '#d9b25c', top: '#4ea8de', legs: '#3a5a8a', hat: '#e24a4a' },
  tourist2: { skin: '#f0c7a0', hair: '#5a3a22', top: '#f2c14e', legs: '#3a3a4a' },
  tourist3: { skin: '#e2b08c', hair: '#111', top: '#1b1b22', legs: '#1b1b22' },
  tourist4: { skin: '#f3c9a8', hair: '#b04a2a', top: '#58b368', legs: '#3a3a4a' },
  raver: { skin: '#8d5a3b', hair: '#b36bd1', top: '#222', legs: '#222', shades: true },
  oldraver: { skin: '#f0c7a0', hair: '#c0c0c0', top: '#d9733a', legs: '#3a3a4a', beard: '#c0c0c0' },
  monday: { skin: '#e2b08c', hair: '#3a2a20', top: '#9a4ad1', legs: '#2a2a35', shades: true }
};
function cityPeople(): Entity[] {
  const ents: Entity[] = [];
  CLUBS.forEach(c => {
    ents.push({ kind: 'bouncer', club: c, x: c.dx, y: c.by, dir: 'down', look: c.look, ox: 0 });
    ents.push({ kind: 'sign', x: c.dx + c.signSide, y: c.by, lines: c.sign });
  });
  ents.push(
    { kind: 'sign', x: 25, y: 17, lines: ['EAST SIDE GALLERY', 'About 1.3 km of the Berlin Wall, painted by artists from around the world in 1990.'] },
    { kind: 'sign', x: 47, y: 19, lines: ['FERNSEHTURM · Alexanderplatz', '368 m tall. You can see it from almost every street in Berlin.'] },
    { kind: 'sign', x: 41, y: 21, lines: ['OBERBAUMBRÜCKE', 'The red brick bridge between Friedrichshain and Kreuzberg.'] },
    { kind: 'sign', x: 63, y: 13, lines: ['S OSTKREUZ', 'The busiest S-Bahn interchange in town. ://about blank is just around the corner.'] },
    { kind: 'npc', x: 43, y: 39, dir: 'down', look: LOOKS.spati, lines: ['Späti: Club-Mate? Two euros.', 'Späti: Tip: bouncers spot tourists fast. Learn about a club before you queue.', 'Späti: Wrong clothes? Coexist and SYLD are on this street. Humana and Blackstyle are up north.', 'Späti: And Berghain was a power plant. Everyone asks.'] },
    { kind: 'npc', x: 26, y: 13, dir: 'right', look: LOOKS.tourist1, lines: ["Tourist: We came as nine from the hostel. He just said 'Heute nicht.'", 'Tourist: Go alone. And keep your phone in your pocket.'] },
    { kind: 'npc', x: 27, y: 13, dir: 'right', look: LOOKS.tourist2, lines: ["Tourist: Is this even Berghain? There's no sign.", "Tourist: …I think that's the point."] },
    { kind: 'npc', x: 28, y: 13, dir: 'right', look: LOOKS.tourist3, lines: ["Local: I'm wearing all black. I rehearsed my answers.", "Local: I'm terrified."] },
    { kind: 'npc', x: 29, y: 13, dir: 'right', look: LOOKS.tourist4, lines: ['Tourist: Two hours in the queue. Worth it, right?'] },
    { kind: 'npc', x: 19, y: 39, dir: 'down', look: LOOKS.raver, lines: ['Raver: Tresor and KitKat are both on Köpenicker Straße.', 'Raver: Coexist and SYLD sell clubwear right here. Sisyphos wants color, Berghain wants black.', 'Raver: Read the signs. Bouncers love people who know the place.'] },
    { kind: 'npc', x: 14, y: 20, dir: 'down', look: LOOKS.oldraver, lines: ['Old raver: I danced at Bar25 for three days straight in 2009.', 'Old raver: Kater Blau is the same crew. New spot, same spirit.'] },
    { kind: 'npc', x: 70, y: 21, dir: 'left', look: LOOKS.monday, lines: ['Raver: What day is it?', "Raver: I came in on Friday. Sisyphos does that to you."] }
  );
  return ents;
}

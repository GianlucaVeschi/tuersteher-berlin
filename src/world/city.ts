import { PLACES } from '../data/places';
import { CLUBS } from '../data/clubs';
import { SHOPS } from '../data/outfits';
import { RT } from '../core/runtime';
import { ATB, B, BK, BR, C, D, DK, F, FB, FN, G, GRL, KU, MTB, OT, PL, R, RL, S, SA, SK, TER, TR, TW, UMB, W } from './tiles';
import { STATION } from './station';
import { get, rect, set } from './grid';
import { NPCS } from '../data/npcs';
import type { Building, Entity, Road, ShopSign } from '../types';

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
/** The Landwehrkanal: three rows of water across the south of the map. */
export const CANAL = { y: 48, h: 3 };
/** Görlitzer Park, south of the canal: fenced since 2025/26, but every gate stands open. */
export const GORLI = { x0: 13, y0: 55, x1: 58, y1: 70 };
// Molecule Man: stands in the Spree, east of the Oberbaumbrücke (drawn onto the water; the river stays solid)
export const MOLECULE = { x: 45, y: 23, w: 3, h: 3 };
const tree = (x: number, y: number) => { if (get(x, y) === G) set(x, y, TR); };

/** The canal terraces: cobblestones, tables and chairs by the water in front of the Ankerklause
 *  (polka-dot cloths, blue chairs, a folded parasol) and La Maison (round bistro tables). One way
 *  through to each door stays free (Ankerklause: row 52 from the bridge; La Maison: row 46 from x62). */
function buildTerraces() {
  rect(40, 52, 10, 2, TER);
  [[41, 53], [45, 53], [48, 53]].forEach(([x, y]) => set(x, y, ATB));
  set(47, 52, UMB);
  rect(63, 46, 8, 2, TER);
  [[64, 47], [67, 47], [69, 46]].forEach(([x, y]) => set(x, y, MTB));
}

/** Görlitzer Park (researched): on the grounds of the old Görlitzer Bahnhof. The Senate's new fence
 *  with sixteen gates, all open; the Kuhle (the bowl lawn), basketball, football and a skate park,
 *  the children's farm, a grill zone, old rails in the grass, bike paths, and the black-light minigolf
 *  (a place you walk into, data/places.ts). */
function buildGorli() {
  const { x0, y0, x1, y1 } = GORLI;
  for (let x = x0; x <= x1; x++) { set(x, y0, FN); set(x, y1, FN); }
  for (let y = y0; y <= y1; y++) { set(x0, y, FN); set(x1, y, FN); }
  // the sixteen gates, all standing open
  [20, 28, 33, 37, 38, 39, 40, 47, 54].forEach(x => set(x, y0, S));
  [25, 33, 45, 52].forEach(x => set(x, y1, S));
  [58, 62, 67].forEach(y => set(x0, y, S));
  [59, 62, 68].forEach(y => set(x1, y, S));
  // bike paths: across the park and down the middle
  for (let x = x0 + 1; x < x1; x++) { set(x, 62, S); set(x, 63, S); }
  for (let y = y0 + 1; y < y1; y++) { set(38, y, S); set(39, y, S); }
  // the Kuhle: the lawn dips into a big bowl
  for (let y = y0 + 1; y <= 61; y++) for (let x = 15; x <= 35; x++) if (((x - 26) / 9.5) ** 2 + ((y - 58.5) / 3) ** 2 <= 1) set(x, y, KU);
  [[23, 58], [27, 59], [30, 57], [25, 60]].forEach(([x, y]) => set(x, y, TW));
  rect(42, 57, 6, 4, BK);                                   // basketball
  rect(49, 56, 9, 6, FB);                                   // football
  rect(42, 64, 7, 5, SK);                                   // skate park
  rect(26, 65, 11, 4, SA); [[27, 66], [30, 67], [33, 66], [35, 68]].forEach(([x, y]) => set(x, y, GRL)); // grill zone
  for (let x = 26; x <= 36; x++) set(x, 64, OT);           // old rails of the Görlitzer Bahnhof
  // the children's farm: a fenced yard with a stable
  for (let x = 14; x <= 24; x++) { set(x, 64, FN); set(x, 69, FN); }
  for (let y = 64; y <= 69; y++) { set(14, y, FN); set(24, y, FN); }
  set(19, 64, S);
  building(15, 65, 4, 2, 'altbau', { v: 2, shop: { label: 'KINDERBAUERNHOF', band: '#7a5a3a', ink: '#ffe58a', door: false } });
}

/** Lays out the street map: river, roads, buildings, clubs, trees, and the people on it. */
export function buildCity() {
  // Water: the Spree, the Flutgraben, and the Landwehrkanal in the south (the Flutgraben joins it)
  rect(0, 22, RT.MW, 5, W);
  rect(53, 27, 2, CANAL.y - 27, W);
  rect(0, CANAL.y, RT.MW, CANAL.h, W);
  // S-Bahn tracks, and the Warschauer Straße platform next to them (world/station.ts)
  rect(13, 1, RT.MW - 13, 1, RL);
  rect(STATION.x0, STATION.y, STATION.x1 - STATION.x0 + 1, 1, PL);
  // Streets
  hroad(4, 10, RT.MW - 1);
  hroad(14, 0, RT.MW - 1);
  hroad(30, 0, RT.MW - 1);
  hroad(40, 0, RT.MW - 1);
  vroad(10, 0, RT.MH - 1);
  vroad(38, 3, GORLI.y0 - 1);
  vroad(60, 3, RT.MH - 1);
  // promenades along both banks of the canal: Paul-Lincke-Ufer (north) and Maybachufer (south)
  for (let x = 1; x < RT.MW - 1; x++) { pave(x, CANAL.y - 2, S); pave(x, CANAL.y + CANAL.h + 1, S); }
  buildGorli();
  buildTerraces();

  // Buildings
  building(TOWER.x, TOWER.y, TOWER.w, TOWER.h, 'tower');
  building(63, 7, 8, 6, 'station');
  SHOPS.forEach(sh => {
    building(sh.x, sh.y, sh.w, sh.h, 'altbau', { v: sh.v, shop: { label: sh.label, band: sh.band, ink: sh.ink, door: true } });
    set(sh.dx, sh.doorY, D);
  });
  // places you can walk into (data/places.ts)
  PLACES.forEach(p => {
    building(p.x, p.y, p.w, p.h, 'altbau', { v: p.v, shop: { label: p.label, band: p.band, ink: p.ink, door: true, awning: p.awning } });
    set(p.dx, p.doorY, D);
  });
  // Mustafa's Gemüse Kebap: the famous Imbiss (the real one is on Mehringdamm), on the green west of Humana
  building(3, 3, 5, 3, 'altbau', { v: 2, shop: { label: "MUSTAFA'S", band: '#c4162a', ink: '#fff6a8', door: false } });
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
  for (let x = 0; x < RT.MW; x++) { tree(x, 0); tree(x, RT.MH - 2); tree(x, RT.MH - 1); }
  for (let y = 0; y < RT.MH; y++) { tree(0, y); tree(RT.MW - 1, y); }
  [[1, 1], [3, 3], [5, 5], [2, 7], [6, 8], [3, 10], [5, 12], [7, 3], [8, 7], [7, 10], [1, 8], [1, 11], [2, 17], [5, 18], [3, 20], [7, 17], [14, 17], [16, 19],
   [42, 17], [45, 19], [48, 17], [51, 19], [54, 17], [57, 18], [44, 21], [52, 20],
   [56, 7], [57, 8], [58, 7], [56, 10], [58, 11], [57, 12], [36, 8], [36, 11], [25, 8],
   [3, 28], [9 - 1, 27], [16, 28], [22, 27], [28, 28], [34, 27], [44, 28], [49, 27], [57, 28], [64, 27], [69, 28],
   [55, 33], [56, 35], [58, 34], [57, 37], [55, 38], [1, 34], [1, 37],
   [63, 34], [65, 33], [67, 35], [69, 33], [64, 37], [66, 38], [70, 36], [68, 38],
   [20, 2], [30, 2], [44, 2], [55, 2], [41, 8], [43, 7], [46, 9], [42, 11], [45, 11], [44, 9], [66, 2], [12 + 3, 46 - 3], [45, 34], [36, 35],
   // trees along the Landwehrkanal banks
   [3, 47], [7, 47], [17, 47], [22, 47], [27, 47], [33, 47], [44, 47], [50, 47], [57, 47], [69, 47],
   [3, 51], [7, 51], [17, 51], [22, 51], [27, 51], [33, 51], [48, 51], [57, 51], [64, 51], [68, 51],
   [5, 44], [20, 44], [30, 44], [52, 44], [66, 44], [5, 54], [24, 54], [32, 54], [50, 54], [66, 54],
   // trees in Görli
   [15, 57], [18, 60], [35, 57], [36, 60], [41, 56], [24, 68], [36, 66], [40, 68], [57, 63], [49, 68]
  ].forEach(([x, y]) => tree(x, y));

  RT.ents = cityPeople();
}

/* ================= ENTITIES ================= */
/** Off the map: where street NPCs who left are parked. */
export const OFF_MAP = -10;
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
    { kind: 'sign', x: 46, y: 27, lines: ['MOLECULE MAN · in the Spree', 'Three aluminium figures, 30 m tall, by the American artist Jonathan Borofsky (1999). They meet in the river where Friedrichshain, Kreuzberg and Treptow touch.', '(The holes stand for the molecules we are all made of.)'] },
    // Litfaßsäule next to the Fernsehturm: the guest list (ui/players.ts)
    { kind: 'column', x: 48, y: 16, lines: ['LITFASSSÄULE · The guest list', 'Everyone who has tried the doors of Berlin: who made it into every club, who is still out, who just arrived.'] },
    { kind: 'sign', x: 63, y: 13, lines: ['S OSTKREUZ', 'The busiest S-Bahn interchange in town. Change here for Schöneweide and RSO.'] },
    // the road south out of town; walking towards it turns you back (STREET_TRIGGERS in world/street.ts)
    { kind: 'sign', x: 8, y: RT.MH - 4, lines: ['MÜNCHEN · 585 km', '(Someone has drawn a tiny man in lederhosen on it.)'] },
    // Görlitzer Park (researched)
    { kind: 'sign', x: 42, y: 54, lines: ['GÖRLITZER PARK', 'Built from the late 1980s on the tracks of the old Görlitzer Bahnhof.', 'Open day and night. (A sticker on the sign: GÖRLI BLEIBT AUF!)'] },
    // the Landwehrkanal (researched): Admiralbrücke, La Maison on Paul-Lincke-Ufer, Ankerklause at Kottbusser Brücke
    { kind: 'sign', x: 13, y: 47, lines: ['ADMIRALBRÜCKE', 'Built 1880 to 1882, the oldest iron bridge over the Landwehrkanal. Cobblestones, old lanterns, people on the bollards.', 'On summer evenings half of Kreuzberg sits here with a beer and watches the sunset. It gets cleared at 10pm, so the neighbours can sleep.'] },
    { kind: 'sign', x: 30, y: 47, lines: ['LANDWEHRKANAL · Paul-Lincke-Ufer', 'The canal between Kreuzberg and Neukölln. Swans, plane trees, and people drinking spritz on the bank.'] },
    // the main street east out of town; walking towards the edge turns you back (STREET_TRIGGERS)
    { kind: 'sign', x: STATION.x1, y: STATION.y, lines: ['S+U WARSCHAUER STRASSE', 'S-Bahn: S3, S5, S7, S75, S9. Change for the U1 on the other side of the bridge.', 'Berghain is ten minutes on foot. Just follow the people running.'] },
    // the street west out of town (STREET_TRIGGERS)
    { kind: 'sign', x: 1, y: 28, lines: ['HANNOVER · 285 km', '(Nobody has drawn anything on this one.)'] },
    { kind: 'sign', x: 69, y: 43, lines: ['COTTBUS · 130 km', '(Someone has stuck a FCK AFD sticker on it.)'] }
  );
  // the animals at the Görli children's farm
  ([[16, 67, 'goat'], [18, 68, 'goat'], [21, 67, 'donkey'], [22, 65, 'donkey'], [20, 68, 'sheep'], [23, 68, 'rabbit'], [16, 68, 'rabbit']] as const)
    .forEach(([x, y, species], i) => ents.push({ kind: 'animal', species, x, y, dir: i % 2 ? 'left' : 'right', lines: [{ goat: 'Goat: Meh-eh-eh.', donkey: 'Donkey: I-aaah!', sheep: 'Sheep: Mäh.', rabbit: '(The rabbit wiggles its nose at you.)' }[species]] }));
  // people from data/npcs.ts; `home` lets Start over bring back the ones who left
  NPCS.forEach(n => ents.push({ kind: 'npc', npcId: n.id, x: n.x, y: n.y, dir: n.dir || 'down', look: n.look, lines: n.lines, act: n.act, leave: n.leave, home: { x: n.x, y: n.y } }));
  return ents;
}

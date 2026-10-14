// Shared types for the whole game.

export type Dir = 'up' | 'down' | 'left' | 'right';

/** How a person is drawn. Colours are CSS hex strings. */
export interface Look {
  skin: string;
  top: string;
  legs: string;
  hair?: string;
  bald?: boolean;
  long?: boolean;
  big?: boolean;
  hat?: string;
  shades?: boolean;
  glasses?: string;
  beard?: string;
  tattoo?: boolean;
  stripes?: string;
  shine?: string;
  sparkle?: string;
  harness?: boolean;
  shirt?: string;
  tie?: string;
  ears?: string;
  flowers?: string[];
  paint?: string;
  blush?: boolean;
}

/* ---------- clubs ---------- */

export interface Question {
  q: string;
  /** answers; the first one is correct (shuffled in game) */
  a: string[];
  /** shown after a wrong answer */
  fact: string;
}

export interface ClubDef {
  id: string;
  name: string;
  area: string;
  x: number; y: number; w: number; h: number;
  /** how many questions the bouncer asks */
  need: number;
  /** sign position relative to the bouncer */
  signSide: number;
  style: string;
  glow: string;
  initials: string;
  look: Look;
  greet: string[];
  reject: string;
  accept: string[];
  again: string;
  inside: string;
  sign: string[];
  pool: Question[];
}

/** A club with its door position worked out. */
export interface Club extends ClubDef {
  /** door column */
  dx: number;
  /** door row */
  doorY: number;
  /** row of the pavement in front of the door, where the bouncer stands */
  by: number;
}

/* ---------- clothes and shops ---------- */

export type Tag = 'black' | 'latex' | 'colorful' | 'vintage' | 'tourist' | 'suit' | 'tech';

export interface Outfit {
  name: string;
  tags: Tag[];
  look: Partial<Look>;
}

export interface Character {
  id: string;
  name: string;
  desc: string;
  /** kept when changing clothes */
  body: Partial<Look>;
  /** starting outfit id */
  outfit: string;
}

export interface DressCode {
  /** at least one of these tags is required */
  ok?: Tag[];
  /** none of these tags is allowed */
  no?: Tag[];
  hint: string;
  no_line: string;
}

export interface ShopDef {
  id: string;
  name: string;
  area: string;
  x: number; y: number; w: number; h: number;
  /** building colour variant */
  v: number;
  band: string;
  ink: string;
  label: string;
  line: string;
  items: string[];
}

export interface Shop extends ShopDef {
  dx: number;
  doorY: number;
  by: number;
}

/* ---------- world ---------- */

export interface Point { x: number; y: number }

export type BottleType = 'beer' | 'mate' | 'can';

/** Anything standing on the map: people, signs, bottles, groups on a bed. */
export interface Entity {
  kind: 'npc' | 'sign' | 'bouncer' | 'bottle' | 'pile';
  x: number;
  y: number;
  /** width in tiles (groups on a bed) */
  w?: number;
  dir?: Dir;
  look?: Look;
  lines?: string[];
  /** quest handler name in ACTS */
  act?: string;
  name?: string;
  club?: Club;
  /** horizontal pixel offset while sliding aside */
  ox?: number;
  dance?: boolean;
  phase?: number;
  home?: Point;
  /** walk-through pickups (bottles) */
  pickup?: boolean;
  bid?: string;
  type?: BottleType;
  story?: string;
  movedWhen?: string;
  movedTo?: [number, number];
  pile?: boolean;
  join?: 'yes' | 'no' | 'busy';
  looks?: Look[];
  sheet?: string;
}

export interface Road { h: boolean; x?: number; y?: number; a: number; b: number }

export interface ShopSign { label: string; band: string; ink: string; door: boolean }

export interface Building {
  x: number; y: number; w: number; h: number;
  kind: 'altbau' | 'station' | 'tower' | 'obtower';
  v?: number;
  shop?: ShopSign;
}

export interface Rect { x0: number; y0: number; x1: number; y1: number }

export interface Scene {
  id: string;
  club?: string;
  floor?: string;
  map: number[][];
  w: number;
  h: number;
  ents: Entity[];
  canvas: HTMLCanvasElement;
  /** bounding box of the dancefloor tiles */
  dance?: Rect;
}

/* ---------- club interiors (data in data/interiors.ts) ---------- */

export interface FloorLink { to: string; at: string }

export interface PersonDef extends Partial<Entity> {
  x: number;
  y: number;
}

export interface FloorDef {
  label: string;
  short: string;
  /** ASCII map, see the legend in data/interiors.ts */
  map: string[];
  spawn: Record<string, [number, number, Dir]>;
  up?: FloorLink;
  down?: FloorLink;
  exit?: boolean;
  /** doorways: map digit -> floor */
  doors?: Record<string, FloorLink>;
  dancers?: number;
  people: PersonDef[];
  bottles?: [number, number, BottleType][];
  /** fairy light strings [x0, y0, x1, y1] */
  fairy?: [number, number, number, number][];
  lanterns?: [number, number][];
  steam?: boolean;
  daylight?: boolean;
  uv?: boolean;
  red?: boolean;
  /** colours of the moving light spots */
  spots?: string[];
}

export interface QuestDef { id: string; title: string; hint: string }

export interface DancerPalette {
  style?: 'kinky';
  hair: string[];
  tops: string[];
  legs: string[];
  extras: string[];
}

export interface InteriorDef {
  name: string;
  floors: Record<string, FloorDef>;
  examine: Record<string, string[]>;
  /** tiles that run a quest handler when examined */
  examineActs?: Record<string, string>;
  dancerLines: string[];
  dancerPalette?: DancerPalette;
  quests: QuestDef[];
  welcome?: string[];
  stories?: Record<string, string[]>;
}

/* ---------- saved progress ---------- */

export interface Pfand {
  carry: number;
  carryCents: number;
  returned: number;
  cents: number;
  taken: Record<string, boolean>;
}

export interface GameState {
  stamps: Record<string, boolean>;
  intro: boolean;
  finale: boolean;
  outfit: string;
  char: string | null;
  quests: Record<string, boolean>;
  visited: Record<string, boolean>;
  sunrise: Record<string, boolean>;
  coatNo: number;
  kStage: number;
  pfand: Pfand;
  heard: Record<string, boolean>;
  danced: Record<string, boolean>;
  kkStripped: boolean;
}

export interface Player {
  dur: number;
  x: number; y: number;
  tx: number; ty: number;
  dir: Dir;
  moving: boolean;
  t: number;
  n: number;
}

export interface SaveData extends Partial<GameState> {
  zoom?: { i: number; fit: boolean };
  x?: number;
  y?: number;
  dir?: Dir;
}

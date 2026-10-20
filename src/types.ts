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
  /** crying: tears running down the cheeks */
  tears?: boolean;
  /** riding a bike (Taski) */
  bike?: boolean;
  /** a delivery box on the back, in this colour (Taski's Wolt box) */
  box?: string;
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
  /** colour of a ₿ printed on the front of the top */
  btc?: string;
  /** hair as a mohawk: a strip down the middle, shaved sides */
  mohawk?: boolean;
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
  /** the bouncer's name in the narration, e.g. "(Sven looks you up and down.)"; default "The bouncer" */
  bouncer?: string;
  /** a yes/no question before the dress check (Sven at Berghain): "No" means you're turned away right there */
  intro?: { ask: string; yes: string[]; no: string };
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

/** A building you can walk into freely (no bouncer, no stamp); its inside is an INTERIORS entry with the same id. */
export interface PlaceDef {
  id: string;
  name: string;
  x: number; y: number; w: number; h: number;
  /** building colour variant */
  v: number;
  band: string;
  ink: string;
  label: string;
  /** striped awning over the front (the Ankerklause) */
  awning?: [string, string];
  /** handler in ACTS run every time you walk in (e.g. someone comes up to greet you) */
  enter?: string;
}
export interface Place extends PlaceDef {
  dx: number;
  doorY: number;
  by: number;
}

/** A haircut from Antonio's: replaces the hair of the player's character. */
export interface HairStyle {
  name: string;
  look: Partial<Look>;
}

/* ---------- world ---------- */

export interface Point { x: number; y: number }

export type BottleType = 'beer' | 'mate' | 'can';

/** Anything standing on the map: people, signs, bottles, groups on a bed. */
/** A person standing on the street (data/npcs.ts). */
export interface NpcDef {
  /** unique, used to remember who has left */
  id: string;
  x: number;
  y: number;
  dir?: Dir;
  look: Look;
  /** said one after another; start each with "Name: " */
  lines?: string[];
  /** custom behaviour in world/street.ts, instead of (or after) the lines */
  act?: string;
  /** after talking, walk off this way, fade out and stay gone */
  leave?: 'left' | 'right';
}

export interface Entity {
  kind: 'npc' | 'sign' | 'column' | 'bouncer' | 'bottle' | 'pile' | 'animal';
  /** animals at the Görli children's farm */
  species?: 'goat' | 'donkey' | 'sheep' | 'rabbit';
  /** street NPCs: id from data/npcs.ts */
  npcId?: string;
  leave?: 'left' | 'right';
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
  /** pixel offset while sliding to the next tile (eased back to 0 every frame) */
  ox?: number;
  oy?: number;
  /** 0..1, for people fading out */
  alpha?: number;
  /** people at the S-Bahn station (world/station.ts) */
  passenger?: 'waiting' | 'boarding' | 'running';
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

/** A two-lane road: horizontal at row y, or vertical at column x, from a to b. */
export type Road = { h: true; y: number; a: number; b: number } | { h: false; x: number; a: number; b: number };

export interface ShopSign { label: string; band: string; ink: string; door: boolean; /** striped awning over the front, two colours */ awning?: [string, string] }

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

/** A club floor: always belongs to a club and has a dancefloor box (possibly empty). */
export interface ClubScene extends Scene {
  club: string;
  floor: string;
  dance: Rect;
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
  /** where the spiral staircase (`/`) goes */
  spiral?: FloorLink;
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
  /** thick drifting fog (the Tresor vault) */
  fog?: boolean;
  /** a short white strobe flash every few seconds */
  strobe?: boolean;
  /** coloured light beams sweeping across the floor from the rig above (Berghain main floor) */
  beams?: boolean;
  /** violet light falling through the church-like windows (`W`) onto the floor (Panorama Bar) */
  violet?: boolean;
  daylight?: boolean;
  uv?: boolean;
  red?: boolean;
  /** colours of the moving light spots */
  spots?: string[];
  /** a glass roof drawn over these tiles [x0, y0, x1, y1] */
  roof?: [number, number, number, number];
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
  /** Sisyphos MDMA chain: 0 not asked, 1 find Ronny's hat, 2 have the hat, 3 have the pill, 4 done */
  mdStage: number;
  pfand: Pfand;
  heard: Record<string, boolean>;
  danced: Record<string, boolean>;
  kkStripped: boolean;
  /** street NPCs (by id) who walked off */
  gone: Record<string, boolean>;
  /** Heideglühen: time of night in minutes after midnight */
  hgTime: number;
  /** Heideglühen back-to-back quest: 0 not asked, 1 ask Woody, 2 Woody said yes, 3 done */
  hgStage: number;
  /** Club der Visionäre bar: 0 not tried, 1 card refused, 2 borrowed cash, 3 spent it */
  cdvCash: number;
  /** haircut from Antonio's (data/hair.ts), or null for the character's own hair */
  hair: string | null;
  /** your name on the public guest list (not unique; the login id is) */
  name: string | null;
  /** active play time in ms: only while the game is open and in front */
  playMs: number;
  /** play time when you got your last stamp */
  finishPlayMs: number | null;
  /** the finish has been recorded on the guest list */
  onlineFinished: boolean;
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
  /** street map layout the position was saved on (missing: the first layout) */
  map?: number;
  dir?: Dir;
}

/* ---------- runtime UI state ---------- */

export interface DialogState {
  mode: 'say' | 'ask';
  ready: boolean;
  resolve: (choice: number) => void;
  /** number of choices (ask) */
  n: number;
  /** selected choice (ask) */
  sel: number;
}

export interface Typing { id: ReturnType<typeof setInterval>; finish: () => void }

export interface ShopUI { shop: Shop; sel: number; entries: string[] }

/** step 1: man/woman, 2: character, 3: your name. nameOnly: just asking an existing player for a name */
/** While a mini game (the MDMA runner, the DJ set) is on, the buttons and keys go to it. */
export interface RunnerHooks { dir(d: Dir): void; jump(): void; /** a direction let go (for games you steer by holding) */ release?(d: Dir): void; /** music style while it runs (default 'runner') */ music?: string }
export type Gender = 'man' | 'woman' | 'nb';
export interface CreatorState { step: 1 | 2 | 3; sel: number; gender: Gender; nameOnly?: boolean }

export interface TouchState { x: number; y: number; dir: Dir | null; far?: boolean; menu?: boolean }

/** Someone walking behind you (Sascha on the way to the darkroom). */
export interface Follower {
  name: string;
  look: Look;
  quest: string;
  ent: Entity;
  homeScene: string;
  x: number; y: number;
  /** previous tile, for the walk animation */
  px: number; py: number;
  dir: Dir;
}

/** A quest handler: runs when you talk to someone (e) or examine a tile (e = null) on a club floor. */
export type Act = (e: Entity | null, clubId: string) => Promise<void>;

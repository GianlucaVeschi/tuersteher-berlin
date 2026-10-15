import { CLUBS } from './clubs';
import type { Character, DressCode, Gender, Look, Outfit, Shop, ShopDef, Tag } from '../types';
/* ================= OUTFITS & SHOPS ================= */
export const TAG_LABEL: Record<Tag, string> = { black: 'ALL BLACK', latex: 'FETISH', colorful: 'COLORFUL', vintage: 'VINTAGE', tourist: 'TOURIST', suit: 'FANCY', tech: 'TECH' };
export const BASE_LOOK: Pick<Look, 'skin' | 'hair'> = { skin: '#f0c7a0', hair: '#2b1f1a' };
export const OUTFITS: Record<string, Outfit> = {
  tourist:     { name: 'Red hoodie & cap',       tags: ['tourist'],             look: { top: '#e04f5f', legs: '#26243a', hat: '#1c1a28' } },
  sunhat:      { name: 'Sun hat & souvenir tee', tags: ['tourist'],             look: { top: '#f2c14e', legs: '#4ea8de', hat: '#efe3c0' } },
  flannel:     { name: 'Flannel & beanie',       tags: ['vintage'],             look: { top: '#8a2f2f', legs: '#2b3f6b', stripes: '#3a1f1f', hat: '#3a5a40' } },
  knit:        { name: 'Oversized knit & mom jeans', tags: ['vintage'],         look: { top: '#c98a4a', legs: '#5a7aa8' } },
  techvest:    { name: 'Fleece vest & sneakers', tags: ['tech'],                look: { top: '#2f3b4a', legs: '#4a4a58', shirt: '#cfd8e3' } },
  painter:     { name: 'Paint-splattered overalls', tags: ['colorful', 'vintage'], look: { top: '#e9e4d6', legs: '#d9d2c0', sparkle: '#d94bd1' } },
  thriftblack: { name: 'All-black thrift fit',   tags: ['black'],               look: { top: '#1a1920', legs: '#1a1920' } },
  seventies:   { name: '70s suede jacket',       tags: ['vintage'],             look: { top: '#a8653a', legs: '#3b4a6b' } },
  gdr:         { name: 'GDR work jacket',        tags: ['vintage'],             look: { top: '#3d5f94', legs: '#3d5f94', stripes: '#2c4672' } },
  suit:        { name: "Grandpa's suit",         tags: ['suit'],                look: { top: '#4a4a58', legs: '#4a4a58', tie: '#b8323a' } },
  latex:       { name: 'Black latex catsuit',    tags: ['latex', 'black'],      look: { top: '#0c0c12', legs: '#0c0c12', shine: '#6a6a88' } },
  harness:     { name: 'Leather harness',        tags: ['latex', 'black'],      look: { top: '#f0c7a0', legs: '#0c0c12', harness: true } },
  redlatex:    { name: 'Red latex dress',        tags: ['latex'],               look: { top: '#c4162a', legs: '#c4162a', shine: '#ff7a8a' } },
  glitter:     { name: 'Glitter bodysuit',       tags: ['colorful'],            look: { top: '#d94bd1', legs: '#7a3fd1', sparkle: '#fff6a8' } },
  rainbow:     { name: 'Neon mesh & shiny pants', tags: ['colorful'],           look: { top: '#4ea8de', legs: '#c0c0d8', stripes: '#f2c14e' } },
  nineties:    { name: '90s windbreaker',        tags: ['colorful', 'vintage'], look: { top: '#2bb3a3', legs: '#3a3a8a', stripes: '#f2c14e' } },
  mesh:        { name: 'Black mesh & cargos',    tags: ['black'],               look: { top: '#2a2a33', legs: '#1a1920', stripes: '#14121c' } },
  sailor:      { name: 'Sailor stripes',         tags: ['colorful', 'vintage'], look: { top: '#f3eee3', legs: '#2b3f6b', stripes: '#2b4c7a', hat: '#f3eee3' } }
};

// Starting characters. `body` is kept when you change clothes; `outfit` is what they start in.
export const CHARACTERS: Record<Gender, Character[]> = {
  man: [
    { id: 'tourist_m', name: 'The Tourist', desc: 'First night in Berlin. Very excited, very visible.', body: { skin: '#f3c9a8', hair: '#c9a24a' }, outfit: 'tourist' },
    { id: 'hipster_m', name: 'The Hipster', desc: 'Moved to Neukölln in 2014. Has opinions about coffee.', body: { skin: '#e2b08c', hair: '#5a3a22', beard: '#5a3a22' }, outfit: 'flannel' },
    { id: 'tech_m', name: 'The Tech Guy', desc: "Works at a scale-up. Says 'synergy' without irony.", body: { skin: '#d9a27c', hair: '#1a1a1a', glasses: '#9fc7e6' }, outfit: 'techvest' },
    { id: 'local_m', name: 'The Local', desc: 'Born in Friedrichshain. Already dressed in black.', body: { skin: '#8d5a3b', hair: '#111111' }, outfit: 'thriftblack' }
  ],
  woman: [
    { id: 'tourist_f', name: 'The Tourist', desc: 'Interrailing through Europe. Berlin is stop four.', body: { skin: '#f3c9a8', hair: '#d9b25c', long: true }, outfit: 'sunhat' },
    { id: 'hipster_f', name: 'The Hipster', desc: 'Runs a vintage stall at the Mauerpark flea market on Sundays.', body: { skin: '#f0c7a0', hair: '#b04a2a', glasses: '#9fc7e6' }, outfit: 'knit' },
    { id: 'tech_f', name: 'The Tech Girl', desc: 'Product manager. Has a roadmap for tonight.', body: { skin: '#c98d6a', hair: '#2a1a14', long: true }, outfit: 'techvest' },
    { id: 'artist_f', name: 'The Art Student', desc: 'Second year at art school. Paint on everything.', body: { skin: '#e2b08c', hair: '#7a3fd1', long: true }, outfit: 'painter' }
  ],
  nb: [
    { id: 'tourist_n', name: 'The Tourist', desc: 'Came for one weekend. Already looking at flats.', body: { skin: '#f0c7a0', hair: '#2bb3a3' }, outfit: 'nineties' },
    { id: 'hipster_n', name: 'The Hipster', desc: 'Makes a queer zine in a Neukölln back room. Bikes everywhere.', body: { skin: '#c98d6a', hair: '#d94a8a', glasses: '#9fc7e6' }, outfit: 'seventies' },
    { id: 'tech_n', name: 'The Engineer', desc: 'Writes Rust by day, dances techno by night, declines all meetings.', body: { skin: '#8d5a3b', hair: '#111111', long: true }, outfit: 'techvest' },
    { id: 'local_n', name: 'The Local', desc: 'Grew up in Wedding. Knows half the bouncers by first name.', body: { skin: '#e2b08c', hair: '#9a9a9a' }, outfit: 'mesh' }
  ]
};
/** Step 1 of the character creator. */
export const GENDERS: { id: Gender; label: string }[] = [{ id: 'man', label: 'Man' }, { id: 'woman', label: 'Woman' }, { id: 'nb', label: 'Non-binary' }];
export const ALL_CHARS = CHARACTERS.man.concat(CHARACTERS.woman, CHARACTERS.nb);
export const charById = (id: string | null): Character | null => ALL_CHARS.find(c => c.id === id) || null;
// Dress codes: `ok` = at least one of these tags required; `no` = none of these tags allowed.
export const DRESS: Record<string, DressCode> = {
  berghain:   { ok: ['black'],               hint: 'All black. Nothing flashy.',            no_line: 'Sven: … Nein.' },
  tresor:     { ok: ['black'],               hint: 'Dark and functional. Black works.',     no_line: 'Jens: Bit bright for a vault, mate.' },
  kitkat:     { ok: ['latex'],               hint: 'Fetish: latex, leather or very little.', no_line: "Dee: Darling, you're wearing far too much. And the wrong things." },
  rso:        { no: ['tourist', 'suit', 'tech'], hint: 'Dressed for a long weekend in a brewery. No tourist look, no tech vest, nothing fancy.', no_line: "Ronja: You look like you're here for a brewery tour. Not tonight." },
  katerblau:  { ok: ['colorful', 'vintage'], hint: 'Colorful, playful, a bit of costume.',  no_line: 'Olli: Too serious for the boat! Bring some color.' },
  sisyphos:   { ok: ['colorful'],            hint: 'Bright colors, glitter, festival.',     no_line: "Mo: It's a festival in here, not a funeral. Color, please." },
  heidegluehen: { ok: ['vintage', 'colorful'], hint: 'House heads: vintage or colourful, something cosy for the fire.', no_line: 'Lotte: Too serious for a campfire, honey. Bring some warmth.' },
  cdv:        { no: ['suit'],                hint: 'Relaxed. Just not too fancy.',          no_line: 'Uwe: Bit fancy for a wooden deck, no?' }
};
export function dressOK(clubId: string, outfitId: string): boolean {
  const d = DRESS[clubId], tags = OUTFITS[outfitId].tags;
  const { ok, no } = d;
  if (ok && !tags.some(t => ok.includes(t))) return false;
  if (no && tags.some(t => no.includes(t))) return false;
  return true;
}

const SHOP_DEFS: ShopDef[] = [
  { id: 'humana', name: 'Humana', area: 'Frankfurter Tor', x: 15, y: 10, w: 3, h: 3, v: 0, band: '#e9e4d6', ink: '#2a6a4a', label: 'HUMANA',
    line: 'Humana: Second-hand, floor after floor of it. Try anything on.', items: ['thriftblack', 'seventies', 'gdr', 'suit', 'tourist'] },
  { id: 'blackstyle', name: 'Blackstyle', area: 'Prenzlauer Berg', x: 21, y: 10, w: 3, h: 3, v: 1, band: '#0c0c12', ink: '#e8e8f0', label: 'BLACKSTYLE',
    line: "Blackstyle: Latex made in Berlin since 1992. Fitting room's at the back.", items: ['latex', 'harness', 'redlatex'] },
  { id: 'coexist', name: 'Coexist', area: 'Friedrichshain', x: 15, y: 36, w: 3, h: 3, v: 1, band: '#2bb3a3', ink: '#14121c', label: 'COEXIST',
    line: 'Coexist: 90s, 00s, black, neon. Something for every door.', items: ['nineties', 'mesh', 'sailor'] },
  { id: 'voo', name: 'Voo Store', area: 'Oranienstraße, Kreuzberg', x: 32, y: 36, w: 3, h: 3, v: 2, band: '#d94bd1', ink: '#fff6a8', label: 'VOO STORE',
    line: 'Voo Store: Designer pieces in an old Kreuzberg backyard. Try the loud ones on.', items: ['glitter', 'rainbow'] }
];
export const SHOPS: Shop[] = SHOP_DEFS.map(sh => ({ ...sh, dx: sh.x + Math.floor(sh.w / 2), doorY: sh.y + sh.h - 1, by: sh.y + sh.h }));
CLUBS.forEach(c => { c.sign = c.sign.concat('Dress code: ' + DRESS[c.id].hint); });

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
  sailor:      { name: 'Sailor stripes',         tags: ['colorful', 'vintage'], look: { top: '#f3eee3', legs: '#2b3f6b', stripes: '#2b4c7a', hat: '#f3eee3' } },
  // starting clothes of the characters below (flannel, knit, techvest and painter were the old ones; kept for old saves)
  puffer:      { name: 'Lilac puffer & wide jeans', tags: ['colorful'],         look: { top: '#c28cff', legs: '#5a7aa8', stripes: '#a46ee0' } },
  chrome:      { name: 'Chrome top & baggy cargos', tags: ['colorful'],         look: { top: '#c9ced8', legs: '#4a5a3a', shine: '#ffffff' } },
  pinkvest:    { name: 'Pink knit vest & flares',  tags: ['colorful'],          look: { top: '#ff8cc4', legs: '#2a2a33', stripes: '#ffd23f' } },
  leather:     { name: 'Old leather jacket, all black', tags: ['black'],        look: { top: '#14121c', legs: '#1a1920', shine: '#4a4a5a' } },
  turtleneck:  { name: 'Black turtleneck & leather trousers', tags: ['black'],  look: { top: '#1a1920', legs: '#0c0c12', shine: '#3a3a4a' } },
  bandtee:     { name: 'Band tee & ripped jeans',  tags: ['vintage'],           look: { top: '#2a2a33', legs: '#5a7aa8', stripes: '#c94a3a' } },
  slipdress:   { name: 'Thrifted slip dress & Docs', tags: ['vintage'],         look: { top: '#5a2a4a', legs: '#5a2a4a', stripes: '#14121c' } },
  patches:     { name: 'Patched denim vest & plaid', tags: ['vintage'],         look: { top: '#3b4a6b', legs: '#26242e', stripes: '#8a2f2f' } },
  raincoat:    { name: 'Rain jacket & bum bag',    tags: ['tourist'],           look: { top: '#ff8c42', legs: '#4a4a58', hat: '#2b4c7a' } }
};

// Starting characters. `body` is kept when you change clothes; `outfit` is what they start in.
// The same four for everyone, each with clothes they'd really wear, and skin tones from light to dark.
export const CHARACTERS: Record<Gender, Character[]> = {
  man: [
    { id: 'trendy_m', name: 'The Trendy', desc: 'Possibly cooler than you. Works in fashion PR. Shirt from Voo, sneakers from Tokyo, opinions from Instagram.', body: { skin: '#5c3a26', hair: '#111111', beard: '#111111' }, outfit: 'puffer' },
    { id: 'legend_m', name: 'The Local Legend', desc: 'Danced at the first Tresor in 1991. The bouncers call him by his first name.', body: { skin: '#f0c7a0', hair: '#9a9a9a', bald: true, beard: '#9a9a9a' }, outfit: 'leather' },
    { id: 'alt_m', name: 'The Alternative', desc: 'Lives in a Friedrichshain house project. Punk band on Tuesdays, techno on weekends.', body: { skin: '#c98d6a', hair: '#2bb3a3', mohawk: true, tattoo: true }, outfit: 'bandtee' },
    { id: 'tourist_m', name: 'The Tourist', desc: 'First night in Berlin. Very excited, very visible.', body: { skin: '#f3c9a8', hair: '#c9a24a' }, outfit: 'tourist' }
  ],
  woman: [
    { id: 'trendy_f', name: 'The Trendy', desc: 'Possibly cooler than you. Has a moodboard for tonight. Knows every new bar before it opens.', body: { skin: '#d9a27c', hair: '#2a1a14', long: true, shades: true }, outfit: 'chrome' },
    { id: 'legend_f', name: 'The Local Legend', desc: 'Thirty years of Sundays at Panorama Bar. Has seen every sunrise there.', body: { skin: '#6b4329', hair: '#c9c9c9', long: true }, outfit: 'turtleneck' },
    { id: 'alt_f', name: 'The Alternative', desc: 'Goth on weekdays, goth on weekends. Bought her boots at Humana in 2009.', body: { skin: '#f0c7a0', hair: '#7a3fd1', long: true, tattoo: true }, outfit: 'slipdress' },
    { id: 'tourist_f', name: 'The Tourist', desc: 'Interrailing through Europe. Berlin is stop four.', body: { skin: '#8d5a3b', hair: '#111111', long: true }, outfit: 'sunhat' }
  ],
  nb: [
    { id: 'trendy_n', name: 'The Trendy', desc: 'Possibly cooler than you. A model scout found them at Kotti. Now they decide what Kotti wears.', body: { skin: '#f3c9a8', hair: '#ff8cc4' }, outfit: 'pinkvest' },
    { id: 'legend_n', name: 'The Local Legend', desc: 'Grew up in Wedding. Knows half the bouncers and all the toilets.', body: { skin: '#8d5a3b', hair: '#111111', glasses: '#c9a24a' }, outfit: 'mesh' },
    { id: 'alt_n', name: 'The Alternative', desc: 'Makes a queer zine in a Neukölln back room. Bikes everywhere.', body: { skin: '#5c3a26', hair: '#b6f36b', long: true }, outfit: 'patches' },
    { id: 'tourist_n', name: 'The Tourist', desc: 'Came for one weekend. Already looking at flats.', body: { skin: '#e2b08c', hair: '#5a3a22', glasses: '#9fc7e6' }, outfit: 'raincoat' }
  ]
};
/** Old character ids (before the four types above) → the new one that's closest, so old saves keep a body. */
const OLD_CHARS: Record<string, string> = {
  hipster_m: 'alt_m', tech_m: 'trendy_m', local_m: 'legend_m',
  hipster_f: 'alt_f', tech_f: 'trendy_f', artist_f: 'alt_f',
  hipster_n: 'alt_n', tech_n: 'trendy_n', local_n: 'legend_n'
};
/** Step 1 of the character creator. */
export const GENDERS: { id: Gender; label: string }[] = [{ id: 'man', label: 'Man' }, { id: 'woman', label: 'Woman' }, { id: 'nb', label: 'Non-binary' }];
export const ALL_CHARS = CHARACTERS.man.concat(CHARACTERS.woman, CHARACTERS.nb);
export const charById = (id: string | null): Character | null => { const k = id && (OLD_CHARS[id] ?? id); return ALL_CHARS.find(c => c.id === k) || null; };
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

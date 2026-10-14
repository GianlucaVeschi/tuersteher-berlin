(function () {
'use strict';
const $ = s => document.querySelector(s);
const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= DATA ================= */
const CLUBS = [
  {
    id: 'berghain', name: 'Berghain', area: 'Friedrichshain', x: 26, y: 7, w: 10, h: 6, need: 3, signSide: 2,
    style: 'berghain', glow: '#ff4d6d', initials: 'BG',
    look: { skin: '#e2b08c', bald: true, top: '#111016', legs: '#111016', big: true, tattoo: true },
    greet: ['Türsteher: …', '(He looks at you. For a long time.)', 'Türsteher: Three questions. One wrong and you go home.'],
    reject: 'Türsteher: Heute nicht.',
    accept: ['(He nods. Barely.)', 'Türsteher: Rein.'],
    again: 'Türsteher: … Go.',
    inside: 'Concrete, fog and a kick drum you feel in your teeth. You walk out Sunday afternoon.',
    sign: ['BERGHAIN · Friedrichshain', 'No sign on the building, on purpose. A former power plant, open since 2004.', 'Upstairs: Panorama Bar. Cameras get a sticker. Come alone or in a small group.'],
    pool: [
      { q: 'What was this building before it was a club?', a: ['A power plant', 'A bank vault', 'A dog biscuit factory', 'A church'], fact: 'It was an East German heating power plant.' },
      { q: "What's the floor upstairs called?", a: ['Panorama Bar', 'Sky Lounge', 'Globus', 'Dachboden'], fact: 'Panorama Bar is upstairs. Everyone knows that.' },
      { q: 'Inside, what happens to your phone camera?', a: ['It gets a sticker', 'I film the DJ', 'Flash on all night', 'I go live'], fact: 'Cameras get stickered at the door. No photos inside.' },
      { q: 'How many are you tonight?', a: ['Just me', "We're 9, a stag party", 'Me and my hostel', "Who's asking?"], fact: 'Big loud groups rarely get in.' },
      { q: 'Since when has Berghain been open?', a: ['2004', '1991', '1989', '2016'], fact: 'Berghain opened in 2004. Before that, the crew ran Ostgut.' },
      { q: 'Why are you here tonight?', a: ['For the music', 'For a selfie', "It's on my bucket list", 'Hostel said it was easy'], fact: 'Come for the music, not the hype.' }
    ]
  },
  {
    id: 'tresor', name: 'Tresor', area: 'Köpenicker Str., Mitte', x: 20, y: 33, w: 9, h: 6, need: 2, signSide: -2,
    style: 'tresor', glow: '#6fb7ff', initials: 'TR',
    look: { skin: '#c98d6a', hair: '#2a2420', top: '#2a2b3a', legs: '#16151d', big: true, beard: '#3a2a20' },
    greet: ['Jens: Nabend. Tresor.', 'Jens: Two questions about the place, then you can go down.'],
    reject: 'Jens: Nope. Heute nicht.',
    accept: ['Jens: Not bad. Down the stairs.'],
    again: 'Jens: Back for more? Go on.',
    inside: 'Down into the vault: steel bars, strobes, Detroit techno on the decks.',
    sign: ['TRESOR · Köpenicker Straße', "Opened 1991 in the vault of the old Wertheim store. 'Tresor' means safe.", 'Since 2007 inside the old Kraftwerk power plant. Close ties to Detroit techno.'],
    pool: [
      { q: 'What year did Tresor first open?', a: ['1991', '2004', '1999', '1985'], fact: 'Tresor opened in 1991, right after the Wall came down.' },
      { q: 'Where was the very first Tresor?', a: ["In a store's old vault", 'On a boat', 'In a dog food factory', 'On a rooftop'], fact: 'It started in the vault of the Wertheim department store.' },
      { q: 'Tresor Records built a bridge to which city?', a: ['Detroit', 'Ibiza', 'Paris', 'Munich'], fact: 'Tresor released Detroit artists like Jeff Mills.' },
      { q: 'Today Tresor is inside a former…', a: ['Power plant', 'Airport', 'Swimming pool', 'Brewery'], fact: 'Since 2007 it sits in the old Kraftwerk power plant.' },
      { q: "What does 'Tresor' mean in German?", a: ['A safe', 'A bar', 'A treasure map', 'A dance'], fact: 'Tresor means safe, like a bank safe.' }
    ]
  },
  {
    id: 'kitkat', name: 'KitKatClub', area: 'Köpenicker Str., Mitte', x: 2, y: 33, w: 7, h: 6, need: 2, signSide: -2,
    style: 'kitkat', glow: '#ff7ab8', initials: 'KK',
    look: { skin: '#f0c7a0', hair: '#e83f8f', top: '#1a1118', legs: '#1a1118', big: true, shades: true },
    greet: ['Dee: Welcome to KitKat, darling.', 'Dee: Rules first. Two questions.'],
    reject: 'Dee: Heute nicht, Schatz.',
    accept: ['Dee: Gorgeous answer. In you go.'],
    again: 'Dee: Back already? Go on, darling.',
    inside: 'Mirrors, a pool, glitter and nobody judging anyone. Very Berlin.',
    sign: ['KITKATCLUB · since 1994', "Named after the club in 'Cabaret'. Dress code: fetish, or very little.", 'Consent first. Cameras stay covered.'],
    pool: [
      { q: 'What are you wearing tonight?', a: ['Latex, leather, or less', 'Jeans and a hoodie', 'A suit and tie', 'A football jersey'], fact: 'Fetish or barely anything. Street clothes get you sent home.' },
      { q: 'Our name comes from which musical?', a: ['Cabaret', 'Cats', 'Grease', 'Mamma Mia!'], fact: 'The Kit Kat Klub is the nightclub in Cabaret, set in 1930s Berlin.' },
      { q: 'Someone catches your eye. You…', a: ['Ask first', 'Just go for it', 'Take a photo', 'Follow them around'], fact: 'Consent first. Always.' },
      { q: 'Phones inside?', a: ['Camera stays covered', 'Livestream it', 'Selfies only', 'Flash on'], fact: 'No photos. What happens at KitKat stays at KitKat.' },
      { q: 'Since when has KitKat been around?', a: ['1994', '2014', '1971', '2020'], fact: 'KitKatClub started in 1994.' }
    ]
  },
  {
    id: 'aboutblank', name: '://about blank', area: 'near Ostkreuz', x: 48, y: 8, w: 7, h: 5, need: 2, signSide: -2,
    style: 'aboutblank', glow: '#b6f36b', initials: '://',
    look: { skin: '#8d5a3b', hair: '#111', top: '#3d5a40', legs: '#22222a', big: true },
    greet: ["Kim: Hey. We're a collective, so we care who comes in.", 'Kim: Two questions.'],
    reject: 'Kim: Sorry. Not tonight.',
    accept: ['Kim: Nice. Welcome to the garden.'],
    again: 'Kim: Hey again. Go on in.',
    inside: "The garden is still going at noon. Someone hands you water. That's the vibe here.",
    sign: ['://ABOUT BLANK · Ostkreuz', 'Run by a collective. Named after the empty browser page.', 'Home of Homopatik. Awareness team on site.'],
    pool: [
      { q: 'Which station is around the corner?', a: ['Ostkreuz', 'Zoologischer Garten', 'Wannsee', 'Alexanderplatz'], fact: 'Ostkreuz is a short walk away.' },
      { q: 'Who runs this club?', a: ['A collective', 'A hotel chain', 'A football club', 'A bank'], fact: "It's run by a collective. No boss, lots of meetings." },
      { q: 'In a browser, what is about:blank?', a: ['An empty page', 'A virus', 'A cookie', 'A password'], fact: "about:blank is the browser's empty page. Hence the name." },
      { q: "Someone tells you they're not OK. You…", a: ['Find the awareness team', 'Ignore it', 'Film it', 'Leave'], fact: 'The awareness team is there to help. Go find them.' },
      { q: 'Which queer party is a regular here?', a: ['Homopatik', 'Schlagerparty', 'Oktoberfest', 'Karneval'], fact: 'Homopatik is a long-running queer party here.' }
    ]
  },
  {
    id: 'katerblau', name: 'Kater Blau', area: 'Holzmarkt, on the Spree', x: 18, y: 16, w: 7, h: 4, need: 2, signSide: -2,
    style: 'katerblau', glow: '#7ec8ff', initials: 'KB',
    look: { skin: '#f0c7a0', hair: '#c9a24a', top: '#2b4c7a', legs: '#20202a', big: true, hat: '#1f2f4d' },
    greet: ['Olli: Ahoi! Kater Blau.', 'Olli: Quick quiz, sailor. Two questions.'],
    reject: 'Olli: Ahoi… and goodbye. Heute nicht.',
    accept: ['Olli: Welcome aboard!'],
    again: 'Olli: Ahoi again! Hop in.',
    inside: 'Fairy lights over the Spree, a wooden boat full of dancers, sunrise on the water.',
    sign: ['KATER BLAU · Holzmarkt', 'On the Spree. Heir of Bar25 and Kater Holzig.', "'Kater' means tomcat. It also means hangover."],
    pool: [
      { q: 'Which legendary club came before us?', a: ['Bar25', 'Studio 54', 'Ministry of Sound', 'Pacha'], fact: 'Bar25, then Kater Holzig, then Kater Blau. Same family.' },
      { q: 'Which river are we sitting on?', a: ['Spree', 'Rhine', 'Elbe', 'Danube'], fact: "The Spree. It's right there." },
      { q: "'Kater' means hangover, and also…", a: ['Tomcat', 'Boat', 'Beer', 'Moon'], fact: 'Kater is German for tomcat. And for hangover.' },
      { q: 'This riverside spot is called…', a: ['Holzmarkt', 'Potsdamer Platz', 'Kurfürstendamm', 'Tempelhof'], fact: 'Kater Blau is part of the Holzmarkt village.' }
    ]
  },
  {
    id: 'sisyphos', name: 'Sisyphos', area: 'Rummelsburg', x: 64, y: 16, w: 7, h: 4, need: 2, signSide: -2,
    style: 'sisyphos', glow: '#ffd36b', initials: 'SI',
    look: { skin: '#d9a27c', hair: '#5a3a22', top: '#6b3f6b', legs: '#26242e', big: true, beard: '#5a3a22' },
    greet: ['Mo: Welcome to the factory.', 'Mo: You know what happens here? Prove it.'],
    reject: 'Mo: Nah. Try again next weekend.',
    accept: ['Mo: Alright. See you Monday.'],
    again: 'Mo: Still here? Come in.',
    inside: "You lose track of time. It's Monday. Nobody minds.",
    sign: ['SISYPHOS · Rummelsburg', 'An old dog biscuit factory, named after the man with the boulder.', 'Weekends run Friday to Monday. In summer: the open-air garden.'],
    pool: [
      { q: 'This place was a factory. Making what?', a: ['Dog biscuits', 'Beer', 'Cars', 'Chocolate'], fact: 'Sisyphos was a dog biscuit factory.' },
      { q: 'In the myth, what does Sisyphus push uphill?', a: ['A boulder', 'A shopping cart', 'A DJ booth', 'A goat'], fact: 'A boulder. Forever. Like a weekend here.' },
      { q: 'How long does a weekend here last?', a: ['Friday to Monday', '10pm to 2am', 'One hour', 'Only at sunset'], fact: 'Parties here run from Friday night into Monday.' },
      { q: 'Best spot on a summer afternoon?', a: ['The open-air garden', 'The VIP table', 'The cloakroom', 'The parking lot'], fact: 'In summer the open-air garden is the heart of the place.' }
    ]
  },
  {
    id: 'cdv', name: 'Club der Visionäre', area: 'Kreuzberg / Treptow', x: 46, y: 34, w: 5, h: 5, need: 2, signSide: -2,
    style: 'cdv', glow: '#a6e3a1', initials: 'CDV',
    look: { skin: '#f0c7a0', hair: '#9a9a9a', top: '#4a5a3a', legs: '#26242e', big: true, beard: '#9a9a9a' },
    greet: ['Uwe: Easy, easy.', "Uwe: Deck's full of good people. Answer me two things."],
    reject: 'Uwe: Hmm. Not today, friend.',
    accept: ['Uwe: Visionary. Come in.'],
    again: 'Uwe: The deck missed you. Go on.',
    inside: 'Sunset over the canal. Minimal grooves on a wooden deck under a big old tree.',
    sign: ['CLUB DER VISIONÄRE', 'A wooden deck on the Flutgraben canal, where Kreuzberg meets Treptow.', 'Minimal and house. It starts in the afternoon.'],
    pool: [
      { q: 'Where does the party happen here?', a: ['On a deck by the canal', 'On a rooftop', 'In a basement', 'On a mountain'], fact: 'CDV sits on a wooden deck on the Flutgraben canal.' },
      { q: 'What music fits CDV best?', a: ['Minimal and house', 'Schlager', 'Death metal', 'Polka'], fact: 'Minimal and house, ideally at sunset.' },
      { q: 'Which districts meet here?', a: ['Kreuzberg and Treptow', 'Spandau and Mitte', 'Wedding and Pankow', 'Potsdam and Grunewald'], fact: 'CDV is right where Kreuzberg meets Alt-Treptow.' },
      { q: 'When do things get going here?', a: ['In the afternoon', 'Exactly midnight', 'Only at 9am', 'Never'], fact: 'CDV is known for long afternoon sessions.' }
    ]
  }
];
CLUBS.forEach(c => {
  c.dx = c.x + Math.floor(c.w / 2);
  c.doorY = c.y + c.h - 1;
  c.by = c.y + c.h;
});

/* ================= OUTFITS & SHOPS ================= */
const TAG_LABEL = { black: 'ALL BLACK', latex: 'FETISH', colorful: 'COLORFUL', vintage: 'VINTAGE', tourist: 'TOURIST', suit: 'FANCY', tech: 'TECH' };
const BASE_LOOK = { skin: '#f0c7a0', hair: '#2b1f1a' };
const OUTFITS = {
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
const CHARACTERS = {
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
  ]
};
const ALL_CHARS = CHARACTERS.man.concat(CHARACTERS.woman);
const charById = id => ALL_CHARS.find(c => c.id === id) || null;
const lookFor = (ch, outfitId) => Object.assign({}, BASE_LOOK, ch ? ch.body : {}, OUTFITS[outfitId || (ch ? ch.outfit : 'tourist')].look);
const lookOf = id => {
  const L = lookFor(charById(state.char), id);
  if (!(state.kkStripped && typeof scene !== 'undefined' && scene.startsWith('kitkat:'))) return L;
  return Object.assign({}, L, { top: L.skin, legs: '#0c0c12', stripes: undefined, sparkle: undefined, shirt: undefined, tie: undefined, hat: undefined, shine: undefined, harness: L.harness });
};

// Dress codes: `ok` = at least one of these tags required; `no` = none of these tags allowed.
const DRESS = {
  berghain:   { ok: ['black'],               hint: 'All black. Nothing flashy.',            no_line: 'Türsteher: … Nein.' },
  tresor:     { ok: ['black'],               hint: 'Dark and functional. Black works.',     no_line: 'Jens: Bit bright for a vault, mate.' },
  kitkat:     { ok: ['latex'],               hint: 'Fetish: latex, leather or very little.', no_line: "Dee: Darling, you're wearing far too much. And the wrong things." },
  aboutblank: { no: ['tourist', 'suit', 'tech'], hint: 'Anything with personality. No tourist look, no tech vest, nothing fancy.', no_line: "Kim: That outfit doesn't say anything about you. Not tonight." },
  katerblau:  { ok: ['colorful', 'vintage'], hint: 'Colorful, playful, a bit of costume.',  no_line: 'Olli: Too serious for the boat! Bring some color.' },
  sisyphos:   { ok: ['colorful'],            hint: 'Bright colors, glitter, festival.',     no_line: "Mo: It's a festival in here, not a funeral. Color, please." },
  cdv:        { no: ['suit'],                hint: 'Relaxed. Just not too fancy.',          no_line: 'Uwe: Bit fancy for a wooden deck, no?' }
};
function dressOK(clubId, outfitId) {
  const d = DRESS[clubId], tags = OUTFITS[outfitId].tags;
  if (d.ok && !tags.some(t => d.ok.includes(t))) return false;
  if (d.no && tags.some(t => d.no.includes(t))) return false;
  return true;
}

const SHOPS = [
  { id: 'humana', name: 'Humana', area: 'Frankfurter Tor', x: 13, y: 7, w: 6, h: 6, v: 0, band: '#e9e4d6', ink: '#2a6a4a', label: 'HUMANA',
    line: 'Humana: Second-hand, floor after floor of it. Try anything on.', items: ['thriftblack', 'seventies', 'gdr', 'suit', 'tourist'] },
  { id: 'blackstyle', name: 'Blackstyle', area: 'Prenzlauer Berg', x: 19, y: 7, w: 6, h: 6, v: 1, band: '#0c0c12', ink: '#e8e8f0', label: 'BLACKSTYLE',
    line: "Blackstyle: Latex made in Berlin since 1992. Fitting room's at the back.", items: ['latex', 'harness', 'redlatex'] },
  { id: 'coexist', name: 'Coexist', area: 'Friedrichshain', x: 13, y: 33, w: 6, h: 6, v: 1, band: '#2bb3a3', ink: '#14121c', label: 'COEXIST',
    line: 'Coexist: 90s, 00s, black, neon. Something for every door.', items: ['nineties', 'mesh', 'sailor'] },
  { id: 'syld', name: 'SYLD', area: 'near Frankfurter Allee', x: 30, y: 33, w: 6, h: 6, v: 2, band: '#d94bd1', ink: '#fff6a8', label: 'SYLD',
    line: 'SYLD: Glitter, chains, shiny pants. All by Berlin designers.', items: ['glitter', 'rainbow'] }
];
SHOPS.forEach(sh => { sh.dx = sh.x + Math.floor(sh.w / 2); sh.doorY = sh.y + sh.h - 1; sh.by = sh.y + sh.h; });
CLUBS.forEach(c => { c.sign = c.sign.concat('Dress code: ' + DRESS[c.id].hint); });

const INTRO = [
  'Friday, 23:47. Warschauer Straße.',
  'Seven clubs. Seven bouncers. One long weekend.',
  "Walk up to a bouncer and press A. Answer right and you're in.",
  'Bouncers check your outfit first. Walk into a shop to change clothes.',
  'Stuck? Read the signs by each door. Locals talk too.'
];
const FINALE = [
  'Monday, 09:12. The sun is up, and so are you.',
  'Seven stamps. Every bouncer in Berlin let you in.',
  "You're officially a Berliner now. Go get a Döner."
];

/* ================= MAP ================= */
const T = 16, CITY_W = 72, CITY_H = 46;
// MW/MH, map, ents and mc point at the current scene (the street or a club floor).
let MW = CITY_W, MH = CITY_H;
// Visible area in game pixels. Desktop uses a fixed 384x256 view; on phones fitCanvas() sizes it to the screen.
let VW = 384, VH = 256;
const G = 0, R = 1, S = 2, W = 3, B = 4, TR = 5, BR = 6, C = 7, D = 8, F = 9, SA = 10, RL = 11, DK = 12;
const SOLID = new Set([W, B, TR, C, F, RL]);
// Interior tiles, mapped from the ASCII legend in interiors.js
const ICH = { '#': 40, '.': 41, ',': 42, '^': 43, 'v': 44, 'x': 45, 'k': 46, 't': 47, '|': 48, 'P': 49, 'W': 50, 'A': 51, 'N': 52, 'C': 53, 'I': 54, '=': 55, 'c': 56, 'b': 57, 'S': 58, 'D': 59, 'L': 60, '_': 61, ' ': 62,
  // Sisyphos and other open-air / wooden clubs
  'a': 63, '~': 64, 'w': 65, 'g': 66, 'T': 67, 'B': 68, 'H': 69, 'u': 70, 'O': 71, 'F': 72, 'R': 73, 'G': 74, 'l': 75, 'h': 76, 'e': 77, 'o': 78, 'K': 79,
  // doorways between rooms: the same digit on both sides
  // KitKat
  'V': 90, 'p': 91, 'Y': 92, 'Z': 93, 'Q': 94, 'X': 95, 'J': 96, 'M': 97, 'n': 98, 'U': 100, 'i': 101,
  '1': 81, '2': 82, '3': 83, '4': 84, '5': 85, '6': 86, '7': 87, '8': 88, '9': 89 };
const ICHAR = Object.fromEntries(Object.entries(ICH).map(([k, v]) => [v, k]));
[40, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 62, 64, 67, 68, 69, 71, 72, 73, 74, 76, 78, 79, 90, 92, 93, 94, 95, 96, 97, 98, 100].forEach(c => SOLID.add(c));
const COUNTERS = new Set([53, 54, 55, 56, 59]);
const WALLISH = new Set([40, 50, 51, 52, 60, 62, 68, 69, 74, 78, 79, 90]);
const DANCES = new Set([42, 63, 75, 77, 91]); // concrete, sand, red tunnel floor, wooden floor, pole stage
const isDoorTile = t => t >= 81 && t <= 89;
const STAIRS_UP = 43, STAIRS_DOWN = 44, EXIT = 45, DARK = 46, DANCE = 42;
let map = Array.from({ length: MH }, () => Array(MW).fill(G));
const get = (x, y) => (x < 0 || y < 0 || x >= MW || y >= MH) ? TR : map[y][x];
const set = (x, y, t) => { if (x >= 0 && y >= 0 && x < MW && y < MH) map[y][x] = t; };
const rect = (x0, y0, w, h, t) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) set(x, y, t); };

function pave(x, y, t) {
  const cur = get(x, y);
  if (cur === W || cur === BR) { set(x, y, BR); return; }
  if (t === S && cur === R) return;
  set(x, y, t);
}
const roads = [];
function hroad(y, x0, x1) {
  for (let x = x0; x <= x1; x++) { pave(x, y - 1, S); pave(x, y, R); pave(x, y + 1, R); pave(x, y + 2, S); }
  roads.push({ h: true, y, a: x0, b: x1 });
}
function vroad(x, y0, y1) {
  for (let y = y0; y <= y1; y++) { pave(x - 1, y, S); pave(x, y, R); pave(x + 1, y, R); pave(x + 2, y, S); }
  roads.push({ h: false, x, a: y0, b: y1 });
}

// Water: the Spree and the Flutgraben canal
rect(0, 22, MW, 5, W);
rect(53, 27, 2, 19, W);
// S-Bahn tracks
rect(13, 1, MW - 13, 1, RL);
// Streets
hroad(4, 10, MW - 1);
hroad(14, 0, MW - 1);
hroad(30, 0, MW - 1);
hroad(40, 0, MW - 1);
vroad(10, 0, MH - 1);
vroad(38, 3, MH - 1);
vroad(60, 3, MH - 1);

// Buildings
const buildings = [];
function building(x, y, w, h, kind, extra) { rect(x, y, w, h, B); buildings.push(Object.assign({ x, y, w, h, kind }, extra || {})); }
// Fernsehturm: solid footprint is the plaza block; the tall part is drawn in front of sprites.
const TOWER = { x: 41, y: 16, w: 6, h: 4, top: 9 };
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
const tree = (x, y) => { if (get(x, y) === G) set(x, y, TR); };
for (let x = 0; x < MW; x++) { tree(x, 0); tree(x, 44); tree(x, 45); }
for (let y = 0; y < MH; y++) { tree(0, y); tree(MW - 1, y); }
[[1, 1], [3, 3], [5, 5], [2, 7], [6, 8], [3, 10], [5, 12], [7, 3], [8, 7], [7, 10], [1, 8], [1, 11], [2, 17], [5, 18], [3, 20], [7, 17], [14, 17], [16, 19],
 [42, 17], [45, 19], [48, 17], [51, 19], [54, 17], [57, 18], [44, 21], [52, 20],
 [56, 7], [57, 8], [58, 7], [56, 10], [58, 11], [57, 12], [36, 8], [36, 11], [25, 8],
 [3, 28], [9 - 1, 27], [16, 28], [22, 27], [28, 28], [34, 27], [44, 28], [49, 27], [57, 28], [64, 27], [69, 28],
 [55, 33], [56, 35], [58, 34], [57, 37], [55, 38], [1, 34], [1, 37],
 [63, 34], [65, 33], [67, 35], [69, 33], [64, 37], [66, 38], [70, 36], [68, 38],
 [20, 2], [30, 2], [44, 2], [55, 2], [41, 8], [43, 7], [46, 9], [42, 11], [45, 11], [44, 9], [66, 2], [12 + 3, 46 - 3], [45, 34], [36, 35]
].forEach(([x, y]) => tree(x, y));

/* ================= ENTITIES ================= */
const LOOKS = {
  spati: { skin: '#c98d6a', hair: '#1a1a1a', top: '#e0a83a', legs: '#2a2a35', beard: '#1a1a1a' },
  tourist1: { skin: '#f3c9a8', hair: '#d9b25c', top: '#4ea8de', legs: '#3a5a8a', hat: '#e24a4a' },
  tourist2: { skin: '#f0c7a0', hair: '#5a3a22', top: '#f2c14e', legs: '#3a3a4a' },
  tourist3: { skin: '#e2b08c', hair: '#111', top: '#1b1b22', legs: '#1b1b22' },
  tourist4: { skin: '#f3c9a8', hair: '#b04a2a', top: '#58b368', legs: '#3a3a4a' },
  raver: { skin: '#8d5a3b', hair: '#b36bd1', top: '#222', legs: '#222', shades: true },
  oldraver: { skin: '#f0c7a0', hair: '#c0c0c0', top: '#d9733a', legs: '#3a3a4a', beard: '#c0c0c0' },
  monday: { skin: '#e2b08c', hair: '#3a2a20', top: '#9a4ad1', legs: '#2a2a35', shades: true }
};
let ents = [];
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

/* ================= STATE ================= */
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
const MOVE = 170, RUN = 85;
let runKey = false, runBtn = false;
const running = () => runKey || runBtn || !!(touch && touch.far);
const START = { x: 40, y: 16, dir: 'down' };
const state = { stamps: {}, intro: false, finale: false, outfit: 'tourist', char: null, quests: {}, visited: {}, sunrise: {}, coatNo: 0, kStage: 0, pfand: newPfand(), heard: {}, danced: {}, kkStripped: false };
function newPfand() { return { carry: 0, carryCents: 0, returned: 0, cents: 0, taken: {} }; }
const player = { dur: 170, x: START.x, y: START.y, tx: START.x, ty: START.y, dir: START.dir, moving: false, t: 0, n: 0 };
let busy = true, titleOn = true;
const held = [];

function save() {
  try { localStorage.setItem('tuersteher-save', JSON.stringify(snapshot())); } catch (e) { /* storage unavailable */ }
}
function snapshot() {
  // Inside a club we save the spot outside its door, so a reload puts you back on the street.
  const club = inClub() ? CLUBS.find(c => c.id === sceneClub()) : null;
  const pos = club ? { x: club.dx, y: club.by, dir: 'down' } : { x: player.x, y: player.y, dir: player.dir };
  return { stamps: state.stamps, intro: state.intro, finale: state.finale, outfit: state.outfit, char: state.char,
    zoom: { i: zoom.i, fit: zoom.fit }, quests: state.quests, visited: state.visited, sunrise: state.sunrise, coatNo: state.coatNo, kStage: state.kStage, pfand: state.pfand, heard: state.heard, danced: state.danced, kkStripped: state.kkStripped, x: pos.x, y: pos.y, dir: pos.dir };
}
function applySave(s) {
  if (!s) return;
  state.stamps = s.stamps || {};
  state.intro = !!s.intro;
  state.finale = !!s.finale;
  state.outfit = OUTFITS[s.outfit] ? s.outfit : 'tourist';
  state.char = charById(s.char) ? s.char : null;
  if (s.zoom && ZOOMS[s.zoom.i]) { zoom.i = s.zoom.i; zoom.fit = !!s.zoom.fit; }
  state.quests = s.quests || {}; state.visited = s.visited || {}; state.sunrise = s.sunrise || {}; state.coatNo = s.coatNo || 0; state.kStage = s.kStage || 0;
  state.pfand = Object.assign(newPfand(), s.pfand || {}); state.heard = s.heard || {}; state.danced = s.danced || {}; state.kkStripped = !!s.kkStripped;
  // bottles in your hands are lost if you reload while carrying them outside a club
  if (!s.pfand) state.pfand.taken = {};
  ents.forEach(e => { if (e.kind === 'bouncer' && state.stamps[e.club.id]) e.x = e.club.dx + 1; });
  if (Number.isInteger(s.x) && Number.isInteger(s.y) && !blocked(s.x, s.y) && get(s.x, s.y) !== D) {
    player.x = player.tx = s.x; player.y = player.ty = s.y; player.dir = s.dir || 'down';
  }
}
const stampCount = () => CLUBS.filter(c => state.stamps[c.id]).length;

/* ================= COLLISION ================= */
function clubAtDoor(x, y) { return CLUBS.find(c => c.dx === x && c.doorY === y); }
function shopAtDoor(x, y) { return SHOPS.find(sh => sh.dx === x && sh.doorY === y); }
function blocked(x, y) {
  const t = get(x, y);
  if (t === D) { if (shopAtDoor(x, y)) return false; const c = clubAtDoor(x, y); return !(c && state.stamps[c.id]); }
  if (SOLID.has(t)) return true;
  return ents.some(e => !e.pickup && covers(e, x, y));
}
// most people fill one tile; groups on a bed are `w` tiles wide
const covers = (e, x, y) => e.y === y && x >= e.x && x < e.x + (e.w || 1);

/* ================= PRERENDER MAP ================= */
const INK = '#14121c';
let mc = document.createElement('canvas');
mc.width = MW * T; mc.height = MH * T;
const m = mc.getContext('2d');

/* ================= SCENES ================= */
const SCENES = { city: { id: 'city', map, w: MW, h: MH, ents, canvas: mc } };
let scene = 'city';
function useScene(id) {
  const sc = SCENES[id];
  scene = id; map = sc.map; MW = sc.w; MH = sc.h; ents = sc.ents; mc = sc.canvas;
}
const inClub = () => scene !== 'city';
const sceneClub = () => scene.split(':')[0];
const sceneFloor = () => scene.split(':')[1];
let seed = 1337;
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pick = a => a[Math.floor(rnd() * a.length)];
function P(x, y, w, h, c) { m.fillStyle = c; m.fillRect(x, y, w, h); }
function circle(g, cx, cy, r, c) {
  g.fillStyle = c;
  for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y + 0.5)); g.fillRect(cx - w, cy + y, w * 2, 1); }
}
const isWater = t => t === W;

function drawGrass(X, Y) {
  P(X, Y, 16, 16, '#26473a');
  for (let i = 0; i < 3; i++) { const a = Math.floor(rnd() * 14), b = Math.floor(rnd() * 14); P(X + a, Y + b, 1, 2, '#30594a'); P(X + a + 1, Y + b + 1, 1, 1, '#30594a'); }
  if (rnd() < 0.15) P(X + Math.floor(rnd() * 14), Y + Math.floor(rnd() * 14), 1, 1, '#8a6fb0');
  if (rnd() < 0.3) P(X + Math.floor(rnd() * 14), Y + Math.floor(rnd() * 14), 2, 1, '#1f3d30');
}
function drawTile(x, y) {
  const X = x * T, Y = y * T, t = map[y][x];
  switch (t) {
    case B:
      if (y === 24 && (x === 37 || x === 40)) { P(X, Y, 16, 16, '#8a3c35'); break; }
      drawGrass(X, Y); break;
    case G: case C: case D: drawGrass(X, Y); break;
    case R:
      P(X, Y, 16, 16, '#343345');
      for (let i = 0; i < 4; i++) P(X + Math.floor(rnd() * 16), Y + Math.floor(rnd() * 16), 1, 1, '#3f3e52');
      break;
    case S:
      P(X, Y, 16, 16, '#6c677d');
      P(X, Y, 16, 1, '#5f5a70'); P(X, Y + 8, 16, 1, '#5f5a70');
      P(X + ((y % 2) ? 4 : 12), Y, 1, 8, '#5f5a70'); P(X + ((y % 2) ? 12 : 4), Y + 8, 1, 8, '#5f5a70');
      if (rnd() < 0.1) P(X + 3 + Math.floor(rnd() * 10), Y + 3 + Math.floor(rnd() * 10), 2, 1, '#7d7890');
      break;
    case W: {
      P(X, Y, 16, 16, '#1e3a6e');
      for (let i = 0; i < 2; i++) P(X + Math.floor(rnd() * 11), Y + 2 + Math.floor(rnd() * 12), 4, 1, '#2b4f8c');
      const up = get(x, y - 1), dn = get(x, y + 1), lf = get(x - 1, y), rt = get(x + 1, y);
      if (!isWater(up) && up !== BR) { P(X, Y, 16, 2, '#14284f'); P(X, Y + 2, 16, 1, '#6f93c9'); }
      if (!isWater(dn) && dn !== BR) P(X, Y + 14, 16, 2, '#14284f');
      if (!isWater(lf) && lf !== BR) P(X, Y, 2, 16, '#14284f');
      if (!isWater(rt) && rt !== BR) P(X + 14, Y, 2, 16, '#14284f');
      break;
    }
    case BR: {
      const brick = x >= 37 && x <= 40 && y >= 20 && y <= 28;
      if (brick) {
        P(X, Y, 16, 16, '#8a3c35');
        for (let r = 0; r < 4; r++) { P(X, Y + r * 4 + 3, 16, 1, '#6e2c27'); P(X + ((r % 2) ? 2 : 10), Y + r * 4, 1, 3, '#6e2c27'); }
      } else {
        P(X, Y, 16, 16, '#64616f');
        for (let r = 0; r < 4; r++) P(X, Y + r * 4 + 3, 16, 1, '#555261');
      }
      const rail = brick ? '#c56b5c' : '#b9b5c6';
      if (isWater(get(x - 1, y))) { P(X, Y, 3, 16, INK); P(X, Y, 2, 16, rail); }
      if (isWater(get(x + 1, y))) { P(X + 13, Y, 3, 16, INK); P(X + 14, Y, 2, 16, rail); }
      if (isWater(get(x, y - 1))) { P(X, Y, 16, 3, INK); P(X, Y, 16, 2, rail); }
      if (isWater(get(x, y + 1))) { P(X, Y + 13, 16, 3, INK); P(X, Y + 14, 16, 2, rail); }
      break;
    }
    case TR:
      drawGrass(X, Y);
      P(X + 7, Y + 11, 2, 4, '#3a2a22');
      circle(m, X + 8, Y + 7, 7, INK);
      circle(m, X + 8, Y + 7, 6, '#24503b');
      circle(m, X + 6, Y + 5, 3, '#33704f');
      P(X + 9, Y + 9, 2, 1, '#1b3d2c');
      break;
    case F: {
      P(X, Y, 16, 16, '#d6d0c1');
      const cols = ['#e24a4a', '#f2c14e', '#4ea8de', '#58b368', '#b36bd1', '#f28c38', '#ff7ab8'];
      for (let i = 0; i < 4; i++) P(X + Math.floor(rnd() * 12), Y + 3 + Math.floor(rnd() * 8), 2 + Math.floor(rnd() * 5), 2 + Math.floor(rnd() * 4), pick(cols));
      P(X, Y, 16, 2, '#b9b2a2'); P(X, Y + 14, 16, 2, '#8a8476'); P(X, Y + 2, 16, 1, '#f1ece0');
      break;
    }
    case SA:
      P(X, Y, 16, 16, '#9a8256');
      for (let i = 0; i < 5; i++) P(X + Math.floor(rnd() * 16), Y + Math.floor(rnd() * 16), 1, 1, pick(['#b09868', '#836c45']));
      break;
    case RL:
      P(X, Y, 16, 16, '#3c3744');
      for (let i = 0; i < 16; i += 4) P(X + i, Y + 2, 2, 12, '#5a4636');
      P(X, Y + 4, 16, 1, '#a9a9b8'); P(X, Y + 11, 16, 1, '#a9a9b8');
      break;
    case DK:
      P(X, Y, 16, 16, '#6e4b2e');
      for (let r = 0; r < 4; r++) P(X, Y + r * 4 + 3, 16, 1, '#553821');
      P(X + 2, Y + 1, 1, 1, '#8a6a48'); P(X + 12, Y + 9, 1, 1, '#8a6a48');
      break;
  }
}

function drawRoadMarks() {
  roads.forEach(r => {
    for (let i = r.a; i <= r.b; i++) {
      if (r.h) {
        if (get(i, r.y - 1) === R || get(i, r.y + 2) === R || get(i, r.y) === BR) continue;
        P(i * T + 2, (r.y + 1) * T - 1, 6, 2, '#c9b25a');
        P(i * T + 10, (r.y + 1) * T - 1, 4, 2, '#c9b25a');
      } else {
        if (get(r.x - 1, i) === R || get(r.x + 2, i) === R) continue;
        P((r.x + 1) * T - 1, i * T + 2, 2, 6, '#c9b25a');
        P((r.x + 1) * T - 1, i * T + 10, 2, 4, '#c9b25a');
      }
    }
  });
}

function windows(X, Y, w, h, skipDoor) {
  for (let ry = 1; ry < h; ry++) for (let cx = 0; cx < w; cx++) {
    if (skipDoor && ry === h - 1 && cx === Math.floor(w / 2)) continue;
    for (const ox of [3, 10]) {
      const lit = rnd() < 0.42;
      const wx = X + cx * T + ox, wy = Y + ry * T + 3;
      P(wx - 1, wy - 1, 5, 9, INK);
      P(wx, wy, 3, 7, lit ? pick(['#f2d06b', '#f5b95a', '#e8e0a0']) : '#262238');
      if (!lit && rnd() < 0.3) P(wx, wy, 3, 1, '#3a3554');
      P(wx - 1, wy + 8, 5, 1, '#a9a2b4');
    }
  }
}
function drawAltbau(b) {
  const X = b.x * T, Y = b.y * T, Wd = b.w * T, H = b.h * T;
  const walls = ['#76687a', '#66737e', '#7d7262'][b.v];
  const roofs = ['#4a3c58', '#3d4458', '#523d3d'][b.v];
  P(X, Y, Wd, H, INK);
  P(X + 1, Y + 1, Wd - 2, 15, roofs);
  for (let i = 4; i < 15; i += 4) P(X + 1, Y + 1 + i, Wd - 2, 1, 'rgba(0,0,0,.25)');
  P(X + 1, Y + 1, Wd - 2, 2, 'rgba(255,255,255,.08)');
  P(X + 1, Y + 16, Wd - 2, H - 17, walls);
  P(X + 1, Y + 16, Wd - 2, 2, 'rgba(255,255,255,.18)');
  P(X + Wd - 14, Y - 2, 5, 8, INK); P(X + Wd - 13, Y - 1, 3, 6, '#6e4a3a');
  windows(X, Y, b.w, b.h, true);
  const dX = X + Math.floor(b.w / 2) * T;
  if (b.shop) {
    const sh = b.shop, sy = Y + H - T;
    P(X + 2, sy - 1, Wd - 4, T, INK);
    P(X + 3, sy + 3, Wd - 6, 10, '#f2d47a');
    for (let i = 0; i < 12; i++) P(X + 5 + Math.floor(rnd() * (Wd - 12)), sy + 7 + Math.floor(rnd() * 5), 2, 2, pick(['#e24a4a', '#4ea8de', '#58b368', '#f28c38', '#3a3a3a', '#d94bd1']));
    P(X + 2, sy - 6, Wd - 4, 11, INK);
    P(X + 3, sy - 5, Wd - 6, 9, sh.band);
    m.fillStyle = sh.ink; m.font = '8px "Press Start 2P", monospace'; m.textBaseline = 'top';
    const tw = m.measureText(sh.label).width;
    m.fillText(sh.label, Math.round(X + Wd / 2 - tw / 2), sy - 5);
    if (sh.door) {
      P(dX + 2, sy + 4, 12, 12, INK);
      P(dX + 3, sy + 5, 10, 11, '#fbecb4');
      P(dX + 7, sy + 5, 1, 11, INK);
      P(dX + 9, sy + 10, 1, 2, INK);
    }
  } else {
    P(dX + 3, Y + H - 14, 10, 13, INK);
    P(dX + 4, Y + H - 13, 8, 12, '#4a2f2a');
    P(dX + 4, Y + H - 13, 8, 3, '#d9c27a');
  }
}
function drawStation(b) {
  const X = b.x * T, Y = b.y * T, Wd = b.w * T, H = b.h * T;
  P(X, Y, Wd, H, INK);
  P(X + 1, Y + 1, Wd - 2, 30, '#3f6b6e');
  for (let i = 0; i < Wd; i += 8) P(X + 1 + i, Y + 1, 1, 30, '#5e9195');
  P(X + 1, Y + 15, Wd - 2, 1, '#5e9195');
  P(X + 1, Y + 32, Wd - 2, H - 33, '#6d3a32');
  for (let r = 0; r < (H - 33) / 4; r++) P(X + 1, Y + 32 + r * 4 + 3, Wd - 2, 1, '#5a2e28');
  for (let i = 0; i < b.w; i++) { P(X + i * T + 3, Y + 40, 10, 14, INK); P(X + i * T + 4, Y + 41, 8, 12, i % 2 ? '#f2d06b' : '#d9e6e0'); }
  P(X + 10, Y + H - 15, Wd - 20, 14, INK); P(X + 11, Y + H - 14, Wd - 22, 13, '#2a2533');
  const cx = X + Wd / 2;
  P(cx - 44, Y + 3, 88, 12, INK);
  circle(m, cx - 36, Y + 9, 5, '#1f8a4a'); m.fillStyle = '#fff'; m.font = '8px "Press Start 2P", monospace'; m.textBaseline = 'top';
  m.fillText('S', cx - 39, Y + 5);
  m.fillText('OSTKREUZ', cx - 28, Y + 5);
}
const towerC = document.createElement('canvas');
function drawTower(b) {
  // Draw the whole tower (rows TOWER.top .. bottom of footprint) into its own canvas.
  const Wd = b.w * T, H = (b.y + b.h - TOWER.top) * T;
  towerC.width = Wd; towerC.height = H;
  const g = towerC.getContext('2d');
  const P = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const m = g, X = 0, Y = 0, cx = Wd / 2;
  // plaza
  P(0, H - b.h * T + 2, Wd, b.h * T - 2, '#5f5a70');
  for (let i = 0; i < Wd; i += 8) P(i, H - b.h * T + 2, 1, b.h * T - 2, '#57526a');
  // base pavilion
  P(X + 2, Y + H - 22, Wd - 4, 20, INK);
  P(X + 3, Y + H - 21, Wd - 6, 18, '#77748a');
  for (let i = 6; i < Wd - 8; i += 6) P(X + i, Y + H - 16, 3, 6, '#f2d06b');
  // shaft
  P(cx - 5, Y + 50, 10, H - 72, INK);
  P(cx - 4, Y + 50, 8, H - 72, '#bdbacb');
  P(cx + 1, Y + 50, 3, H - 72, '#9591a6');
  // sphere
  circle(m, cx, Y + 42, 16, INK);
  circle(m, cx, Y + 42, 15, '#c7c4d4');
  m.save(); m.beginPath(); m.rect(cx - 16, Y + 44, 32, 16); m.clip(); circle(m, cx, Y + 42, 15, '#9a97ab'); m.restore();
  P(cx - 15, Y + 40, 30, 4, '#2b2838');
  for (let i = -13; i < 13; i += 3) P(cx + i, Y + 41, 2, 2, '#f2c45a');
  // antenna
  P(cx - 2, Y + 6, 4, 22, INK);
  for (let i = 0; i < 22; i += 4) P(cx - 1, Y + 6 + i, 2, 4, (i / 4) % 2 ? '#e9e6ef' : '#d64545');
  P(cx - 3, Y + 24, 6, 4, '#bdbacb');
  // footprint part goes into the static map
  const fy = (b.y - TOWER.top) * T;
  mDraw(towerC, 0, fy, Wd, H - fy, b.x * T, b.y * T);
}
function mDraw(img, sx, sy, sw, sh, dx, dy) { m.drawImage(img, sx, sy, sw, sh, dx, dy, sw, sh); }
function drawObTower(b) {
  const X = b.x * T, Y = b.y * T;
  P(X + 1, Y - 10, 14, 26, INK);
  P(X + 2, Y - 9, 12, 24, '#9a4038');
  for (let r = 0; r < 6; r++) P(X + 2, Y - 9 + r * 4 + 3, 12, 1, '#7a2f29');
  P(X + 5, Y - 2, 6, 8, INK); P(X + 6, Y - 1, 4, 6, '#f2c45a');
  P(X + 3, Y - 14, 10, 5, INK); P(X + 4, Y - 13, 8, 4, '#4a5a6a');
  P(X + 7, Y - 18, 2, 5, INK);
}

function signText(text, X, Y, Wd, color) {
  m.font = '8px "Press Start 2P", monospace'; m.textBaseline = 'top';
  const tw = Math.ceil(m.measureText(text).width);
  const sx = Math.round(X + Wd / 2 - tw / 2);
  P(sx - 4, Y + 2, tw + 8, 13, INK);
  P(sx - 3, Y + 3, tw + 6, 11, '#0b0a10');
  m.fillStyle = color; m.fillText(text, sx, Y + 5);
}
function drawClub(c) {
  const X = c.x * T, Y = c.y * T, Wd = c.w * T, H = c.h * T;
  const base = { berghain: '#6c6a66', tresor: '#4c3532', kitkat: '#4f1d3b', aboutblank: '#55555f', katerblau: '#6a4a2c', sisyphos: '#5c4630', cdv: '#5a432d' }[c.style];
  P(X, Y, Wd, H, INK);
  P(X + 1, Y + 1, Wd - 2, H - 2, base);
  P(X + 1, Y + 1, Wd - 2, 15, 'rgba(0,0,0,.28)');
  P(X + 1, Y + 15, Wd - 2, 1, 'rgba(255,255,255,.12)');
  switch (c.style) {
    case 'berghain':
      for (let i = T; i < Wd; i += T) P(X + i, Y + 16, 1, H - 17, '#5a5854');
      P(X + 1, Y + 48, Wd - 2, 2, '#5a5854');
      P(X + 10, Y + 22, Wd - 20, 10, INK);
      P(X + 11, Y + 23, Wd - 22, 8, '#c98b4a');
      for (let i = 0; i < Wd - 22; i += 3) P(X + 11 + i, Y + 23, 1, 8, '#8d5f33');
      for (let i = 0; i < c.w; i++) { if (i === Math.floor(c.w / 2)) continue; P(X + i * T + 7, Y + 54, 2, 30, '#1d1b22'); }
      P(X + 1, Y + 1, Wd - 2, 4, '#55534f');
      break;
    case 'tresor':
      for (let r = 16; r < H - 1; r += 4) { P(X + 1, Y + r, Wd - 2, 1, '#3d2a28'); for (let i = (r / 4) % 2 ? 4 : 0; i < Wd; i += 8) P(X + i, Y + r - 3, 1, 3, '#3d2a28'); }
      for (let i = 0; i + 2 <= c.w; i += 3) {
        const wx = X + i * T + 8, wy = Y + 22;
        P(wx - 1, wy - 1, 24, 32, INK); P(wx, wy, 22, 30, '#1e3646');
        P(wx + 7, wy, 1, 30, base); P(wx + 14, wy, 1, 30, base); P(wx, wy + 10, 22, 1, base); P(wx, wy + 20, 22, 1, base);
        P(wx + 1, wy + 1, 5, 8, '#2f5a76');
      }
      P(X + Wd - 14, Y - 14, 8, 16, INK); P(X + Wd - 13, Y - 13, 6, 14, '#5b403c');
      signText('TRESOR', X, Y, Wd, '#e8e8f0');
      break;
    case 'kitkat':
      for (let r = 20; r < H - 18; r += 8) for (let i = ((r / 8) % 2) * 4 + 3; i < Wd - 3; i += 8) P(X + i, Y + r, 2, 2, '#6d2a52');
      for (let i = 1; i < c.w - 1; i += 2) { circle(m, X + i * T + 8, Y + 34, 5, INK); circle(m, X + i * T + 8, Y + 34, 4, '#ff7ab8'); }
      signText('KITKAT', X, Y, Wd, '#ff8cc4');
      break;
    case 'aboutblank': {
      const cols = ['#b6f36b', '#ff5e7a', '#5ec8ff', '#ffd23f', '#c28cff', '#ffffff'];
      for (let i = 0; i < 60; i++) {
        const gx = X + 2 + Math.floor(rnd() * (Wd - 10)), gy = Y + 18 + Math.floor(rnd() * (H - 22));
        const col = pick(cols);
        P(gx, gy, 2 + Math.floor(rnd() * 6), 2, col);
        if (rnd() < 0.5) P(gx + 1, gy - 2, 2, 2, col);
      }
      signText('ABOUT BLANK', X, Y, Wd, '#ffffff');
      break;
    }
    case 'katerblau':
      for (let i = 4; i < Wd; i += 4) P(X + i, Y + 16, 1, H - 17, '#59391f');
      for (let i = 2; i < Wd - 6; i += 7) {
        const col = ['#ff5e7a', '#ffd23f', '#5ec8ff', '#b6f36b'][(i / 7 | 0) % 4];
        P(X + i, Y + 17, 5, 2, col); P(X + i + 1, Y + 19, 3, 1, col); P(X + i + 2, Y + 20, 1, 1, col);
      }
      for (let i = 1; i < c.w - 1; i += 2) { if (i === Math.floor(c.w / 2)) continue; circle(m, X + i * T + 8, Y + 34, 4, INK); circle(m, X + i * T + 8, Y + 34, 3, '#7ec8ff'); }
      signText('KATER BLAU', X, Y, Wd, '#7ec8ff');
      break;
    case 'sisyphos':
      for (let r = 19; r < H - 1; r += 4) P(X + 1, Y + r, Wd - 2, 1, '#4b3826');
      for (const ly of [20, 34]) for (let i = 3; i < Wd - 3; i += 5) P(X + i, Y + ly + ((i / 5 | 0) % 2), 2, 2, pick(['#ffd36b', '#ff7a5a', '#7ec8ff', '#b6f36b']));
      signText('SISYPHOS', X, Y, Wd, '#ffd36b');
      break;
    case 'cdv':
      for (let i = 4; i < Wd; i += 4) P(X + i, Y + 16, 1, H - 17, '#4a3522');
      P(X + 10, Y + 26, 14, 10, INK); P(X + 11, Y + 27, 12, 8, '#f2c45a');
      // the big tree hanging over the deck
      circle(m, X + Wd - 4, Y + 6, 15, INK);
      circle(m, X + Wd - 4, Y + 6, 14, '#2a5a3c');
      circle(m, X + Wd - 8, Y + 2, 7, '#3b7a50');
      for (let i = 0; i < 7; i++) P(X + Wd - 16 + i * 4, Y + 18, 1, 6 + (i % 3) * 3, '#2a5a3c');
      signText('CDV', X - 12, Y + 16, Wd, '#a6e3a1');
      break;
  }
  // door
  const dX = c.dx * T, dY = c.doorY * T;
  P(dX + 2, dY + 1, 12, 15, INK);
  P(dX + 3, dY + 2, 10, 14, '#0d0b12');
  P(dX + 6, dY - 1, 4, 2, INK); P(dX + 7, dY - 1, 2, 1, '#f2c45a');
}

function prerender() {
  seed = 1337;
  for (let y = 0; y < MH; y++) for (let x = 0; x < MW; x++) drawTile(x, y);
  drawRoadMarks();
  buildings.forEach(b => {
    if (b.kind === 'altbau') drawAltbau(b);
    else if (b.kind === 'station') drawStation(b);
    else if (b.kind === 'tower') drawTower(b);
  });
  CLUBS.forEach(drawClub);
  buildInteriors();
  buildings.forEach(b => { if (b.kind === 'obtower') drawObTower(b); });
}

/* ================= SPRITES ================= */
function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const f = v => Math.max(0, Math.min(255, Math.round(v * k)));
  return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join('');
}
function person(g, X, Y, dir, step, L) {
  const flip = dir === 'right';
  const d = flip ? 'left' : dir;
  const b = L.big ? 1 : 0;
  g.save();
  g.translate(X, Y);
  if (flip) { g.translate(16, 0); g.scale(-1, 1); }
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(3, 14, 10, 2);
  if (step) g.translate(0, -1);
  const parts = [];
  if (d === 'left') parts.push([step ? 5 : 6, 11, 2, step === 1 ? 3 : 4, L.legs], [step ? 9 : 8, 11, 2, step === 2 ? 3 : 4, L.legs]);
  else parts.push([5, 11, 2, step === 1 ? 3 : 4, L.legs], [9, 11, 2, step === 2 ? 3 : 4, L.legs]);
  parts.push([4 - b, 7, 8 + 2 * b, 5, L.top]);
  if (d !== 'left') parts.push([3 - b, 8, 1, 3, L.top], [12 + b, 8, 1, 3, L.top]);
  parts.push([4, 1, 8, 7, L.skin]);
  g.fillStyle = INK;
  parts.forEach(p => g.fillRect(p[0] - 1, p[1] - 1, p[2] + 2, p[3] + 2));
  parts.forEach(p => { g.fillStyle = p[4]; g.fillRect(p[0], p[1], p[2], p[3]); });
  const det = [];
  if (d === 'left') det.push([6, 8, 3, 3, shade(L.top, 0.7)], [7, 11, 1, 1, L.skin]);
  else det.push([3 - b, 11, 1, 1, L.skin], [12 + b, 11, 1, 1, L.skin]);
  if (L.stripes) det.push([4 - b, 8, 8 + 2 * b, 1, L.stripes], [4 - b, 10, 8 + 2 * b, 1, L.stripes]);
  if (L.shine) det.push([5, 8, 1, 3, L.shine]);
  if (L.sparkle) det.push([5, 8, 1, 1, L.sparkle], [9, 9, 1, 1, L.sparkle], [7, 10, 1, 1, L.sparkle], [11, 8, 1, 1, L.sparkle]);
  if (L.harness) { if (d === 'left') det.push([6, 7, 1, 4, INK], [6, 9, 4, 1, INK]); else det.push([5, 7, 1, 4, INK], [10, 7, 1, 4, INK], [5, 9, 6, 1, INK]); }
  if (L.shirt && d === 'down') det.push([7, 7, 2, 5, L.shirt]);
  if (L.tie && d === 'down') det.push([7, 7, 2, 1, '#e9e6ef'], [7, 8, 2, 3, L.tie]);
  if (!L.bald) {
    if (L.long) {
      if (d === 'down') det.push([4, 1, 8, 2, L.hair], [3, 2, 2, 7, L.hair], [11, 2, 2, 7, L.hair]);
      else if (d === 'up') det.push([3, 1, 10, 8, L.hair]);
      else det.push([5, 1, 7, 2, L.hair], [8, 2, 5, 7, L.hair]);
    } else if (d === 'down') det.push([4, 1, 8, 2, L.hair], [4, 3, 1, 2, L.hair], [11, 3, 1, 2, L.hair]);
    else if (!L.long && d === 'up') det.push([4, 1, 8, 6, L.hair]);
    else if (!L.long) det.push([5, 1, 7, 2, L.hair], [9, 3, 3, 3, L.hair]);
  } else det.push([d === 'left' ? 7 : 5, 2, 2, 1, 'rgba(255,255,255,.4)']);
  if (L.hat) {
    if (d === 'down') det.push([4, 1, 8, 2, L.hat], [3, 3, 10, 1, L.hat]);
    else if (d === 'up') det.push([4, 1, 8, 3, L.hat]);
    else det.push([5, 1, 7, 2, L.hat], [2, 3, 6, 1, L.hat]);
  }
  if (L.ears) det.push([4, -2, 2, 3, INK], [10, -2, 2, 3, INK], [4, -1, 2, 2, L.ears], [10, -1, 2, 2, L.ears]);
  if (L.flowers && d !== 'up') det.push([4, 1, 2, 1, L.flowers[0]], [7, 0, 2, 1, L.flowers[1] || L.flowers[0]], [10, 1, 2, 1, L.flowers[0]]);
  if (L.flowers && d === 'up') det.push([4, 1, 2, 1, L.flowers[0]], [7, 1, 2, 1, L.flowers[1] || L.flowers[0]], [10, 1, 2, 1, L.flowers[0]]);
  if (d === 'down') {
    det.push([6, 4, 1, 2, INK], [9, 4, 1, 2, INK]);
    if (L.paint) det.push([5, 6, 1, 1, L.paint], [10, 6, 1, 1, L.paint], [7, 2, 2, 1, L.paint]);
    if (L.blush) det.push([5, 6, 2, 1, '#ff6b8a'], [9, 6, 2, 1, '#ff6b8a']);
    if (L.glasses) det.push([5, 4, 2, 2, L.glasses], [9, 4, 2, 2, L.glasses], [7, 4, 2, 1, INK], [6, 5, 1, 1, INK], [9, 5, 1, 1, INK]);
    if (L.shades) det.push([5, 4, 6, 1, INK], [5, 5, 2, 1, INK], [9, 5, 2, 1, INK]);
    if (L.beard) det.push([5, 6, 6, 2, L.beard]);
    if (L.tattoo) det.push([5, 6, 1, 1, '#3b3a5c'], [10, 6, 1, 1, '#3b3a5c'], [7, 2, 2, 1, '#3b3a5c'], [11, 4, 1, 1, '#c0c0d0']);
  } else if (d === 'left') {
    det.push([5, 4, 1, 2, INK]);
    if (L.paint) det.push([6, 6, 1, 1, L.paint]);
    if (L.glasses) det.push([4, 4, 2, 2, L.glasses], [5, 5, 1, 1, INK], [6, 4, 3, 1, INK]);
    if (L.shades) det.push([4, 4, 3, 1, INK]);
    if (L.beard) det.push([4, 6, 4, 2, L.beard]);
    if (L.tattoo) det.push([7, 5, 1, 1, '#3b3a5c'], [6, 3, 1, 1, '#3b3a5c']);
  }
  det.forEach(p => { g.fillStyle = p[4]; g.fillRect(p[0], p[1], p[2], p[3]); });
  g.restore();
}

/* ================= RENDER ================= */
const cvs = $('#game');
const ctx = cvs.getContext('2d');
ctx.imageSmoothingEnabled = false;

/* ================= SCREEN FIT (mobile) ================= */
const screenEl = $('#screen');
const MOBILE = window.matchMedia('(max-width: 700px), (max-height: 500px)');
function fitCanvas() {
  let w = 384, h = 256;
  if (MOBILE.matches) {
    const r = screenEl.getBoundingClientRect();
    if (r.width < 32 || r.height < 32) return;
    // Integer scale keeps pixels crisp; aim for roughly 10-12 tiles across the short side.
    const s = Math.max(2, Math.round(Math.min(r.width, r.height) / 160));
    w = Math.min(CITY_W * T, Math.floor(r.width / s));
    h = Math.min(CITY_H * T, Math.floor(r.height / s));
    cvs.style.width = (w * s) + 'px';
    cvs.style.height = (h * s) + 'px';
  } else {
    cvs.style.width = ''; cvs.style.height = '';
  }
  if (cvs.width !== w || cvs.height !== h) {
    cvs.width = w; cvs.height = h;
    ctx.imageSmoothingEnabled = false;
  }
  VW = w; VH = h;
}
if (window.ResizeObserver) new ResizeObserver(fitCanvas).observe(screenEl);
window.addEventListener('resize', fitCanvas);
if (MOBILE.addEventListener) MOBILE.addEventListener('change', fitCanvas);
fitCanvas();
const train = { x: -400, wait: 2500 };

function playerPx() {
  if (!player.moving) return [player.x * T, player.y * T];
  const k = player.t / player.dur;
  return [Math.round((player.x + (player.tx - player.x) * k) * T), Math.round((player.y + (player.ty - player.y) * k) * T)];
}
function drawWorld(now) {
  const [ppx, ppy] = playerPx();
  // Small rooms are centred; big maps follow the player.
  const camX = MW * T <= VW ? Math.round((MW * T - VW) / 2) : Math.max(0, Math.min(MW * T - VW, ppx + 8 - VW / 2));
  const camY = MH * T <= VH ? Math.round((MH * T - VH) / 2) : Math.max(0, Math.min(MH * T - VH, ppy + 8 - VH / 2));
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH);
  ctx.drawImage(mc, -camX, -camY);

  if (inClub()) { drawInteriorFx(now, camX, camY, ppx, ppy); return [camX, camY, ppx, ppy]; }
  // water shimmer
  const tick = Math.floor(now / 450);
  const x0 = Math.max(0, Math.floor(camX / T)), y0 = Math.max(0, Math.floor(camY / T));
  for (let y = y0; y <= y0 + VH / T + 1 && y < MH; y++) for (let x = x0; x <= x0 + VW / T + 1 && x < MW; x++) {
    if (map[y][x] !== W) continue;
    const k = (x * 5 + y * 3 + tick) % 7;
    if (k < 2) {
      ctx.fillStyle = k ? '#5d86c4' : '#8fb4e8';
      ctx.fillRect(x * T - camX + ((x * 7 + k * 5 + tick) % 11) + 1, y * T - camY + ((y * 11 + x) % 10) + 3, 3, 1);
    }
  }

  // club doors
  CLUBS.forEach(c => {
    const dx = c.dx * T - camX, dy = c.doorY * T - camY;
    if (dx < -16 || dy < -16 || dx > VW || dy > VH) return;
    if (state.stamps[c.id]) {
      const pulse = 0.55 + 0.45 * Math.sin(now / (reduceMotion ? 1e9 : 160));
      ctx.globalAlpha = pulse; ctx.fillStyle = c.glow; ctx.fillRect(dx + 3, dy + 2, 10, 14);
      ctx.globalAlpha = 1; ctx.fillStyle = '#0d0b12'; ctx.fillRect(dx + 5, dy + 6, 2, 3); ctx.fillRect(dx + 9, dy + 4, 2, 3);
    } else if (Math.floor(now / 1200 + c.dx) % 3 !== 0) {
      ctx.fillStyle = c.glow; ctx.fillRect(dx + 4, dy + 15, 8, 1);
    }
  });
  // S-Bahn
  if (train.wait <= 0) {
    ctx.save();
    ctx.beginPath(); ctx.rect(13 * T - camX, 0, VW + MW * T, VH); ctx.clip();
    for (let i = 0; i < 3; i++) {
      const tx = Math.round(train.x) + i * 44 - camX, ty = T + 2 - camY;
      ctx.fillStyle = INK; ctx.fillRect(tx - 1, ty - 1, 44, 14);
      ctx.fillStyle = '#e0a83a'; ctx.fillRect(tx, ty, 42, 6);
      ctx.fillStyle = '#a8323a'; ctx.fillRect(tx, ty + 6, 42, 6);
      ctx.fillStyle = '#26223a'; ctx.fillRect(tx + 3, ty + 2, 36, 3);
      ctx.fillStyle = '#f2d06b'; for (let j = 5; j < 38; j += 7) ctx.fillRect(tx + j, ty + 2, 2, 2);
    }
    ctx.restore();
  }
  // entities + player sorted by row
  const list = ents.map(e => ({ e, y: e.y }));
  list.push({ e: null, y: ppy / T });
  list.sort((a, b) => a.y - b.y);
  list.forEach(({ e }) => {
    if (!e) {
      const step = player.moving ? (player.t < player.dur / 2 ? (player.n % 2) + 1 : 0) : 0;
      person(ctx, ppx - camX, ppy - camY - 3, player.dir, step, lookOf(state.outfit));
      return;
    }
    const X = e.x * T - camX + Math.round(e.ox || 0), Y = e.y * T - camY;
    if (X < -16 || Y < -24 || X > VW || Y > VH + 8) return;
    if (e.kind === 'sign') {
      ctx.fillStyle = INK; ctx.fillRect(X + 7, Y + 8, 2, 8); ctx.fillRect(X + 1, Y + 1, 14, 9);
      ctx.fillStyle = '#b08a52'; ctx.fillRect(X + 2, Y + 2, 12, 7);
      ctx.fillStyle = '#7d5f35'; ctx.fillRect(X + 4, Y + 4, 8, 1); ctx.fillRect(X + 4, Y + 6, 6, 1);
    } else {
      person(ctx, X, Y - 3, e.dir, 0, e.look);
    }
  });
  // Fernsehturm upper part, drawn in front of everything north of it
  const tX = TOWER.x * T - camX, tY = TOWER.top * T - camY, fy = (TOWER.y - TOWER.top) * T;
  if (towerC.width && tX > -towerC.width && tX < VW && tY < VH) {
    ctx.drawImage(towerC, 0, 0, towerC.width, fy, tX, tY, towerC.width, fy);
    if (Math.floor(now / 700) % 2 === 0) { ctx.fillStyle = '#ff3b3b'; ctx.fillRect(tX + towerC.width / 2 - 1, tY + 3, 2, 2); }
  }
  return [camX, camY, ppx, ppy];
}

/* ================= ZOOM ================= */
const ZOOMS = [2, 1.5, 1, 0.66, 0.5];
const zoom = { i: 2, fit: false };
const zoomLevel = () => zoom.fit ? Math.min(VW / (MW * T), VH / (MH * T)) : ZOOMS[zoom.i];
const CLUB_SHORT = { berghain: 'BERGHAIN', tresor: 'TRESOR', kitkat: 'KITKAT', aboutblank: 'ABOUT BLANK', katerblau: 'KATER BLAU', sisyphos: 'SISYPHOS', cdv: 'CDV' };
function setZoom(fn) { fn(); zoomUI(); save(); }
const zoomIn = () => setZoom(() => { if (zoom.fit) { zoom.fit = false; zoom.i = ZOOMS.length - 1; } else zoom.i = Math.max(0, zoom.i - 1); });
const zoomOut = () => setZoom(() => { if (zoom.i >= ZOOMS.length - 1) zoom.fit = true; else if (!zoom.fit) zoom.i++; });
const toggleMap = () => setZoom(() => { zoom.fit = !zoom.fit; });
function zoomUI() {
  const b = $('#zoomMap');
  if (b) { b.classList.toggle('on', zoom.fit); b.setAttribute('aria-pressed', String(zoom.fit)); }
}
let chipRects = [];
function chip(text, x, y, bg, fg, size) {
  ctx.font = size + 'px "Press Start 2P", monospace'; ctx.textBaseline = 'top';
  const w = Math.ceil(ctx.measureText(text).width) + 6, h = size + 6;
  const X = Math.round(Math.max(1, Math.min(VW - w - 1, x - w / 2)));
  let Y = Math.round(Math.max(1, Math.min(VH - h - 1, y - h)));
  // nudge down until it no longer overlaps a label drawn earlier this frame
  for (let i = 0; i < 6 && chipRects.some(r => X < r.x + r.w + 2 && X + w + 2 > r.x && Y < r.y + r.h + 2 && Y + h + 2 > r.y); i++) Y += h + 3;
  chipRects.push({ x: X, y: Y, w, h });
  ctx.fillStyle = INK; ctx.fillRect(X - 1, Y - 1, w + 2, h + 2);
  ctx.fillStyle = bg; ctx.fillRect(X, Y, w, h);
  ctx.fillStyle = fg; ctx.fillText(text, X + 3, Y + 3);
}
function draw(now) {
  const z = zoomLevel();
  const realW = VW, realH = VH;
  // draw the world at scale z: everything inside treats VW/VH as the visible world size
  VW = realW / z; VH = realH / z;
  ctx.setTransform(z, 0, 0, z, 0, 0);
  ctx.imageSmoothingEnabled = z < 1;
  let cam;
  try { cam = drawWorld(now); } finally {
    VW = realW; VH = realH;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
  }
  if (z >= 0.9) return;
  // zoomed out: label clubs and shops, and mark the player
  const [camX, camY, ppx, ppy] = cam;
  const sx = wx => (wx - camX) * z, sy = wy => (wy - camY) * z;
  const size = VW < 260 ? 6 : 8;
  chipRects = [];
  if (!inClub()) {
    // clubs on the roof, shops at the shopfront (smaller), so neighbours don't collide
    CLUBS.forEach(c => chip((state.stamps[c.id] ? '✓ ' : '') + CLUB_SHORT[c.id], sx((c.x + c.w / 2) * T), sy(c.y * T + 4), c.glow, INK, size));
    SHOPS.forEach(sh => chip(sh.label, sx((sh.x + sh.w / 2) * T), sy((sh.y + sh.h) * T) + size + 6, '#f3eee3', INK, Math.max(6, size - 2)));
  }
  const px = sx(ppx + 8), py = sy(ppy + 2);
  const pulse = reduceMotion ? 1 : 0.6 + 0.4 * Math.sin(now / 180);
  ctx.strokeStyle = `rgba(255,77,109,${pulse})`; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(px, sy(ppy + 8), Math.max(6, 10 * z) + 3 * pulse, 0, Math.PI * 2); ctx.stroke();
  chip('YOU', px, py - 6, '#ff4d6d', '#fff', size);
}

/* ================= CLUB INTERIORS ================= */
const DANCER_TOPS = ['#0c0c12', '#16151c', '#1a1920', '#2a2a33', '#0c0c12', '#e8e8f0', '#3a1f2a'];
const DANCER_SKINS = ['#f3c9a8', '#f0c7a0', '#e2b08c', '#d9a27c', '#c98d6a', '#8d5a3b', '#6b4430'];
const DANCER_HAIR = ['#111111', '#2a2420', '#5a3a22', '#c9a24a', '#b04a2a', '#c0c0c0', '#e83f8f', '#7ec8ff'];
let follower = null;

function buildInteriors() {
  if (!window.INTERIORS) return;
  Object.entries(window.INTERIORS).forEach(([clubId, club]) => {
    Object.entries(club.floors).forEach(([floorId, fl]) => {
      const id = clubId + ':' + floorId;
      const h = fl.map.length, w = fl.map[0].length;
      const grid = fl.map.map(row => [...row].map(ch => ICH[ch] !== undefined ? ICH[ch] : 41));
      const list = fl.people.map(p => Object.assign({ kind: 'npc', dir: p.dir || 'down', lines: [] }, p, { home: { x: p.x, y: p.y } }));
      list.forEach((e, i) => { if (e.pile) { e.kind = 'pile'; e.act = 'pile'; e.phase = i * 1.37; } });
      list.forEach(e => { if (e.movedWhen && questDone(clubId, e.movedWhen)) { e.x = e.movedTo[0]; e.y = e.movedTo[1]; } });
      // scatter dancers on the dancefloor, away from staff and stairs
      seed = 4242 + id.length * 31;
      const busyTile = (x, y) => list.some(e => Math.abs(e.x - x) + Math.abs(e.y - y) <= 2);
      const spawns = Object.values(fl.spawn);
      let tries = 0, placed = 0, dance = { x0: w, y0: h, x1: 0, y1: 0 };
      grid.forEach((row, y) => row.forEach((t, x) => { if (DANCES.has(t)) { dance.x0 = Math.min(dance.x0, x); dance.y0 = Math.min(dance.y0, y); dance.x1 = Math.max(dance.x1, x); dance.y1 = Math.max(dance.y1, y); } }));
      while (placed < (fl.dancers || 0) && tries++ < 2000) {
        const x = dance.x0 + Math.floor(rnd() * (dance.x1 - dance.x0 + 1)), y = dance.y0 + Math.floor(rnd() * (dance.y1 - dance.y0 + 1));
        if (!DANCES.has(grid[y][x]) || busyTile(x, y) || spawns.some(s => Math.abs(s[0] - x) + Math.abs(s[1] - y) <= 2)) continue;
        if (list.some(e => e.x === x && e.y === y)) continue;
        const long = rnd() < 0.4, pal = club.dancerPalette;
        const look = pal && pal.style === 'kinky'
          // latex, leather, harnesses, bare skin, the odd pair of bunny ears
          ? (() => { const skin = pick(DANCER_SKINS); return { skin, hair: pick(pal.hair), long, bald: !long && rnd() < 0.25, top: rnd() < 0.3 ? skin : pick(pal.tops), legs: pick(pal.legs),
              harness: rnd() < 0.45, shine: rnd() < 0.4 ? '#7a7a99' : undefined, shades: rnd() < 0.25, ears: rnd() < 0.15 ? pick(pal.extras) : undefined }; })()
          : pal
          // colourful festival crowd: glitter, stripes, flower crowns, face paint
          ? { skin: pick(DANCER_SKINS), hair: pick(pal.hair), long, top: pick(pal.tops), legs: pick(pal.legs), shades: rnd() < 0.2,
              sparkle: rnd() < 0.35 ? pick(pal.extras) : undefined, stripes: rnd() < 0.3 ? pick(pal.extras) : undefined,
              flowers: rnd() < 0.3 ? [pick(pal.extras), pick(pal.extras)] : undefined, paint: rnd() < 0.3 ? pick(pal.extras) : undefined,
              hat: !long && rnd() < 0.2 ? pick(pal.tops) : undefined, beard: !long && rnd() < 0.2 ? pick(pal.hair) : undefined }
          : { skin: pick(DANCER_SKINS), hair: pick(DANCER_HAIR), bald: !long && rnd() < 0.2, long, top: pick(DANCER_TOPS), legs: '#121116', shades: rnd() < 0.25, harness: rnd() < 0.12, beard: !long && rnd() < 0.2 ? '#2a2420' : undefined };
        list.push({ kind: 'npc', act: 'dancer', dance: true, phase: rnd() * 10, x, y, dir: 'down', look, lines: [pick(club.dancerLines)] });
        placed++;
      }
      // empty bottles to collect for Pfand (hidden once taken, so a reset brings them back)
      (fl.bottles || []).forEach(([x, y, type], i) => list.push({ kind: 'bottle', pickup: true, bid: id + ':' + i, type, x, y }));
      const sc = { id, club: clubId, floor: floorId, map: grid, w, h, ents: list, dance };
      sc.canvas = drawInteriorTiles(sc);
      SCENES[id] = sc;
    });
  });
}

function drawInteriorTiles(sc) {
  const cv = document.createElement('canvas');
  cv.width = sc.w * T; cv.height = sc.h * T;
  const g = cv.getContext('2d');
  const P = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const at = (x, y) => (x < 0 || y < 0 || x >= sc.w || y >= sc.h) ? 62 : sc.map[y][x];
  const floorBase = (X, Y) => { P(X, Y, 16, 16, '#2f2e35'); for (let i = 0; i < 4; i++) P(X + Math.floor(rnd() * 15), Y + Math.floor(rnd() * 15), 1, 1, pick(['#37363e', '#28272d'])); };
  const face = (X, Y) => { // raw concrete wall seen from the front, with formwork tie holes
    P(X, Y, 16, 16, '#5c5a56'); P(X, Y, 1, 16, '#4e4c48'); P(X, Y, 16, 2, '#6e6c67'); P(X, Y + 13, 16, 3, '#2a2928');
    [[4, 5], [12, 5], [4, 10], [12, 10]].forEach(([a, b]) => P(X + a, Y + b, 1, 1, '#45433f'));
  };
  seed = 777 + sc.id.length;
  for (let y = 0; y < sc.h; y++) for (let x = 0; x < sc.w; x++) {
    const t = sc.map[y][x], X = x * T, Y = y * T;
    const frontFace = !WALLISH.has(at(x, y + 1));
    switch (t) {
      case 40: if (frontFace) face(X, Y); else { P(X, Y, 16, 16, '#141318'); if (!WALLISH.has(at(x, y - 1)) && y > 0) P(X, Y, 16, 1, '#26252c'); } break;
      case 41: floorBase(X, Y); break;
      case 42: P(X, Y, 16, 16, '#222128'); P(X, Y, 16, 1, '#29282f'); P(X, Y, 1, 16, '#29282f'); P(X + 8, Y + 8, 1, 1, '#2f2e36'); break;
      case 61: P(X, Y, 16, 16, '#3a3a43'); for (let a = 1; a < 16; a += 3) for (let b = 1; b < 16; b += 3) P(X + a, Y + b, 1, 1, '#2c2c34'); break;
      case 47: P(X, Y, 16, 16, '#40454c'); P(X, Y, 16, 1, '#353940'); P(X, Y + 8, 16, 1, '#353940'); P(X, Y, 1, 16, '#353940'); P(X + 8, Y, 1, 16, '#353940'); break;
      case 46: P(X, Y, 16, 16, '#07060a'); if (rnd() < 0.2) P(X + Math.floor(rnd() * 15), Y + Math.floor(rnd() * 15), 1, 1, '#121117'); break;
      case 43: case 44: {
        const up = t === 43;
        for (let i = 0; i < 4; i++) {
          const shade = up ? ['#5d5d68', '#6d6d78', '#7d7d88', '#8d8d98'][3 - i] : ['#4a4a54', '#3e3e47', '#33333b', '#282830'][i];
          P(X, Y + i * 4, 16, 4, shade); P(X, Y + i * 4, 16, 1, '#c9b25a');
        }
        if (at(x - 1, y) !== t) { P(X, Y, 2, 16, '#a7a7b3'); P(X + 2, Y, 1, 16, INK); }
        if (at(x + 1, y) !== t) { P(X + 14, Y, 2, 16, '#a7a7b3'); P(X + 13, Y, 1, 16, INK); }
        break;
      }
      case 45: P(X, Y, 16, 16, '#0f0e13'); P(X + 2, Y, 12, 16, '#3b3a2c'); P(X + 2, Y + 12, 12, 4, '#6a6648'); if (at(x - 1, y) !== 45) P(X + 4, Y + 2, 8, 3, '#3fbf6f'); break;
      case 52: P(X, Y, 16, 16, '#3a3226'); for (let a = 1; a < 16; a += 4) for (let b = 1; b < 14; b += 4) P(X + a, Y + b, 3, 3, pick(['#c9a24a', '#a8823a', '#e8dcc0', '#7a5a2a', '#d9c27a'])); P(X, Y + 13, 16, 3, '#2a2928'); break;
      case 51: {
        face(X, Y); P(X + 1, Y + 1, 14, 12, INK); P(X + 2, Y + 2, 12, 10, '#07060a');
        for (let i = 0; i < 14; i++) { const gx = X + 1 + i, wy = Math.round(7 + 3 * Math.sin((gx) / 6)); P(gx, Y + wy, 1, 1, '#9fd6c0'); P(gx, Y + wy + 1, 1, 1, '#4a7a6a'); if (i % 3 === 0) P(gx, Y + 12 - Math.round(2 * Math.cos(gx / 5)), 1, 1, '#f0b8d0'); }
        break;
      }
      case 50: P(X, Y, 16, 16, '#1d1c22'); P(X + 1, Y + 1, 14, 12, '#2a2a32'); for (let i = 2; i < 13; i += 2) P(X + 1, Y + i, 14, 1, '#4c4c56'); P(X, Y + 13, 16, 3, '#2a2928'); break;
      case 60: face(X, Y); P(X + 3, Y + 2, 10, 14, INK); P(X + 4, Y + 3, 8, 13, '#1a1820'); P(X + 5, Y + 5, 6, 2, '#c9b25a'); break;
      case 49: floorBase(X, Y); P(X + 3, Y - 9, 10, 25, INK); P(X + 4, Y - 8, 8, 23, '#6a6e78'); P(X + 4, Y - 8, 2, 23, '#8a8e98'); P(X + 10, Y - 8, 2, 23, '#4e525a'); break;
      case 58: floorBase(X, Y); P(X + 1, Y, 14, 16, INK); P(X + 2, Y + 1, 12, 14, '#1b1a20'); circle(g, X + 8, Y + 9, 4, '#34333b'); circle(g, X + 8, Y + 9, 2, '#0c0c12'); P(X + 4, Y + 2, 8, 2, '#2c2b33'); break;
      case 59: floorBase(X, Y); P(X, Y + 1, 16, 15, INK); P(X, Y + 2, 16, 13, '#1c1b22'); P(X, Y + 2, 16, 4, '#2c2b33'); for (let i = 0; i < 3; i++) P(X + 2 + Math.floor(rnd() * 12), Y + 3 + Math.floor(rnd() * 2), 1, 1, pick(['#f2c45a', '#ff4d6d', '#6fb7ff'])); break;
      case 55: floorBase(X, Y); P(X, Y, 16, 16, INK); P(X + 1, Y + 1, 14, 9, '#1e1d24'); P(X + 1, Y + 1, 14, 1, '#2e2d36'); P(X + 1, Y + 10, 14, 5, '#111015'); if (rnd() < 0.5) { P(X + 3 + Math.floor(rnd() * 8), Y + 3, 2, 4, pick(['#7ec8ff', '#f2c45a', '#c8f0d0'])); } break;
      case 53: floorBase(X, Y); P(X, Y, 16, 16, INK); P(X + 1, Y + 1, 14, 9, '#7d5838'); P(X + 1, Y + 10, 14, 5, '#553a22'); break;
      case 54: floorBase(X, Y); P(X, Y, 16, 16, INK); P(X + 1, Y + 1, 14, 9, '#d9e6e0'); P(X + 1, Y + 10, 14, 5, '#9fb5ab'); circle(g, X + 5, Y + 5, 2, pick(['#f7c6d9', '#f2e2a0', '#7a4a2e'])); circle(g, X + 11, Y + 5, 2, pick(['#f7c6d9', '#f2e2a0', '#c8f0d0'])); break;
      case 56: floorBase(X, Y); P(X, Y, 16, 16, INK); P(X + 1, Y + 1, 14, 9, '#4a4a52'); P(X + 1, Y + 10, 14, 5, '#33333a'); P(X + 5, Y + 2, 6, 4, '#6fb7ff'); break;
      case 57: floorBase(X, Y); P(X + 1, Y + 5, 14, 8, INK); P(X + 2, Y + 6, 12, 6, '#2a2930'); P(X + 2, Y + 6, 12, 2, '#3a3942'); break;
      case 48: P(X, Y, 16, 16, '#40454c'); P(X + 6, Y - 6, 4, 22, INK); P(X + 7, Y - 5, 2, 20, '#8a9098'); break;
      // ---- Sisyphos ----
      case 63: P(X, Y, 16, 16, '#c9a86a'); for (let i = 0; i < 7; i++) P(X + Math.floor(rnd() * 15), Y + Math.floor(rnd() * 15), 1, 1, pick(['#b8955a', '#d9bc84', '#a88a50'])); break;
      case 64: {
        P(X, Y, 16, 16, '#2f86ad');
        for (let i = 0; i < 2; i++) P(X + Math.floor(rnd() * 11), Y + 3 + Math.floor(rnd() * 10), 4, 1, '#5fb6db');
        const edge = '#e8e4d8';
        if (at(x, y - 1) !== 64) { P(X, Y, 16, 3, edge); P(X, Y + 3, 16, 1, '#1d5f80'); }
        if (at(x, y + 1) !== 64) P(X, Y + 14, 16, 2, edge);
        if (at(x - 1, y) !== 64) P(X, Y, 2, 16, edge);
        if (at(x + 1, y) !== 64) P(X + 14, Y, 2, 16, edge);
        break;
      }
      case 65: P(X, Y, 16, 16, '#6b4a2e'); for (let r = 3; r < 16; r += 4) P(X, Y + r, 16, 1, '#563a22'); P(X + ((y % 2) ? 5 : 11), Y, 1, 16, '#5a3e26'); P(X + 2, Y + 1, 1, 1, '#8a6a48'); break;
      case 66: P(X, Y, 16, 16, '#3f7a3a'); for (let i = 0; i < 4; i++) P(X + Math.floor(rnd() * 15), Y + Math.floor(rnd() * 14), 1, 2, pick(['#4f8f45', '#356a31'])); if (rnd() < 0.25) P(X + Math.floor(rnd() * 14), Y + Math.floor(rnd() * 14), 2, 2, pick(['#ff5e7a', '#ffd23f', '#f3eee3', '#c28cff'])); break;
      case 67: P(X, Y, 16, 16, '#3f7a3a'); P(X + 7, Y + 10, 2, 6, '#5a3a22'); circle(g, X + 8, Y + 7, 7, INK); circle(g, X + 8, Y + 7, 6, '#2f6b35'); circle(g, X + 6, Y + 5, 3, '#4f8f4a'); P(X + 9, Y + 9, 2, 2, pick(['#ff5e7a', '#ffd23f', '#5ec8ff'])); break;
      case 68: if (frontFace) { P(X, Y, 16, 16, '#8a4b3a'); for (let r = 0; r < 16; r += 4) { P(X, Y + r + 3, 16, 1, '#6e3a2c'); P(X + ((r / 4) % 2 ? 4 : 12), Y + r, 1, 3, '#6e3a2c'); } P(X, Y + 13, 16, 3, '#4a2a22'); } else { P(X, Y, 16, 16, '#2a1a18'); if (!WALLISH.has(at(x, y - 1)) && y > 0) P(X, Y, 16, 1, '#4a2e28'); } break;
      case 69: if (frontFace) { P(X, Y, 16, 16, '#c08a55'); for (let i = 3; i < 16; i += 4) P(X + i, Y, 1, 16, '#a06e40'); P(X, Y + 13, 16, 3, '#7a5432'); } else P(X, Y, 16, 16, '#5a3a22'); break;
      case 70: P(X, Y, 16, 16, '#7a5432'); for (let r = 0; r < 16; r += 4) P(X, Y + r, 16, 3, '#a87a4a'); break;
      case 71: P(X, Y, 16, 16, '#7a5432'); P(X + 1, Y + 4, 14, 12, INK); P(X + 2, Y + 5, 12, 10, '#3a3a3a'); circle(g, X + 5, Y + 6, 3, '#8a8a8a'); circle(g, X + 10, Y + 6, 3, '#6a6a6a'); circle(g, X + 8, Y + 4, 2, '#9a9a9a'); P(X + 6, Y + 11, 4, 2, '#ff8c42'); break;
      case 72: P(X, Y, 16, 16, '#3f7a3a'); P(X, Y + 4, 16, 2, '#7a5a3a'); P(X, Y + 10, 16, 2, '#7a5a3a'); P(X + 2, Y + 1, 3, 15, '#8a6a48'); P(X + 11, Y + 1, 3, 15, '#8a6a48'); if (rnd() < 0.4) P(X + 6, Y + 6, 3, 4, pick(['#ff5e7a', '#ffd23f', '#5ec8ff', '#b6f36b'])); break;
      case 73: {
        P(X, Y, 16, 16, '#3f7a3a');
        const cols = ['#ff5e7a', '#ffd23f', '#5ec8ff', '#b6f36b', '#c28cff'];
        P(X + 3, Y - 10, 10, 26, INK);
        for (let i = 0; i < 5; i++) P(X + 4, Y - 9 + i * 5, 8, 5, cols[(i + x) % 5]);
        P(X + 6, Y - 6, 1, 1, INK); P(X + 9, Y - 6, 1, 1, INK); P(X + 6, Y - 3, 4, 1, INK);
        break;
      }
      case 74: if (frontFace) { P(X, Y, 16, 16, '#7fb8b0'); P(X, Y, 16, 1, '#d8e8e0'); P(X, Y + 7, 16, 1, '#d8e8e0'); P(X, Y, 1, 16, '#d8e8e0'); P(X + 2, Y + 2, 2, 4, '#c9efe7'); P(X, Y + 14, 16, 2, '#4a6a66'); } else { P(X, Y, 16, 16, '#26403c'); P(X, Y, 16, 1, '#3f6660'); } break;
      case 75: P(X, Y, 16, 16, '#4a1416'); P(X, Y, 16, 1, '#6a4a1a'); P(X, Y + 8, 16, 1, '#6a4a1a'); P(X, Y, 1, 16, '#6a4a1a'); P(X + 8, Y, 1, 16, '#6a4a1a'); break;
      case 76: P(X, Y, 16, 16, '#7a5432'); P(X, Y + 2, 16, 12, INK); P(X, Y + 3, 16, 7, '#e0b47c'); P(X, Y + 10, 16, 3, '#a87a4a'); break;
      case 77: P(X, Y, 16, 16, '#7a5434'); for (let r = 0; r < 16; r += 4) P(X, Y + r, 16, 1, '#6a4628'); P(X + ((y % 2) ? 3 : 10), Y, 1, 16, '#6a4628'); if (rnd() < 0.3) P(X + Math.floor(rnd() * 13), Y + Math.floor(rnd() * 13), 3, 1, '#8a6440'); break;
      case 78: P(X, Y, 16, 16, '#8a4b3a'); P(X, Y + 13, 16, 3, '#4a2a22'); circle(g, X + 8, Y + 7, 6, '#c9a24a'); circle(g, X + 8, Y + 7, 4, '#2f6f8f'); P(X + 6, Y + 5, 2, 2, '#9fd0e6'); break;
      case 79: if (frontFace) { P(X, Y, 16, 16, '#a3161a'); P(X, Y + 2, 16, 1, '#e0b040'); P(X, Y + 11, 16, 1, '#e0b040'); for (let i = 1; i < 16; i += 5) { P(X + i, Y + 4, 3, 1, '#e0b040'); P(X + i, Y + 4, 1, 4, '#e0b040'); P(X + i, Y + 7, 3, 1, '#e0b040'); } P(X, Y + 13, 16, 3, '#5a0a0c'); } else { P(X, Y, 16, 16, '#3a0a0c'); P(X, Y, 16, 1, '#6a1a1c'); } break;
      // ---- KitKat ----
      case 90: if (frontFace) {
        P(X, Y, 16, 16, '#1a0a2a');
        const neon = ['#39ff14', '#ff2bd6', '#00e5ff', '#fff200'];
        for (let k = 0; k < 3; k++) { const c = neon[(x + k) % 4], ph = rnd() * 6; for (let i = 0; i < 16; i++) P(X + i, Y + 3 + Math.round(4 + 3 * Math.sin(i / 2.5 + ph + k)), 1, 1, c); }
        P(X + 4 + Math.floor(rnd() * 8), Y + 4, 2, 2, pick(neon));
        P(X, Y + 13, 16, 3, '#0a0612');
      } else P(X, Y, 16, 16, '#0a0612'); break;
      case 91: P(X, Y, 16, 16, '#2a0a1a'); for (let i = 0; i < 3; i++) P(X + Math.floor(rnd() * 15), Y + Math.floor(rnd() * 15), 1, 1, '#ff2bd6');
        if (at(x, y + 1) !== 91 && at(x, y + 1) !== 92) P(X, Y + 14, 16, 2, '#e0b040'); break;
      case 92: P(X, Y, 16, 16, '#2a0a1a'); P(X + 6, Y - 12, 4, 28, INK); P(X + 7, Y - 11, 2, 26, '#d8dce6'); P(X + 7, Y - 11, 1, 26, '#ffffff'); P(X + 4, Y + 13, 8, 3, '#8a9098'); break;
      case 93: floorBase(X, Y); P(X, Y + 2, 16, 13, INK); P(X + 1, Y + 3, 14, 6, '#3a0a12'); P(X + 1, Y + 9, 14, 5, '#5a1220'); P(X + 2, Y + 4, 12, 1, '#7a2a36'); for (let i = 3; i < 14; i += 4) P(X + i, Y + 6, 1, 1, '#1a0408'); break;
      case 94: floorBase(X, Y); P(X, Y + 1, 16, 15, INK); P(X + 1, Y + 2, 14, 13, '#2a0a14'); P(X + 1, Y + 2, 14, 1, '#4a1a24'); break;
      case 95: floorBase(X, Y); for (let i = 0; i < 14; i++) { P(X + 1 + i, Y + 1 + i, 2, 2, '#3a2418'); P(X + 13 - i, Y + 1 + i, 2, 2, '#3a2418'); } P(X + 1, Y + 1, 3, 2, '#0c0c12'); P(X + 12, Y + 1, 3, 2, '#0c0c12'); P(X + 2, Y + 2, 1, 1, '#c0c4cc'); P(X + 13, Y + 2, 1, 1, '#c0c4cc'); break;
      case 96: floorBase(X, Y); P(X + 3, Y - 8, 1, 16, '#8a9098'); P(X + 12, Y - 8, 1, 16, '#8a9098'); P(X + 2, Y + 8, 12, 4, INK); P(X + 3, Y + 9, 10, 2, '#3a0a12'); break;
      case 97: P(X, Y, 16, 16, INK); P(X + 1, Y - 6, 14, 22, '#a3161a'); P(X + 1, Y - 6, 14, 4, '#e0b040'); for (let i = 0; i < 6; i++) P(X + 3 + i * 2, Y - 5, 1, 2, i % 2 ? '#fff200' : '#ff2bd6');
        P(X + 3, Y, 10, 15, '#6a0a18'); for (let i = 4; i < 13; i += 3) P(X + i, Y, 1, 15, '#4a0610'); break;
      case 98: floorBase(X, Y); P(X, Y + 1, 16, 1, '#8a9098'); for (let i = 1; i < 16; i += 3) P(X + i, Y + 1, 1, 15, '#8a9098'); break;
      case 100: floorBase(X, Y); P(X + 3, Y + 5, 10, 6, INK); P(X + 4, Y + 6, 8, 4, '#d9e6e0'); P(X + 1, Y + 2, 2, 5, '#8a9098'); P(X + 13, Y + 2, 2, 5, '#8a9098'); P(X + 7, Y + 11, 2, 5, '#8a9098'); break;
      case 101: P(X, Y, 16, 16, '#9fe0e8'); P(X, Y, 16, 1, '#7fc8d2'); P(X, Y + 8, 16, 1, '#7fc8d2'); P(X, Y, 1, 16, '#7fc8d2'); P(X + 8, Y, 1, 16, '#7fc8d2'); break;
      case 81: case 82: case 83: case 84: case 85: case 86: case 87: case 88: case 89: {
        // a doorway with a bead curtain
        P(X, Y, 16, 16, '#1a1018'); P(X, Y, 16, 2, '#c9a24a'); P(X, Y, 2, 16, '#c9a24a'); P(X + 14, Y, 2, 16, '#c9a24a');
        const beads = ['#ff5e7a', '#ffd23f', '#5ec8ff', '#b6f36b', '#c28cff'];
        for (let i = 3; i < 14; i += 2) for (let j = 3; j < 15; j += 3) P(X + i, Y + j, 1, 2, beads[(i + j) % 5]);
        break;
      }
      default: P(X, Y, 16, 16, '#000'); break;
    }
  }
  return cv;
}

function drawInteriorFx(now, camX, camY, ppx, ppy) {
  const sc = SCENES[scene];
  const fl = window.INTERIORS[sc.club].floors[sc.floor];
  const lights = !reduceMotion;
  // pool water shimmer
  sc.map.forEach((row, y) => row.forEach((t, x) => {
    if (t !== 64) return;
    const k = (x * 5 + y * 3 + Math.floor(now / 400)) % 6;
    if (k < 2) { ctx.fillStyle = k ? '#7fcde8' : '#c9f0ff'; ctx.fillRect(x * T - camX + 3 + ((x * 7 + k * 5) % 8), y * T - camY + 5 + ((y * 11 + x) % 6), 3, 1); }
  }));
  // moving coloured spots on the dancefloor
  if (sc.dance.x1 >= sc.dance.x0) {
    const d = sc.dance, bx = d.x0 * T - camX, by = d.y0 * T - camY, bw = (d.x1 - d.x0 + 1) * T, bh = (d.y1 - d.y0 + 1) * T;
    ctx.save(); ctx.beginPath(); ctx.rect(bx, by, bw, bh); ctx.clip();
    ctx.globalCompositeOperation = 'lighter';
    const cols = fl.spots || (sc.floor === 'pb' ? ['rgba(255,170,90,.16)', 'rgba(255,90,160,.14)', 'rgba(140,120,255,.14)'] : ['rgba(255,40,80,.15)', 'rgba(60,120,255,.15)', 'rgba(255,255,255,.10)', 'rgba(170,80,255,.13)']);
    for (let i = 0; i < 6; i++) {
      const t = (lights ? now / 1000 : 0) * (0.35 + i * 0.07) + i * 1.7;
      const cx = bx + bw / 2 + Math.sin(t) * bw * 0.4, cy = by + bh / 2 + Math.cos(t * 1.3) * bh * 0.4;
      const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, 34);
      gr.addColorStop(0, cols[i % cols.length]); gr.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = gr; ctx.fillRect(cx - 34, cy - 34, 68, 68);
    }
    ctx.restore();
  }
  // DJ booth lights
  sc.map.forEach((row, y) => row.forEach((t, x) => {
    if (t !== 59) return;
    if ((Math.floor(now / 180) + x * 3) % 4 === 0) { ctx.fillStyle = ['#ff4d6d', '#6fb7ff', '#f2c45a'][(x + y) % 3]; ctx.fillRect(x * T - camX + 3 + (x * 5) % 9, y * T - camY + 4, 2, 2); }
  }));
  // entities, follower and player, sorted by row
  const list = ents.map(e => ({ e, y: e.y }));
  list.push({ e: null, y: ppy / T });
  if (follower) list.push({ e: 'follower', y: followerPx()[1] / T });
  list.sort((a, b) => a.y - b.y);
  list.forEach(({ e }) => {
    if (!e) {
      const step = player.moving ? (player.t < player.dur / 2 ? (player.n % 2) + 1 : 0) : 0;
      person(ctx, ppx - camX, ppy - camY - 3, player.dir, step, lookOf(state.outfit));
      return;
    }
    if (e === 'follower') {
      const [fx, fy] = followerPx();
      const step = player.moving ? (player.t < player.dur / 2 ? ((player.n + 1) % 2) + 1 : 0) : 0;
      person(ctx, fx - camX, fy - camY - 3, follower.dir, step, follower.look);
      return;
    }
    const X = e.x * T - camX, Y = e.y * T - camY;
    if (X < -16 || Y < -24 || X > VW || Y > VH + 8) return;
    if (e.kind === 'bottle') { if (!state.pfand.taken[e.bid]) drawBottle(X, Y, e.type, now); return; }
    if (e.kind === 'pile') { drawPile(e, X, Y, now, lights); return; }
    if (e.dance && lights) {
      const beat = Math.floor(now / 230 + e.phase);
      const dir = ['down', 'left', 'down', 'right'][Math.floor(now / 900 + e.phase) % 4];
      person(ctx, X, Y - 3 - (beat % 2), dir, (beat % 2) + 1, e.look);
    } else person(ctx, X, Y - 3, e.dir, 0, e.look);
  });
  // main floor: the light bar along the top wall and a short strobe now and then
  if (sc.floor === 'mf') {
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(T - camX, T + 5 - camY, (sc.w - 2) * T, 2);
    ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(T - camX, T + 2 - camY, (sc.w - 2) * T, 8);
    if (lights && now % 3200 < 70) { ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(0, 0, VW, VH); }
  }
  // Panorama Bar sunrise: open blinds and light falling into the room
  if (sc.floor === 'pb' && state.sunrise[sc.club]) {
    sc.map.forEach((row, y) => row.forEach((t, x) => {
      if (t !== 50) return;
      const X = x * T - camX, Y = y * T - camY;
      ctx.fillStyle = '#ffe2a0'; ctx.fillRect(X + 1, Y + 1, 14, 12);
      ctx.fillStyle = '#fff4d6'; ctx.fillRect(X + 1, Y + 1, 14, 3);
      ctx.fillStyle = '#c9a26a'; ctx.fillRect(X + 1, Y + 1, 14, 1);
    }));
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const wx0 = 9 * T - camX, wx1 = 25 * T - camX, wy = 2 * T - camY;
    const gr = ctx.createLinearGradient(0, wy, 0, wy + 10 * T);
    gr.addColorStop(0, 'rgba(255,200,120,.30)'); gr.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(wx0, wy); ctx.lineTo(wx1, wy); ctx.lineTo(wx1 - 5 * T, wy + 10 * T); ctx.lineTo(wx0 - 6 * T, wy + 10 * T); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // fairy lights strung between two tiles, sagging a little
  (fl.fairy || []).forEach(([x0, y0, x1, y1], si) => {
    const n = Math.max(4, Math.abs(x1 - x0) * 2);
    for (let i = 0; i <= n; i++) {
      const k = i / n, sag = Math.sin(k * Math.PI) * 5;
      const lx = (x0 + (x1 - x0) * k) * T + 8 - camX, ly = (y0 + (y1 - y0) * k) * T + 2 + sag - camY;
      const on = !lights || (Math.floor(now / 500) + i + si) % 3 !== 0;
      ctx.fillStyle = 'rgba(20,18,28,.6)'; if (i < n) ctx.fillRect(lx, ly, T / 2, 1);
      if (on) { ctx.fillStyle = ['#ffd23f', '#ff5e7a', '#5ec8ff', '#b6f36b', '#c28cff'][(i + si) % 5]; ctx.fillRect(lx - 1, ly, 2, 2); }
    }
  });
  // red paper lanterns, swaying (the Tunnel)
  (fl.lanterns || []).forEach(([lx, ly], i) => {
    const sway = lights ? Math.sin(now / 700 + i) * 2 : 0;
    const X = lx * T + 8 - camX + sway, Y = ly * T - 4 - camY;
    ctx.fillStyle = 'rgba(255,90,40,.18)'; ctx.beginPath(); ctx.arc(X, Y + 6, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = INK; ctx.fillRect(X - 0.5, Y - 6, 1, 6);
    ctx.fillStyle = '#e0b040'; ctx.fillRect(X - 3, Y, 6, 1); ctx.fillRect(X - 3, Y + 10, 6, 1);
    ctx.fillStyle = '#d42a1e'; ctx.fillRect(X - 4, Y + 1, 8, 9);
    ctx.fillStyle = '#ff6a3a'; ctx.fillRect(X - 2, Y + 2, 2, 7);
    ctx.fillStyle = '#e0b040'; ctx.fillRect(X - 0.5, Y + 11, 1, 3);
  });
  // sauna steam (thicker during the Aufguss)
  if (fl.steam) {
    const thick = steamUntil > now ? 1 : 0.35;
    ctx.save(); ctx.globalAlpha = 0.18 * thick;
    for (let i = 0; i < 14; i++) {
      const t = (lights ? now / 2600 : 0) + i * 1.3;
      const sx = ((i * 53 + t * 30) % (sc.w * T)) - camX, sy = (sc.h * T - ((t * 40 + i * 37) % (sc.h * T))) - camY;
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(sx, sy, 12 + (i % 4) * 4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
  // open air: warm afternoon light
  if (fl.daylight) { ctx.fillStyle = 'rgba(255,214,140,.10)'; ctx.fillRect(0, 0, VW, VH); }
  // KitKat: UV light upstairs, red light in the dungeon
  if (fl.uv) {
    ctx.fillStyle = 'rgba(110,30,200,.16)'; ctx.fillRect(0, 0, VW, VH);
    // the fluorescent paintings glow under the UV
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = lights ? 0.18 + 0.08 * Math.sin(now / 600) : 0.2;
    sc.map.forEach((row, y) => row.forEach((t, x) => { if (t === 90 && !WALLISH.has(sc.map[y + 1] ? sc.map[y + 1][x] : 40)) ctx.drawImage(mc, x * T, y * T, T, T, x * T - camX, y * T - camY, T, T); }));
    ctx.restore();
  }
  if (fl.red) { ctx.fillStyle = 'rgba(170,0,30,.18)'; ctx.fillRect(0, 0, VW, VH); }
  // darkroom: you only see right around you
  if (get(player.x, player.y) === DARK || (player.moving && get(player.tx, player.ty) === DARK)) {
    const cx = ppx - camX + 8, cy = ppy - camY + 6;
    const gr = ctx.createRadialGradient(cx, cy, 8, cx, cy, 44);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.94)');
    ctx.fillStyle = gr; ctx.fillRect(0, 0, VW, VH);
  }
}

/* ---- follower (someone walking behind you) ---- */
function followerPx() {
  if (!player.moving) return [follower.x * T, follower.y * T];
  const k = player.t / player.dur;
  return [Math.round((follower.px + (follower.x - follower.px) * k) * T), Math.round((follower.py + (follower.y - follower.py) * k) * T)];
}
function followStep(oldX, oldY) {
  if (!follower) return;
  follower.px = follower.x; follower.py = follower.y;
  follower.x = oldX; follower.y = oldY;
  const dx = follower.x - follower.px, dy = follower.y - follower.py;
  if (dx || dy) follower.dir = dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'down' : 'up';
}
function placeFollower() {
  if (!follower) return;
  const [dx, dy] = DIRS[OPP[player.dir]];
  let fx = player.x + dx, fy = player.y + dy;
  if (blocked(fx, fy)) { fx = player.x; fy = player.y; }
  follower.x = follower.px = fx; follower.y = follower.py = fy; follower.dir = player.dir;
}
function releaseFollower() {
  if (!follower) return;
  const sc = SCENES[follower.homeScene];
  if (sc && !sc.ents.includes(follower.ent)) { follower.ent.x = follower.ent.home.x; follower.ent.y = follower.ent.home.y; sc.ents.push(follower.ent); }
  follower = null;
}

/* ---- transitions ---- */
const fadeEl = $('#fade'), floorCard = $('#floorCard'), floorTag = $('#floorTag'), toastEl = $('#toast');
async function fade(on) { fadeEl.classList.toggle('on', on); await wait(reduceMotion ? 0 : 240); }
let floorCardTimer = null;
function showFloorCard(title, sub) {
  floorCard.innerHTML = '<b></b><span></span>';
  floorCard.querySelector('b').textContent = title;
  floorCard.querySelector('span').textContent = sub;
  floorCard.hidden = false; floorCard.classList.remove('out');
  clearTimeout(floorCardTimer);
  floorCardTimer = setTimeout(() => { floorCard.classList.add('out'); floorCardTimer = setTimeout(() => { floorCard.hidden = true; }, 400); }, 1400);
}
let toastTimer = null;
function toast(text) {
  toastEl.textContent = text; toastEl.hidden = false; toastEl.classList.remove('out');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastEl.classList.add('out'); toastTimer = setTimeout(() => { toastEl.hidden = true; }, 400); }, 2600);
}
function updateFloorTag() {
  if (!inClub()) { floorTag.hidden = true; return; }
  const fl = window.INTERIORS[sceneClub()].floors[sceneFloor()];
  floorTag.textContent = window.INTERIORS[sceneClub()].name.toUpperCase() + ' · ' + fl.short;
  floorTag.hidden = false;
}
async function goFloor(clubId, floorId, spawnKey) {
  busy = true;
  await fade(true);
  const fl = window.INTERIORS[clubId].floors[floorId];
  const [x, y, dir] = fl.spawn[spawnKey];
  useScene(clubId + ':' + floorId);
  player.x = player.tx = x; player.y = player.ty = y; player.dir = dir; player.moving = false;
  placeFollower();
  updateFloorTag();
  showFloorCard(fl.short, fl.label);
  await fade(false);
  busy = false;
  await onFloorEnter(clubId, floorId);
}
async function enterClub(c, overlayShown) {
  busy = true;
  if (!overlayShown && !state.visited[c.id]) await showInside(c, false);
  const first = !state.visited[c.id];
  state.visited[c.id] = true;
  await goFloor(c.id, Object.keys(window.INTERIORS[c.id].floors)[0], 'street');
  if (first) {
    busy = true;
    const welcome = window.INTERIORS[c.id].welcome || ['Security: Phone.', '(He puts stickers over your phone cameras. No photos in here.)', 'Security: Viel Spaß.', '(Side quests unlocked. Check your stamp card.)'];
    for (const l of welcome) await say(l);
    closeBox();
    renderCard(); save();
    busy = false;
  }
}
async function leaveClub(clubId) {
  const c = CLUBS.find(cl => cl.id === clubId);
  busy = true;
  if (follower) { await say(`(${follower.name} stays inside. They'll wait for you at Panorama Bar.)`); closeBox(); releaseFollower(); }
  await fade(true);
  useScene('city');
  player.x = player.tx = c.dx; player.y = player.ty = c.by; player.dir = 'down'; player.moving = false;
  updateFloorTag();
  save();
  await fade(false);
  busy = false;
}

/* ---- side quests ---- */
const QUEST_LIST = clubId => (window.INTERIORS[clubId] && window.INTERIORS[clubId].quests) || [];
const questDone = (clubId, id) => !!state.quests[clubId + ':' + id];
const questCount = clubId => QUEST_LIST(clubId).filter(q => questDone(clubId, q.id)).length;
async function completeQuest(clubId, id) {
  if (questDone(clubId, id)) return;
  state.quests[clubId + ':' + id] = true;
  const q = QUEST_LIST(clubId).find(x => x.id === id);
  toast('QUEST DONE · ' + (q ? q.title : id));
  renderCard(); save();
  if (questCount(clubId) === QUEST_LIST(clubId).length) {
    await say(`(You did everything ${window.INTERIORS[clubId].name} has to offer. Almost. Nobody does everything.)`);
  }
}
async function onFloorEnter(clubId, floorId) {
  if (floorId !== 'pb' || state.sunrise[clubId]) return;
  const others = QUEST_LIST(clubId).filter(q => q.id !== 'sunrise' && questDone(clubId, q.id)).length;
  if (others < 3) return;
  busy = true;
  await say('(The music drops. The metal blinds start to rise…)');
  state.sunrise[clubId] = true; save();
  await say('(Daylight floods Panorama Bar. The whole room screams.)');
  await say('(Dance now! Press A on the dancefloor.)');
  closeBox();
  busy = false;
}
let tripUntil = 0;
// Hint shown on the stamp card for each step of the toilet chain.
const K_HINTS = { 1: 'Find Mila on the main dancefloor: pink hair, sunglasses, left speakers.', 2: 'You have the bag. Back to the guy at the toilet door.' };

/* ---- the 10-second K hit: melting rows and columns, ghost trails, blur, colour drift, slow motion ---- */
const K_MS = 10000;
let kStart = 0, kUntil = 0;
const kBuf = document.createElement('canvas'), kBufCtx = kBuf.getContext('2d');
const kTrail = document.createElement('canvas'), kTrailCtx = kTrail.getContext('2d');
function startK() { kStart = performance.now(); kUntil = kStart + K_MS; kTrailCtx.clearRect(0, 0, kTrail.width, kTrail.height); }
function endK() { kUntil = 0; cvs.style.filter = ''; }
// 0..1: rises quickly, holds, fades out over the last seconds
function kLevel(now) {
  if (!kUntil) return 0;
  const p = (now - kStart) / K_MS;
  if (p >= 1) return 0;
  return Math.min(1, p * 6) * Math.min(1, (1 - p) * 3);
}
const timeScale = now => 1 - 0.6 * kLevel(now);
function applyK(now) {
  const env = kLevel(now);
  if (!env) { endK(); return; }
  if (reduceMotion) { cvs.style.filter = `blur(${(1.5 * env).toFixed(2)}px) saturate(${(1 + env).toFixed(2)}) hue-rotate(${Math.round(90 * env)}deg)`; return; }
  const W = cvs.width, H = cvs.height, t = now / 1000;
  if (kBuf.width !== W || kBuf.height !== H) { kBuf.width = W; kBuf.height = H; kTrail.width = W; kTrail.height = H; }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  // rows slide sideways in waves
  kBufCtx.drawImage(cvs, 0, 0);
  const ax = 12 * env;
  for (let y = 0; y < H; y += 2) ctx.drawImage(kBuf, 0, y, W, 2, Math.sin(y * 0.045 + t * 2.2) * ax + Math.sin(y * 0.13 + t * 5) * ax * 0.25, y, W, 2);
  // columns drip downwards: the room melts
  kBufCtx.drawImage(cvs, 0, 0);
  const ay = 18 * env;
  for (let x = 0; x < W; x += 2) {
    const d = Math.max(0, Math.sin(x * 0.028 + t * 1.1)) * ay + Math.sin(x * 0.17 + t * 3.3) * ay * 0.2;
    ctx.drawImage(kBuf, x, 0, 2, H, x, d, 2, H);
  }
  // ghost trails: everything that moves leaves an echo
  ctx.globalAlpha = 0.6 * env; ctx.drawImage(kTrail, 0, 0); ctx.globalAlpha = 1;
  kTrailCtx.drawImage(cvs, 0, 0);
  cvs.style.filter = `blur(${(2.4 * env).toFixed(2)}px) hue-rotate(${Math.round(now / 9) % 360}deg) saturate(${(1 + 2 * env).toFixed(2)}) contrast(${(1 + 0.35 * env).toFixed(2)})`;
}
function startTrip() { tripUntil = performance.now() + 45000; }
function endTrip() { tripUntil = 0; cvs.style.filter = ''; }

async function danceHere() {
  busy = true;
  const dirs = ['down', 'left', 'up', 'right'];
  for (let i = 0; i < 8; i++) { player.dir = dirs[i % 4]; await wait(reduceMotion ? 0 : 110); }
  player.dir = 'down';
  const clubId = sceneClub(), fl = sceneFloor();
  if (DANCE_HOOKS[clubId]) { await DANCE_HOOKS[clubId](fl); closeBox(); busy = false; return; }
  if (fl === 'pb' && state.sunrise[clubId]) {
    await say('(Sunlight on your face, house music in your ears. This is it.)');
    await completeQuest(clubId, 'sunrise');
  } else if (fl === 'pb') {
    await say('(Nice groove. The blinds are still down.)');
  } else {
    await say(pick(['(You lose yourself in the kick drum.)', '(Eyes closed. The bass goes straight through you.)', '(Someone next to you yells "YES". You agree.)']));
    await completeQuest(clubId, 'dance');
  }
  closeBox();
  busy = false;
}

/* ---- Sisyphos: Pfand, stories, dancing in every room ---- */
// German bottle deposit: reusable beer bottles 8 ct, Club-Mate 15 ct, cans 25 ct.
const PFAND = { beer: { name: 'beer bottle', cents: 8 }, mate: { name: 'Club-Mate bottle', cents: 15 }, can: { name: 'can', cents: 25 } };
const PFAND_GOAL = 8, CARRY_MAX = 4;
const euro = c => '€' + (c / 100).toFixed(2);
let steamUntil = 0;
function pickBottle(e) {
  const p = state.pfand;
  if (p.carry >= CARRY_MAX) { toast('HANDS FULL · BRING THEM TO A BAR'); return false; }
  p.taken[e.bid] = true; p.carry++; p.carryCents += PFAND[e.type].cents;
  toast(`+1 ${PFAND[e.type].name.toUpperCase()} · ${p.carry}/${CARRY_MAX} IN HANDS`);
  save(); renderCard();
  return true;
}
function drawBottle(X, Y, type, now) {
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(X + 5, Y + 13, 6, 2);
  if (type === 'can') {
    ctx.fillStyle = INK; ctx.fillRect(X + 5, Y + 6, 6, 8);
    ctx.fillStyle = '#c0c4cc'; ctx.fillRect(X + 6, Y + 7, 4, 6);
    ctx.fillStyle = '#ff5e7a'; ctx.fillRect(X + 6, Y + 9, 4, 2);
  } else {
    const glass = type === 'mate' ? '#2f6b3a' : '#6b3d1a';
    ctx.fillStyle = INK; ctx.fillRect(X + 5, Y + 6, 6, 8); ctx.fillRect(X + 6, Y + 3, 4, 4);
    ctx.fillStyle = glass; ctx.fillRect(X + 6, Y + 7, 4, 6); ctx.fillRect(X + 7, Y + 4, 2, 3);
    if (type === 'mate') { ctx.fillStyle = '#f2c14e'; ctx.fillRect(X + 6, Y + 9, 4, 2); }
  }
  // a glint so you spot them
  if (Math.floor(now / 400 + X) % 5 === 0) { ctx.fillStyle = '#fff'; ctx.fillRect(X + 7, Y + 7, 1, 2); }
}
function questHint(clubId, q) {
  if (clubId === 'berghain' && q.id === 'toilet' && K_HINTS[state.kStage]) return K_HINTS[state.kStage];
  if (q.id === 'pfand') { const p = state.pfand; return `Returned ${p.returned}/${PFAND_GOAL} · in hands ${p.carry}/${CARRY_MAX} · ${euro(p.cents)} earned. Any bar takes them back.`; }
  if (q.id === 'stories') return `${Object.keys(state.heard).length}/3 heard. ` + q.hint;
  if (q.id === 'hopper') return `${roomsDanced(clubId)}/4 rooms. ` + q.hint;
  return q.hint;
}
const roomsDanced = clubId => Object.keys(state.danced).filter(k => k.startsWith(clubId + ':')).length;
const SISY_DANCE = {
  strand: '(Barefoot in the sand, sun on your neck. Someone hands you a slice of watermelon.)',
  wg: "(Glass walls, plants, house music. In the Wintergarten it's always the good part of the afternoon.)",
  hh: '(The Hammahalle kick drum hits like a hammer. Fair enough.)',
  df: '(The whole Dampfer seems to sway like a ship. Or is that you?)',
  tn: '(Red lanterns swing above you. The Tunnel goes on forever.)'
};
const DANCE_HOOKS = {
  async sisyphos(fl) {
    await say(SISY_DANCE[fl] || '(You dance. Nobody is in a hurry here.)');
    if (!state.danced['sisyphos:' + fl]) { state.danced['sisyphos:' + fl] = true; save(); renderCard(); }
    const n = roomsDanced('sisyphos');
    if (n >= 4) await completeQuest('sisyphos', 'hopper');
    else toast(`DANCED IN ${n}/4 ROOMS`);
  }
};

/* ---- KitKat: groups on beds, Marco, the photo booth ---- */
function drawPile(e, X, Y, now, lights) {
  // a bed (or a dark corner) with several people tangled together, rocking slowly
  const W = (e.w || 1) * T, n = e.looks.length, beat = lights ? now / 430 : 0;
  ctx.fillStyle = INK; ctx.fillRect(X - 1, Y + 3, W + 2, 13);
  ctx.fillStyle = e.sheet || '#5a0a1a'; ctx.fillRect(X, Y + 4, W, 11);
  ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(X, Y + 4, W, 2);
  e.looks.forEach((L, i) => {
    const bob = Math.round(Math.sin(beat * Math.PI + i * 1.9 + e.phase) * 1.5);
    const cx = X + 8 + i * (W - 16) / Math.max(1, n - 1);
    ctx.save();
    ctx.translate(Math.round(cx), Y + 9 + bob);
    ctx.rotate(i % 2 ? -Math.PI / 2 : Math.PI / 2);
    person(ctx, -8, -9, i % 3 === 1 ? 'up' : 'down', 0, L);
    ctx.restore();
  });
  // a blanket over the middle: it's understood, not shown
  ctx.fillStyle = e.sheet || '#5a0a1a'; ctx.fillRect(X + 3, Y + 10, W - 6, 5);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(X + 3, Y + 10, W - 6, 1);
  // little hearts drifting up
  if (lights) for (let i = 0; i < 3; i++) {
    const t = ((now / 1700) + i / 3 + e.phase) % 1;
    const hx = Math.round(X + W / 2 + Math.sin(t * 6 + i) * W / 3), hy = Math.round(Y + 2 - t * 20);
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = '#ff5fa2'; ctx.fillRect(hx - 2, hy, 2, 2); ctx.fillRect(hx + 1, hy, 2, 2); ctx.fillRect(hx - 2, hy + 1, 5, 2); ctx.fillRect(hx - 1, hy + 3, 3, 1); ctx.fillRect(hx, hy + 4, 1, 1);
    ctx.globalAlpha = 1;
  }
}
const PILE_LINES = {
  yes: { look: '(A tangle of bodies under a blanket, moving to their own rhythm. Someone looks up and smiles.)', hi: 'Them: Hi, cutie. Want to join us?',
    ok: 'Them: Everyone? … Yes, yes and yes. Come here.', after: '(A while later you crawl back out, grinning and slightly out of breath.)' },
  no: { look: '(A tight knot of bodies in the dark. Somebody shifts and looks over at you.)', hi: 'Them: Hey. Something you wanted?',
    ok: "Them: Sweet of you to ask, but we're a closed group tonight. Have fun out there!" },
  busy: { look: '(Two people, very busy, very much in their own world.)', hi: 'Them: (breathless) …not now, darling. Maybe later.' }
};
async function spankFx(gentle) {
  const sm = $('#smack');
  sm.textContent = gentle ? 'pat.' : 'SMACK!';
  sm.hidden = false; sm.classList.remove('go'); void sm.offsetWidth; sm.classList.add('go');
  if (!reduceMotion) { screenEl.classList.remove('shake'); void screenEl.offsetWidth; screenEl.classList.add('shake'); }
  if (navigator.vibrate) { try { navigator.vibrate(gentle ? 40 : [80, 40, 120]); } catch (err) {} }
  await wait(800);
  sm.hidden = true; screenEl.classList.remove('shake');
}
let photoResolve = null;
const MARCO_LOOK = { skin: '#d9a27c', hair: '#2a2420', beard: '#2a2420', top: '#d9a27c', legs: '#0c0c12', harness: true, shine: '#7a7a99' };
function drawPhotoStrip(cv, scale) {
  const g = cv.getContext('2d'), s = scale || 1;
  cv.width = 56 * s; cv.height = 200 * s;
  g.imageSmoothingEnabled = false;
  g.setTransform(s, 0, 0, s, 0, 0);
  const sprite = document.createElement('canvas'); sprite.width = 16; sprite.height = 18;
  const sg = sprite.getContext('2d');
  const drawP = (L, dir, x, y) => { sg.clearRect(0, 0, 16, 18); person(sg, 0, 2, dir, 0, L); g.drawImage(sprite, 0, 0, 16, 18, x, y, 32, 36); };
  const me = lookOf(state.outfit);
  g.fillStyle = '#f3eee3'; g.fillRect(0, 0, 56, 200);
  for (let f = 0; f < 4; f++) {
    const fy = 4 + f * 44;
    g.fillStyle = '#6a0a18'; g.fillRect(4, fy, 48, 40);
    for (let i = 6; i < 52; i += 5) { g.fillStyle = '#4a0610'; g.fillRect(i, fy, 1, 34); g.fillStyle = '#8a1a28'; g.fillRect(i + 2, fy, 1, 34); }
    g.fillStyle = '#2a0a10'; g.fillRect(4, fy + 34, 48, 6);
    if (f === 0) { drawP(me, 'down', 2, fy + 3); drawP(MARCO_LOOK, 'down', 22, fy + 3); }
    if (f === 1) { drawP(me, 'down', 2, fy + 3); drawP(MARCO_LOOK, 'left', 22, fy + 3); g.fillStyle = MARCO_LOOK.skin; g.fillRect(24, fy + 6, 5, 5); g.fillStyle = '#ffffff'; g.fillRect(31, fy + 4, 4, 1); g.fillRect(32, fy + 7, 4, 1); }
    if (f === 2) {
      drawP(Object.assign({}, me, { blush: true }), 'up', 2, fy + 3); drawP(MARCO_LOOK, 'left', 22, fy + 3);
      g.fillStyle = '#fff200'; [[14, 8], [10, 14], [18, 16], [12, 22]].forEach(([a, b]) => { g.fillRect(4 + a, fy + b, 3, 1); g.fillRect(5 + a, fy + b - 1, 1, 3); });
      g.font = '8px "Press Start 2P", monospace'; g.textBaseline = 'top'; g.fillStyle = INK; g.fillText('SMACK', 9, fy + 27); g.fillStyle = '#ffffff'; g.fillText('SMACK', 8, fy + 26);
    }
    if (f === 3) {
      drawP(Object.assign({}, me, { blush: true }), 'down', 2, fy + 3); drawP(MARCO_LOOK, 'down', 22, fy + 3);
      g.fillStyle = '#ff5fa2'; const hx = 25, hy = fy + 4; g.fillRect(hx, hy, 3, 2); g.fillRect(hx + 4, hy, 3, 2); g.fillRect(hx, hy + 2, 7, 2); g.fillRect(hx + 1, hy + 4, 5, 1); g.fillRect(hx + 2, hy + 5, 3, 1); g.fillRect(hx + 3, hy + 6, 1, 1);
    }
  }
  g.font = '8px "Press Start 2P", monospace'; g.textBaseline = 'top'; g.fillStyle = '#a3161a'; g.fillText('KITKAT', 4, 183);
  g.setTransform(1, 0, 0, 1, 0, 0);
}
function showPhotoStrip() {
  return new Promise(resolve => {
    const el = $('#photo');
    drawPhotoStrip($('#photoCanvas'), 1);
    el.hidden = false;
    photoResolve = () => { el.hidden = true; photoResolve = null; resolve(); };
  });
}

const ACTS = {
  async pile(e, clubId) {
    const L = PILE_LINES[e.join] || PILE_LINES.busy;
    await say(L.look);
    await say(L.hi);
    if (e.join === 'busy') return;
    const a = await ask('', ['Can I join? If everyone is into it', 'Just watch, if that\'s okay', 'Sorry, wrong corner']);
    if (a === 2) { await say('Them: No worries! Bye!'); return; }
    if (a === 1) { await say('Them: Watching is fine. No touching, no photos. Enjoy the show.'); return; }
    await say(L.ok);
    if (e.join !== 'yes') return;
    closeBox();
    await fade(true);
    await wait(reduceMotion ? 300 : 1200);
    await fade(false);
    await say(L.after);
    await completeQuest(clubId, 'orgy');
  },
  async kkGarderobe(e, clubId) {
    if (state.kkStripped) { await say('Garderobe: Your clothes are safe with me. You look great.'); return; }
    await say('Garderobe: Clothes off? Most people keep only the essentials.');
    const a = await ask('', ['Down to my underwear', 'I\'ll keep my outfit']);
    if (a === 1) { await say('Garderobe: As you like, darling.'); return; }
    state.kkStripped = true; save(); renderCard();
    await say('(You hand over your clothes and get a ticket. The air feels very warm on your skin.)');
    await completeQuest(clubId, 'garderobe');
  },
  async pole(e, clubId) {
    const dirs = ['down', 'left', 'up', 'right'];
    for (let i = 0; i < 12; i++) { player.dir = dirs[i % 4]; await wait(reduceMotion ? 0 : 80); }
    player.dir = 'down';
    await say(pick(['(You grab the pole and spin. The crowd whoops.)', '(One hand on the pole, one leg up. You are a star.)']));
    await completeQuest(clubId, 'pole');
  },
  async kkPool(e, clubId) {
    if (questDone(clubId, 'swim')) { await say('(The water is still warm. The mermaid waves.)'); return; }
    const a = await ask('The pool. Warm water, purple light, people floating around in nothing much. Get in?', ['Slide in', 'Just the feet', 'Stay dry']);
    if (a === 2) return;
    await say(a === 0 ? '(You slide in. Warm as a bath. Somebody hands you a rubber duck.)' : '(Feet in the warm water. Somebody compliments your ankles.)');
    await completeQuest(clubId, 'swim');
  },
  async swing() {
    await say('(The love swing. There\'s a small queue and a sign: "Ask the person before you how to get out."');
  },
  async marco(e, clubId) {
    if (questDone(clubId, 'spank')) {
      await say(questDone(clubId, 'photo') ? 'Marco: Bellissima foto! I keep a copy in my heart.' : 'Marco: Now the photo booth! There, in the corner. Presto, presto!');
      return;
    }
    await say('Marco: Ciao! I am Marco, from Napoli. Twenty years I come to KitKat.');
    await say('Marco: You have a very… spankable energy. May I? Only if you say yes, eh.');
    const a = await ask('', ['Yes, go on', 'Yes, but gently', 'No, grazie']);
    if (a === 2) { await say('Marco: No is no. Perfetto. Enjoy your night, amore.'); return; }
    closeBox();
    await spankFx(a === 1);
    await say(a === 1 ? 'Marco: Piano, piano… delicato, like a cannolo.' : 'Marco: SMACK! Mamma mia, what a sound! The whole dungeon heard it!');
    await say('Marco: Now we need a souvenir. The photo booth, there in the corner. Andiamo!');
    await completeQuest(clubId, 'spank');
  },
  async booth(e, clubId) {
    if (!questDone(clubId, 'spank')) { await say('(A photo booth with a red velvet curtain. A handwritten sign: "Ask Marco first."'); return; }
    await say(questDone(clubId, 'photo') ? '(You squeeze in with Marco again. FLASH. FLASH. FLASH. FLASH.)' : '(Marco squeezes into the booth with you. FLASH. FLASH. FLASH. FLASH.)');
    closeBox();
    await showPhotoStrip();
    await completeQuest(clubId, 'photo');
  },
  async pfandBar(e, clubId) {
    const p = state.pfand;
    if (p.carry > 0) {
      const n = p.carry, c = p.carryCents;
      p.returned += n; p.cents += c; p.carry = 0; p.carryCents = 0;
      await say(`Bar: ${n} empt${n > 1 ? 'ies' : 'y'}? Pfand, here you go.`);
      await say(`(+${euro(c)}. You've made ${euro(p.cents)} from bottles tonight.)`);
      save(); renderCard();
      if (p.returned >= PFAND_GOAL) {
        if (!questDone(clubId, 'pfand')) await say('Bar: You cleaned up half the club. Respect. Mate is on the house.');
        await completeQuest(clubId, 'pfand');
      } else toast(`PFAND ${p.returned}/${PFAND_GOAL} BOTTLES`);
      return;
    }
    const a = await ask('Bar: What can I get you?', ['Club-Mate', 'Fresh ginger tea', 'Just water', 'Do you take empties?']);
    const replies = ['(Ice-cold Club-Mate. Somebody plays a ukulele next to you.)', '(Ginger tea with honey. The bartender winks: "for your chakras".)', 'Bar: Water is free. Stay hydrated, festival child.',
      `Bar: Always. Bring empty bottles here and you get the Pfand back. You can carry ${CARRY_MAX} at a time.`];
    await say(replies[a]);
    if (a === 2 && tripUntil) { endTrip(); await say('(You feel a bit steadier.)'); }
  },
  async juggler(e, clubId) {
    if (questDone(clubId, 'juggle')) { await say('Zora: Look at you! Circus material. Come on tour with us.'); return; }
    await say('Zora: I ran away with the circus at sixteen. Then the circus ran away to Sisyphos.');
    await say('Zora: Want to learn to juggle? Three balls. Throw on the kick drum, catch in between.');
    const a = await ask('Zora: Ready? Listen… boom… boom…', ['Throw now!', 'Wait for the next boom', 'Run away']);
    if (a === 2) { await say('Zora: Next time, little clown.'); return; }
    if (a === 0) { await say("(Balls everywhere. One lands in someone's Club-Mate.)"); await say('Zora: Too early! Feel the kick, then throw.'); return; }
    await say('(Boom. Throw. Boom. Catch. Boom. Throw…)');
    await say('(You juggle three balls for almost ten seconds. A small crowd claps on the beat.)');
    await completeQuest(clubId, 'juggle');
  },
  async story(e, clubId) {
    const lines = window.INTERIORS[clubId].stories[e.story] || [];
    for (const l of lines) await say(l);
    if (!state.heard[e.story]) {
      state.heard[e.story] = true; save(); renderCard();
      const n = Object.keys(state.heard).length;
      if (n >= 3) await completeQuest(clubId, 'stories');
      else toast(`STORIES ${n}/3`);
    }
  },
  async sauna(e, clubId) {
    if (questDone(clubId, 'sauna')) { await say('Saunameister: Next Aufguss in twenty minutes. Drink water.'); return; }
    await say('Saunameister: Aufguss in one minute! Eucalyptus or lavender?');
    const a = await ask('', ['Eucalyptus', 'Lavender', 'I need air']);
    if (a === 2) { await say('Saunameister: Wise. The door is behind you.'); return; }
    await say(`(Water with ${a === 0 ? 'eucalyptus' : 'lavender'} hits the hot stones. A wall of steam rolls over you.)`);
    steamUntil = clock + 9000;
    await say('(He waves a towel like a helicopter. Everyone groans happily.)');
    await say('Kai, from the corner: This is basically a sweat lodge. Basically.');
    await completeQuest(clubId, 'sauna');
  },
  async pool(e, clubId) {
    if (questDone(clubId, 'swim')) { await say('(The water is still cold. Still worth it.)'); return; }
    const a = await ask('The pool. People are splashing around in the sun. Jump in?', ['Jump in', 'Just dip your feet', 'Stay dry']);
    if (a === 2) return;
    await say(a === 0 ? '(SPLASH. Ice cold. The whole garden cheers. Your outfit will dry. Eventually.)' : '(Feet in the water, sun on your face, sand between your toes. Perfect.)');
    await completeQuest(clubId, 'swim');
  },
  async coat(e, clubId) {
    if (questDone(clubId, 'coat')) { await say(`Garderobe: Ticket #${state.coatNo}. Don't lose it.`); return; }
    await say('Garderobe: Jacke?');
    const a = await ask('Hand over your jacket?', ['Here you go', "I'll keep it"]);
    if (a === 1) { await say("Garderobe: Suit yourself. It gets hot up there."); return; }
    state.coatNo = 100 + Math.floor(Math.random() * 900);
    await say(`(You get ticket #${state.coatNo}. You'll need it at 11am. Or 3pm.)`);
    await completeQuest(clubId, 'coat');
  },
  async cashier() {
    await say("Kasse: You're in. Hand, please.");
    await say('(A stamp on the back of your hand. Now you can step out and come back in.)');
  },
  async bar(e, clubId) {
    const a = await ask('Bar: What can I get you?', ['Club-Mate', 'A beer', 'Vodka-Mate', 'Just water']);
    const replies = ['(Ice cold and very caffeinated. Berlin in a bottle.)', '(A cold Pils. Now you are officially out.)', '(Vodka and Club-Mate. A dangerous combination.)', 'Bar: Good call. Tap water is free.'];
    await say(replies[a]);
    if (a === 3 && tripUntil) { endTrip(); await say('(You feel a bit steadier.)'); }
    await completeQuest(clubId, 'drink');
  },
  async ice(e, clubId) {
    await say('Eisbar: Two scoops?');
    await ask('Pick a flavour', ['Vanilla', 'Chocolate', "Whatever's coldest"]);
    await say('(Best ice cream you have ever had at 6am.)');
    await completeQuest(clubId, 'ice');
  },
  async dj(e, clubId) {
    if (sceneFloor() === 'pb') await say(state.sunrise[clubId] ? '(The DJ throws both arms up. The room loses it.)' : '(The DJ smiles and glances at the windows.)');
    else await say("(The DJ doesn't look up. Respect.)");
  },
  // Toilet chain: the guy at the toilet door wants K -> Mila on the dancefloor has it -> back to him.
  async toiletGuy(e, clubId) {
    if (questDone(clubId, 'toilet')) { await say('Toilet guy: Wild, right? Drink some water. Seriously.'); return; }
    if (state.kStage === 0) {
      await say('Toilet guy: Toilets are full. Everyone in there is waiting for the same thing.');
      await say('Toilet guy: Bring some K and you can come in with me. Otherwise, queue.');
      await say("Toilet guy: Ask Mila. Pink hair, sunglasses, dancing by the speakers on the left. Say I sent you.");
      state.kStage = 1; save(); renderCard();
      return;
    }
    if (state.kStage === 1) { await say('Toilet guy: Found Mila yet? Pink hair, sunglasses. Left side of the floor, by the speakers.'); return; }
    await say('Toilet guy: You got it? Nice. Come on.');
    closeBox();
    await fade(true);
    e.x = e.movedTo[0]; e.y = e.movedTo[1]; e.dir = 'right';
    player.x = player.tx = e.x + 1; player.y = player.ty = e.y; player.dir = 'left'; player.moving = false;
    await fade(false);
    await say('(You squeeze into a stall together. He racks up two lines on the back of his phone.)');
    await say('(You take one. It burns. Then the floor tilts.)');
    closeBox();
    state.kStage = 3;
    startK();
    await completeQuest(clubId, 'toilet');
  },
  async mila(e) {
    if (state.kStage >= 2) { await say("Mila: Enjoy. Don't overdo it."); return; }
    if (state.kStage === 0) { await say(pick(['Mila: Woo! This track!', "(She's lost in the music. She doesn't even see you.)"])); return; }
    await say('Mila: Hm? Who sent you?');
    const a = await ask('', ['The guy at the toilets', 'Nobody, just asking', 'Are you selling?']);
    if (a !== 0) { await say(a === 2 ? 'Mila: Wow. Loud. No idea what you mean.' : "Mila: Then I don't know what you're talking about."); return; }
    await say('Mila: Him? Okay.');
    await say('(Mila slips a tiny bag into your hand without missing a beat.)');
    state.kStage = 2; save(); renderCard();
    toast('GOT · A TINY BAG');
  },
  async dancer(e, clubId) {
    if (clubId === 'berghain' && state.kStage === 1 && Math.random() < 0.6) {
      await say(pick(['Raver: K? Not me, sorry.', 'Raver: Pink hair? Saw her by the speakers on the left.', "Raver: Mila? She's always dancing near the left speakers."]));
    } else await say(e.lines[0]);
  },
  async awareness() {
    if (tripUntil) {
      await say("Awareness: Hey, how are you doing? Here's some water. Sit with me for a bit.");
      endTrip();
      await say('(You feel steadier.)');
      return;
    }
    await say("Awareness: We're the awareness team. If anything feels wrong, come find us.");
    await say('Awareness: Drink water, take breaks, look out for each other.');
  },
  async sascha(e, clubId) {
    if (questDone(clubId, 'darkroom')) { await say('Sascha: That was fun. See you on the floor.'); return; }
    await say('Sascha: Hey. Having a good night?');
    const a = await ask('', ['Want to go somewhere darker?', 'Just saying hi']);
    if (a === 1) { await say('Sascha: Hi back.'); return; }
    const b = await ask('Sascha: Maybe. How do you ask?', ['Only if you want to', 'Grab their hand and go']);
    if (b === 1) { await say('Sascha: Whoa. Ask first.'); return; }
    await say('Sascha: I do. Lead the way. The darkroom is on the ground floor.');
    ents.splice(ents.indexOf(e), 1);
    follower = { name: 'Sascha', look: e.look, quest: 'darkroom', ent: e, homeScene: scene, x: e.x, y: e.y, px: e.x, py: e.y, dir: 'down' };
    toast('Sascha follows you');
  }
};
async function darkroomScene() {
  const clubId = sceneClub();
  busy = true;
  await fade(true);
  await say(`(It's very dark. ${follower.name} squeezes your hand.)`);
  await say('(What happens in the darkroom stays in the darkroom.)');
  closeBox();
  releaseFollower();
  await fade(false);
  await completeQuest(clubId, 'darkroom');
  closeBox();
  busy = false;
}

/* ================= DIALOG ================= */
const dialog = $('#dialog'), dtext = $('#dtext'), dchoices = $('#dchoices'), dmore = $('#dmore');
let ui = null, typing = null;
function typeText(text, done) {
  if (typing) clearInterval(typing.id);
  dtext.textContent = '';
  if (reduceMotion) { dtext.textContent = text; typing = null; done(); return; }
  let i = 0;
  const id = setInterval(() => {
    i++; dtext.textContent = text.slice(0, i);
    if (i >= text.length) { clearInterval(id); typing = null; done(); }
  }, 20);
  typing = { id, finish: () => { clearInterval(id); dtext.textContent = text; typing = null; done(); } };
}
function say(text) {
  return new Promise(resolve => {
    dialog.hidden = false; dchoices.hidden = true; dmore.hidden = true;
    ui = { mode: 'say', ready: false, resolve };
    typeText(text, () => { if (ui) { ui.ready = true; dmore.hidden = false; } });
  });
}
function ask(text, opts) {
  return new Promise(resolve => {
    dialog.hidden = false; dchoices.hidden = true; dmore.hidden = true;
    ui = { mode: 'ask', ready: false, resolve, n: opts.length, sel: 0 };
    dchoices.innerHTML = '';
    opts.forEach((o, i) => {
      const li = document.createElement('li');
      li.textContent = o;
      li.addEventListener('click', () => { if (ui && ui.mode === 'ask' && ui.ready) { ui.sel = i; renderChoices(); pressA(); } });
      dchoices.appendChild(li);
    });
    typeText(text, () => { if (ui) { ui.ready = true; dchoices.hidden = false; renderChoices(); } });
  });
}
function renderChoices() { [...dchoices.children].forEach((li, i) => li.classList.toggle('sel', i === ui.sel)); }
function closeBox() { dialog.hidden = true; ui = null; }
function uiA() {
  if (typing) { typing.finish(); return; }
  if (!ui || !ui.ready) return;
  const u = ui;
  if (u.mode === 'say') { ui = null; u.resolve(); }
  else { ui = null; u.resolve(u.sel); }
}
function uiMove(dir) {
  if (!ui || ui.mode !== 'ask' || !ui.ready) return;
  if (dir === 'up') ui.sel = (ui.sel - 1 + ui.n) % ui.n;
  if (dir === 'down') ui.sel = (ui.sel + 1) % ui.n;
  renderChoices();
}

/* ================= INSIDE ================= */
const inside = $('#inside');
let insideResolve = null;
function showInside(c, fresh) {
  return new Promise(resolve => {
    inside.style.setProperty('--club', c.glow);
    $('#inClub').textContent = c.name.toUpperCase();
    $('#inText').textContent = c.inside;
    $('#inStamp').hidden = !fresh;
    inside.hidden = false;
    insideResolve = () => { inside.hidden = true; insideResolve = null; resolve(); };
  });
}

/* ================= SHOP ================= */
const shopEl = $('#shop'), shopList = $('#shopList'), shopMsg = $('#shopMsg'), shopTags = $('#shopTags'), shopFits = $('#shopFits');
const previewCtx = $('#shopPreview').getContext('2d');
let shopUI = null;
function drawMini(g, id) {
  g.clearRect(0, 0, 16, 16);
  person(g, 0, 0, 'down', 0, lookOf(id));
}
function openShop(sh) {
  busy = true;
  shopUI = { shop: sh, sel: 0 };
  $('#shopName').textContent = sh.name.toUpperCase();
  $('#shopArea').textContent = sh.area;
  shopMsg.textContent = sh.line;
  shopList.innerHTML = '';
  const own = charById(state.char);
  const entries = (own && !sh.items.includes(own.outfit) ? [own.outfit] : []).concat(sh.items, '__leave');
  entries.forEach((id, i) => {
    const li = document.createElement('li');
    if (id === '__leave') {
      li.innerHTML = '<span class="mini"></span><span class="nm">Leave shop</span>';
    } else {
      li.innerHTML = '<canvas class="mini" width="16" height="16"></canvas><span class="nm"></span>';
      li.querySelector('.nm').textContent = OUTFITS[id].name;
      drawMini(li.querySelector('canvas').getContext('2d'), id);
    }
    li.addEventListener('click', () => { if (!shopUI) return; shopUI.sel = i; renderShop(); shopA(); });
    shopList.appendChild(li);
  });
  shopUI.entries = entries;
  shopEl.hidden = false;
  renderShop();
}
function renderShop() {
  const { entries, sel } = shopUI;
  [...shopList.children].forEach((li, i) => {
    li.classList.toggle('sel', i === sel);
    li.classList.toggle('worn', entries[i] === state.outfit);
  });
  const id = entries[sel] === '__leave' ? state.outfit : entries[sel];
  drawMini(previewCtx, id);
  shopTags.textContent = OUTFITS[id].tags.map(t => TAG_LABEL[t]).join(' · ');
  const fits = CLUBS.filter(c => dressOK(c.id, id)).map(c => c.name);
  shopFits.textContent = fits.length ? 'Gets you past: ' + fits.join(', ') : 'No club will take this.';
}
function shopMove(dir) {
  if (!shopUI) return;
  const n = shopUI.entries.length;
  if (dir === 'up' || dir === 'left') shopUI.sel = (shopUI.sel - 1 + n) % n;
  if (dir === 'down' || dir === 'right') shopUI.sel = (shopUI.sel + 1) % n;
  renderShop();
}
function shopA() {
  if (!shopUI) return;
  const id = shopUI.entries[shopUI.sel];
  if (id === '__leave') { leaveShop(); return; }
  if (state.outfit === id) { shopMsg.textContent = "You're already wearing that."; return; }
  state.outfit = id;
  shopMsg.textContent = 'You change in the fitting room: ' + OUTFITS[id].name + '.';
  renderShop(); renderCard(); save();
}
function leaveShop() {
  const sh = shopUI.shop;
  shopUI = null; shopEl.hidden = true;
  player.x = player.tx = sh.dx; player.y = player.ty = sh.by; player.dir = 'down';
  save();
  busy = false;
}

/* ================= CHARACTER CREATOR ================= */
const creatorEl = $('#creator'), crList = $('#crList');
let creator = null;
function openCreator() {
  busy = true;
  creator = { step: 1, sel: 0, gender: 'man' };
  creatorEl.hidden = false;
  renderCreator();
}
function creatorOptions() {
  if (creator.step === 1) return [{ label: 'Man', ch: CHARACTERS.man[0] }, { label: 'Woman', ch: CHARACTERS.woman[0] }];
  return CHARACTERS[creator.gender].map(ch => ({ label: ch.name, ch }));
}
function renderCreator() {
  const opts = creatorOptions();
  $('#crStep').textContent = `NEW GAME · ${creator.step}/2`;
  $('#crQ').textContent = creator.step === 1 ? "Who's going out tonight?" : 'Pick your character';
  crList.dataset.n = opts.length;
  crList.innerHTML = '';
  opts.forEach((o, i) => {
    const li = document.createElement('li');
    li.innerHTML = '<canvas width="16" height="16"></canvas><span></span>';
    li.querySelector('span').textContent = o.label;
    const g = li.querySelector('canvas').getContext('2d');
    person(g, 0, 0, 'down', 0, lookFor(o.ch));
    li.classList.toggle('sel', i === creator.sel);
    li.addEventListener('click', () => { if (!creator) return; creator.sel = i; creatorA(); });
    crList.appendChild(li);
  });
  const cur = opts[creator.sel];
  if (creator.step === 1) $('#crDesc').textContent = 'You pick a look next. You can change clothes later in shops.';
  else {
    const o = OUTFITS[cur.ch.outfit];
    $('#crDesc').textContent = `${cur.ch.desc} Starts in: ${o.name} (${o.tags.map(t => TAG_LABEL[t]).join(', ')}).`;
  }
}
function creatorMove(dir) {
  const n = creatorOptions().length;
  creator.sel = (creator.sel + (dir === 'left' || dir === 'up' ? -1 : 1) + n) % n;
  renderCreator();
}
function creatorA() {
  if (creator.step === 1) {
    creator.gender = creator.sel === 0 ? 'man' : 'woman';
    creator.step = 2; creator.sel = 0;
    renderCreator();
    return;
  }
  const ch = CHARACTERS[creator.gender][creator.sel];
  state.char = ch.id;
  state.outfit = ch.outfit;
  creator = null; creatorEl.hidden = true;
  renderCard(); save();
  busy = false;
  if (!state.intro) runIntro();
}
function creatorB() {
  if (creator.step === 2) { creator.step = 1; creator.sel = creator.gender === 'man' ? 0 : 1; renderCreator(); }
}

/* ================= SCRIPTS ================= */
const shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

async function bouncerTalk(e) {
  const c = e.club;
  if (state.stamps[c.id]) { await say(c.again); return; }
  await say('(The bouncer looks you up and down.)');
  if (!dressOK(c.id, state.outfit)) {
    await say(DRESS[c.id].no_line);
    await say('(Dress code: ' + DRESS[c.id].hint + ')');
    closeBox();
    pushBack();
    return;
  }
  for (const l of c.greet) await say(l);
  const qs = shuffle(c.pool).slice(0, c.need);
  for (let i = 0; i < qs.length; i++) {
    const q = qs[i];
    const opts = shuffle(q.a.map((t, j) => ({ t, ok: j === 0 })));
    const label = qs.length > 1 ? `(${i + 1}/${qs.length}) ` : '';
    const choice = await ask(label + q.q, opts.map(o => o.t));
    if (!opts[choice].ok) {
      await say(c.reject);
      await say('(' + q.fact + ')');
      closeBox();
      pushBack();
      return;
    }
  }
  for (const l of c.accept) await say(l);
  closeBox();
  state.stamps[c.id] = true;
  e.x = c.dx + 1; e.ox = -16; e.dir = 'left';
  renderCard(); save();
  await wait(reduceMotion ? 0 : 320);
  await showInside(c, true);
  e.dir = 'down';
  if (window.INTERIORS && window.INTERIORS[c.id]) { await enterClub(c, true); await maybeFinale(); return; }
  player.x = player.tx = c.dx; player.y = player.ty = c.by; player.dir = 'down';
  save();
  await maybeFinale();
}
async function maybeFinale() {
  if (stampCount() === CLUBS.length && !state.finale) {
    state.finale = true; save();
    for (const l of FINALE) await say(l);
    closeBox();
  }
}
function pushBack() {
  if (navigator.vibrate) { try { navigator.vibrate(60); } catch (e) {} }
  const [dx, dy] = DIRS[OPP[player.dir]];
  const nx = player.x + dx, ny = player.y + dy;
  if (!blocked(nx, ny)) { player.tx = nx; player.ty = ny; player.moving = true; player.t = 0; player.n++; player.dur = MOVE; }
}
const wait = ms => new Promise(r => setTimeout(r, ms));

async function interact() {
  const [dx, dy] = DIRS[player.dir];
  const tx = player.x + dx, ty = player.y + dy;
  let e = ents.find(en => covers(en, tx, ty));
  // staff behind a counter: talk across it
  if (!e && COUNTERS.has(get(tx, ty))) e = ents.find(en => covers(en, tx + dx, ty + dy));
  if (e && e.kind === 'bottle') { if (!state.pfand.taken[e.bid]) pickBottle(e); return; }
  if (!e && inClub()) {
    const clubId = sceneClub(), ch = ICHAR[get(tx, ty)];
    const tileAct = window.INTERIORS[clubId].examineActs && window.INTERIORS[clubId].examineActs[ch];
    if (tileAct && ACTS[tileAct]) {
      busy = true;
      try { await ACTS[tileAct](null, clubId); } finally { closeBox(); busy = false; }
      return;
    }
    let lines = window.INTERIORS[clubId].examine[ch];
    if (ch === 'W' && state.sunrise[clubId]) lines = ['The blinds are up. Morning sun pours into the room.'];
    if (lines) {
      busy = true;
      try { for (const l of lines) await say(l); } finally { closeBox(); busy = false; }
      return;
    }
    if (DANCES.has(get(player.x, player.y))) await danceHere();
    return;
  }
  if (!e) return;
  busy = true;
  if (e.kind !== 'sign') e.dir = OPP[player.dir];
  try {
    if (e.kind === 'bouncer') await bouncerTalk(e);
    else if (e.act && ACTS[e.act]) await ACTS[e.act](e, inClub() ? sceneClub() : null);
    else for (const l of e.lines) await say(l);
  } finally { closeBox(); busy = false; }
}
async function enterDoor(c) {
  if (window.INTERIORS && window.INTERIORS[c.id]) { await enterClub(c, false); return; }
  busy = true;
  await showInside(c, false);
  player.x = player.tx = c.dx; player.y = player.ty = c.by; player.dir = 'down';
  save();
  busy = false;
}
async function runIntro() {
  busy = true;
  for (const l of INTRO) await say(l);
  closeBox();
  state.intro = true; save();
  busy = false;
}

/* ================= INPUT ================= */
function pressA() {
  if (titleOn) { startGame(); return; }
  if (creator) { creatorA(); return; }
  if (photoResolve) { photoResolve(); return; }
  if (insideResolve) { insideResolve(); return; }
  if (shopUI) { shopA(); return; }
  if (ui || typing) { uiA(); return; }
  if (busy || player.moving) return;
  interact();
}
function pressB() {
  if (creator) { creatorB(); return; }
  if (photoResolve) { photoResolve(); return; }
  if (insideResolve) { insideResolve(); return; }
  if (shopUI) { leaveShop(); return; }
  if (typing) { typing.finish(); return; }
  if (ui && ui.mode === 'say') uiA();
}
function pressDir(dir) {
  if (creator) { creatorMove(dir); return; }
  if (shopUI) { shopMove(dir); return; }
  if (!held.includes(dir)) held.push(dir);
  if (ui) uiMove(dir);
}
function releaseDir(dir) { const i = held.indexOf(dir); if (i >= 0) held.splice(i, 1); }

const KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
window.addEventListener('keydown', ev => {
  if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA')) return;
  const dir = KEYMAP[ev.code];
  if (dir) { ev.preventDefault(); if (!ev.repeat) pressDir(dir); else if (creator) creatorMove(dir); else if (shopUI) shopMove(dir); else if (ui) uiMove(dir); return; }
  if (ev.code === 'Tab' || ev.code === 'ShiftLeft' || ev.code === 'ShiftRight') {
    if (ev.code === 'Tab' && ev.target && ev.target.closest && ev.target.closest('.card')) return;
    ev.preventDefault(); runKey = true; return;
  }
  if (['KeyZ', 'Enter', 'Space'].includes(ev.code)) {
    if (ev.code === 'Space' || ev.code === 'Enter') { if (ev.target && ev.target.tagName === 'BUTTON' && ev.target.id === 'reset') return; ev.preventDefault(); }
    if (!ev.repeat) pressA();
    return;
  }
  if (ev.code === 'Equal' || ev.code === 'NumpadAdd') { ev.preventDefault(); zoomIn(); return; }
  if (ev.code === 'Minus' || ev.code === 'NumpadSubtract') { ev.preventDefault(); zoomOut(); return; }
  if (ev.code === 'KeyM' && !ev.repeat) { toggleMap(); return; }
  if (['KeyX', 'Escape', 'Backspace'].includes(ev.code)) { ev.preventDefault(); if (!ev.repeat) pressB(); }
});
window.addEventListener('keyup', ev => {
  if (ev.code === 'Tab' || ev.code === 'ShiftLeft' || ev.code === 'ShiftRight') runKey = false;
  const dir = KEYMAP[ev.code]; if (dir) releaseDir(dir);
});
window.addEventListener('blur', () => { held.length = 0; runKey = false; runBtn = false; });
// Keep the latest position when the tab is hidden or closed.
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });
window.addEventListener('pagehide', save);
// Open the page with ?debug to inspect game state from the browser console (window.__game).
if (/[?&]debug\b/.test(location.search)) window.__game = {
  player, state, held, get busy() { return busy; }, get scene() { return scene; }, get follower() { return follower; },
  enterClub: id => enterClub(CLUBS.find(c => c.id === id), true),
  tp(x, y, dir) { player.x = player.tx = x; player.y = player.ty = y; player.moving = false; if (dir) player.dir = dir; placeFollower(); }
};

/* Touch on the map: drag to walk (like a joystick), tap for A. */
let touch = null;
cvs.addEventListener('pointerdown', ev => {
  if (ev.pointerType === 'mouse') return;
  ev.preventDefault();
  touch = { x: ev.clientX, y: ev.clientY, dir: null };
  try { cvs.setPointerCapture(ev.pointerId); } catch (e) {}
});
cvs.addEventListener('pointermove', ev => {
  if (!touch) return;
  const dx = ev.clientX - touch.x, dy = ev.clientY - touch.y;
  touch.far = Math.hypot(dx, dy) > 70;
  if (Math.hypot(dx, dy) < 18) return;
  const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  if (dir === touch.dir) return;
  if (touch.dir) releaseDir(touch.dir);
  touch.dir = dir;
  pressDir(dir);
  // In menus each drag step moves the cursor once: re-anchor so the next swipe counts again.
  if (ui || shopUI) { touch.x = ev.clientX; touch.y = ev.clientY; releaseDir(dir); touch.dir = null; touch.menu = true; }
});
function endTouch() {
  if (!touch) return;
  if (touch.dir) releaseDir(touch.dir);
  else if (!touch.menu) pressA();
  touch = null;
}
cvs.addEventListener('pointerup', endTouch);
cvs.addEventListener('pointercancel', () => { if (touch && touch.dir) releaseDir(touch.dir); touch = null; });
cvs.addEventListener('contextmenu', ev => ev.preventDefault());
// Tapping the text box advances it.
$('#dialog').addEventListener('click', ev => { if (ev.target.closest('li')) return; if (ui && ui.mode === 'ask' && !typing) return; pressA(); });

/* Stamp card sheet (mobile). */
const cardEl = $('#card');
function setCard(open) {
  cardEl.classList.toggle('open', open);
  $('#cardBtn').setAttribute('aria-expanded', String(open));
  if (open) held.length = 0;
}
$('#cardBtn').addEventListener('click', () => setCard(!cardEl.classList.contains('open')));
$('#cardClose').addEventListener('click', () => setCard(false));
window.addEventListener('keydown', ev => { if (ev.code === 'Escape' && cardEl.classList.contains('open')) setCard(false); }, true);

document.querySelectorAll('.dpad button').forEach(btn => {
  const dir = btn.dataset.dir;
  const down = ev => { ev.preventDefault(); btn.classList.add('on'); pressDir(dir); try { btn.setPointerCapture(ev.pointerId); } catch (e) {} };
  const up = () => { btn.classList.remove('on'); releaseDir(dir); };
  btn.addEventListener('pointerdown', down);
  btn.addEventListener('pointerup', up);
  btn.addEventListener('pointercancel', up);
  btn.addEventListener('lostpointercapture', up);
  btn.addEventListener('contextmenu', ev => ev.preventDefault());
});
[['#btnA', pressA], ['#btnB', pressB]].forEach(([sel, fn]) => {
  const btn = $(sel);
  btn.addEventListener('pointerdown', ev => { ev.preventDefault(); btn.classList.add('on'); if (sel === '#btnB') runBtn = true; fn(); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => btn.addEventListener(t, () => { btn.classList.remove('on'); if (sel === '#btnB') runBtn = false; }));
  btn.addEventListener('keydown', ev => { if (ev.code === 'Enter' || ev.code === 'Space') { ev.stopPropagation(); ev.preventDefault(); fn(); } });
});
$('#title').addEventListener('click', () => { if (titleOn) startGame(); });
$('#zoomIn').addEventListener('click', zoomIn);
$('#zoomOut').addEventListener('click', zoomOut);
$('#zoomMap').addEventListener('click', toggleMap);
let wheelAt = 0;
cvs.addEventListener('wheel', ev => {
  ev.preventDefault();
  if (performance.now() - wheelAt < 180) return;
  wheelAt = performance.now();
  if (ev.deltaY < 0) zoomIn(); else if (ev.deltaY > 0) zoomOut();
}, { passive: false });
inside.addEventListener('click', () => { if (insideResolve) insideResolve(); });
// photo booth strip: save a big copy as PNG, or close
$('#photoClose').addEventListener('click', () => { if (photoResolve) photoResolve(); });
$('#photoSave').addEventListener('click', () => {
  const big = document.createElement('canvas');
  drawPhotoStrip(big, 8);
  const a = document.createElement('a');
  a.href = big.toDataURL('image/png'); a.download = 'kitkat-photo-booth.png';
  document.body.appendChild(a); a.click(); a.remove();
});

/* ================= STAMP CARD ================= */
function renderCard() {
  const ol = $('#stamps');
  ol.innerHTML = '';
  CLUBS.forEach(c => {
    const done = !!state.stamps[c.id];
    const li = document.createElement('li');
    li.innerHTML = `<span class="st${done ? ' done' : ''}" style="--c:${shade(c.glow, 0.62)}">${done ? c.initials : '?'}</span>
      <div><b></b><small></small></div>`;
    li.querySelector('b').textContent = c.name;
    li.querySelector('small').textContent = `${c.area} · ${c.need} questions${done ? ' · in' : ''}`;
    const dc = document.createElement('small'); dc.className = 'dress' + (dressOK(c.id, state.outfit) ? ' ok' : '');
    dc.textContent = (dressOK(c.id, state.outfit) ? '✓ ' : '✗ ') + DRESS[c.id].hint;
    li.querySelector('div').appendChild(dc);
    ol.appendChild(li);
  });
  const n = stampCount();
  $('#count').textContent = n;
  $('#cardBtnCount').textContent = `${n}/${CLUBS.length}`;
  drawMini($('#mbarMini').getContext('2d'), state.outfit);
  $('#wearing').textContent = OUTFITS[state.outfit].name;
  drawMini($('#wearingMini').getContext('2d'), state.outfit);
  $('#hud').textContent = `STEMPEL ${n}/${CLUBS.length}`;
  // side quests for every club you have been inside
  const qs = $('#quests'), ql = $('#questList');
  const clubsIn = Object.keys(window.INTERIORS || {}).filter(id => state.visited[id]);
  qs.hidden = !clubsIn.length;
  if (!qs.hidden) {
    ql.innerHTML = '';
    let total = 0, doneAll = 0;
    clubsIn.forEach(clubId => QUEST_LIST(clubId).forEach((q, qi) => {
      total++; if (questDone(clubId, q.id)) doneAll++;
      if (qi === 0) {
        const h = document.createElement('li'); h.className = 'qclub';
        h.textContent = `${window.INTERIORS[clubId].name} · ${questCount(clubId)}/${QUEST_LIST(clubId).length}`;
        ql.appendChild(h);
      }
      const done = questDone(clubId, q.id);
      const li = document.createElement('li');
      li.className = done ? 'done' : '';
      li.innerHTML = '<span class="qmark"></span><div><b></b><small></small></div>';
      li.querySelector('.qmark').textContent = done ? '✓' : '○';
      li.querySelector('b').textContent = q.title;
      li.querySelector('small').textContent = done ? 'Done' : questHint(clubId, q);
      ql.appendChild(li);
    }));
    $('#questCount').textContent = `${doneAll}/${total}`;
  }
}
const resetBtn = $('#reset');
let armTimer = null;
resetBtn.addEventListener('click', () => {
  if (!resetBtn.classList.contains('armed')) {
    resetBtn.classList.add('armed'); resetBtn.textContent = 'Click again to erase stamps';
    clearTimeout(armTimer);
    armTimer = setTimeout(() => { resetBtn.classList.remove('armed'); resetBtn.textContent = 'Start over'; }, 3000);
    return;
  }
  clearTimeout(armTimer);
  resetBtn.classList.remove('armed'); resetBtn.textContent = 'Start over';
  state.stamps = {}; state.intro = false; state.finale = false; state.outfit = 'tourist'; state.char = null;
  state.quests = {}; state.visited = {}; state.sunrise = {}; state.coatNo = 0; state.kStage = 0; state.pfand = newPfand(); state.heard = {}; state.danced = {}; state.kkStripped = false;
  releaseFollower(); endTrip(); endK();
  Object.values(SCENES).forEach(sc => sc.ents.forEach(e => { if (e.home && e.movedWhen) { e.x = e.home.x; e.y = e.home.y; } })); if (inClub()) useScene('city'); updateFloorTag();
  if (creator) { creator = null; creatorEl.hidden = true; }
  if (shopUI) { shopUI = null; shopEl.hidden = true; }
  ents.forEach(e => { if (e.kind === 'bouncer') { e.x = e.club.dx; e.ox = 0; e.dir = 'down'; } });
  player.x = player.tx = START.x; player.y = player.ty = START.y; player.dir = START.dir; player.moving = false;
  if (insideResolve) { inside.hidden = true; insideResolve = null; }
  closeBox(); if (typing) { clearInterval(typing.id); typing = null; }
  busy = true; titleOn = true; $('#title').hidden = false;
  $('#titlePress').textContent = 'PRESS A';
  renderCard(); save();
});

/* ================= LOOP ================= */
function startGame() {
  titleOn = false; $('#title').hidden = true;
  if (!state.char) { openCreator(); return; }
  busy = false;
  if (!state.intro) runIntro();
}
let saveTimer = 0;
function tryMove(dir) {
  player.dir = dir;
  const [dx, dy] = DIRS[dir];
  const nx = player.x + dx, ny = player.y + dy;
  if (blocked(nx, ny)) return;
  followStep(player.x, player.y);
  player.tx = nx; player.ty = ny; player.moving = true; player.t = 0; player.n++;
  player.dur = running() ? RUN : MOVE;
}
function arrive() {
  if (inClub()) {
    const t = get(player.x, player.y), clubId = sceneClub(), fl = window.INTERIORS[clubId].floors[sceneFloor()];
    if (t === STAIRS_UP && fl.up) { goFloor(clubId, fl.up.to, fl.up.at); return; }
    if (t === STAIRS_DOWN && fl.down) { goFloor(clubId, fl.down.to, fl.down.at); return; }
    if (t === EXIT && fl.exit) { leaveClub(clubId); return; }
    if (isDoorTile(t) && fl.doors && fl.doors[ICHAR[t]]) { const d = fl.doors[ICHAR[t]]; goFloor(clubId, d.to, d.at); return; }
    const b = ents.find(en => en.kind === 'bottle' && en.x === player.x && en.y === player.y && !state.pfand.taken[en.bid]);
    if (b) pickBottle(b);
    if (t === DARK && follower && follower.quest === 'darkroom') { darkroomScene(); return; }
    return;
  }
  if (get(player.x, player.y) === D) {
    const c = clubAtDoor(player.x, player.y);
    if (c) { enterDoor(c); return; }
    const sh = shopAtDoor(player.x, player.y);
    if (sh) { openShop(sh); return; }
  }
  if (++saveTimer % 8 === 0) save();
}
function update(dt) {
  if (player.moving) {
    player.t += dt;
    if (player.t >= player.dur) {
      player.x = player.tx; player.y = player.ty; player.moving = false; player.t = 0;
      arrive();
    }
  }
  if (!player.moving && !busy && !titleOn && held.length) tryMove(held[held.length - 1]);
  ents.forEach(e => { if (e.ox) e.ox = Math.min(0, e.ox + dt * 0.08); });
  if (train.wait > 0) train.wait -= dt;
  else {
    train.x += dt * 0.11;
    if (train.x > CITY_W * T + 20) { train.x = 13 * T - 140; train.wait = 7000 + Math.random() * 9000; }
  }
}
let last = performance.now();
let clock = 0;
function frame(now) {
  const raw = Math.min(50, now - last); last = now;
  const dt = raw * timeScale(now);
  clock += dt;
  update(dt);
  if (tripUntil && !kUntil) {
    if (now > tripUntil) endTrip();
    else cvs.style.filter = reduceMotion ? 'saturate(1.7) hue-rotate(60deg)' : `hue-rotate(${Math.round(now / 25) % 360}deg) saturate(1.8)`;
  }
  // keep the loop alive even if one frame fails to draw
  try { draw(clock); if (kUntil) applyK(now); } catch (err) { console.error(err); }
  requestAnimationFrame(frame);
}

function start() {
  let saved = null;
  { try { saved = JSON.parse(localStorage.getItem('tuersteher-save') || 'null'); } catch (e) { saved = null; } }
  applySave(saved);
  renderCard();
  zoomUI();
  if (state.intro) {
    $('#titlePress').textContent = 'PRESS A · CONTINUE';
  }
  train.x = 13 * T - 140;
  const fontReady = (document.fonts && document.fonts.load) ? document.fonts.load('8px "Press Start 2P"') : Promise.resolve();
  Promise.race([fontReady, wait(1500)]).catch(() => {}).then(() => {
    prerender();
    requestAnimationFrame(t => { last = t; clock = t; frame(t); });
  });
}

start();
})();

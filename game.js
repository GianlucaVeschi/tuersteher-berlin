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

const INTRO = [
  'Friday, 23:47. Warschauer Straße.',
  'Seven clubs. Seven bouncers. One long weekend.',
  "Walk up to a bouncer and press A. Answer right and you're in.",
  'Stuck? Read the signs by each door. Locals talk too.'
];
const FINALE = [
  'Monday, 09:12. The sun is up, and so are you.',
  'Seven stamps. Every bouncer in Berlin let you in.',
  "You're officially a Berliner now. Go get a Döner."
];

/* ================= MAP ================= */
const T = 16, VW = 384, VH = 256, MW = 72, MH = 46;
const G = 0, R = 1, S = 2, W = 3, B = 4, TR = 5, BR = 6, C = 7, D = 8, F = 9, SA = 10, RL = 11, DK = 12;
const SOLID = new Set([W, B, TR, C, F, RL]);
const map = Array.from({ length: MH }, () => Array(MW).fill(G));
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
building(2, 2, 5, 11, 'tower');
building(13, 7, 6, 6, 'altbau', { v: 0 });
building(19, 7, 6, 6, 'altbau', { v: 1 });
building(41, 7, 6, 6, 'altbau', { v: 2, spati: true });
building(63, 7, 8, 6, 'station');
building(13, 33, 6, 6, 'altbau', { v: 1 });
building(30, 33, 6, 6, 'altbau', { v: 2 });
building(41, 33, 4, 6, 'altbau', { v: 0 });
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
[[1, 14 - 13], [7, 3], [8, 7], [7, 10], [1, 8], [1, 11], [2, 17], [5, 18], [3, 20], [7, 17], [14, 17], [16, 19],
 [42, 17], [45, 19], [48, 17], [51, 19], [54, 17], [57, 18], [44, 21], [52, 20],
 [56, 7], [57, 8], [58, 7], [56, 10], [58, 11], [57, 12], [36, 8], [36, 11], [25, 8],
 [3, 28], [9 - 1, 27], [16, 28], [22, 27], [28, 28], [34, 27], [44, 28], [49, 27], [57, 28], [64, 27], [69, 28],
 [55, 33], [56, 35], [58, 34], [57, 37], [55, 38], [1, 34], [1, 37],
 [63, 34], [65, 33], [67, 35], [69, 33], [64, 37], [66, 38], [70, 36], [68, 38],
 [20, 2], [30, 2], [44, 2], [55, 2], [66, 2], [12 + 3, 46 - 3], [45, 34], [36, 35]
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
const ents = [];
CLUBS.forEach(c => {
  ents.push({ kind: 'bouncer', club: c, x: c.dx, y: c.by, dir: 'down', look: c.look, ox: 0 });
  ents.push({ kind: 'sign', x: c.dx + c.signSide, y: c.by, lines: c.sign });
});
ents.push(
  { kind: 'sign', x: 25, y: 17, lines: ['EAST SIDE GALLERY', 'About 1.3 km of the Berlin Wall, painted by artists from around the world in 1990.'] },
  { kind: 'sign', x: 8, y: 12, lines: ['FERNSEHTURM · Alexanderplatz', '368 m tall. You can see it from almost every street in Berlin.'] },
  { kind: 'sign', x: 41, y: 21, lines: ['OBERBAUMBRÜCKE', 'The red brick bridge between Friedrichshain and Kreuzberg.'] },
  { kind: 'sign', x: 63, y: 13, lines: ['S OSTKREUZ', 'The busiest S-Bahn interchange in town. ://about blank is just around the corner.'] },
  { kind: 'npc', x: 44, y: 13, dir: 'down', look: LOOKS.spati, lines: ['Späti: Club-Mate? Two euros.', 'Späti: Tip: bouncers spot tourists fast. Learn about a club before you queue.', 'Späti: And Berghain was a power plant. Everyone asks.'] },
  { kind: 'npc', x: 26, y: 13, dir: 'right', look: LOOKS.tourist1, lines: ["Tourist: We came as nine from the hostel. He just said 'Heute nicht.'", 'Tourist: Go alone. And keep your phone in your pocket.'] },
  { kind: 'npc', x: 27, y: 13, dir: 'right', look: LOOKS.tourist2, lines: ["Tourist: Is this even Berghain? There's no sign.", "Tourist: …I think that's the point."] },
  { kind: 'npc', x: 28, y: 13, dir: 'right', look: LOOKS.tourist3, lines: ["Local: I'm wearing all black. I rehearsed my answers.", "Local: I'm terrified."] },
  { kind: 'npc', x: 29, y: 13, dir: 'right', look: LOOKS.tourist4, lines: ['Tourist: Two hours in the queue. Worth it, right?'] },
  { kind: 'npc', x: 16, y: 39, dir: 'down', look: LOOKS.raver, lines: ['Raver: Tresor and KitKat are both on Köpenicker Straße.', 'Raver: Read the signs. Bouncers love people who know the place.'] },
  { kind: 'npc', x: 14, y: 20, dir: 'down', look: LOOKS.oldraver, lines: ['Old raver: I danced at Bar25 for three days straight in 2009.', 'Old raver: Kater Blau is the same crew. New spot, same spirit.'] },
  { kind: 'npc', x: 70, y: 21, dir: 'left', look: LOOKS.monday, lines: ['Raver: What day is it?', "Raver: I came in on Friday. Sisyphos does that to you."] }
);

/* ================= STATE ================= */
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPP = { up: 'down', down: 'up', left: 'right', right: 'left' };
const MOVE = 170;
const START = { x: 40, y: 16, dir: 'down' };
const state = { stamps: {}, intro: false, finale: false };
const player = { x: START.x, y: START.y, tx: START.x, ty: START.y, dir: START.dir, moving: false, t: 0, n: 0 };
let busy = true, titleOn = true;
const held = [];

function save() {
  try { localStorage.setItem('tuersteher-save', JSON.stringify(snapshot())); } catch (e) { /* storage unavailable */ }
}
function snapshot() {
  return { stamps: state.stamps, intro: state.intro, finale: state.finale, x: player.x, y: player.y, dir: player.dir };
}
function applySave(s) {
  if (!s) return;
  state.stamps = s.stamps || {};
  state.intro = !!s.intro;
  state.finale = !!s.finale;
  ents.forEach(e => { if (e.kind === 'bouncer' && state.stamps[e.club.id]) e.x = e.club.dx + 1; });
  if (Number.isInteger(s.x) && Number.isInteger(s.y) && !blocked(s.x, s.y) && get(s.x, s.y) !== D) {
    player.x = player.tx = s.x; player.y = player.ty = s.y; player.dir = s.dir || 'down';
  }
}
const stampCount = () => CLUBS.filter(c => state.stamps[c.id]).length;

/* ================= COLLISION ================= */
function clubAtDoor(x, y) { return CLUBS.find(c => c.dx === x && c.doorY === y); }
function blocked(x, y) {
  const t = get(x, y);
  if (t === D) { const c = clubAtDoor(x, y); return !(c && state.stamps[c.id]); }
  if (SOLID.has(t)) return true;
  return ents.some(e => e.x === x && e.y === y);
}

/* ================= PRERENDER MAP ================= */
const INK = '#14121c';
const mc = document.createElement('canvas');
mc.width = MW * T; mc.height = MH * T;
const m = mc.getContext('2d');
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
  if (b.spati) {
    const sy = Y + H - T;
    P(X + 2, sy - 1, Wd - 4, T, INK);
    P(X + 3, sy + 3, Wd - 6, 10, '#f2d47a');
    for (let i = 0; i < 12; i++) P(X + 5 + Math.floor(rnd() * (Wd - 12)), sy + 7 + Math.floor(rnd() * 5), 2, 2, pick(['#e24a4a', '#4ea8de', '#58b368', '#f28c38', '#3a3a3a']));
    P(X + 2, sy - 5, Wd - 4, 9, '#1f6b4a');
    m.fillStyle = '#ffe58a'; m.font = '8px "Press Start 2P", monospace'; m.textBaseline = 'top';
    const tw = m.measureText('SPÄTI').width;
    m.fillText('SPÄTI', Math.round(X + Wd / 2 - tw / 2), sy - 5);
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
function drawTower(b) {
  const X = b.x * T, Y = b.y * T, Wd = b.w * T, H = b.h * T, cx = X + Wd / 2;
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
}
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
  if (!L.bald) {
    if (d === 'down') det.push([4, 1, 8, 2, L.hair], [4, 3, 1, 2, L.hair], [11, 3, 1, 2, L.hair]);
    else if (d === 'up') det.push([4, 1, 8, 6, L.hair]);
    else det.push([5, 1, 7, 2, L.hair], [9, 3, 3, 3, L.hair]);
  } else det.push([d === 'left' ? 7 : 5, 2, 2, 1, 'rgba(255,255,255,.4)']);
  if (L.hat) {
    if (d === 'down') det.push([4, 1, 8, 2, L.hat], [3, 3, 10, 1, L.hat]);
    else if (d === 'up') det.push([4, 1, 8, 3, L.hat]);
    else det.push([5, 1, 7, 2, L.hat], [2, 3, 6, 1, L.hat]);
  }
  if (d === 'down') {
    det.push([6, 4, 1, 2, INK], [9, 4, 1, 2, INK]);
    if (L.shades) det.push([5, 4, 6, 1, INK], [5, 5, 2, 1, INK], [9, 5, 2, 1, INK]);
    if (L.beard) det.push([5, 6, 6, 2, L.beard]);
    if (L.tattoo) det.push([5, 6, 1, 1, '#3b3a5c'], [10, 6, 1, 1, '#3b3a5c'], [7, 2, 2, 1, '#3b3a5c'], [11, 4, 1, 1, '#c0c0d0']);
  } else if (d === 'left') {
    det.push([5, 4, 1, 2, INK]);
    if (L.shades) det.push([4, 4, 3, 1, INK]);
    if (L.beard) det.push([4, 6, 4, 2, L.beard]);
    if (L.tattoo) det.push([7, 5, 1, 1, '#3b3a5c'], [6, 3, 1, 1, '#3b3a5c']);
  }
  det.forEach(p => { g.fillStyle = p[4]; g.fillRect(p[0], p[1], p[2], p[3]); });
  g.restore();
}
const PLAYER_LOOK = { skin: '#f0c7a0', hair: '#2b1f1a', top: '#e04f5f', legs: '#26243a', hat: '#1c1a28' };

/* ================= RENDER ================= */
const cvs = $('#game');
const ctx = cvs.getContext('2d');
ctx.imageSmoothingEnabled = false;
const train = { x: -400, wait: 2500 };

function playerPx() {
  if (!player.moving) return [player.x * T, player.y * T];
  const k = player.t / MOVE;
  return [Math.round((player.x + (player.tx - player.x) * k) * T), Math.round((player.y + (player.ty - player.y) * k) * T)];
}
function draw(now) {
  const [ppx, ppy] = playerPx();
  const camX = Math.max(0, Math.min(MW * T - VW, ppx + 8 - VW / 2));
  const camY = Math.max(0, Math.min(MH * T - VH, ppy + 8 - VH / 2));
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, VW, VH);
  ctx.drawImage(mc, -camX, -camY);

  // water shimmer
  const tick = Math.floor(now / 450);
  const x0 = Math.floor(camX / T), y0 = Math.floor(camY / T);
  for (let y = y0; y <= y0 + VH / T + 1 && y < MH; y++) for (let x = x0; x <= x0 + VW / T + 1 && x < MW; x++) {
    if (map[y][x] !== W) continue;
    const k = (x * 5 + y * 3 + tick) % 7;
    if (k < 2) {
      ctx.fillStyle = k ? '#5d86c4' : '#8fb4e8';
      ctx.fillRect(x * T - camX + ((x * 7 + k * 5 + tick) % 11) + 1, y * T - camY + ((y * 11 + x) % 10) + 3, 3, 1);
    }
  }
  // Fernsehturm beacon
  if (Math.floor(now / 700) % 2 === 0) { ctx.fillStyle = '#ff3b3b'; ctx.fillRect(2 * T + 39 - camX, 2 * T + 3 - camY, 2, 2); }
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
      const step = player.moving ? (player.t < MOVE / 2 ? (player.n % 2) + 1 : 0) : 0;
      person(ctx, ppx - camX, ppy - camY - 3, player.dir, step, PLAYER_LOOK);
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

/* ================= SCRIPTS ================= */
const shuffle = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; } return r; };

async function bouncerTalk(e) {
  const c = e.club;
  if (state.stamps[c.id]) { await say(c.again); return; }
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
  player.x = player.tx = c.dx; player.y = player.ty = c.by; player.dir = 'down';
  e.dir = 'down';
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
  const [dx, dy] = DIRS[OPP[player.dir]];
  const nx = player.x + dx, ny = player.y + dy;
  if (!blocked(nx, ny)) { player.tx = nx; player.ty = ny; player.moving = true; player.t = 0; player.n++; }
}
const wait = ms => new Promise(r => setTimeout(r, ms));

async function interact() {
  const [dx, dy] = DIRS[player.dir];
  const tx = player.x + dx, ty = player.y + dy;
  const e = ents.find(en => en.x === tx && en.y === ty);
  if (!e) return;
  busy = true;
  if (e.kind !== 'sign') e.dir = OPP[player.dir];
  try {
    if (e.kind === 'bouncer') await bouncerTalk(e);
    else for (const l of e.lines) await say(l);
  } finally { closeBox(); busy = false; }
}
async function enterDoor(c) {
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
  if (insideResolve) { insideResolve(); return; }
  if (ui || typing) { uiA(); return; }
  if (busy || player.moving) return;
  interact();
}
function pressB() {
  if (insideResolve) { insideResolve(); return; }
  if (typing) { typing.finish(); return; }
  if (ui && ui.mode === 'say') uiA();
}
function pressDir(dir) {
  if (!held.includes(dir)) held.push(dir);
  if (ui) uiMove(dir);
}
function releaseDir(dir) { const i = held.indexOf(dir); if (i >= 0) held.splice(i, 1); }

const KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right' };
window.addEventListener('keydown', ev => {
  if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA')) return;
  const dir = KEYMAP[ev.code];
  if (dir) { ev.preventDefault(); if (!ev.repeat) pressDir(dir); else if (ui) uiMove(dir); return; }
  if (['KeyZ', 'Enter', 'Space'].includes(ev.code)) {
    if (ev.code === 'Space' || ev.code === 'Enter') { if (ev.target && ev.target.tagName === 'BUTTON' && ev.target.id === 'reset') return; ev.preventDefault(); }
    if (!ev.repeat) pressA();
    return;
  }
  if (['KeyX', 'Escape', 'Backspace'].includes(ev.code)) { ev.preventDefault(); if (!ev.repeat) pressB(); }
});
window.addEventListener('keyup', ev => { const dir = KEYMAP[ev.code]; if (dir) releaseDir(dir); });
window.addEventListener('blur', () => { held.length = 0; });

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
  btn.addEventListener('pointerdown', ev => { ev.preventDefault(); btn.classList.add('on'); fn(); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => btn.addEventListener(t, () => btn.classList.remove('on')));
  btn.addEventListener('keydown', ev => { if (ev.code === 'Enter' || ev.code === 'Space') { ev.stopPropagation(); ev.preventDefault(); fn(); } });
});
$('#title').addEventListener('click', () => { if (titleOn) startGame(); });
inside.addEventListener('click', () => { if (insideResolve) insideResolve(); });

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
    ol.appendChild(li);
  });
  const n = stampCount();
  $('#count').textContent = n;
  $('#hud').textContent = `STEMPEL ${n}/${CLUBS.length}`;
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
  state.stamps = {}; state.intro = false; state.finale = false;
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
  busy = false;
  if (!state.intro) runIntro();
}
let saveTimer = 0;
function tryMove(dir) {
  player.dir = dir;
  const [dx, dy] = DIRS[dir];
  const nx = player.x + dx, ny = player.y + dy;
  if (blocked(nx, ny)) return;
  player.tx = nx; player.ty = ny; player.moving = true; player.t = 0; player.n++;
}
function arrive() {
  if (get(player.x, player.y) === D) {
    const c = clubAtDoor(player.x, player.y);
    if (c) { enterDoor(c); return; }
  }
  if (++saveTimer % 8 === 0) save();
}
function update(dt) {
  if (player.moving) {
    player.t += dt;
    if (player.t >= MOVE) {
      player.x = player.tx; player.y = player.ty; player.moving = false; player.t = 0;
      arrive();
    }
  }
  if (!player.moving && !busy && !titleOn && held.length) tryMove(held[held.length - 1]);
  ents.forEach(e => { if (e.ox) e.ox = Math.min(0, e.ox + dt * 0.08); });
  if (train.wait > 0) train.wait -= dt;
  else {
    train.x += dt * 0.11;
    if (train.x > MW * T + 20) { train.x = 13 * T - 140; train.wait = 7000 + Math.random() * 9000; }
  }
}
let last = performance.now();
function frame(now) {
  const dt = Math.min(50, now - last); last = now;
  update(dt);
  draw(now);
  requestAnimationFrame(frame);
}

function start() {
  let saved = null;
  { try { saved = JSON.parse(localStorage.getItem('tuersteher-save') || 'null'); } catch (e) { saved = null; } }
  applySave(saved);
  renderCard();
  if (state.intro) {
    $('#titlePress').textContent = 'PRESS A · CONTINUE';
  }
  train.x = 13 * T - 140;
  const fontReady = (document.fonts && document.fonts.load) ? document.fonts.load('8px "Press Start 2P"') : Promise.resolve();
  Promise.race([fontReady, wait(1500)]).catch(() => {}).then(() => {
    prerender();
    requestAnimationFrame(t => { last = t; frame(t); });
  });
}

start();
})();

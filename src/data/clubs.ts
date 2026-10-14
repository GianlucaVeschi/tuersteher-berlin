/* ================= DATA ================= */
export const CLUBS = [
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
export const INTRO = [
  'Friday, 23:47. Warschauer Straße.',
  'Seven clubs. Seven bouncers. One long weekend.',
  "Walk up to a bouncer and press A. Answer right and you're in.",
  'Bouncers check your outfit first. Walk into a shop to change clothes.',
  'Stuck? Read the signs by each door. Locals talk too.'
];
export const FINALE = [
  'Monday, 09:12. The sun is up, and so are you.',
  'Seven stamps. Every bouncer in Berlin let you in.',
  "You're officially a Berliner now. Go get a Döner."
];

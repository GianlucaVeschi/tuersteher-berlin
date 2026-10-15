import type { Club, ClubDef } from '../types';

/* ================= CLUBS ================= */
const CLUB_DEFS: ClubDef[] = [
  {
    id: 'berghain', name: 'Berghain', area: 'Friedrichshain', x: 26, y: 7, w: 10, h: 6, need: 3, signSide: 2,
    style: 'berghain', glow: '#ff4d6d', initials: 'BG',
    look: { skin: '#e2b08c', bald: true, top: '#111016', legs: '#111016', big: true, tattoo: true },
    bouncer: 'Sven',
    intro: {
      ask: 'Sven: I guess you know who I am, right?',
      yes: ["Sven: I'm the most feared bouncer in the whole world! (I even have a Netflix documentary, hehe.)"],
      no: 'Sven: Heute nicht!'
    },
    greet: ['(He looks at you. For a long time.)', 'Sven: Three questions. One wrong and you go home.'],
    reject: 'Sven: Heute nicht.',
    accept: ['(He nods. Barely.)', 'Sven: Rein.'],
    again: 'Sven: … Go.',
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
    // RSO (Revier Südost): the Griessmühle crew's new home in the old Bärenquell brewery, Schöneweide.
    // On the game map it sits where the S-Bahn heads out east.
    id: 'rso', name: 'RSO', area: 'Schöneweide', x: 48, y: 8, w: 7, h: 5, need: 2, signSide: -2,
    style: 'rso', glow: '#ff8c42', initials: 'RSO',
    look: { skin: '#e2b08c', hair: '#2a2420', top: '#16151c', legs: '#16151c', big: true, beard: '#2a2420' },
    greet: ['Ronja: Moin. RSO.', 'Ronja: Two questions about the place. Then the brewery is yours.'],
    reject: 'Ronja: Nope. Heute nicht.',
    accept: ['Ronja: Good. Stickers on the cameras, then straight into the yard.'],
    again: 'Ronja: Back already? Go on.',
    inside: 'Brewery brick, deep techno in ROBUS and SUMME, and the sky going pale over OPAN.',
    sign: ['RSO · REVIER SÜDOST', 'Schnellerstraße 137. The old Bärenquell brewery, more than 100 years of beer on this site.',
      'Run by the crew from Griessmühle. Floors: ROBUS, SUMME and OPAN outside in summer.'],
    pool: [
      { q: 'What was this site before it was a club?', a: ['A brewery', 'A power plant', 'A bank vault', 'A dog biscuit factory'], fact: 'RSO is in the old Bärenquell brewery.' },
      { q: 'Which club did the RSO crew run before?', a: ['Griessmühle', 'Tresor', 'Bar25', 'Watergate'], fact: 'Griessmühle in Neukölln. It had to close in 2020.' },
      { q: "What's the open-air floor called?", a: ['OPAN', 'ROBUS', 'SUMME', 'Panorama Bar'], fact: 'ROBUS and SUMME are inside, OPAN is the open-air floor.' },
      { q: 'Which S-Bahn station is closest?', a: ['Schöneweide', 'Ostkreuz', 'Wannsee', 'Zoologischer Garten'], fact: 'S Schöneweide, about ten minutes on foot.' },
      { q: 'Griessmühle sat in an old…', a: ['Pasta factory', 'Power plant', 'Church', 'Airport hangar'], fact: 'An old pasta factory on the canal by Sonnenallee.' }
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
    inside: 'Fairy lights over the Spree, wooden shacks and a circus tent, glitter everywhere, sunrise on the water.',
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
    accept: ['Uwe: Visionary. Come in. Five euro, cash.'],
    again: 'Uwe: The deck missed you. Go on.',
    inside: 'Sunset over the Flutgraben. Minimal grooves on a wooden deck under a huge weeping willow.',
    sign: ['CLUB DER VISIONÄRE', 'A former boathouse on the Flutgraben, where Kreuzberg meets Treptow. Since around 2001.', 'Minimal and house under a weeping willow. Opens in the afternoon. Cash only.'],
    pool: [
      { q: 'Where does the party happen here?', a: ['On a wooden deck by the canal', 'On a rooftop', 'In a basement', 'On a mountain'], fact: 'CDV is a wooden deck in a former boathouse on the Flutgraben canal.' },
      { q: 'What hangs over the deck?', a: ['A big weeping willow', 'A disco ball the size of a car', 'A cable car', 'A Zeppelin'], fact: 'The deck sits under a huge weeping willow. It is the heart of the place.' },
      { q: 'Paying at the bar. What do you bring?', a: ['Cash', 'Just my card', 'Crypto', 'Club-Mate bottle caps'], fact: 'CDV is cash only, like a lot of old Berlin places.' },
      { q: 'What music fits CDV best?', a: ['Minimal and house', 'Schlager', 'Death metal', 'Polka'], fact: 'CDV is a home of minimal: Villalobos, Zip and Sonja Moonear have all played the deck.' },
      { q: 'Where does the party go in winter?', a: ['Onto the Hoppetosse, an old ship nearby', 'A ski hut', 'A U-Bahn station', 'Nowhere, it is outside all year'], fact: 'In winter the parties move to the Hoppetosse, CDV\'s sister ship, a steamer from 1928.' },
      { q: 'How long can a summer weekend here last?', a: ['Friday to Monday, if the sun plays along', 'One hour', '9pm to midnight, strictly', 'Closed on weekends'], fact: 'On busy summer weekends CDV can stay open from Friday to Monday.' },
      { q: 'Which districts meet here?', a: ['Kreuzberg and Treptow', 'Spandau and Mitte', 'Wedding and Pankow', 'Potsdam and Grunewald'], fact: 'CDV is right where Kreuzberg meets Alt-Treptow.' }
    ]
  },
  {
    // Heideglühen: open-air house club at Westhafen (Seestraße), since 2012. Started 2011 in a potato garden on Heidestraße.
    // On the game map it sits in the park in the south-east.
    id: 'heidegluehen', name: 'Heideglühen', area: 'Westhafen', x: 63, y: 33, w: 8, h: 6, need: 2, signSide: -2,
    style: 'heidegluehen', glow: '#ffb347', initials: 'HG',
    look: { skin: '#f0c7a0', hair: '#c9a24a', top: '#7a5a3a', legs: '#2b3f6b', big: true, long: true },
    greet: ['Lotte: Na? Heideglühen.', 'Lotte: Two questions, then you can warm up by the fire.'],
    reject: 'Lotte: Not tonight, honey.',
    accept: ['Lotte: Lovely. In you go. Fire pits are on the left, house music straight ahead.'],
    again: 'Lotte: Missed the fire already? Go on.',
    inside: 'Fire pits, fairy lights, a wooden floor under a glass roof, and house music until the birds join in.',
    sign: ['HEIDEGLÜHEN · Westhafen', 'Since 2012 by the harbour. It started in 2011 in a potato garden on Heidestraße.',
      'Mostly house. Own label: Heideglühen Tonträger. 21+.'],
    pool: [
      { q: 'Where did Heideglühen start in 2011?', a: ['In a potato garden', 'On a boat', 'In a bunker', 'On a rooftop'], fact: 'A potato garden behind old railway sheds on Heidestraße.' },
      { q: 'What do they mostly play here?', a: ['House', 'Schlager', 'Drum and bass', 'Metal'], fact: 'Mostly house music.' },
      { q: "What's the club's own record label?", a: ['Heideglühen Tonträger', 'Ostgut Ton', 'Tresor Records', 'Mute'], fact: 'Heideglühen Tonträger. Ostgut Ton is Berghain\'s.' },
      { q: 'How old do you have to be?', a: ['21', '16', '18', '30'], fact: 'Heideglühen is 21+.' },
      { q: 'Which harbour is next door?', a: ['Westhafen', 'Osthafen', 'Spreehafen', 'Hamburg'], fact: 'Westhafen, on Seestraße.' }
    ]
  }
];
// The door sits in the middle of the bottom wall; the bouncer stands on the pavement below it.
export const CLUBS: Club[] = CLUB_DEFS.map(c => ({ ...c, dx: c.x + Math.floor(c.w / 2), doorY: c.y + c.h - 1, by: c.y + c.h }));
export const INTRO = [
  'Friday, 23:47. Warschauer Straße.',
  'Eight clubs. Eight bouncers. One long weekend.',
  "Walk up to a bouncer and press A. Answer right and you're in.",
  'Bouncers check your outfit first. Walk into a shop to change clothes.',
  'Stuck? Read the signs by each door. Locals talk too.'
];
export const FINALE = [
  'Monday, 09:12. The sun is up, and so are you.',
  'Eight stamps. Every bouncer in Berlin let you in.',
  '(You close your eyes. Just for a second…)'
];

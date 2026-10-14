/* Club interiors. Each floor is a tile map drawn as ASCII art.

   Legend
   #  concrete wall          .  floor              ,  dancefloor
   ^  stairs up              v  stairs down        x  exit to the street
   k  darkroom (very dark)   t  toilet tiles       |  toilet stall wall
   P  steel pillar           S  Funktion-One stack D  DJ booth
   =  bar counter            C  coat check counter I  ice cream counter
   c  ticket desk            b  bench              _  mezzanine grating
   N  Piotr Nathan wall installation               A  Wolfgang Tillmans print
   W  tall windows with metal blinds               L  Lab.oratory door (closed)

   Staff stand behind counters; you talk to them across the counter.
   `people` entries: { x, y, look, lines } or { x, y, look, act } where `act`
   names a quest handler in game.js. Dancers are scattered on ',' tiles.
*/
window.INTERIORS = {
  berghain: {
    name: 'Berghain',
    floors: {
      eg: {
        label: 'Erdgeschoss', short: 'EG',
        map: [
      '##############################',
      '#NNNNNNNNNN##^^^^##kkkkkkkkkk#',
      '#............^^^^.#kkkkkkkkkk#',
      '#.................#kkkkkkkkkk#',
      '#.................#kkkkkkkkkk#',
      '####..............##k#########',
      '#..C....................######',
      '#..C....................=....#',
      '#..C....P......P........=....#',
      '#..C....................=....#',
      '#..C....................=....#',
      '#..C....................=....#',
      '####....................######',
      '#.......P..........P.........#',
      '#............................#',
      '#............................#',
      '#.bbbb....ccc................#',
      '#............................#',
      '#............................#',
      '####L#########xx##############'
        ],
        spawn: { street: [14, 18, 'up'], fromUp: [14, 3, 'down'] },
        up: { to: 'mf', at: 'fromDown' },
        exit: true,
        dancers: 0,
        people: [
          { x: 2, y: 8, act: 'coat', look: { skin: '#e2b08c', hair: '#2a2420', top: '#16151c', legs: '#16151c', long: true } },
          { x: 25, y: 9, act: 'bar', look: { skin: '#c98d6a', bald: true, top: '#16151c', legs: '#16151c', beard: '#2a1a14' } },
          { x: 11, y: 15, act: 'cashier', look: { skin: '#f0c7a0', hair: '#9a9a9a', top: '#16151c', legs: '#16151c', glasses: '#9fc7e6' } },
          { x: 17, y: 17, dir: 'left', look: { skin: '#d9a27c', bald: true, top: '#111016', legs: '#111016', big: true }, lines: ['Security: Stickers stay on your cameras. All night.', 'Security: No photos. Have fun.'] },
          { x: 6, y: 14, dir: 'right', look: { skin: '#f0c7a0', hair: '#111', top: '#2a2a33', legs: '#1a1920' }, lines: ['Raver: First time? The stairs take you up to the main floor.', 'Raver: Panorama Bar is above that. Wait for the blinds.'] },
          { x: 24, y: 2, dir: 'left', look: { skin: '#8d5a3b', hair: '#111', top: '#0c0c12', legs: '#0c0c12' }, lines: ['…', '(Someone in the dark. They just nod.)'] },
          { x: 27, y: 4, dir: 'up', look: { skin: '#e2b08c', bald: true, top: '#0c0c12', legs: '#0c0c12', harness: true }, lines: ['(A shape in the dark. You leave them to it.)'] }
        ]
      },
      mf: {
        label: 'Berghain · main floor', short: '1. OG',
        map: [
      '####################################',
      '###############################^^^##',
      '#.....#......#......#..........^^^.#',
      '#IIIII#......#......#..............#',
      '#________.....DDDDDD...............#',
      '#________.S.............S...S..S...#',
      '#________.S.P.........P.S...S..S...#',
      '#..................................#',
      '#.......,,,,,,,,,,,,,,,,,,,........#',
      '#.......,,,,,,,,,,,,,,,,,,,........#',
      '#.......,,,,,,,,,,,,,,,,,,,........#',
      '#...S...,,,,,,,,,,,,,,,,,,,...S....#',
      '#...S...,,,,,,,,,,,,,,,,,,,...S....#',
      '####....,,,,,,,,,,,,,,,,,,,.....####',
      '#..=....,,,,,,,,,,,,,,,,,,,.....=..#',
      '#..=....,,,,,,,,,,,,,,,,,,,.....=..#',
      '#..=....,,,,,,,,,,,,,,,,,,,.....=..#',
      '#..=....,,,,,,,,,,,,,,,,,,,.....=..#',
      '#..=....,,,,,,,,,,,,,,,,,,,.....=..#',
      '#..=....,,,,,,,,,,,,,,,,,,,.....=..#',
      '####......................###t######',
      '#......P.................P#tttttttt#',
      '#................S........#tttttttt#',
      '#.vvv.....bbbbbb..........#t|t|t|tt#',
      '#.vvv.....................#t|t|t|tt#',
      '####################################'
        ],
        spawn: { fromDown: [3, 22, 'up'], fromUp: [32, 3, 'down'] },
        down: { to: 'eg', at: 'fromUp' },
        up: { to: 'pb', at: 'fromDown' },
        dancers: 26,
        people: [
          { x: 16, y: 3, act: 'dj', look: { skin: '#e2b08c', hair: '#111', top: '#0c0c12', legs: '#0c0c12', shades: true } },
          { x: 3, y: 2, act: 'ice', look: { skin: '#f3c9a8', hair: '#d9b25c', top: '#f3eee3', legs: '#16151c', long: true } },
          { x: 2, y: 16, act: 'bar', look: { skin: '#d9a27c', hair: '#5a3a22', top: '#16151c', legs: '#16151c', beard: '#5a3a22' } },
          { x: 33, y: 16, act: 'bar', look: { skin: '#8d5a3b', hair: '#111', top: '#16151c', legs: '#16151c', long: true } },
          { x: 33, y: 22, dir: 'left', look: { skin: '#f0c7a0', hair: '#c9a24a', top: '#2b2b38', legs: '#16151c' }, lines: ['Raver: (splashing water on their face) Ugh. Better.'] },
          // blocks the toilet door until you bring K; after the quest he waits inside the toilets
          { x: 29, y: 19, act: 'toiletGuy', dir: 'up', movedWhen: 'toilet', movedTo: [30, 22], look: { skin: '#e2b08c', hair: '#111', top: '#16151c', legs: '#16151c', shades: true } },
          // Mila: dances by the left speakers, has what the toilet guy wants
          { x: 9, y: 11, act: 'mila', dance: true, phase: 3, look: { skin: '#f0c7a0', hair: '#ff5fa2', long: true, shades: true, top: '#0c0c12', legs: '#121116' } },
          { x: 28, y: 18, act: 'awareness', dir: 'left', look: { skin: '#c98d6a', hair: '#7ec8ff', top: '#5ec8ff', legs: '#26242e', long: true } },
          { x: 12, y: 22, dir: 'down', look: { skin: '#f3c9a8', hair: '#b04a2a', top: '#0c0c12', legs: '#0c0c12', long: true }, lines: ['Raver: Sitting down for five minutes. Then back in.'] }
        ]
      },
      pb: {
        label: 'Panorama Bar', short: '2. OG',
        map: [
      '############################',
      '##AAAAA##WWWWWWWWWWWWWWWW###',
      '#..........................#',
      '#.,,,,,,,,,,,,,,.......bbb.#',
      '#.,,,,,,,,,,,,,,.......bbb.#',
      '#.,,,,,,,,,,,,,,...........#',
      '#.,,,,,,,,,,,,,,...........#',
      '#.#######,,,,,,,.======....#',
      '#.#.....#,,,,,,,.=....=....#',
      '#.#.....#,,,,,,,.=....=....#',
      '#.,DDDDD,,,,,,,,.=....=....#',
      '#.,,,,,,,,,,,,,,.======....#',
      '#.,,,,,,,,,,,,,,...........#',
      '#.,,,,,,,,,,,,,,...........#',
      '#.,,,,,,,,,,,,,,...........#',
      '#.......................vv.#',
      '#.......................vv.#',
      '############################'
        ],
        spawn: { fromDown: [24, 14, 'up'] },
        down: { to: 'mf', at: 'fromUp' },
        dancers: 14,
        people: [
          { x: 5, y: 9, act: 'dj', look: { skin: '#c98d6a', hair: '#e83f8f', top: '#16151c', legs: '#16151c', long: true } },
          { x: 19, y: 10, act: 'bar', look: { skin: '#f0c7a0', hair: '#2a2420', top: '#16151c', legs: '#16151c' } },
          { x: 20, y: 8, act: 'bar', look: { skin: '#e2b08c', bald: true, top: '#16151c', legs: '#16151c' } },
          { x: 16, y: 9, act: 'sascha', dir: 'left', look: { skin: '#e2b08c', hair: '#3a2a20', top: '#0c0c12', legs: '#0c0c12', harness: true } },
          { x: 24, y: 5, dir: 'down', look: { skin: '#f3c9a8', hair: '#c0c0c0', top: '#16151c', legs: '#16151c', beard: '#c0c0c0' }, lines: ['Regular: When the blinds go up, the whole room screams.', "Regular: It only happens when the night's been good. Keep going."] }
        ]
      }
    },
    examine: {
      S: ['A Funktion-One speaker stack. Your trousers are vibrating.'],
      N: ['A huge wall installation by Piotr Nathan.', 'Hundreds of little panels. Nobody knows where to start looking.'],
      A: ['A huge Wolfgang Tillmans print from his Freischwimmer series.', 'Soft lines of light floating on black.'],
      W: ['Tall windows with metal blinds. Closed. For now.'],
      L: ['Lab.oratory. Separate entrance, separate rules. Closed tonight.'],
      P: ['A steel pillar from the old power plant.'],
      '|': ['Two pairs of feet under the stall door. Classic.']
    },
    dancerLines: [
      'Raver: Best set of the year.', "Raver: What time is it? Don't tell me.", 'Raver: …', 'Raver: This kick drum!',
      'Raver: I came on Saturday.', "Raver: Don't stop.", 'Raver: Have you seen my friend? Tall, black shirt.',
      'Raver: Water is free at the bar, you know.', '(They are too deep in the music to answer.)'
    ],
    quests: [
      { id: 'coat', title: 'Check your coat', hint: 'Garderobe, ground floor.' },
      { id: 'drink', title: 'Order a drink', hint: 'Any bar.' },
      { id: 'ice', title: 'Get ice cream', hint: 'Eisbar on the mezzanine, main floor.' },
      { id: 'dance', title: 'Dance on the main floor', hint: 'Press A on the dancefloor.' },
      { id: 'toilet', title: 'Get into the toilets', hint: 'Someone is blocking the toilet door, main floor.' },
      { id: 'darkroom', title: 'Take someone to the darkroom', hint: 'Find Sascha at Panorama Bar.' },
      { id: 'sunrise', title: 'Dance when the blinds open', hint: 'Finish three quests, then go to Panorama Bar.' }
    ]
  },

  /* Sisyphos: an old dog-biscuit factory in Rummelsburg. Outdoor "Strand" with sand and a pool,
     then the indoor rooms: Wintergarten (glass house, house music), Hammahalle (techno),
     Dampfer (deep/tech house), Tunnel (techno, red lanterns) and a sauna behind the Dampfer.

     Extra legend for Sisyphos
     a  sand (dancefloor outside)   ~  pool water            w  wooden planks / deck
     g  grass                       T  tree or big plant      B  old factory brick wall
     F  wooden fence                R  art installation       G  glass wall (Wintergarten)
     e  wooden dancefloor           l  red tunnel floor (dancefloor)   K  red lacquer wall with gold
     o  brick wall with a porthole  H  sauna wall (wood)      u  sauna slats   h  sauna bench   O  sauna stove
     1-9  doorways: the same digit on both sides of a door. `doors` says where each one leads.
  */
  sisyphos: {
    name: 'Sisyphos',
    welcome: [
      'Door: Hand.',
      '(A glittery stamp on your wrist. Someone throws confetti at you for no reason.)',
      'Door: Welcome home. See you Monday.',
      '(Side quests unlocked. Check your stamp card.)'
    ],
    floors: {
      strand: {
        label: 'Strand · garden and pool', short: 'STRAND',
        map: [
      'FFFFFFFFFFBBBBBBBB1BBBBBFFFFFF',
      'FDDDggggTgggggggggggggggggTggF',
      'FaaaaaaaaaSggggggggggggggggggF',
      'FaaaaaaaaaSgggTgggaaaaaaaaaagF',
      'FaaaaaaaaaagggggggaaaaaaaaaagF',
      'Faaaaaaaaaagggggggwa~~~~~~aagF',
      'FaaaaaaaaaaggggRggwa~~~~~~aagF',
      'Faaaaaaaaaagggggggwa~~~~~~aagF',
      'FaaaaaaaaaagggggggaaaaaaaaaagF',
      'FgggggggggggggTgggaaaaaaaaaagF',
      'FggggTggggggggggggggggggbbbggF',
      'FgggggggggggRggggggggggggggggF',
      'Fg======ggggggggggggggTggggggF',
      'FgwwwwwwgggggggggggggggggggTgF',
      'FggggggggggggggggggggggggggggF',
      'FggTggggggggggggggggggggTggggF',
      'FggggggggggggggggggggggggggggF',
      'FggggggggggggggggggggggggggggF',
      'FFFFFFFFFFFFFFxxFFFFFFFFFFFFFF'
        ],
        spawn: { street: [14, 17, 'up'], fromWg: [18, 1, 'down'] },
        doors: { 1: { to: 'wg', at: 'fromStrand' } },
        exit: true,
        dancers: 16,
        spots: ['rgba(255,190,90,.12)', 'rgba(255,120,180,.10)', 'rgba(120,220,255,.10)'],
        daylight: true,
        fairy: [[1, 9, 9, 9], [19, 2, 28, 2], [11, 13, 27, 13]],
        bottles: [[6, 4, 'beer'], [15, 9, 'mate'], [27, 10, 'can'], [10, 15, 'beer'], [22, 14, 'mate']],
        people: [
          { x: 2, y: 1, look: { skin: '#c98d6a', hair: '#c9a24a', long: true, top: '#ff8c42', legs: '#3a3a8a', flowers: ['#ff5e7a', '#ffd23f'] }, lines: ['(The DJ is barefoot, wearing a flower crown, and playing to the pool.)'] },
          { x: 4, y: 13, act: 'pfandBar', look: { skin: '#e2b08c', hair: '#b04a2a', top: '#b6f36b', legs: '#2b3f6b', stripes: '#ff5e7a', hat: '#f2c14e' } },
          { x: 13, y: 4, act: 'juggler', name: 'Zora', look: { skin: '#f3c9a8', hair: '#e83f8f', top: '#ff5e7a', legs: '#f3eee3', stripes: '#f3eee3', paint: '#5ec8ff', hat: '#14121c' } },
          { x: 27, y: 7, act: 'story', story: 'momo', dir: 'left', look: { skin: '#d9a27c', hair: '#5a3a22', long: true, beard: '#5a3a22', top: '#c28cff', legs: '#ff8c42', flowers: ['#b6f36b', '#ffd23f'] } },
          { x: 19, y: 8, dir: 'up', look: { skin: '#8d5a3b', hair: '#111', top: '#5ec8ff', legs: '#ffd23f', sparkle: '#fff6a8' }, lines: ['Raver: The water is FREEZING. Ten out of ten.'] },
          { x: 16, y: 16, look: { skin: '#f0c7a0', hair: '#7a3fd1', long: true, top: '#ffd23f', legs: '#c28cff', sparkle: '#ff5e7a', paint: '#ff5e7a' }, lines: ['Raver: Welcome to Sisyphos! Time works differently here.', "Raver: The bars take back empty bottles. Pfand! That's how I pay for my Mate."] }
        ]
      },
      wg: {
        label: 'Wintergarten · house music, never stops', short: 'WINTERGARTEN',
        map: [
      'GGGGGGGGGGGGGGGGGGGGGGGG',
      'GTwwwwwwwwwDDDwwwwwwwTwG',
      'GwwwwwwwwwwwwwwwwwwwwwwG',
      'GweeeeeeeeeeeeeeeeeeewwG',
      'GweeeeeeeeeeeeeeeeeeewwG',
      'GweeeeeeeeeeeeeeeeeeewwG',
      'Gweeeeeeeeeeeeeeeeeeeww3',
      'GweeeeeeeeeeeeeeeeeeewwG',
      'GwwwwwwwwwwwwwwwwwwwwwwG',
      'GTww====wwwwwwwwwbbbwwTG',
      'GwwwwwwwwwwwwwwwwwwwwwwG',
      'GTwwwwwwwwwwwwwwwwwwwwTG',
      'BBBBBBBBBBBB1BBBBBBBBBBB'
        ],
        spawn: { fromStrand: [12, 11, 'up'], fromHh: [22, 6, 'left'] },
        doors: { 1: { to: 'strand', at: 'fromWg' }, 3: { to: 'hh', at: 'fromWg' } },
        dancers: 12,
        spots: ['rgba(255,200,120,.14)', 'rgba(140,255,170,.10)', 'rgba(255,140,200,.10)'],
        fairy: [[1, 2, 22, 2], [1, 8, 22, 8]],
        bottles: [[3, 4, 'can'], [21, 3, 'beer'], [15, 11, 'mate']],
        people: [
          { x: 12, y: 1, look: { skin: '#f3c9a8', hair: '#f3eee3', long: true, top: '#f3eee3', legs: '#f3eee3', flowers: ['#ff5e7a', '#b6f36b'] }, lines: ['(The DJ is dressed all in white and dancing harder than anyone.)'] },
          { x: 5, y: 10, act: 'pfandBar', look: { skin: '#c98d6a', hair: '#111', top: '#ff8c42', legs: '#2b3f6b', hat: '#5ec8ff' } },
          { x: 20, y: 8, act: 'story', story: 'luna', dir: 'left', look: { skin: '#f0c7a0', hair: '#d9b25c', long: true, top: '#f7c6d9', legs: '#c28cff', flowers: ['#f3eee3', '#ffd23f'], paint: '#ffd23f' } },
          { x: 3, y: 2, look: { skin: '#8d5a3b', hair: '#ff8c42', long: true, top: '#7a4a2e', legs: '#b6f36b', sparkle: '#ffd23f' }, lines: ['Raver: Cacao ceremony in here at noon. Bring an open heart. And a cup.'] }
        ]
      },
      hh: {
        label: 'Hammahalle · techno', short: 'HAMMAHALLE',
        map: [
      'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
      'BSwwwwwwwwwwDDDDDDwwwwwwwwwwSB',
      'B............................B',
      'B..P.....,,,,,,,,,,,,.....P..B',
      'B.....,,,,,,,,,,,,,,,,,,.....B',
      'B.....,,,,,,,,,,,,,,,,,,.....4',
      'B.....,,,,,,,,,,,,,,,,,,.....B',
      'B.....,,,P,,,,,,,,,,P,,,.....B',
      '3.....,,,,,,,,,,,,,,,,,,.....B',
      'B.....,,,,,,,,,,,,,,,,,,.....B',
      'B.....,,,,,,,,,,,,,,,,,,.....B',
      'B.....,,,,,,,,,,,,,,,,,,.....B',
      'B............................B',
      'B.=======...............SS...B',
      'B.wwwwwww....................B',
      'B............................B',
      'B..bbb.................bbb...B',
      'BBBBBBBBBBBBBBB5BBBBBBBBBBBBBB'
        ],
        spawn: { fromWg: [1, 8, 'right'], fromDf: [28, 5, 'left'], fromTn: [15, 16, 'up'] },
        doors: { 3: { to: 'wg', at: 'fromHh' }, 4: { to: 'df', at: 'fromHh' }, 5: { to: 'tn', at: 'fromHh' } },
        dancers: 22,
        spots: ['rgba(255,60,60,.16)', 'rgba(255,255,255,.10)', 'rgba(255,120,40,.13)'],
        bottles: [[3, 10, 'beer'], [26, 15, 'can'], [12, 2, 'mate']],
        people: [
          { x: 14, y: 1, look: { skin: '#e2b08c', bald: true, top: '#14121c', legs: '#14121c', paint: '#ff5e7a' }, lines: ['(The DJ is hitting the kick drum like a blacksmith. Hammahalle indeed.)'] },
          { x: 5, y: 14, act: 'pfandBar', look: { skin: '#d9a27c', hair: '#5a3a22', top: '#14121c', legs: '#14121c', stripes: '#ff5e7a', beard: '#5a3a22' } },
          { x: 27, y: 15, look: { skin: '#f3c9a8', hair: '#ff5e7a', top: '#f3eee3', legs: '#ff5e7a', stripes: '#ff5e7a', paint: '#ff5e7a', hat: '#ff5e7a' }, lines: ['Clown: I came for a circus gig in 2019. Never left.', 'Clown: The red nose is for the dancefloor. Safety first.'] },
          { x: 4, y: 3, look: { skin: '#8d5a3b', hair: '#111', long: true, top: '#b6f36b', legs: '#14121c', sparkle: '#fff6a8' }, lines: ['Raver: Empties everywhere. Somebody should collect them. (Hint hint.)'] }
        ]
      },
      df: {
        label: 'Dampfer · deep house', short: 'DAMPFER',
        map: [
      'BBoBBBoBBBoBBBoBBBoBBBoBBB',
      'BwwwwwwwwwwwwwwwwwwwwwwwwB',
      'BwwDDDDwwwwwwwwwwwwwwwwwwB',
      'BweeeeeeeeeeeeeeeeeeeewwwB',
      'BweeeeeeeeeeeeeeeeeeeewwwB',
      '4weeeeeeeeeeeeeeeeeeeewwwB',
      'BweeeeeeeeeeeeeeeeeeeewwwB',
      'BweeeeeeeeeeeeeeeeeeeewwwB',
      'BweeeeeeeeeeeeeeeeeeeewwwB',
      'BwwwwwwwwwwwwwwwwwwwwwwwwB',
      'Bww=====wwwwwwwwwwwwwbbwwB',
      'BwwwwwwwwwwwwwwwwwwwwwwwwB',
      'BwwwwwwwwwwwwwwwwwwwwwwwwB',
      'BBBBBBBBBBBBBBBBBBBBBB6BBB'
        ],
        spawn: { fromHh: [1, 5, 'right'], fromSa: [22, 12, 'up'] },
        doors: { 4: { to: 'hh', at: 'fromDf' }, 6: { to: 'sa', at: 'fromDf' } },
        dancers: 14,
        spots: ['rgba(80,220,200,.13)', 'rgba(255,190,90,.12)', 'rgba(120,140,255,.12)'],
        bottles: [[20, 11, 'beer'], [24, 4, 'can']],
        people: [
          { x: 4, y: 2, look: { skin: '#f0c7a0', hair: '#c0c0c0', beard: '#c0c0c0', top: '#2b3f6b', legs: '#f3eee3', hat: '#f3eee3' }, lines: ['(The DJ wears a captain\'s hat. Full steam ahead.)'] },
          { x: 5, y: 11, act: 'pfandBar', look: { skin: '#f3c9a8', hair: '#5ec8ff', long: true, top: '#f3eee3', legs: '#2b3f6b', stripes: '#2b4c7a' } },
          { x: 23, y: 7, dir: 'left', look: { skin: '#c98d6a', hair: '#b6f36b', top: '#ff8c42', legs: '#7a3fd1', sparkle: '#fff6a8', paint: '#b6f36b' }, lines: ['Raver: The sauna is through the little door at the back. Go sweat it out.'] }
        ]
      },
      tn: {
        label: 'Tunnel · techno under the lanterns', short: 'TUNNEL',
        map: [
      'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
      'KllllllllllllllllllllllllllllllllK',
      'KlllllllllllllllllllllllllllllDDSK',
      '5lllllllllllllllllllllllllllllDDlK',
      'KlllllllllllllllllllllllllllllDDSK',
      'KllllllllllllllllllllllllllllllllK',
      'KlllbbblllllllllllllllllllllllbbbK',
      'KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK'
        ],
        spawn: { fromHh: [1, 3, 'right'] },
        doors: { 5: { to: 'hh', at: 'fromTn' } },
        dancers: 14,
        spots: ['rgba(255,60,40,.18)', 'rgba(255,200,60,.12)'],
        lanterns: [[3, 1], [7, 1], [11, 1], [15, 1], [19, 1], [23, 1], [27, 1], [5, 5], [9, 5], [13, 5], [17, 5], [21, 5], [25, 5]],
        bottles: [[17, 6, 'mate']],
        people: [
          { x: 31, y: 3, look: { skin: '#c98d6a', hair: '#111', long: true, top: '#a3161a', legs: '#14121c', stripes: '#e0b040' }, lines: ['(The DJ nods at the lanterns swinging to the beat.)'] },
          { x: 8, y: 5, act: 'story', story: 'sunny', look: { skin: '#e2b08c', hair: '#ffd23f', long: true, top: '#5ec8ff', legs: '#ff5e7a', sparkle: '#fff6a8', flowers: ['#ff5e7a', '#c28cff'] } }
        ]
      },
      sa: {
        label: 'Sauna · behind the Dampfer', short: 'SAUNA',
        map: [
      'HHHHHHHHHHHHHH',
      'HhhhhhhhhhhhhH',
      'HuuuuuuuuuuuuH',
      'HhhhhuuuuhhhhH',
      'HuuuuuuuuuuuuH',
      'HuuuuuOOuuuuuH',
      'HuuuuuuuuuuuuH',
      'HuuuuuuuuuuuuH',
      'HHHHHH6HHHHHHH'
        ],
        spawn: { fromDf: [6, 7, 'up'] },
        doors: { 6: { to: 'df', at: 'fromSa' } },
        dancers: 0,
        steam: true,
        bottles: [[11, 7, 'beer']],
        people: [
          { x: 8, y: 6, act: 'sauna', dir: 'up', look: { skin: '#f0c7a0', hair: '#c0c0c0', bald: true, beard: '#c0c0c0', top: '#f0c7a0', legs: '#f3eee3' } },
          { x: 2, y: 2, act: 'story', story: 'kai', look: { skin: '#c98d6a', hair: '#2a2420', long: true, beard: '#2a2420', top: '#c98d6a', legs: '#ff8c42', paint: '#f2c14e' } },
          { x: 11, y: 4, dir: 'left', look: { skin: '#f3c9a8', hair: '#ff5e7a', long: true, top: '#f3eee3', legs: '#f3eee3' }, lines: ['(Someone in a towel is humming a mantra. Badly. Beautifully.)'] }
        ]
      }
    },
    examine: {
      '~': ['The pool.'],
      T: ['A big plant. Someone has hung a disco ball in it.'],
      R: ['An art installation: a giant papier-mâché head with flowers growing out of its eyes.', 'Nobody knows who made it. Everyone has taken a selfie with it in their mind.'],
      G: ['Glass walls. Outside it might be morning. In here it is always the good part of the afternoon.'],
      F: ['A wooden fence, covered in ribbons and stickers.'],
      K: ['Red lacquer walls with golden patterns. The Tunnel feels like a night market.'],
      o: ['A porthole. Behind it: more Sisyphos.'],
      h: ['A hot wooden bench. Your thighs remember it forever.'],
      O: ['The sauna stove. Hot stones, hissing.'],
      B: ['Old brick. This used to be a dog-biscuit factory.']
    },
    examineActs: { '~': 'pool' },
    dancerPalette: {
      tops: ['#ff5e7a', '#ffd23f', '#5ec8ff', '#b6f36b', '#c28cff', '#ff8c42', '#f3eee3', '#e83f8f'],
      hair: ['#ff5e7a', '#ffd23f', '#5ec8ff', '#b6f36b', '#c28cff', '#d9b25c', '#5a3a22', '#111111'],
      legs: ['#2b3f6b', '#f3eee3', '#ff8c42', '#7a3fd1', '#3a3a8a', '#b6f36b'],
      extras: ['#fff6a8', '#ff5e7a', '#5ec8ff', '#b6f36b', '#ffd23f']
    },
    dancerLines: [
      'Raver: I just got back from a yoga retreat in Goa. My chakras are SO aligned right now.',
      'Raver: Ayahuasca in Peru changed everything. I saw my grandmother. She was a jaguar.',
      'Raver: We met at Fusion, then at Burning Man, then here. It is literally fate.',
      "Raver: I'm in a circus troupe. Aerial silks. Ask me anything.",
      'Raver: Have you tried breathwork? I breathed so hard I saw colours.',
      'Raver: My van is parked outside. It runs on vegetable oil and good vibes.',
      "Raver: I gave up my phone. I navigate by the moon now.",
      'Raver: Third day. Or fourth. Time is a construct.',
      'Raver: Do you want some of my kombucha? I brewed it in a hollowed-out drum.',
      'Raver: Sisyphos rolls the stone up the hill forever. We roll ourselves to the next floor.'
    ],
    stories: {
      momo: ['Momo: We drove here from Fusion in a van that runs on chip fat.', 'Momo: Then a forest rave in Brandenburg, then Portugal. Somewhere in there I married a tree.', 'Momo: Not legally. Spiritually.'],
      luna: ['Luna: I just got back from a silent yoga retreat in Goa. Ten days, no talking.', "Luna: On day six I heard my heartbeat as a four-to-the-floor kick. That's when I knew I had to come here.", 'Luna: Namaste. Also: this track!'],
      kai: ['Kai: Three ayahuasca ceremonies in the Peruvian jungle. The shaman sang all night.', 'Kai: I met my inner child. He was wearing a Sisyphos wristband.', 'Kai: Anyway. Hot in here, right?'],
      sunny: ['Sunny: I teach aerial silks and run sound baths on Tuesdays.', 'Sunny: Did breathwork this morning. Breathed so hard I saw the Wintergarten from above.', 'Sunny: You should come. Bring a gong if you have one.']
    },
    quests: [
      { id: 'pfand', title: 'Pfand hunter', hint: 'Collect empty bottles (you can carry 4) and return them at any bar.' },
      { id: 'swim', title: 'Jump in the pool', hint: 'The pool in the garden, with the sand around it.' },
      { id: 'sauna', title: 'Survive the Aufguss', hint: 'The sauna is behind the Dampfer.' },
      { id: 'stories', title: 'Listen to 3 hippie stories', hint: 'Momo, Luna, Kai and Sunny each have one.' },
      { id: 'juggle', title: 'Learn to juggle', hint: 'Zora the circus kid, in the garden.' },
      { id: 'hopper', title: 'Dance in 4 different rooms', hint: 'Strand, Wintergarten, Hammahalle, Dampfer, Tunnel.' }
    ]
  },
  /* KitKatClub: Köpenicker Straße 76, in the building it shares with Sage Club.
     Three areas: the main floor (UV light, fluorescent wall paintings, pole stage, love swing),
     the pool lounge behind the curtains (with the Awareness Station at the pool bar)
     and the dungeon downstairs (crosses, cages, darkrooms, a photo booth).

     Extra legend for KitKat
     V  UV wall with fluorescent paintings   p  pole stage (dancefloor)   Y  pole
     Z  leather sofa                         Q  bed                       X  St Andrew's cross
     J  love swing                           M  photo booth               n  cage
     U  the gynaecologist's chair            i  pool tiles
     People with `pile: true` are groups on a bed or in a dark corner; `w` is how many tiles they cover.
     `join` decides their answer when you ask to join: 'yes', 'no' or 'busy'.
  */
  kitkat: {
    name: 'KitKat',
    welcome: [
      'Garderobe: Phone.',
      '(Stickers over your cameras. No photos at KitKat. Ever.)',
      'Host: Welcome, darling. House rule: do what you want, but stay in communication.',
      '(Side quests unlocked. Check your stamp card.)'
    ],
    floors: {
      main: {
        label: 'Main floor · UV and poles', short: 'MAIN FLOOR',
        map: [
      'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
      '#kkkk#..pppYppppppYppp..DDDD...#',
      '#kkkk#..pppppppppppppp.........#',
      '#kkkk#.........................#',
      '#kkkk#...,,,,,,,,,,,,,,,,,,,...#',
      '##k###...,,,,,,,,,,,,,,,,,,,...#',
      '#........,,,,,,,,,,,,,,,,,,,...#',
      '#.ZZ.....,,,,,,,,,,,,,,,,,,,...#',
      '#.ZZ.....,,,,,,,,,,,,,,,,,,,...1',
      '#........,,,,,,,,,,,,,,,,,,,...#',
      '#..J.....,,,,,,,,,,,,,,,,,,,...#',
      '#........,,,,,,,,,,,,,,,,,,,...#',
      '#..............................#',
      '#..............................#',
      '#vvv..........ZZZZ....======...#',
      '#vvv..................______...#',
      '#....CCCCC.........ZZ..........#',
      '#...._____.....................#',
      '#..............................#',
      '###############xx###############'
        ],
        spawn: { street: [15, 18, 'up'], fromPool: [30, 8, 'left'], fromDungeon: [4, 14, 'right'] },
        doors: { 1: { to: 'pool', at: 'fromMain' } },
        down: { to: 'dungeon', at: 'fromMain' },
        exit: true,
        dancers: 20,
        uv: true,
        spots: ['rgba(255,40,200,.16)', 'rgba(60,255,120,.10)', 'rgba(0,220,255,.12)', 'rgba(170,60,255,.14)'],
        people: [
          { x: 7, y: 17, act: 'kkGarderobe', look: { skin: '#f0c7a0', hair: '#111', top: '#0c0c12', legs: '#0c0c12', shine: '#7a7a99', long: true } },
          { x: 25, y: 15, act: 'bar', look: { skin: '#c98d6a', bald: true, top: '#c4162a', legs: '#0c0c12', shine: '#ff7a8a', harness: true } },
          { x: 25, y: 1, look: { skin: '#e2b08c', hair: '#ff5fa2', top: '#0c0c12', legs: '#0c0c12', shine: '#7a7a99', ears: '#ff5fa2' }, lines: ['(The DJ is wearing bunny ears and a very serious face.)'] },
          { x: 13, y: 2, dir: 'down', look: { skin: '#f3c9a8', hair: '#e8e8f0', long: true, top: '#f3c9a8', legs: '#0c0c12', harness: true, shine: '#7a7a99' }, lines: ['Pole dancer: The poles are for everyone. Grab one, spin, feel fabulous.'] },
          { x: 20, y: 12, dir: 'left', look: { skin: '#8d5a3b', hair: '#111', top: '#c4162a', legs: '#c4162a', shine: '#ff7a8a', shades: true }, lines: ['Latex queen: First time? Then hear this: ask before you touch, and take no for an answer.', 'Latex queen: Everything else is up to you, darling.'] },
          { x: 17, y: 18, dir: 'up', look: { skin: '#d9a27c', bald: true, top: '#111016', legs: '#111016', big: true }, lines: ['Security: Camera stickers stay on. Consent is not optional. Have fun.'] },
          { pile: true, x: 1, y: 2, w: 3, join: 'yes', sheet: '#4a0a2a', looks: [
            { skin: '#f0c7a0', hair: '#111', top: '#f0c7a0', legs: '#0c0c12', long: true },
            { skin: '#c98d6a', hair: '#ff5fa2', top: '#c98d6a', legs: '#0c0c12' },
            { skin: '#e2b08c', bald: true, top: '#e2b08c', legs: '#0c0c12', harness: true } ] }
        ]
      },
      pool: {
        label: 'Pool lounge · behind the curtains', short: 'POOL',
        map: [
      '##########################',
      '#TwwwwwwwwwwwwwwwwwwwwwwT#',
      '#wiiiiiiiiiiiiiiiiiiiiiiw#',
      '#wi~~~~~~~~~~~~~~~~~~~iiw#',
      '#wi~~~~~~~~~~~~~~~~~~~iiw#',
      '#wi~~~~~~~~~~~~~~~~~~~iiw#',
      '#wi~~~~~~~~~~~~~~~~~~~iiw#',
      '#wi~~~~~~~~~~~~~~~~~~~iiw#',
      '#wiiiiiiiiiiiiiiiiiiiiiiw#',
      '#wwwQQwwwQQwwwwwwwwwwwwww#',
      '#wwwwwwwwwwwwwwwwwwwwwwww#',
      '#ww=====wwwwwwwwwwwwZZZww#',
      '#ww_____wwwwwwwwwwwwwwwww#',
      '#wwwwwwwwwwwwwwwwwwwwwwTw#',
      '1wwwwwwwwwwwwwwwwwwwwwwww#',
      '##########################'
        ],
        spawn: { fromMain: [1, 14, 'right'] },
        doors: { 1: { to: 'main', at: 'fromPool' } },
        dancers: 0,
        spots: ['rgba(0,220,255,.10)', 'rgba(255,90,200,.10)'],
        people: [
          { x: 5, y: 12, act: 'bar', look: { skin: '#f3c9a8', hair: '#5ec8ff', long: true, top: '#0c0c12', legs: '#0c0c12', shine: '#7a7a99' } },
          { x: 9, y: 11, act: 'awareness', dir: 'up', look: { skin: '#c98d6a', hair: '#7ec8ff', top: '#ffd23f', legs: '#26242e', long: true } },
          { x: 11, y: 3, look: { skin: '#f0c7a0', hair: '#5ec8ff', long: true, top: '#2bb3a3', legs: '#2bb3a3', shine: '#9ff0e6' }, lines: ['(A mermaid in a latex tail waves from the water.)', 'Mermaid: The water is warm. The people are warmer.'] },
          { x: 21, y: 10, dir: 'down', look: { skin: '#d9a27c', hair: '#5a3a22', beard: '#5a3a22', top: '#d9a27c', legs: '#c4162a' }, lines: ['Sunbather: Tanning under UV light. Doctors hate me.'] },
          { pile: true, x: 4, y: 9, w: 2, join: 'busy', sheet: '#7a1a2a', looks: [
            { skin: '#f3c9a8', hair: '#d9b25c', long: true, top: '#f3c9a8', legs: '#c4162a' },
            { skin: '#8d5a3b', hair: '#111', top: '#8d5a3b', legs: '#0c0c12' } ] },
          { pile: true, x: 9, y: 9, w: 2, join: 'yes', sheet: '#2a4a7a', looks: [
            { skin: '#e2b08c', hair: '#b04a2a', top: '#e2b08c', legs: '#0c0c12', harness: true },
            { skin: '#f0c7a0', hair: '#c28cff', long: true, top: '#f0c7a0', legs: '#c28cff' } ] }
        ]
      },
      dungeon: {
        label: 'Dungeon · downstairs', short: 'DUNGEON',
        map: [
      '##############################',
      '#^^^......X.....X...#kkkkkkkk#',
      '#^^^................#kkkkkkkk#',
      '#...................#kkk#kkkk#',
      '#...................#kkk#kkkk#',
      '#...................kkkkkkkkk#',
      '#...................#kkkkkkkk#',
      '#..nnn....UU........##########',
      '#............................#',
      '#............................#',
      '#....MM..........ZZ..........#',
      '#............................#',
      '#kkkkkk#.....................#',
      '#kkkkkk......................#',
      '#kkkkkk#.....................#',
      '#kkkkkk#.....................#',
      '########.....................#',
      '##############################'
        ],
        spawn: { fromMain: [4, 2, 'right'] },
        up: { to: 'main', at: 'fromDungeon' },
        dancers: 0,
        red: true,
        people: [
          { x: 8, y: 9, act: 'marco', dir: 'left', look: { skin: '#d9a27c', hair: '#2a2420', beard: '#2a2420', top: '#d9a27c', legs: '#0c0c12', harness: true, shine: '#7a7a99' } },
          { x: 12, y: 3, dir: 'down', look: { skin: '#f3c9a8', hair: '#0c0c12', long: true, top: '#0c0c12', legs: '#0c0c12', shine: '#7a7a99', shades: true }, lines: ['Mistress: Kneel. Or don\'t. I only work with volunteers.', 'Mistress: Watching is free. Touching needs a yes.'] },
          { x: 10, y: 1, dir: 'down', look: { skin: '#e2b08c', bald: true, top: '#e2b08c', legs: '#0c0c12', harness: true }, lines: ['(Strapped to a St Andrew\'s cross, grinning from ear to ear.)', 'Him: Don\'t touch. Ask my Mistress. She\'s the one in black. Well. Everyone is in black.'] },
          { x: 4, y: 7, dir: 'down', look: { skin: '#f0c7a0', hair: '#c9a24a', top: '#0c0c12', legs: '#0c0c12', ears: '#c9a24a' }, lines: ['(Someone sits in a cage, wagging an imaginary tail.)', 'Pup: Woof! Don\'t worry, I have the key.'] },
          { pile: true, x: 21, y: 1, w: 3, join: 'yes', sheet: '#2a0a10', looks: [
            { skin: '#c98d6a', hair: '#111', top: '#c98d6a', legs: '#0c0c12', harness: true },
            { skin: '#f3c9a8', hair: '#ff5fa2', long: true, top: '#f3c9a8', legs: '#0c0c12' },
            { skin: '#8d5a3b', bald: true, top: '#8d5a3b', legs: '#0c0c12' },
            { skin: '#e2b08c', hair: '#c0c0c0', top: '#e2b08c', legs: '#c4162a' } ] },
          { pile: true, x: 25, y: 4, w: 3, join: 'no', sheet: '#1a0a14', looks: [
            { skin: '#f0c7a0', hair: '#2a2420', top: '#f0c7a0', legs: '#0c0c12' },
            { skin: '#d9a27c', hair: '#e8e8f0', long: true, top: '#d9a27c', legs: '#0c0c12', harness: true },
            { skin: '#c98d6a', bald: true, top: '#c98d6a', legs: '#0c0c12' } ] },
          { pile: true, x: 1, y: 14, w: 3, join: 'busy', sheet: '#3a0a1a', looks: [
            { skin: '#f3c9a8', hair: '#b04a2a', top: '#f3c9a8', legs: '#0c0c12' },
            { skin: '#8d5a3b', hair: '#111', long: true, top: '#8d5a3b', legs: '#0c0c12' } ] }
        ]
      }
    },
    examine: {
      V: ['Fluorescent paintings glowing under UV light. Faces, eyes, bodies, all melting into each other.'],
      Y: ['A chrome pole. Warm from use.'],
      Z: ['A leather sofa. It squeaks when you sit. Everyone pretends not to notice.'],
      Q: ['A bed with a fitted rubber sheet. Very practical.'],
      X: ['A St Andrew\'s cross. Leather cuffs, worn soft.'],
      J: ['The love swing. Chains, leather, and a small queue.'],
      n: ['A cage. The door is open. Probably.'],
      U: ['A gynaecologist\'s chair. Nobody here is a gynaecologist. Probably.'],
      '~': ['The pool.'],
      T: ['A palm tree, wearing a feather boa.'],
      k: ['Darkness. Breathing. A sigh somewhere to your left.']
    },
    examineActs: { '~': 'kkPool', Y: 'pole', M: 'booth', J: 'swing' },
    dancerPalette: {
      style: 'kinky',
      tops: ['#0c0c12', '#0c0c12', '#c4162a', '#ff5fa2', '#16151c', '#7a0a2a'],
      hair: ['#111111', '#2a2420', '#ff5fa2', '#e8e8f0', '#c4162a', '#d9b25c', '#7a3fd1'],
      legs: ['#0c0c12', '#0c0c12', '#c4162a', '#16151c'],
      extras: ['#ff5fa2', '#c4162a', '#e8e8f0', '#111111']
    },
    dancerLines: [
      'Raver: Isn\'t it amazing? Nobody judges anybody here.',
      'Raver: I came in a suit on Friday. The suit is in the cloakroom now. So is my shame.',
      'Raver: Ask first. Always. That\'s the only rule that matters.',
      'Raver: The pool is through the curtains. Bring nothing.',
      'Raver: I met my husband here. And his boyfriend.',
      'Raver: Have you met Marco downstairs? Everybody has met Marco.',
      '(They wink at you and keep dancing.)',
      'Raver: Latex is just a very honest raincoat.'
    ],
    quests: [
      { id: 'garderobe', title: 'Strip down at the Garderobe', hint: 'Main floor, by the entrance.' },
      { id: 'pole', title: 'Spin on a pole', hint: 'The pole stage at the top of the main floor.' },
      { id: 'swim', title: 'Take a dip in the pool', hint: 'Through the curtains on the right of the main floor.' },
      { id: 'orgy', title: 'Join an orgy', hint: 'Beds and dark corners. Ask first: not everyone says yes.' },
      { id: 'spank', title: 'Say yes to Marco', hint: 'Marco from Napoli, in the dungeon downstairs.' },
      { id: 'photo', title: 'Photo booth souvenir', hint: 'After Marco: the photo booth in the dungeon.' }
    ]
  }
};

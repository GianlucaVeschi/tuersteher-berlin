import type { InteriorDef } from '../types';

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
   ;  the empty space overlooking the Säule, behind a railing

   Staff stand behind counters; you talk to them across the counter.
   `people` entries: { x, y, look, lines } or { x, y, look, act } where `act`
   names a quest handler in src/quests/acts.ts (ACTS). Dancers are scattered on ',' tiles.
*/
export const INTERIORS: Record<string, InteriorDef> = {
  berghain: {
    name: 'Berghain',
    floors: {
      eg: {
        // The ground floor, Säule (after its big concrete pillar), laid out from the owner's sketch:
        // in through the vertical corridor, left into the bag check, round the squared C to the Kasse
        // at the top, into the changing space and the Garderobe, then the Säule with the bar along the
        // top, the DJ on the left, seats along the bottom and the staircase up in the top right. Going
        // out you skip the C: the corridor is open at the top.
        // Extra legend: ]  staircase up (rising to the right)   $  coat rack
        label: 'Säule', short: 'SÄULE',
        map: [
      '##################################',
      '#kkkk#....#............##]]]]]]]]#',
      '#kkkk#.....============..]]]]]]]]#',
      '#kkkk#.S.................]]]]]]]]#',
      '#kkkk#.D..,,,,,,,,,,,,,..]]]]]]]]#',
      '#kkkk#.D..,,,,,,,,,,,,,..........#',
      '#kkkk#.D..,,,,,,,,P,,,,..........#',
      '#kkkk#.S..,,,,,,,,,,,,,..........#',
      '#kkkkk....,,,,,,,,,,,,,..........#',
      '######...bbbbb...bbbbb...........#',
      '##############..########..########',
      '#................................#',
      '#.bbbb....................bbbb...#',
      '#................................#',
      '#.bbbb..bbb......................#',
      '#.............#.#................#',
      '#####L#########c#.#..#...........#',
      '############......#..##CCCCCCCCC##',
      '############..#####..##.........##',
      '############..#####..##$$$$$$$$$##',
      '############......#..#############',
      '############.........#############',
      '###################..#############',
      '###################..#############',
      '###################xx#############'
        ],
        spawn: { street: [19, 23, 'up'], fromUp: [24, 3, 'left'] },
        up: { to: 'mf', at: 'fromDown' },
        exit: true,
        dancers: 10,
        people: [
          { x: 14, y: 21, dir: 'left', look: { skin: '#d9a27c', bald: true, top: '#111016', legs: '#111016', big: true }, lines: ['Security: Bag open, please. Phone.', '(A sticker goes over each camera.)', 'Security: Stickers stay on. All night. Have fun.'] },
          { x: 12, y: 19, dir: 'up', look: { skin: '#f3c9a8', hair: '#d9b25c', top: '#16151c', legs: '#16151c' }, lines: ['Raver: Round the corner, up, round again. Then the Kasse. Then freedom.'] },
          { x: 16, y: 20, dir: 'left', look: { skin: '#8d5a3b', hair: '#111', top: '#0c0c12', legs: '#0c0c12', long: true }, lines: ['Raver: They checked my bag twice. I brought only gum.'] },
          { x: 15, y: 15, dir: 'down', act: 'cashier', look: { skin: '#f0c7a0', hair: '#9a9a9a', top: '#16151c', legs: '#16151c', glasses: '#9fc7e6' } },
          { x: 21, y: 15, dir: 'left', look: { skin: '#c98d6a', bald: true, top: '#111016', legs: '#111016', big: true }, lines: ['Security: The way out is down the corridor.', 'Security: Coming back in? Show the stamp on your hand at the door.'] },
          // the Garderobe: two staff, racks full of jackets, a queue handing over their clothes
          { x: 27, y: 18, dir: 'up', act: 'coat', look: { skin: '#e2b08c', hair: '#2a2420', top: '#16151c', legs: '#16151c', long: true } },
          { x: 24, y: 18, dir: 'up', look: { skin: '#c98d6a', hair: '#111', top: '#16151c', legs: '#16151c' }, lines: ['Garderobe: Next! Jacket, bag, all of it. Number 412.'] },
          { x: 23, y: 16, dir: 'down', look: { skin: '#f3c9a8', hair: '#d9b25c', long: true, top: '#5a4a3a', legs: '#16151c' }, lines: ['Raver: Coat, scarf, hoodie and a second hoodie. It was cold in the queue.'] },
          { x: 24, y: 16, dir: 'down', look: { skin: '#8d5a3b', hair: '#111', top: '#1f2f4d', legs: '#16151c' }, lines: ['Raver: (stuffing a jacket into a tote bag) One euro for a bag, one euro for a jacket. Bag it is.'] },
          { x: 29, y: 16, dir: 'down', look: { skin: '#e2b08c', hair: '#5a3a22', top: '#3a2a20', legs: '#16151c', beard: '#5a3a22' }, lines: ['Raver: I always lose my ticket. Then it is three hours of describing a black jacket.'] },
          { x: 30, y: 16, dir: 'down', look: { skin: '#f0c7a0', hair: '#b04a2a', long: true, top: '#4a1a1a', legs: '#16151c' }, lines: ['Raver: Do not give them your phone. Do not give them your keys. Do give them the jacket.'] },
          { x: 31, y: 16, dir: 'left', look: { skin: '#c98d6a', bald: true, top: '#0c0c12', legs: '#0c0c12', harness: true }, lines: ['Raver: (already down to a harness) Garderobe first, then I am a new person.'] },
          { x: 26, y: 14, dir: 'down', look: { skin: '#f3c9a8', hair: '#111', top: '#5a5a66', legs: '#16151c' }, lines: ['Raver: The queue for the Garderobe is the second queue of the night.'] },
          // the changing space
          { x: 8, y: 11, dir: 'down', look: { skin: '#f0c7a0', hair: '#111', top: '#2a2a33', legs: '#1a1920' }, lines: ['(Someone is swapping a hoodie for a harness. Nobody looks twice.)'] },
          { x: 3, y: 13, dir: 'down', look: { skin: '#e2b08c', hair: '#c9a24a', long: true, top: '#0c0c12', legs: '#0c0c12' }, lines: ['Raver: Boots on, sneakers in the bag, bag to the Garderobe. Ready.'] },
          { x: 9, y: 13, dir: 'down', look: { skin: '#8d5a3b', hair: '#111', top: '#16151c', legs: '#16151c', shades: true }, lines: ['Raver: Sunglasses on. Yes, inside. Yes, at night.'] },
          { x: 20, y: 12, dir: 'down', look: { skin: '#c98d6a', hair: '#5a3a22', top: '#0c0c12', legs: '#0c0c12', long: true }, lines: ['Raver: Jacket off, shirt off, phone away. Now I am ready.'] },
          { x: 27, y: 11, dir: 'down', look: { skin: '#e2b08c', bald: true, top: '#0c0c12', legs: '#0c0c12', harness: true }, lines: ['Raver: First time? Change here, Garderobe over there, Säule through there. Main floor is up the stairs.'] },
          // the Säule
          { x: 13, y: 1, dir: 'down', act: 'bar', look: { skin: '#c98d6a', bald: true, top: '#16151c', legs: '#16151c', beard: '#2a1a14' } },
          { x: 19, y: 1, dir: 'down', act: 'bar', look: { skin: '#f0c7a0', hair: '#5a3a22', top: '#16151c', legs: '#16151c', long: true } },
          { x: 6, y: 5, dir: 'right', act: 'dj', look: { skin: '#e2b08c', hair: '#2a2420', top: '#0c0c12', legs: '#0c0c12', shades: true } },
          { x: 17, y: 7, dir: 'up', look: { skin: '#f0c7a0', hair: '#111', top: '#2a2a33', legs: '#1a1920' }, lines: ['Raver: This floor is the Säule. "Pillar". Because of that one in the middle.', 'Raver: The main floor is up the stairs on the right. Panorama Bar is above that.'] },
          { x: 2, y: 3, dir: 'left', look: { skin: '#8d5a3b', hair: '#111', top: '#0c0c12', legs: '#0c0c12' }, lines: ['…', '(Someone in the dark. They just nod.)'] },
          { x: 3, y: 6, dir: 'up', look: { skin: '#e2b08c', bald: true, top: '#0c0c12', legs: '#0c0c12', harness: true }, lines: ['(A shape in the dark. You leave them to it.)'] }
        ]
      },
      mf: {
        // The main floor, laid out from the owner's sketch: the bathroom, the steps up to the mezzanine
        // (railing over the dancefloor, the lighting desk, then the stairs to Panorama Bar) and the
        // darkrooms along the top, the empty space overlooking the Säule behind a railing on
        // the left, the dancefloor with its columns, the DJ on the right, the bar along the bottom, and
        // in the bottom left the stairs down to the Säule and a few steps up to the ice cream.
        label: 'Berghain · main floor', short: 'MAIN',
        map: [
      '####################################',
      '#########tt|t|t|ttt#########^^^#kkk#',
      '#########tt|t|t|ttt########___D#kkk#',
      '#########tttttttttt#...}}}}___D#kkk#',
      '#########tttttttttt#...}}}}____#kkk#',
      '#############t######...}}}}))))##k##',
      '#;;;;;;;...........................#',
      '#;;;;;;;.,,,,,,,,,,,,,,,,,,,,,,....#',
      '#;;;;;;;.,,,,,,,,,,,,,,,,,,,,,,.S..#',
      '#;;;;;;;.S,,,,,,,,,,,,,,,,,,,,,.D..#',
      '#;;;;;;;.,,,,,,,,,,,,,,,,,,,,,,.D..#',
      '#;;;;;;;.,,,,,,,,,,,,,,,,,,,,,,.D..#',
      '#;;;;;;;.,,,,,,,,,,,,,,,,,,,,,,.D..#',
      '#;;;;;;;.S,,,,{,,,,,{,,,,,{,,,,.S..#',
      '#;;;;;;;.,,,,,{,,,,,{,,,,,{,,,,....#',
      '#;;;;;;;.,,,,,{#####{#####{,,,,....#',
      '#;;;;;;;...........................#',
      '#;;;;;;;...........................#',
      '#..................................#',
      '#.......______.....................#',
      '#vvvv...______.....................#',
      '#vvvv...#IIII###==================##',
      '#vvvv..#......##..................##',
      '####################################'
        ],
        spawn: { fromDown: [3, 19, 'up'], fromUp: [28, 2, 'down'] },
        down: { to: 'eg', at: 'fromUp' },
        up: { to: 'pb', at: 'fromDown' },
        dancers: 26,
        beams: true,
        people: [
          { x: 33, y: 10, act: 'dj', dir: 'left', look: { skin: '#e2b08c', hair: '#111', top: '#0c0c12', legs: '#0c0c12', shades: true } },
          { x: 10, y: 22, act: 'ice', dir: 'up', look: { skin: '#f3c9a8', hair: '#d9b25c', top: '#f3eee3', legs: '#16151c', long: true } },
          { x: 20, y: 22, act: 'bar', dir: 'up', look: { skin: '#d9a27c', hair: '#5a3a22', top: '#16151c', legs: '#16151c', beard: '#5a3a22' } },
          { x: 28, y: 22, act: 'bar', dir: 'up', look: { skin: '#8d5a3b', hair: '#111', top: '#16151c', legs: '#16151c', long: true } },
          { x: 16, y: 3, dir: 'left', look: { skin: '#f0c7a0', hair: '#c9a24a', top: '#2b2b38', legs: '#16151c' }, lines: ['Raver: (splashing water on their face) Ugh. Better.'] },
          // blocks the bathroom door until you bring K; after the quest he waits inside
          { x: 13, y: 5, act: 'toiletGuy', dir: 'down', movedWhen: 'toilet', movedTo: [14, 3], look: { skin: '#e2b08c', hair: '#111', top: '#16151c', legs: '#16151c', shades: true } },
          // Mila: dances by the left speakers, by the railing over the Säule; has what the toilet guy wants
          { x: 10, y: 11, act: 'mila', dance: true, phase: 3, look: { skin: '#f0c7a0', hair: '#ff5fa2', long: true, shades: true, top: '#0c0c12', legs: '#121116' } },
          // the mezzanine: the lighting guy at his desk, people leaning on the railing
          { x: 29, y: 3, dir: 'right', act: 'lights', name: 'Lights', look: { skin: '#e2b08c', hair: '#111', top: '#0c0c12', legs: '#0c0c12', glasses: '#9fc7e6' } },
          { x: 28, y: 4, dir: 'down', look: { skin: '#f0c7a0', hair: '#b04a2a', long: true, top: '#0c0c12', legs: '#0c0c12' }, lines: ['Raver: (leaning on the railing) From up here it looks like one animal breathing.'] },
          { x: 31, y: 19, act: 'awareness', dir: 'left', look: { skin: '#c98d6a', hair: '#7ec8ff', top: '#5ec8ff', legs: '#26242e', long: true } },
          { x: 8, y: 14, dir: 'left', look: { skin: '#e2b08c', bald: true, top: '#0c0c12', legs: '#0c0c12' }, lines: ['Raver: (leaning on the railing) Look down. That is the Säule. Tiny people, big pillar.'] },
          { x: 5, y: 19, dir: 'down', look: { skin: '#f3c9a8', hair: '#b04a2a', top: '#0c0c12', legs: '#0c0c12', long: true }, lines: ['Raver: Sitting down for five minutes. Then back in.'] }
        ]
      },
      pb: {
        label: 'Panorama Bar', short: 'PANO',
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
      $: ['Rails of jackets, hoodies and tote bags, hundreds of them. Somewhere in there: yours.'],
      ')': ['A railing. Below: the main floor, lights sweeping over a thousand heads.'],
      '{': ['A huge column, fluted like on a Greek temple. Somebody is hugging it, eyes closed.'],
      ';': ['A railing. Below you, the Säule: the bar, the pillar, tiny people dancing. The bass comes up through the floor.'],
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
      { id: 'coat', title: 'Check your coat', hint: 'Garderobe, on the ground floor (Säule), past the changing space.' },
      { id: 'drink', title: 'Order a drink', hint: 'Any bar.' },
      { id: 'ice', title: 'Get ice cream', hint: 'Eisbar on the mezzanine, main floor.' },
      { id: 'dance', title: 'Dance on the main floor', hint: 'Press A on the dancefloor.' },
      { id: 'toilet', title: 'Get into the toilets', hint: 'Someone is blocking the bathroom door, top left of the main floor.' },
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
          { x: 19, y: 8, dir: 'up', act: 'poolHat', look: { skin: '#8d5a3b', hair: '#111', top: '#5ec8ff', legs: '#ffd23f', sparkle: '#fff6a8' }, lines: ['Raver: The water is FREEZING. Ten out of ten.'] },
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
          { x: 23, y: 7, dir: 'left', look: { skin: '#c98d6a', hair: '#b6f36b', top: '#ff8c42', legs: '#7a3fd1', sparkle: '#fff6a8', paint: '#b6f36b' }, lines: ['Raver: The sauna is through the little door at the back. Go sweat it out.'] },
          { x: 23, y: 10, dir: 'left', act: 'ronny', name: 'Ronny', look: { skin: '#e2b08c', hair: '#c9a24a', top: '#7a3fd1', legs: '#2b3f6b', stripes: '#b6f36b', sparkle: '#fff6a8' } }
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
      { id: 'hopper', title: 'Dance in 4 different rooms', hint: 'Strand, Wintergarten, Hammahalle, Dampfer, Tunnel.' },
      { id: 'mdma', title: 'Ringbahn rush', hint: 'Ronny on the Dampfer, by the benches, might have something.' }
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
  },
  /* RSO (Revier Südost): the Griessmühle crew's club in the old Bärenquell brewery in Schöneweide.
     ROBUS and SUMME are the two warehouse floors, OPAN the open-air floor in the yard (all real).
     The Keller under ROBUS is made up for the game: no source mentions a darkroom at RSO.
     Uses the Berghain legend plus: B brewery brick, g grass, T tree, F fence, 1-2 doorways. */
  rso: {
    name: 'RSO',
    welcome: [
      'Door: Phone.',
      '(Stickers over your cameras. A stamp on your wrist that says RSO.)',
      'Door: Floors are ROBUS and SUMME inside, OPAN out here. Have a good weekend.',
      '(Side quests unlocked. Check your stamp card.)'
    ],
    floors: {
      opan: {
        label: 'OPAN · open air in the brewery yard', short: 'OPAN',
        map: [
          'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          'BBBBBBB1BBBBBBBBBBBBBB2BBBBBBB',
          'F..........F......F..........F',
          'Fgggggg....F......F..........F',
          'FgTgggg.....DDDDDD.........T.F',
          'Fgggggg......................F',
          'Fgggggg..,,,,,,,,,,,,........F',
          'Fgggggg..,,,,,,,,,,,,...FFFFFF',
          'Fgggggg..,,,,,,,,,,,,...=....F',
          'FgggTgg..,,,,,,,,,,,,...=....F',
          'Fgggggg..,,,,,,,,,,,,...=....F',
          'Fgggggg..,,,,,,,,,,,,...=....F',
          'Fgbbbgg..,,,,,,,,,,,,...FFFFFF',
          'Fgggggg..,,,,,,,,,,,,........F',
          'Fgggggg......................F',
          'FgTgggg....................T.F',
          'FggggTg......................F',
          'Fgggggg......................F',
          'F............................F',
          'FFFFFFFFFFFFFFxxFFFFFFFFFFFFFF'
        ],
        spawn: { street: [14, 18, 'up'], fromRobus: [7, 2, 'down'], fromSumme: [22, 2, 'down'] },
        doors: { '1': { to: 'robus', at: 'fromOpan' }, '2': { to: 'summe', at: 'fromOpan' } },
        exit: true,
        dancers: 10,
        daylight: true,
        fairy: [[1, 2, 10, 2], [19, 2, 28, 2], [8, 14, 21, 14]],
        spots: ['rgba(255,170,90,.14)', 'rgba(255,220,150,.12)', 'rgba(140,200,255,.10)'],
        people: [
          { x: 14, y: 3, act: 'dj', look: { skin: '#c98d6a', hair: '#2a2420', top: '#3a2a20', legs: '#16151c', shades: true } },
          { x: 25, y: 9, act: 'rsoBar', look: { skin: '#f0c7a0', hair: '#b04a2a', top: '#16151c', legs: '#16151c', long: true } },
          { x: 22, y: 14, act: 'griess', name: 'Kalle', dir: 'up', look: { skin: '#e2b08c', hair: '#9a9a9a', beard: '#9a9a9a', top: '#3a3a4a', legs: '#26242e' } },
          { x: 3, y: 13, dir: 'right', look: { skin: '#8d5a3b', hair: '#111111', top: '#16151c', legs: '#16151c' }, lines: ['Raver: SUMME is through the right door, ROBUS through the left.', 'Raver: The Keller? Downstairs in ROBUS. Ask first, always.'] }
        ]
      },
      robus: {
        label: 'ROBUS · the big warehouse floor', short: 'ROBUS',
        map: [
          'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
          'B...........B......B...........B',
          'B...........B......B...........B',
          'B............DDDDDD............B',
          'B..............................B',
          'B...S.,,,,,,,,,,,,,,,,,,,,.S...B',
          'B...S.,,,,,,,,,,,,,,,,,,,,.S...B',
          'BBB...,,,,,,,,,,,,,,,,,,,,.....B',
          'B.=...,,,,,,,,,,,,,,,,,,,,.....B',
          'B.=...,,,,,,,,,,,,,,,,,,,,.....B',
          'B.=...,,,,,,,,,,,,,,,,,,,,.....B',
          'B.=...,,,,,,,,,,,,,,,,,,,,.....B',
          'BBB...,,,,,,,,,,,,,,,,,,,,.....B',
          'B...S.,,,,,,,,,,,,,,,,,,,,.S...B',
          'B...S.,,,,,,,,,,,,,,,,,,,,.S...B',
          'B.....,,,,,,,,,,,,,,,,,,,,.....B',
          'B..............................B',
          'B.......P..............P....vv.B',
          'B...........................vv.B',
          'B..............................B',
          'BBBBBBBBBBBBBBBB1BBBBBBBBBBBBBBB'
        ],
        spawn: { fromOpan: [16, 20, 'up'], fromKeller: [28, 17, 'up'] },
        doors: { '1': { to: 'opan', at: 'fromRobus' } },
        down: { to: 'keller', at: 'fromRobus' },
        dancers: 24,
        people: [
          { x: 15, y: 3, act: 'dj', look: { skin: '#f3c9a8', bald: true, top: '#0c0c12', legs: '#0c0c12', tattoo: true } },
          { x: 1, y: 10, act: 'rsoBar', look: { skin: '#d9a27c', hair: '#5a3a22', top: '#16151c', legs: '#16151c', beard: '#5a3a22' } }
        ]
      },
      summe: {
        label: 'SUMME · the second warehouse floor', short: 'SUMME',
        map: [
          'BBBBBBBBBBBBBBBBBBBBBBBBBB',
          'BBBBBBBBBBBBBBBBBBBBBBBBBB',
          'B........B......B........B',
          'B.........DDDDDD.........B',
          'B........................B',
          'B.S.,,,,,,,,,,,,,,,,,,.S.B',
          'B.S.,,,,,,,,,,,,,,,,,,.S.B',
          'B...,,,,,,,,,,,,,,,,,,...B',
          'B...,,,,,,,,,,,,,,,,,,...B',
          'B...,,,,,,,,,,,,,,,,,,...B',
          'B...,,,,,,,,,,,,,,,,,,...B',
          'B...,,,,,,,,,,,,,,,,,,...B',
          'B...,,,,,,,,,,,,,,,,,,...B',
          'B........................B',
          'B........................B',
          'B.................bbbbb..B',
          'B........................B',
          'BBBBBBBBBBBBB2BBBBBBBBBBBB'
        ],
        spawn: { fromOpan: [13, 16, 'up'] },
        doors: { '2': { to: 'opan', at: 'fromSumme' } },
        dancers: 16,
        spots: ['rgba(255,60,120,.14)', 'rgba(120,80,255,.14)', 'rgba(255,255,255,.08)'],
        people: [
          { x: 12, y: 2, act: 'dj', look: { skin: '#e2b08c', hair: '#e83f8f', long: true, top: '#16151c', legs: '#16151c' } },
          { x: 20, y: 14, dir: 'left', look: { skin: '#f0c7a0', hair: '#5a3a22', top: '#2a2a33', legs: '#1a1920', long: true }, lines: ['Raver: I was at the last Griessmühle party. Kalle out in the yard can tell you all about it.'] }
        ]
      },
      keller: {
        label: 'Keller · the dark under ROBUS', short: 'KELLER',
        map: [
          '######################',
          '######################',
          '#^^^kkkkkkkkkkkkkkkkk#',
          '#.....kkkkkkkkkkkkkkk#',
          '#.....kkkkkkkkkkkkkkk#',
          '#kkkkkkkkkkkkkkkkkkkk#',
          '#kkkkkkkkkkkkkkkkkkkk#',
          '#kkkkkkkkkkkkkkkkkkkk#',
          '#kkkkkkkkkkkkkkkkkkkk#',
          '#kkkkkkkkkkkkkkkkkkkk#',
          '#kkkkkkkkkkkkkkkkkkkk#',
          '#kkkkkkkkkkkkkkkkkkkk#',
          '#kkkkkkkkkkkkkkkkkkkk#',
          '######################'
        ],
        spawn: { fromRobus: [2, 3, 'down'] },
        up: { to: 'robus', at: 'fromKeller' },
        red: true,
        people: [
          { pile: true, x: 12, y: 6, w: 3, join: 'yes', sheet: '#2a1a14', looks: [
            { skin: '#e2b08c', hair: '#111111', top: '#0c0c12', legs: '#0c0c12' }, { skin: '#c98d6a', bald: true, top: '#c98d6a', legs: '#0c0c12', harness: true }, { skin: '#f3c9a8', hair: '#b04a2a', long: true, top: '#0c0c12', legs: '#0c0c12' }] },
          { pile: true, x: 4, y: 10, w: 3, join: 'no', sheet: '#1a0a14', looks: [
            { skin: '#e2b08c', hair: '#111111', top: '#0c0c12', legs: '#0c0c12' }, { skin: '#8d5a3b', hair: '#111111', top: '#16151c', legs: '#16151c' }] },
          { pile: true, x: 15, y: 10, w: 2, join: 'busy', sheet: '#2a0a10', looks: [
            { skin: '#d9a27c', bald: true, top: '#d9a27c', legs: '#0c0c12', harness: true }, { skin: '#e2b08c', hair: '#111111', top: '#0c0c12', legs: '#0c0c12' }] },
          { x: 4, y: 3, dir: 'down', look: { skin: '#e2b08c', hair: '#2a2420', top: '#0c0c12', legs: '#0c0c12', shades: true }, lines: ['(Someone by the stairs whispers: "In here, you ask first. Always.")'] }
        ]
      }
    },
    examine: {
      B: ['Old brewery brick. Beer was brewed on this site for more than a hundred years, last of all Bärenquell.'],
      S: ['A custom-built sound system. Your ribcage hums along.'],
      F: ['A wooden fence around the brewery yard.'],
      T: ['A tree in the brewery yard, fairy lights in its branches.'],
      P: ['A cast-iron pillar from the brewery days.']
    },
    dancerLines: [
      'Raver: Deep. So deep.', "Raver: I've been here since Friday. It's fine.", 'Raver: Have you been to OPAN yet? The sunrise!',
      'Raver: I miss Griessmühle. But this is good too.', '(They are lost in the loop.)', 'Raver: Water at the bar is free.'
    ],
    quests: [
      { id: 'floors', title: 'Dance on all three floors', hint: 'ROBUS, SUMME and OPAN outside. Press A on a dancefloor.' },
      { id: 'griess', title: 'Hear about Griessmühle', hint: 'Kalle, an old regular, in the OPAN yard.' },
      { id: 'drink', title: 'A drink in the old brewery', hint: 'Any bar.' },
      { id: 'orgy', title: 'The Keller', hint: 'Down the stairs in ROBUS. Ask first.' }
    ]
  },

  /* Heideglühen: open-air house club at Westhafen since 2012 (it began in 2011 in a potato garden on Heidestraße).
     Real: fire pits, light installations, a wooden dancefloor under a glass roof, seating along wooden walls, house music.
     Woody, the DJ and the karaoke in the toilets are for the game.
     Extra legend: f fire pit, m karaoke machine. Also uses e (wooden dancefloor), H (wooden wall), w (wooden path),
     g grass, T tree, F fence, R light installation, t / | toilets, 1 doorway. */
  heidegluehen: {
    name: 'Heideglühen',
    welcome: [
      'Door: Wrist, please.',
      '(A stamp shaped like a little flame.)',
      'Door: Fire pits on the left, dancefloor under the roof. No lineup, just trust us.',
      '(Side quests unlocked. Check your stamp card.)'
    ],
    floors: {
      heide: {
        label: 'Heideglühen · fire pits and the glass roof', short: 'HEIDE',
        map: [
          'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
          'FgHHHHHHHHHHHHHHHHgggHHHHHHHHggggF',
          'FgHeeeeH.....HeeeegggHHHHHHHHggggF',
          'FgHeeeeeDDDDDeeeeegggHHHH1HHHggRgF',
          'FgHeeeeeeeeeeeeeeeggggggwwgggggggF',
          'FgHbeeeeeeeeeeeeeeggggggwwgggggggF',
          'FgHbeeeeeeeeeeeeeeggggggwwgggggggF',
          'FgHbeeeeeeeeeeeeeegggfggwwgggggggF',
          'FgHbeeeeeeeeeeeeeeggggggwwgggggggF',
          'FgHbeeeeeeeeeeeeeeggggggwwggfggggF',
          'FgHbeeeeeeeeeeeeeeggggggwwgggggggF',
          'FgHeeeeeeeeeeeeeeeggggggwwggggggTF',
          'FgHwwwwwwwwwwwwwwwwwwwwwwwwwwwwggF',
          'FggwwwwwwwwwwwwwwwwwwwwwwwwwwwwggF',
          'FgggggggggggggggwwggggggggggHHHHHF',
          'FTggggggggggggggwwgggggggggg=...HF',
          'Fgggggggggggggggwwgggggggggg=...HF',
          'Fggggggggfggggggwwggfggggggg=...HF',
          'Fgggggggggggggggwwgggggggggg=...HF',
          'FTggggggggggggggwwggggggggRgHHHHHF',
          'FgggggggggggRgggwwgggggggggggggggF',
          'FgggTgggggggggggwwggggggggggggggTF',
          'FgggggggggggggggwwgggggggggggggggF',
          'FFFFFFFFFFFFFFFFxxFFFFFFFFFFFFFFFF'
        ],
        spawn: { street: [16, 22, 'up'], fromKlo: [25, 4, 'down'] },
        doors: { '1': { to: 'klo', at: 'fromHeide' } },
        exit: true,
        dancers: 18,
        roof: [3, 2, 17, 11],
        fairy: [[18, 4, 32, 4], [18, 11, 31, 11], [3, 13, 30, 13], [18, 20, 31, 20]],
        spots: ['rgba(255,180,90,.16)', 'rgba(255,120,80,.12)', 'rgba(255,230,160,.12)'],
        people: [
          { x: 10, y: 2, act: 'hgDj', name: 'DJ', look: { skin: '#c98d6a', hair: '#2a2420', top: '#c94a3a', legs: '#2b3f6b', hat: '#2a2420', beard: '#2a2420' } },
          { x: 20, y: 8, act: 'woody', name: 'Woody', dir: 'left', movedWhen: 'woody', movedTo: [21, 17], look: { skin: '#e2b08c', bald: true, beard: '#8a8a8a', top: '#3a4a3a', legs: '#26242e', big: true } },
          { x: 29, y: 16, act: 'bar', look: { skin: '#f3c9a8', hair: '#d9b25c', top: '#7a5a3a', legs: '#2b3f6b', long: true } },
          { x: 27, y: 10, dir: 'left', look: { skin: '#8d5a3b', hair: '#111111', top: '#d9733a', legs: '#3a3a4a' }, lines: ['Raver: No lineup online, ever. You just come and trust the music.'] },
          { x: 10, y: 18, dir: 'right', look: { skin: '#f0c7a0', hair: '#b04a2a', top: '#2bb3a3', legs: '#3a3a8a', long: true }, lines: ['Raver: Woody? He booked my first ever gig. Never leaves the dancefloor. Well, except when someone is passing round a really big joint.'] }
        ]
      },
      klo: {
        label: 'Toilets · with karaoke', short: 'KLO',
        map: [
          '################',
          '################',
          '#tt|tt|tt|ttttt#',
          '#tt|tt|tt|ttttt#',
          '#tttttttttttttt#',
          '#tttttttttttttm#',
          '#tttttttttttttt#',
          '#tttttttttttttt#',
          '#tttttttttttttt#',
          '########1#######'
        ],
        spawn: { fromHeide: [8, 8, 'up'] },
        doors: { '1': { to: 'heide', at: 'fromKlo' } },
        people: [
          { x: 11, y: 4, dir: 'right', look: { skin: '#f3c9a8', hair: '#d9b25c', top: '#ff8cc4', legs: '#2b3f6b', long: true }, lines: ['Raver: Queue for the mic is longer than the queue for the toilets.'] },
          { x: 10, y: 7, dir: 'up', look: { skin: '#d9a27c', hair: '#5a3a22', top: '#58b368', legs: '#3a3a4a', beard: '#5a3a22' }, lines: ['Raver: I came in for the toilet. I stayed for the Whitney.'] }
        ]
      }
    },
    examineActs: { f: 'fire', m: 'karaoke' },
    examine: {
      R: ['A light installation, slowly changing colour against the night sky.'],
      H: ['A wooden wall. People sit along it, warming their hands.'],
      F: ['A wooden fence. Behind it: the harbour.'],
      T: ['A tree full of fairy lights.'],
      '|': ['A stall door covered in stickers.']
    },
    dancerLines: [
      'Raver: This bassline!', 'Raver: House music is a feeling.', "Raver: I don't even know who's playing. Doesn't matter.",
      'Raver: The fire pits are the best chill-out in Berlin.', '(They are dancing with their eyes closed.)', 'Raver: Have you tried the karaoke in the toilets?'
    ],
    dancerPalette: {
      hair: ['#2a2420', '#5a3a22', '#c9a24a', '#b04a2a', '#111111', '#9a9a9a'],
      tops: ['#c94a3a', '#2bb3a3', '#d9733a', '#7a5a3a', '#f2c14e', '#3d5f94', '#e9e4d6'],
      legs: ['#2b3f6b', '#3a3a4a', '#26242e', '#5a7aa8'],
      extras: ['#ffd23f', '#ff8c42', '#fff2b0', '#ff5e7a']
    },
    quests: [
      { id: 'b2b', title: 'Steal the decks', hint: 'Ask the DJ under the glass roof if you can play a few tracks.' },
      { id: 'woody', title: 'Get Woody off the dancefloor', hint: 'Woody the booker never leaves the floor. Unless someone offers him something big.' },
      { id: 'karaoke', title: 'Karaoke in the toilets', hint: 'The toilets have a karaoke machine. Of course they do.' },
      { id: 'fire', title: 'Warm up by the fire', hint: 'Press A facing a fire pit.' },
      { id: 'drink', title: 'Get a drink', hint: 'The bar by the fence.' }
    ]
  },

  /* Club der Visionäre: a former boathouse on the Flutgraben. One small wooden dancefloor on the
     water, partly roofed, under a big weeping willow; the Sonnenraum is the small indoor room.
     Extra legend: y  weeping willow   z  newer deck boards (after the 2019 fire)   q  canal water */
  cdv: {
    name: 'Club der Visionäre',
    welcome: [
      'Door: Five euro. Cash.',
      '(A stamp shaped like a little willow leaf.)',
      "Door: Deck's out back, the Sonnenraum is the little wooden house. See you Monday.",
      '(Side quests unlocked. Check your stamp card.)'
    ],
    floors: {
      deck: {
        label: 'The deck · under the willow', short: 'DECK',
        map: [
          'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
          'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
          'qqwwwwwwwwwwwwwwwwwwwwwwzzzwqq',
          'qqwwyyyywwwwwwwwwwwwwwwwzzzwqq',
          'qqwyyyyyywwwwSDDDSwwwwwwwzzwqq',
          'qqwyyyyyywweeeeeeeeeeewwwwwwqq',
          'qqwwyyyywwweeeeeeeeeeewwwwbwqq',
          'qqwwwbbwwwweeeeeeeeeeewwwwbwqq',
          'qqwwwwwwwwweeeeeeeeeeewwwwwwqq',
          'qqwwwwwwwwweeeeeeeeeeewwwwwwqq',
          'qqwwwwwwwwwwwwwwwwwwwHHHHHHHqq',
          'qqF=====wwwwwwwwwwwwwHHHHHHHqq',
          'FFF.....FwwwwwwwwwwwwHHH1HHHqq',
          'FFFFFFFFFwwwwwwwwwwwwwwwwwwwqq',
          'FgggggggggggggwwgggggggggggggF',
          'FFFFFFFFFFFFFFxxFFFFFFFFFFFFFF'
        ],
        spawn: { street: [14, 14, 'up'], fromSonnen: [24, 13, 'down'] },
        doors: { '1': { to: 'sonnen', at: 'fromDeck' } },
        exit: true,
        dancers: 14,
        roof: [11, 5, 21, 9],
        fairy: [[2, 2, 23, 2], [9, 10, 20, 10]],
        spots: ['rgba(255,200,120,.14)', 'rgba(170,230,160,.10)', 'rgba(255,170,120,.10)'],
        people: [
          { x: 15, y: 3, name: 'DJ', look: { skin: '#e2b08c', hair: '#3a2a20', top: '#2a2a2a', legs: '#26242e', hat: '#3a3a3a' }, lines: ['DJ: (without looking up) Lineup? They post it a week before. Sometimes later.', 'DJ: Half the time somebody just walks up and plays. I was only supposed to do two hours. That was Friday.'] },
          { x: 5, y: 12, dir: 'up', act: 'cdvBar', look: { skin: '#f0c7a0', hair: '#b04a2a', top: '#4a5a3a', legs: '#26242e', long: true } },
          { x: 7, y: 7, dir: 'left', act: 'ines', name: 'Ines', look: { skin: '#e8b896', hair: '#c9c9c9', top: '#8a5a8a', legs: '#3a3a4a', long: true, glasses: '#c9a24a' } },
          { x: 23, y: 3, dir: 'right', act: 'planks', name: 'Tom', look: { skin: '#c98d6a', hair: '#2a2420', top: '#d9733a', legs: '#2b3f6b', beard: '#2a2420' } },
          { x: 25, y: 8, dir: 'right', look: { skin: '#f3c9a8', hair: '#d9b25c', top: '#e9e4d6', legs: '#5a7aa8' }, lines: ['Raver: See the old ship down the river? The Hoppetosse. Same crew as here.', 'Raver: Built in 1928 as an excursion steamer, bombed in 1944, raised again, cut in two and towed to Berlin in the nineties. In winter the party moves over there.'] },
          { x: 19, y: 11, dir: 'down', look: { skin: '#8d5a3b', hair: '#111111', top: '#58b368', legs: '#3a3a4a' }, lines: ['Raver: Nearest cash machine? Somewhere in Kreuzberg. Bring cash next time.'] },
          { x: 4, y: 9, dir: 'right', act: 'flo', name: 'Flo', look: { skin: '#f3c9a8', hair: '#c9a24a', top: '#c28cff', legs: '#5a7aa8', long: true, beard: '#c9a24a', glasses: '#ff8c42' } }
        ]
      },
      sonnen: {
        label: 'Sonnenraum · the little wooden house', short: 'SONNEN',
        map: [
          'HHHHHHHHHHHHHHHH',
          'HHHHHHHHHHHHHHHH',
          'HwwwwwwwwwwwwwbH',
          'HwwwwwwwwwwwwwbH',
          'HwweeeeeeeewwwbH',
          'HwweeeeeeeewwwwH',
          'HwweeeeeeeewwwwH',
          'HwwwwwwwwwwwwwwH',
          'HwwwwwwwwwwwwwwH',
          'HHHHHHH1HHHHHHHH'
        ],
        spawn: { fromDeck: [7, 8, 'up'] },
        doors: { '1': { to: 'deck', at: 'fromSonnen' } },
        dancers: 4,
        daylight: true,
        people: [
          { x: 9, y: 2, act: 'jazz', name: 'Bassist', look: { skin: '#8d5a3b', hair: '#2a2420', top: '#3a3a4a', legs: '#26242e', beard: '#2a2420', hat: '#2a2420' } },
          { x: 11, y: 2, look: { skin: '#f0c7a0', hair: '#5a3a22', top: '#c94a3a', legs: '#26242e', glasses: '#1a1a1a' }, lines: ['Saxophonist: In winter the whole party squeezes in here. Or goes over to the Hoppetosse.'] },
          { x: 7, y: 2, look: { skin: '#e2b08c', hair: '#9a9a9a', top: '#2b3f6b', legs: '#26242e', beard: '#9a9a9a' }, lines: ['Drummer: Jazz at a minimal club? Long pieces, small changes. Same thing, really.'] }
        ]
      }
    },
    examineActs: { y: 'willow', z: 'planks' },
    examine: {
      q: ['The Flutgraben, a flood channel off the Spree. Down the river, the Hoppetosse is moored: CDV\'s sister, a steamer from 1928.'],
      '=': ['A small wooden bar. A handwritten sign: CASH ONLY.'],
      H: ['The wooden wall of the Sonnenraum.'],
      F: ['A wooden fence. Behind it, the Arena and the Badeschiff.'],
      b: ['A bench worn smooth by twenty summers of sitting.'],
      S: ['A speaker, turned down a bit. Minimal does not need to be loud.']
    },
    dancerLines: [
      'Raver: This is the best Sunday of my life. Is it Sunday?', 'Raver: Click, click, boom. Forever.', 'Raver: I came for one drink. On Friday.',
      '(They are dancing very slowly, very precisely.)', 'Raver: Did you sit under the willow yet?', "Raver: Card? Ha. You're new."
    ],
    dancerPalette: {
      hair: ['#2a2420', '#5a3a22', '#c9a24a', '#9a9a9a', '#111111', '#b04a2a'],
      tops: ['#e9e4d6', '#4a5a3a', '#7a5a3a', '#d9733a', '#3d5f94', '#c9b28a', '#2a2a2a'],
      legs: ['#26242e', '#3a3a4a', '#5a7aa8', '#7a6a4a'],
      extras: ['#a6e3a1', '#ffd23f', '#f3eee3', '#ff8c42']
    },
    quests: [
      { id: 'drink', title: 'Cash only', hint: 'Get a drink at the bar. Cards are not really a thing here.' },
      { id: 'willow', title: 'Under the willow', hint: 'Sit under the big weeping willow. Press A facing it.' },
      { id: 'monday', title: 'See you Monday', hint: 'Dance on the deck from Saturday through to Monday morning.' },
      { id: 'planks', title: 'The new planks', hint: 'Some deck boards look newer than the rest. Ask Tom why.' },
      { id: 'ines', title: 'The early days', hint: 'Ines on the bench has been coming since the start.' },
      { id: 'jazz', title: 'Jazz in the Sonnenraum', hint: 'Sit in with the trio in the little wooden house.' },
      { id: 'lsd', title: 'Deep trip', hint: 'Flo, by the water near the willow, has little squares of paper. Stay away from the canal.' }
    ]
  },

  /* Antonio's: a hair salon left of Sisyphos (a place, not a club: data/places.ts). Mirrors and
     chairs along the top wall, a DJ set in the corner, a disco floor. Antonio does the haircuts
     (handlers in places/salon.ts).
     Extra legend: E  mirror wall with bulbs   r  salon chair   d  black and white checkered floor */
  salon: {
    name: "Antonio's",
    floors: {
      main: {
        label: "Antonio's · hair and disco", short: "ANTONIO'S",
        map: [
          '#EEEEEEEE#######',
          '#drdrdrdrdddddd#',
          '#ddddddddddSDDS#',
          '#dddddddddddddd#',
          '#bbdddddddddddd#',
          '#dddddddddddddd#',
          '#dddddddddddddd#',
          '#######xx#######'
        ],
        spawn: { street: [7, 6, 'up'] },
        exit: true,
        dancers: 3,
        spots: ['rgba(255,43,214,.16)', 'rgba(255,242,0,.12)', 'rgba(0,229,255,.12)'],
        people: [
          // walks up to you every time you come in (places/salon.ts → salonEnter)
          { x: 5, y: 3, act: 'antonio', name: 'Antonio', look: { skin: '#c98d6a', hair: '#1a1a1a', long: true, shades: true, beard: '#1a1a1a', top: '#c4162a', legs: '#c4162a', stripes: '#f3eee3', sparkle: '#f2c45a' } },
          { x: 12, y: 1, look: { skin: '#e2b08c', hair: '#ff8c42', top: '#7a3fd1', legs: '#14121c', shades: true }, lines: ['DJ: Antonio only lets me play Spanish disco and Italo. I asked for techno once. Once.'] },
          { x: 2, y: 1, dir: 'up', look: { skin: '#f3c9a8', hair: '#5a3a22', top: '#e8e4d8', legs: '#3a3a4a' }, lines: ['Customer: (under foils) He said "trust me" and started bleaching. I trust him. I think.'] },
          { x: 4, y: 1, dir: 'up', look: { skin: '#8d5a3b', hair: '#111', top: '#e8e4d8', legs: '#2a2a35', beard: '#111' }, lines: ['Customer: I came in for a trim. I am getting a mullet. This is my life now.'] },
          { x: 1, y: 4, dir: 'right', look: { skin: '#d9a27c', hair: '#2a2420', top: '#f2c14e', legs: '#3a3a4a' }, lines: ['Waiting: Two hours waiting. Worth it. Last time he gave me a mohawk and I got into KitKat.'] }
        ]
      }
    },
    examine: {
      E: ['A big mirror with dressing-room bulbs. You look like you need a haircut.'],
      D: ['Two turntables and a stack of Spanish disco records. Antonio insists on vinyl.'],
      S: ['A speaker playing at a volume no hairdresser should allow.'],
      b: ['The waiting bench. The magazines are from 1987.']
    },
    examineActs: { r: 'salonChair' },
    dancerLines: [
      'Customer: Waiting for my turn. Might as well dance.',
      'Customer: He cuts better when the music is louder. Science.',
      '(They are dancing with half their hair cut. Nobody minds.)'
    ],
    dancerPalette: {
      tops: ['#c4162a', '#ff2bd6', '#f2c14e', '#4ea8de', '#58b368', '#e8e4d8'],
      hair: ['#ff2bd6', '#f2d06b', '#1a1a1a', '#b04a2a', '#58b368', '#c0c0c0'],
      legs: ['#14121c', '#3a3a8a', '#c4162a', '#e8e4d8'],
      extras: ['#f2c45a', '#fff200', '#ff2bd6', '#00e5ff']
    },
    quests: []
  },

  /* Tresor: since 2007 in the old Kraftwerk power station on Köpenicker Straße. Globus upstairs (house),
     a long concrete tunnel, and the vault in the basement (techno, fog, strobe) with safe-deposit boxes
     from the original 1991 club in the Wertheim vault.
     Extra legend: s  old safe-deposit boxes   j  iron bars in front of the DJ */
  tresor: {
    name: 'Tresor',
    welcome: [
      'Door: Phone.',
      '(A sticker goes over your camera. The bouncer taps it twice: it stays on.)',
      "Door: Globus is up here. The vault is down the stairs, through the tunnel. You'll hear it.",
      '(Side quests unlocked. Check your stamp card.)'
    ],
    floors: {
      globus: {
        label: 'Globus · house upstairs', short: 'GLOBUS',
        map: [
          '##########################',
          '#.........S...S.....=....#',
          '#.........SDDDS.....=....#',
          '#...,,,,,,,,,,,,,...=....#',
          '#...,,,,,,,,,,,,,...=....#',
          '#...,,,,,,,,,,,,,...=....#',
          '#...,,,,,,,,,,,,,...######',
          '#...,,,,,,,,,,,,,........#',
          '#.P...............P......#',
          '#........................#',
          '#bbb.................vvv.#',
          '#........................#',
          '#........................#',
          '###########xx#############'
        ],
        spawn: { street: [11, 12, 'up'], fromDown: [22, 11, 'down'] },
        down: { to: 'tunnel', at: 'fromUp' },
        exit: true,
        dancers: 14,
        spots: ['rgba(255,170,80,.12)', 'rgba(120,160,255,.10)', 'rgba(255,110,90,.10)'],
        people: [
          { x: 12, y: 1, look: { skin: '#c98d6a', hair: '#2a2420', top: '#2a2a2a', legs: '#26242e', glasses: '#1a1a1a' }, lines: ['(The DJ plays deep, warm house. Upstairs is where you warm up for the vault.)'] },
          { x: 21, y: 3, dir: 'left', act: 'bar', look: { skin: '#f0c7a0', hair: '#111111', top: '#1a1920', legs: '#1a1920' } },
          { x: 6, y: 9, dir: 'right', act: 'detroit', name: 'Jens', look: { skin: '#e2b08c', hair: '#9a9a9a', top: '#1a1920', legs: '#26242e', beard: '#9a9a9a', glasses: '#1a1a1a' } },
          { x: 17, y: 9, dir: 'left', look: { skin: '#8d5a3b', hair: '#111111', top: '#3a3a4a', legs: '#26242e' }, lines: ['Raver: Globus for house, the vault for techno. Pace yourself.'] }
        ]
      },
      tunnel: {
        label: 'The tunnel · thirty metres down to the vault', short: 'TUNNEL',
        map: [
          '##################################',
          '##################################',
          '#^^............................vv#',
          '#^^............................vv#',
          '#..............................vv#',
          '##################################'
        ],
        spawn: { fromUp: [3, 3, 'right'], fromDown: [29, 3, 'left'] },
        up: { to: 'globus', at: 'fromDown' },
        down: { to: 'vault', at: 'fromUp' },
        spots: ['rgba(255,140,40,.16)'],
        people: [
          { x: 16, y: 2, dir: 'down', look: { skin: '#f3c9a8', hair: '#d9b25c', long: true, top: '#1a1920', legs: '#1a1920' }, lines: ['Raver: Listen. Every step the kick gets louder. Best walk in Berlin.'] }
        ]
      },
      vault: {
        label: 'The vault · techno in the basement', short: 'VAULT',
        map: [
          '##########################',
          '#sssssssss#.....#ssssssss#',
          '#.........jjDDDjj........#',
          '#s......................s#',
          '#s..P,,,,,,,,,,,,,,,P...s#',
          '#s...,,,,,,,,,,,,,,,....s#',
          '#s...,,,,,,,,,,,,,,,....s#',
          '#s..P,,,,,,,,,,,,,,,P...s#',
          '#s...,,,,,,,,,,,,,,,....s#',
          '#s......................s#',
          '#S......................S#',
          '#s.......====...........s#',
          '#s......................s#',
          '#s^^....................s#',
          '##########################'
        ],
        spawn: { fromUp: [5, 13, 'right'] },
        up: { to: 'tunnel', at: 'fromDown' },
        dancers: 18,
        fog: true,
        strobe: true,
        spots: ['rgba(255,140,40,.14)', 'rgba(255,255,255,.08)', 'rgba(255,90,40,.10)'],
        people: [
          { x: 13, y: 1, look: { skin: '#8d5a3b', hair: '#111111', top: '#1a1920', legs: '#1a1920', hat: '#111111' }, lines: ['(The DJ plays Detroit techno from behind iron bars. In the fog you only see hands and a strobe.)'] },
          { x: 10, y: 12, dir: 'up', act: 'bar', look: { skin: '#e2b08c', hair: '#5a3a22', top: '#1a1920', legs: '#1a1920', bald: true } },
          { x: 21, y: 9, dir: 'up', act: 'sticker', look: { skin: '#f3c9a8', hair: '#c9a24a', top: '#26242e', legs: '#5a7aa8' } },
          { x: 3, y: 9, dir: 'right', look: { skin: '#c98d6a', hair: '#2a2420', long: true, top: '#1a1920', legs: '#1a1920' }, lines: ['Raver: The fog is so thick I danced with a pillar for an hour. Best partner tonight.'] }
        ]
      }
    },
    examineActs: { s: 'boxes' },
    examine: {
      j: ['Thick iron bars. In the old vault the DJ played from behind bars too.'],
      S: ['A speaker stack. The bass comes up through your shoes.'],
      '=': ['A bar in the dark. Club-Mate, beer, water.'],
      b: ['A bench by the wall. Someone left a Tresor tote bag on it.'],
      '#': ['Concrete, old and thick. This used to be a power station.']
    },
    dancerLines: [
      'Raver: This is the hardest kick drum in Berlin.', '(They dance without moving their face at all.)', 'Raver: Detroit! DETROIT!',
      "Raver: I came in at midnight. What day is it?", 'Raver: Did you walk the tunnel? Goosebumps every time.', '(Somebody hands you a cup of water without a word.)'
    ],
    dancerPalette: {
      hair: ['#111111', '#2a2420', '#5a3a22', '#9a9a9a', '#c9a24a', '#d9b25c'],
      tops: ['#1a1920', '#26242e', '#2a2a2a', '#3a3a4a', '#1a1920', '#4a4a52'],
      legs: ['#1a1920', '#26242e', '#2b3f6b', '#3a3a4a'],
      extras: ['#ff8c42', '#e8e4f0', '#ff5a1f', '#9a9a9a']
    },
    quests: [
      { id: 'tunnel', title: 'Through the tunnel', hint: 'Take the stairs down from Globus and follow the tunnel to the vault.' },
      { id: 'boxes', title: 'The old deposit boxes', hint: 'Press A facing the wall of old safe-deposit boxes in the vault.' },
      { id: 'detroit', title: 'The Detroit connection', hint: 'Jens in Globus has been coming since 1991. Know your Tresor history.' },
      { id: 'sticker', title: 'Keep the sticker on', hint: 'Someone in the vault is filming. Deal with it, nicely.' },
      { id: 'dance', title: 'Lose yourself in the fog', hint: 'Press A on a dancefloor. The vault, ideally.' },
      { id: 'drink', title: 'Get a drink', hint: 'Bars in Globus and in the vault.' }
    ]
  },

  /* Kater Blau: on the Spree at Holzmarkt 25, where Bar25 used to be. Open-air garden with wooden shacks,
     a circus tent and a deck over the river; inside, Heinz Hopper (classic techno) and the Acid Arch.
     Extra legend: *  circus tent   q  river water (as at CDV) */
  katerblau: {
    name: 'Kater Blau',
    welcome: [
      'Door: Ahoi! Hand, please.',
      '(A stamp shaped like a little cat with a sailor hat.)',
      'Door: Garden and river out here, Heinz Hopper in the left shack, the Acid Arch through the circus tent. See you Monday.',
      '(Side quests unlocked. Check your stamp card.)'
    ],
    floors: {
      garden: {
        label: 'The garden · on the Spree', short: 'GARDEN',
        map: [
          'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
          'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
          'wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
          'wwbbwwwwwwwwwwwwwwwwwwwwwwwwbbww',
          'gggggggggggggggggggggggggggggggg',
          'gHHHHHHHgggg*****gggggggHHHHHHHg',
          'gHHH1HHHgggg**2**gggggggH.....Hg',
          'ggggggggggggggggggggggggH=====Hg',
          'gggggggggggggggggggggggggggggggg',
          'ggTgggggaaaaaaaaaaaaaaaggggggTgg',
          'ggggggggaaaaaaaaaaaaaaaggggggggg',
          'ggggggggaaaaaaaaaaaaaaaggggggggg',
          'gTggggggaaaaaaaaaaaaaaagggggTggg',
          'gggggggggggggggggggggggggggggggg',
          'gggRgggggggggggggggggggggggggggg',
          'FFFFFFFFFFFFFFxxFFFFFFFFFFFFFFFF'
        ],
        spawn: { street: [14, 14, 'up'], fromHopper: [4, 7, 'down'], fromArch: [14, 7, 'down'] },
        doors: { '1': { to: 'hopper', at: 'fromGarden' }, '2': { to: 'arch', at: 'fromGarden' } },
        exit: true,
        dancers: 12,
        daylight: true,
        fairy: [[0, 4, 31, 4], [8, 8, 22, 8], [8, 13, 22, 13]],
        spots: ['rgba(126,200,255,.12)', 'rgba(255,140,200,.10)', 'rgba(255,214,120,.10)'],
        people: [
          { x: 27, y: 6, dir: 'down', act: 'bar', look: { skin: '#f0c7a0', hair: '#c9a24a', top: '#2b4c7a', legs: '#20202a', stripes: '#f3eee3', hat: '#1f2f4d' } },
          { x: 20, y: 3, dir: 'down', act: 'bar25', name: 'Hanne', look: { skin: '#e2b08c', hair: '#c9c9c9', long: true, top: '#c94a3a', legs: '#3a3a8a', flowers: ['#ffd23f', '#ff5e7a'], sparkle: '#fff6a8' } },
          { x: 4, y: 14, dir: 'left', act: 'glitter', name: 'Glitter fairy', look: { skin: '#f3c9a8', hair: '#ff8cc4', long: true, top: '#c28cff', legs: '#ff5e7a', sparkle: '#fff6a8', paint: '#ffd23f' } },
          { x: 10, y: 3, dir: 'up', look: { skin: '#8d5a3b', hair: '#111111', top: '#ffd23f', legs: '#5ec8ff', sparkle: '#ff5e7a' }, lines: ['Raver: Friday to Monday morning. I am on day three. Or four.'] },
          { x: 25, y: 11, dir: 'left', look: { skin: '#c98d6a', hair: '#5a3a22', top: '#b6f36b', legs: '#7a3fd1', hat: '#ff8c42' }, lines: ['Raver: The restaurant here is called Katerschmaus. I had breakfast there. At four in the afternoon. On a Monday.'] }
        ]
      },
      hopper: {
        label: 'Heinz Hopper · classic techno', short: 'HOPPER',
        map: [
          'HHHHHHHHHHHHHHHHHHHHHHHHHH',
          'HwwwwwwwwwwwwwwwwwwwwwwwwH',
          'HwwwwwwwwwwSDDDSwwwwwwwwwH',
          'HwweeeeeeeeeeeeeeeeeeeewwH',
          'HwweeeeeeeeeeeeeeeeeeeewwH',
          'HwweeeeeeeeeeeeeeeeeeeewwH',
          'HwweeeeeeeeeeeeeeeeeeeewwH',
          'HwweeeeeeeeeeeeeeeeeeeewwH',
          'HwweeeeeeeeeeeeeeeeeeeewwH',
          'HwweeeeeeeeeeeeeeeeeeeewwH',
          'HwwwwwwwwwwwwwwwwwwwwwwwwH',
          'HbbbwwwwwwwwwwwwwwwwwwwwwH',
          'HwwwwwwwwwwwwwwwwwwwwwwwwH',
          'HHHHHHHHHHH1HHHHHHHHHHHHHH'
        ],
        spawn: { fromGarden: [11, 12, 'up'] },
        doors: { '1': { to: 'garden', at: 'fromHopper' } },
        dancers: 18,
        fairy: [[1, 3, 24, 3], [1, 9, 24, 9]],
        spots: ['rgba(126,200,255,.14)', 'rgba(255,90,140,.12)', 'rgba(255,214,120,.10)'],
        people: [
          { x: 12, y: 1, look: { skin: '#e2b08c', hair: '#2a2420', top: '#3d5f94', legs: '#20202a', hat: '#ff5e7a' }, lines: ['(The DJ plays classic techno in a sailor shirt. Somebody keeps throwing confetti at the booth.)'] },
          { x: 21, y: 10, dir: 'left', act: 'confetti', name: 'Mimi', look: { skin: '#f3c9a8', hair: '#5ec8ff', long: true, top: '#ff5e7a', legs: '#ffd23f', sparkle: '#fff6a8' } }
        ]
      },
      arch: {
        label: 'Acid Arch · live sets and stranger sounds', short: 'ARCH',
        map: [
          'BBBBBBBBBBBBBBBBBBBBBB',
          'BBBBBBBBBBBBBBBBBBBBBB',
          'B....................B',
          'B........SDDS........B',
          'B..,,,,,,,,,,,,,,,,..B',
          'B..,,,,,,,,,,,,,,,,..B',
          'B..,,,,,,,,,,,,,,,,..B',
          'B..,,,,,,,,,,,,,,,,..B',
          'B..,,,,,,,,,,,,,,,,..B',
          'B....................B',
          'B....................B',
          'BBBBBBBBBB2BBBBBBBBBBB'
        ],
        spawn: { fromGarden: [10, 10, 'up'] },
        doors: { '2': { to: 'garden', at: 'fromArch' } },
        dancers: 10,
        uv: true,
        people: [
          { x: 10, y: 2, look: { skin: '#c98d6a', hair: '#b6f36b', top: '#14121c', legs: '#14121c', glasses: '#1a1a1a' }, lines: ['(A live act hunched over a pile of synths and cables. Nobody knows what is plugged into what. It sounds incredible.)'] },
          { x: 2, y: 9, dir: 'right', look: { skin: '#f0c7a0', hair: '#7a3fd1', long: true, top: '#5ec8ff', legs: '#c28cff', paint: '#b6f36b' }, lines: ['Raver: Acid Arch. Weird music for weird people. My favourite room in Berlin.'] }
        ]
      }
    },
    examineActs: { q: 'spree' },
    examine: {
      '*': ['A red and white circus tent. Through it: the Acid Arch.'],
      H: ['A wooden shack, patched together from old boards and fairy lights.'],
      R: ['The glitter booth. Jars of glitter in every colour, and a hand-painted sign: NO GLITTER, NO PARTY.'],
      B: ['Old brick, curving up into an arch over your head.'],
      F: ['A wooden fence covered in stickers and somebody\'s lost sequin jacket.'],
      T: ['A tree full of fairy lights and one lost shoe.']
    },
    dancerLines: [
      'Raver: Have you been glittered yet?', 'Raver: Bar25 forever!', '(They are wearing a cat costume. In August.)',
      'Raver: Kater means hangover. That is a Tuesday problem.', 'Raver: The sunrise on the Spree, oh my god.', '(Someone throws a handful of confetti over you and dances away.)'
    ],
    dancerPalette: {
      hair: ['#ff8cc4', '#5ec8ff', '#c9a24a', '#2a2420', '#b6f36b', '#7a3fd1', '#c9c9c9'],
      tops: ['#ff5e7a', '#ffd23f', '#5ec8ff', '#c28cff', '#b6f36b', '#f3eee3', '#2b4c7a'],
      legs: ['#3a3a8a', '#ff5e7a', '#20202a', '#ffd23f', '#5ec8ff'],
      extras: ['#fff6a8', '#ff5e7a', '#ffd23f', '#5ec8ff']
    },
    quests: [
      { id: 'bar25', title: 'The Bar25 story', hint: 'Hanne on the deck by the river has been coming since Bar25.' },
      { id: 'glitter', title: 'Get glittered', hint: 'The glitter booth in the garden. No glitter, no party.' },
      { id: 'confetti', title: 'Fire the confetti', hint: 'Mimi on the Heinz Hopper floor needs help with the confetti cannon.' },
      { id: 'spree', title: 'Sunrise on the Spree', hint: 'Press A facing the river from the wooden deck.' },
      { id: 'floors', title: 'Dance on both floors', hint: 'Heinz Hopper and the Acid Arch.' },
      { id: 'drink', title: 'Get a drink', hint: 'The bar shack in the garden.' }
    ]
  },

  /* La Maison: café and boulangerie on Paul-Lincke-Ufer (a place, not a club: data/places.ts).
     A glass counter of pastries, bistro tables, the canal terrace outside. */
  maison: {
    name: 'La Maison',
    floors: {
      main: {
        label: 'La Maison · café on the canal', short: 'CAFÉ',
        map: [
          '################',
          '#........#.....#',
          '#IIIII===#.....#',
          '#dddddddddddddd#',
          '#dbbddbbddbbddd#',
          '#dddddddddddddd#',
          '#dbbddbbddddddd#',
          '#dddddddddddddd#',
          '#######xx#######'
        ],
        spawn: { street: [7, 7, 'up'] },
        exit: true,
        daylight: true,
        people: [
          { x: 4, y: 1, act: 'maison', name: 'Baker', look: { skin: '#f0c7a0', hair: '#5a3a22', top: '#f3eee3', legs: '#2b3f6b', hat: '#f3eee3' } },
          { x: 2, y: 3, dir: 'up', look: { skin: '#e2b08c', hair: '#c9a24a', long: true, top: '#ff8c42', legs: '#3a3a4a', glasses: '#1a1a1a' }, lines: ['Guest: Sunday after the flea market on Maybachufer, a spritz here. That is my religion.'] },
          { x: 11, y: 5, dir: 'left', look: { skin: '#8d5a3b', hair: '#111111', top: '#c94a3a', legs: '#26242e', beard: '#111111' }, lines: ['Guest: They have orange wine on tap. On TAP. I moved to the right city.'] },
          { x: 6, y: 7, dir: 'up', look: { skin: '#f3c9a8', hair: '#b04a2a', long: true, top: '#58b368', legs: '#f3eee3' }, lines: ['Guest: Grab your coffee and sit on the canal wall outside. Watch out for the swans, they steal.'] },
          // packed: one free path from the door up to the counter (column 8, then row 3)
          { x: 1, y: 3, dir: 'right', look: { skin: '#f3c9a8', hair: '#d9b25c', top: '#ff8c42', legs: '#3a5a8a', long: true }, lines: ['Guest: Every chair is taken. I am sitting on my own bag.'] },
          { x: 9, y: 3, dir: 'left', look: { skin: '#8d5a3b', hair: '#111111', top: '#f3eee3', legs: '#26242e' }, lines: ['Guest: Excuse me, is anyone sitting... yes. Of course they are.'] },
          { x: 10, y: 3, dir: 'down', look: { skin: '#e2b08c', hair: '#5a3a22', top: '#58b368', legs: '#3a3a4a', beard: '#5a3a22' }, lines: ['Guest: The pain au chocolat sells out by eleven. It is three. I am still hoping.'] },
          { x: 12, y: 3, dir: 'left', look: { skin: '#f0c7a0', hair: '#b04a2a', top: '#c94a3a', legs: '#2b3f6b', long: true, glasses: '#1a1a1a' }, lines: ['Guest: We came for one coffee. That was four hours ago.'] },
          { x: 14, y: 3, dir: 'left', look: { skin: '#c98d6a', hair: '#2a2420', top: '#3d5f94', legs: '#7a6a4a', hat: '#c9b28a' }, lines: ['(Elbows, croissant crumbs and three languages at one tiny table.)'] },
          { x: 4, y: 4, dir: 'right', look: { skin: '#f3c9a8', hair: '#c9c9c9', top: '#c28cff', legs: '#3a3a4a' }, lines: ['Guest: Every chair is taken. I am sitting on my own bag.'] },
          { x: 5, y: 4, dir: 'left', look: { skin: '#d9a27c', hair: '#111111', top: '#14121c', legs: '#14121c', shades: true }, lines: ['Guest: Excuse me, is anyone sitting... yes. Of course they are.'] },
          { x: 9, y: 4, dir: 'right', look: { skin: '#f0c7a0', hair: '#ff8cc4', top: '#ffd23f', legs: '#5ec8ff', long: true }, lines: ['Guest: The pain au chocolat sells out by eleven. It is three. I am still hoping.'] },
          { x: 12, y: 4, dir: 'left', look: { skin: '#e2b08c', hair: '#9a9a9a', top: '#2b4c7a', legs: '#26242e', stripes: '#f3eee3' }, lines: ['Guest: We came for one coffee. That was four hours ago.'] },
          { x: 13, y: 4, dir: 'up', look: { skin: '#8d5a3b', hair: '#5a3a22', top: '#b6f36b', legs: '#26242e', long: true }, lines: ['(Elbows, croissant crumbs and three languages at one tiny table.)'] },
          { x: 1, y: 5, dir: 'up', look: { skin: '#f3c9a8', hair: '#d9b25c', top: '#ff8c42', legs: '#3a5a8a', long: true }, lines: ['Guest: Every chair is taken. I am sitting on my own bag.'] },
          { x: 3, y: 5, dir: 'up', look: { skin: '#8d5a3b', hair: '#111111', top: '#f3eee3', legs: '#26242e' }, lines: ['Guest: Excuse me, is anyone sitting... yes. Of course they are.'] },
          { x: 5, y: 5, dir: 'up', look: { skin: '#e2b08c', hair: '#5a3a22', top: '#58b368', legs: '#3a3a4a', beard: '#5a3a22' }, lines: ['Guest: The pain au chocolat sells out by eleven. It is three. I am still hoping.'] },
          { x: 10, y: 5, dir: 'up', look: { skin: '#f0c7a0', hair: '#b04a2a', top: '#c94a3a', legs: '#2b3f6b', long: true, glasses: '#1a1a1a' }, lines: ['Guest: We came for one coffee. That was four hours ago.'] },
          { x: 12, y: 5, dir: 'up', look: { skin: '#c98d6a', hair: '#2a2420', top: '#3d5f94', legs: '#7a6a4a', hat: '#c9b28a' }, lines: ['(Elbows, croissant crumbs and three languages at one tiny table.)'] },
          { x: 14, y: 5, dir: 'left', look: { skin: '#f3c9a8', hair: '#c9c9c9', top: '#c28cff', legs: '#3a3a4a' }, lines: ['Guest: Every chair is taken. I am sitting on my own bag.'] },
          { x: 4, y: 6, dir: 'right', look: { skin: '#d9a27c', hair: '#111111', top: '#14121c', legs: '#14121c', shades: true }, lines: ['Guest: Excuse me, is anyone sitting... yes. Of course they are.'] },
          { x: 5, y: 6, dir: 'left', look: { skin: '#f0c7a0', hair: '#ff8cc4', top: '#ffd23f', legs: '#5ec8ff', long: true }, lines: ['Guest: The pain au chocolat sells out by eleven. It is three. I am still hoping.'] },
          { x: 9, y: 6, dir: 'right', look: { skin: '#e2b08c', hair: '#9a9a9a', top: '#2b4c7a', legs: '#26242e', stripes: '#f3eee3' }, lines: ['Guest: We came for one coffee. That was four hours ago.'] },
          { x: 10, y: 6, dir: 'up', look: { skin: '#8d5a3b', hair: '#5a3a22', top: '#b6f36b', legs: '#26242e', long: true }, lines: ['(Elbows, croissant crumbs and three languages at one tiny table.)'] },
          { x: 12, y: 6, dir: 'left', look: { skin: '#f3c9a8', hair: '#d9b25c', top: '#ff8c42', legs: '#3a5a8a', long: true }, lines: ['Guest: Every chair is taken. I am sitting on my own bag.'] },
          { x: 14, y: 6, dir: 'up', look: { skin: '#8d5a3b', hair: '#111111', top: '#f3eee3', legs: '#26242e' }, lines: ['Guest: Excuse me, is anyone sitting... yes. Of course they are.'] },
          { x: 1, y: 7, dir: 'up', look: { skin: '#e2b08c', hair: '#5a3a22', top: '#58b368', legs: '#3a3a4a', beard: '#5a3a22' }, lines: ['Guest: The pain au chocolat sells out by eleven. It is three. I am still hoping.'] },
          { x: 3, y: 7, dir: 'right', look: { skin: '#f0c7a0', hair: '#b04a2a', top: '#c94a3a', legs: '#2b3f6b', long: true, glasses: '#1a1a1a' }, lines: ['Guest: We came for one coffee. That was four hours ago.'] },
          { x: 10, y: 7, dir: 'up', look: { skin: '#c98d6a', hair: '#2a2420', top: '#3d5f94', legs: '#7a6a4a', hat: '#c9b28a' }, lines: ['(Elbows, croissant crumbs and three languages at one tiny table.)'] },
          { x: 12, y: 7, dir: 'left', look: { skin: '#f3c9a8', hair: '#c9c9c9', top: '#c28cff', legs: '#3a3a4a' }, lines: ['Guest: Every chair is taken. I am sitting on my own bag.'] },
          { x: 14, y: 7, dir: 'up', look: { skin: '#d9a27c', hair: '#111111', top: '#14121c', legs: '#14121c', shades: true }, lines: ['Guest: Excuse me, is anyone sitting... yes. Of course they are.'] }
        ]
      }
    },
    examine: {
      I: ['A glass counter full of croissants, pain au chocolat and tarte au citron. Your willpower: gone.'],
      '=': ['The till and a big tap: orange wine.'],
      b: ['A little bistro table, wobbling exactly like in Paris.']
    },
    dancerLines: [],
    quests: []
  },

  /* Ankerklause: sailors' pub at Kottbusser Brücke, in an old steamer landing on the Landwehrkanal
     (a place, not a club). Wood panelling, portholes, nets, the jukebox, and a glass veranda over the canal.
     Everything here is about how hard it is to get a table (dramatised, but only a little).
     Extra legend: %  the jukebox   [  veranda window over the canal (blue frame, geraniums)
                   !  wood wall covered in graffiti   (  old velvet armchair */
  anker: {
    name: 'Ankerklause',
    floors: {
      main: {
        label: 'Ankerklause · the harbour bar with no harbour', short: 'BAR',
        map: [
          'HHoHHoH1oHHoHHHH',
          'H%wwwwwwww=wwwwH',
          'Hwwwwwwwww=wwwwH',
          'Hwwwwwwwww=wwwwH',
          'Hwwwwwwwww=wwwwH',
          'HwwwwwwwwwHHHHHH',
          'HwbbwwbbwwwwwwwH',
          'HwwwwwwwwwwwwwwH',
          'HHHHHHHxxHHHHHHH'
        ],
        spawn: { street: [7, 7, 'up'], fromVeranda: [7, 1, 'down'] },
        doors: { '1': { to: 'veranda', at: 'fromBar' } },
        exit: true,
        fairy: [[1, 1, 9, 1], [1, 5, 14, 5]],
        spots: ['rgba(255,90,60,.14)', 'rgba(255,214,120,.12)', 'rgba(80,140,255,.10)'],
        people: [
          { x: 11, y: 2, dir: 'left', act: 'ankerBar', name: 'Barkeeper', look: { skin: '#e2b08c', hair: '#9a9a9a', top: '#1f2f4d', legs: '#26242e', beard: '#9a9a9a', stripes: '#f3eee3', hat: '#1f2f4d' } },
          { x: 8, y: 3, dir: 'right', look: { skin: '#f0c7a0', hair: '#c9c9c9', top: '#2b4c7a', legs: '#26242e', beard: '#c9c9c9', hat: '#f3eee3' }, lines: ['Old sailor: Excursion boats used to leave from right outside. You bought your ticket where I am sitting now.', 'Old sailor: That is how I got this stool. I bought a ticket in 1994 and never got up again.'] },
          { x: 4, y: 7, dir: 'up', look: { skin: '#c98d6a', hair: '#111111', top: '#14121c', legs: '#3a3a4a', glasses: '#1a1a1a' }, lines: ['Regular: Kreuzberg or Neukölln? Depends who you ask. Either way: no table.'] },
          { x: 13, y: 6, dir: 'down', look: { skin: '#f3c9a8', hair: '#ff5e7a', long: true, top: '#14121c', legs: '#7a1a22' }, lines: ['Regular: House rule: whoever gets up loses their seat. I have not been to the toilet since nine.'] },
          // packed: one free path from the door to the bar (column 8, then 9) and along the top row to the jukebox
          // and the veranda door
          { x: 2, y: 2, dir: 'right', look: { skin: '#f0c7a0', hair: '#ff8cc4', top: '#ffd23f', legs: '#5ec8ff', long: true }, lines: ['(Shoulder to shoulder, everybody holding a drink and watching the tables like hawks.)'] },
          { x: 3, y: 2, dir: 'up', look: { skin: '#e2b08c', hair: '#9a9a9a', top: '#2b4c7a', legs: '#26242e', stripes: '#f3eee3' }, lines: ['Regular: I put my name on the table list in spring. Nobody has called.'] },
          { x: 5, y: 2, dir: 'right', look: { skin: '#8d5a3b', hair: '#5a3a22', top: '#b6f36b', legs: '#26242e', long: true }, lines: ['Regular: The trick is to stand next to a table and look sad. I have been looking sad for two hours.'] },
          { x: 6, y: 2, dir: 'left', look: { skin: '#f3c9a8', hair: '#d9b25c', top: '#ff8c42', legs: '#3a5a8a', long: true }, lines: ['Regular: Someone stood up! ...No. He was only getting another Pils.'] },
          { x: 1, y: 3, dir: 'right', look: { skin: '#8d5a3b', hair: '#111111', top: '#f3eee3', legs: '#26242e' }, lines: ['Tourist: At home you ask for a table. Here you ask for a table and everybody laughs.'] },
          { x: 3, y: 3, dir: 'right', look: { skin: '#e2b08c', hair: '#5a3a22', top: '#58b368', legs: '#3a3a4a', beard: '#5a3a22' }, lines: ['(Shoulder to shoulder, everybody holding a drink and watching the tables like hawks.)'] },
          { x: 4, y: 3, dir: 'left', look: { skin: '#f0c7a0', hair: '#b04a2a', top: '#c94a3a', legs: '#2b3f6b', long: true, glasses: '#1a1a1a' }, lines: ['Regular: I put my name on the table list in spring. Nobody has called.'] },
          { x: 6, y: 3, dir: 'right', look: { skin: '#c98d6a', hair: '#2a2420', top: '#3d5f94', legs: '#7a6a4a', hat: '#c9b28a' }, lines: ['Regular: The trick is to stand next to a table and look sad. I have been looking sad for two hours.'] },
          { x: 2, y: 4, dir: 'up', look: { skin: '#f3c9a8', hair: '#c9c9c9', top: '#c28cff', legs: '#3a3a4a' }, lines: ['Regular: Someone stood up! ...No. He was only getting another Pils.'] },
          { x: 5, y: 4, dir: 'right', look: { skin: '#d9a27c', hair: '#111111', top: '#14121c', legs: '#14121c', shades: true }, lines: ['Tourist: At home you ask for a table. Here you ask for a table and everybody laughs.'] },
          { x: 6, y: 4, dir: 'left', look: { skin: '#f0c7a0', hair: '#ff8cc4', top: '#ffd23f', legs: '#5ec8ff', long: true }, lines: ['(Shoulder to shoulder, everybody holding a drink and watching the tables like hawks.)'] },
          { x: 1, y: 5, dir: 'up', look: { skin: '#e2b08c', hair: '#9a9a9a', top: '#2b4c7a', legs: '#26242e', stripes: '#f3eee3' }, lines: ['Regular: I put my name on the table list in spring. Nobody has called.'] },
          { x: 3, y: 5, dir: 'right', look: { skin: '#8d5a3b', hair: '#5a3a22', top: '#b6f36b', legs: '#26242e', long: true }, lines: ['Regular: The trick is to stand next to a table and look sad. I have been looking sad for two hours.'] },
          { x: 5, y: 5, dir: 'up', look: { skin: '#f3c9a8', hair: '#d9b25c', top: '#ff8c42', legs: '#3a5a8a', long: true }, lines: ['Regular: Someone stood up! ...No. He was only getting another Pils.'] },
          { x: 6, y: 5, dir: 'left', look: { skin: '#8d5a3b', hair: '#111111', top: '#f3eee3', legs: '#26242e' }, lines: ['Tourist: At home you ask for a table. Here you ask for a table and everybody laughs.'] },
          { x: 1, y: 6, dir: 'right', look: { skin: '#e2b08c', hair: '#5a3a22', top: '#58b368', legs: '#3a3a4a', beard: '#5a3a22' }, lines: ['(Shoulder to shoulder, everybody holding a drink and watching the tables like hawks.)'] },
          { x: 4, y: 6, dir: 'left', look: { skin: '#f0c7a0', hair: '#b04a2a', top: '#c94a3a', legs: '#2b3f6b', long: true, glasses: '#1a1a1a' }, lines: ['Regular: I put my name on the table list in spring. Nobody has called.'] },
          { x: 5, y: 6, dir: 'right', look: { skin: '#c98d6a', hair: '#2a2420', top: '#3d5f94', legs: '#7a6a4a', hat: '#c9b28a' }, lines: ['Regular: The trick is to stand next to a table and look sad. I have been looking sad for two hours.'] },
          { x: 9, y: 6, dir: 'up', look: { skin: '#f3c9a8', hair: '#c9c9c9', top: '#c28cff', legs: '#3a3a4a' }, lines: ['Regular: Someone stood up! ...No. He was only getting another Pils.'] },
          { x: 11, y: 6, dir: 'left', look: { skin: '#d9a27c', hair: '#111111', top: '#14121c', legs: '#14121c', shades: true }, lines: ['Tourist: At home you ask for a table. Here you ask for a table and everybody laughs.'] },
          { x: 12, y: 6, dir: 'up', look: { skin: '#f0c7a0', hair: '#ff8cc4', top: '#ffd23f', legs: '#5ec8ff', long: true }, lines: ['(Shoulder to shoulder, everybody holding a drink and watching the tables like hawks.)'] },
          { x: 14, y: 6, dir: 'left', look: { skin: '#e2b08c', hair: '#9a9a9a', top: '#2b4c7a', legs: '#26242e', stripes: '#f3eee3' }, lines: ['Regular: I put my name on the table list in spring. Nobody has called.'] },
          { x: 2, y: 7, dir: 'up', look: { skin: '#8d5a3b', hair: '#5a3a22', top: '#b6f36b', legs: '#26242e', long: true }, lines: ['Regular: The trick is to stand next to a table and look sad. I have been looking sad for two hours.'] }
        ]
      },
      // the glass veranda hanging over the canal (like the real one, all blue frames and geraniums outside);
      // inside old wood, old armchairs, graffiti. Every seat taken.
      veranda: {
        label: 'Ankerklause · the veranda over the canal', short: 'VERANDA',
        map: [
          'qqqqqqqqqqqqq',
          'qqqqqqqqqqqqq',
          '[[[[[[[[[[[[[',
          '!(b(w(b(w(b(!',
          '!wwwwwwwwwww!',
          '!(b(w(b(w(b(!',
          '!!H!1!H!!!H!!'
        ],
        spawn: { fromBar: [4, 5, 'up'] },
        doors: { '1': { to: 'main', at: 'fromVeranda' } },
        fairy: [[1, 3, 11, 3]],
        spots: ['rgba(255,214,120,.14)', 'rgba(80,140,255,.10)'],
        people: [
          { x: 11, y: 4, dir: 'left', act: 'ankerTable', name: 'Waiter', look: { skin: '#f0c7a0', hair: '#2a2420', top: '#f3eee3', legs: '#26242e', beard: '#2a2420', stripes: '#1f2f4d' } },
          { x: 4, y: 3, dir: 'down', look: { skin: '#e2b08c', hair: '#c9a24a', long: true, top: '#ff8c42', legs: '#3a3a4a', glasses: '#1a1a1a' }, lines: ['Guest: We booked this table for my 30th birthday. I booked it on my 18th.'] },
          { x: 8, y: 3, dir: 'down', look: { skin: '#8d5a3b', hair: '#111111', top: '#c94a3a', legs: '#26242e', beard: '#111111' }, lines: ['Guest: Do not even look at my chair. I can feel you looking at my chair.'] },
          { x: 1, y: 4, dir: 'right', look: { skin: '#f3c9a8', hair: '#b04a2a', long: true, top: '#58b368', legs: '#f3eee3' }, lines: ['Guest: We came for breakfast. Leaving now would be a waste of a table.'] },
          { x: 8, y: 5, dir: 'up', look: { skin: '#c98d6a', hair: '#9a9a9a', top: '#2b4c7a', legs: '#26242e', stripes: '#f3eee3', hat: '#1f2f4d' }, lines: ['Old sailor: The swans out there have the best table in Kreuzberg. On the water. No waiting list.'] }
        ]
      }
    },
    examineActs: { '%': 'jukebox' },
    examine: {
      o: ['A porthole window. Outside: the Landwehrkanal, the terrace, and fifty people waiting for a table on it.'],
      H: ['Dark wood panelling, life rings, anchors and postcards. One says: "Greetings from table 4. Still here."'],
      '=': ['A sticky wooden bar. A bell hangs above it. Legend says it rings when a table comes free. Nobody has ever heard it.'],
      b: ['A wobbly table with a candle in a bottle. Every seat is taken. Every seat has always been taken.'],
      '[': ['The glass veranda, hanging right over the Landwehrkanal. Geraniums in the window boxes, swans below, the Kottbusser Brücke to the side.'],
      '!': ['Old wood, covered in graffiti and stickers. Someone scratched in: "WAITED 3 HOURS FOR THIS TABLE. WORTH IT."'],
      '(': ['An old armchair, the velvet worn through to the springs. Occupied. Of course it is occupied.'],
      q: ['The Landwehrkanal, right under the window. A swan glides past. Even the swan has a better seat than you.']
    },
    dancerLines: [],
    quests: []
  },

  /* Erkahn's Späti (a place, not a club: data/places.ts). Handlers in places/spati.ts.
     Extra legend: <  beer fridge   >  chips shelf   ?  tobacco wall   :  lino floor   +  the counter */
  spati: {
    name: 'Späti',
    floors: {
      main: {
        label: "Erkahn's Späti · open till late. Very late.", short: 'SPÄTI',
        map: [
          'H<<<<<<???H',
          'H::::::H::H',
          'H:>>:>>+++H',
          'H:>>:>>:::H',
          'H:::::::::H',
          'HHHHxxHHHHH'
        ],
        spawn: { street: [4, 4, 'up'] },
        exit: true,
        daylight: true,
        people: [
          // behind the counter, in front of the tobacco: talk to him across it
          { x: 8, y: 1, dir: 'down', act: 'erkahn', name: 'Erkahn', look: { skin: '#c98d6a', hair: '#1a1a1a', top: '#e0a83a', legs: '#2a2a35', beard: '#1a1a1a' } }
        ]
      }
    },
    examineActs: { '<': 'spatiFridge', '>': 'spatiChips' },
    examine: {
      '?': ['Tobacco, papers, lighters. Behind the counter: ask Erkahn.'],
      '+': ['The counter: chewing gum, lighters and a till older than you.'],
      H: ['Posters of Berlin bands nobody has heard of, and a faded Hertha scarf.']
    },
    dancerLines: [],
    quests: []
  },

  /* Black-light minigolf in Görlitzer Park (a place, not a club: data/places.ts): neon walls,
     glowing lanes under UV. Extra legend: @  a neon minigolf lane (press A to putt) */
  minigolf: {
    name: 'Minigolf',
    floors: {
      main: {
        label: 'Black-light minigolf · 18 neon holes', short: 'GOLF',
        map: [
          'VVVVVVVVVVVVVVVVVV',
          'V................V',
          'V.@@..@@..@@..=..V',
          'V................V',
          'V.@@..@@..@@.....V',
          'V................V',
          'V.@@..@@..@@.....V',
          'V................V',
          'V................V',
          'VVVVVVVVxxVVVVVVVV'
        ],
        spawn: { street: [8, 8, 'up'] },
        exit: true,
        uv: true,
        people: [
          { x: 15, y: 2, dir: 'left', act: 'golfDesk', look: { skin: '#e2b08c', hair: '#39ff14', top: '#14121c', legs: '#14121c', glasses: '#ff2bd6' } },
          { x: 5, y: 3, dir: 'up', look: { skin: '#f3c9a8', hair: '#d9b25c', long: true, top: '#f3eee3', legs: '#5ec8ff' }, lines: ['Player: My white T-shirt glows. My teeth glow. My score does not.'] },
          { x: 9, y: 5, dir: 'up', look: { skin: '#8d5a3b', hair: '#111111', top: '#ff2bd6', legs: '#26242e' }, lines: ['Player: Hole seven has a loop-the-loop. It has beaten me four times. Tonight is the night.'] },
          { x: 12, y: 7, dir: 'left', look: { skin: '#f0c7a0', hair: '#b04a2a', top: '#00e5ff', legs: '#14121c', shades: true }, lines: ['Player: First date idea, every Kreuzberg person ever: black-light minigolf. It works, though.'] }
        ]
      }
    },
    examineActs: { '@': 'golf' },
    examine: {
      V: ['Painted walls glowing under the UV: jellyfish, planets, a giant neon octopus.'],
      '=': ['The desk. Clubs, glowing balls, and a sign: NO SOCKS ARE TOO BRIGHT.']
    },
    dancerLines: [],
    quests: []
  }

};

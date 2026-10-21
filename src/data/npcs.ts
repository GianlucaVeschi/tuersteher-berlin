import type { NpcDef } from '../types';

/* People on the street. To add one, add an entry here:
   - plain chat: `lines`, said one after another
   - one-shot: add `leave: 'left' | 'right'` and they walk off after talking, gone for good (reset by Start over)
   - anything custom (choices, items): `act`, a handler in world/street.ts
   Positions are map tiles; check the spot is walkable ground next to where the player can stand. */
export const NPCS: NpcDef[] = [
  { id: 'queue1', x: 26, y: 13, dir: 'right', look: { skin: '#f3c9a8', hair: '#d9b25c', top: '#4ea8de', legs: '#3a5a8a', hat: '#e24a4a' },
    lines: ["Regular: You don't look like you come here all the time (like me).", "Regular: I guess I'm cooler!"] },
  { id: 'queue2', x: 27, y: 13, dir: 'right', look: { skin: '#f0c7a0', hair: '#5a3a22', top: '#f2c14e', legs: '#3a3a4a' },
    lines: ["Tourist: Is this even Berghain? There's no sign.", "Tourist: …I think that's the point."] },
  { id: 'queue3', x: 28, y: 13, dir: 'right', look: { skin: '#e2b08c', hair: '#111', top: '#1b1b22', legs: '#1b1b22' },
    lines: ["Local: I'm wearing all black. I rehearsed my answers.", "Local: I'm terrified."] },
  { id: 'queue4', x: 29, y: 13, dir: 'right', look: { skin: '#f3c9a8', hair: '#b04a2a', top: '#58b368', legs: '#3a3a4a' },
    lines: ['Tourist: Two hours in the queue. Worth it, right?'] },
  { id: 'raver', x: 19, y: 69, look: { skin: '#8d5a3b', hair: '#b36bd1', top: '#222', legs: '#222', shades: true },
    lines: ['Raver: Tresor and KitKat are both on Köpenicker Straße.', 'Raver: Coexist and Voo Store sell clubwear right here. Sisyphos wants color, Berghain wants black.', 'Raver: Read the signs. Bouncers love people who know the place.'] },
  { id: 'oldraver', x: 14, y: 20, look: { skin: '#f0c7a0', hair: '#c0c0c0', top: '#d9733a', legs: '#3a3a4a', beard: '#c0c0c0' },
    lines: ['Old raver: I danced at Bar25 for three days straight in 2009.', 'Old raver: Kater Blau is the same crew. New spot, same spirit.'] },
  { id: 'monday', x: 70, y: 21, dir: 'left', look: { skin: '#e2b08c', hair: '#3a2a20', top: '#9a4ad1', legs: '#2a2a35', shades: true },
    lines: ['Raver: What day is it?', 'Raver: I came in on Friday. Sisyphos does that to you.'] },
  // Taski rides the streets for Wolt all night (world/taski.ts moves him; conversation in STREET_ACTS.taski)
  { id: 'taski', x: 30, y: 21, act: 'taski', look: { skin: '#c98d6a', hair: '#1a1a1a', top: '#00c2e8', legs: '#26242e', hat: '#00c2e8', beard: '#1a1a1a', box: '#00c2e8', bike: true } },
  // outside Heideglühen, at the left corner of the building, as close as he's allowed (conversation in STREET_ACTS.jesus)
  { id: 'jesus', x: 63, y: 69, act: 'jesus', look: { skin: '#e2b08c', hair: '#5a3a22', long: true, beard: '#5a3a22', top: '#e9e4d6', legs: '#7a6a4a' } },
  // in front of his Imbiss on the green west of Humana (conversation in STREET_ACTS.mustafa)
  { id: 'mustafa', x: 5, y: 6, act: 'mustafa', look: { skin: '#d9a27c', hair: '#1a1a1a', beard: '#1a1a1a', top: '#f3eee3', legs: '#2a2a35' } },
  // just off the S-Bahn, on the grass by the tracks
  { id: 'freerk', x: 33, y: 2, leave: 'right', look: { skin: '#f0c7a0', hair: '#d9b25c', top: '#f7931a', legs: '#3a3a4a', btc: '#ffffff' },
    lines: [
      'Freerk: Moin! Just got off the S-Bahn. That was my fourth festival this summer.',
      'Freerk: Fusion, Camp Tipsy, Garbicz, and one in a forest I still can\'t pronounce.',
      'Freerk: Bad news: I have zero euros. Not even enough for a Club-Mate.',
      'Freerk: Good news: I have bitcoin. Time to sell some. Number go up, right?',
      '(He walks off, refreshing a price chart on his phone.)'
    ] },
  ...mustafaQueue(),
  ...canalCrowds(),
  // Görlitzer Park (researched; handlers in places/goerli.ts)
  { id: 'gorli-activist', x: 36, y: 42, dir: 'down', act: 'gorli', move: 'hop', look: { skin: '#f0c7a0', hair: '#ff5e7a', long: true, top: '#14121c', legs: '#3a3a4a', paint: '#ffd23f' } },
  { id: 'gorli-activist2', x: 41, y: 43, dir: 'left', move: 'hop', look: { skin: '#8d5a3b', hair: '#111111', top: '#c94a3a', legs: '#26242e' }, lines: ['Activist: GÖRLI BLEIBT AUF! GÖRLI BLEIBT AUF!', '(He is holding a cardboard sign: "ZAUN WEG". Fence gone.)'] },
  { id: 'gorli-neighbour', x: 34, y: 40, dir: 'down', look: { skin: '#e2b08c', hair: '#c9c9c9', top: '#3d5f94', legs: '#3a3a4a', glasses: '#9fc7e6' }, lines: ['Neighbour: Forty years I have walked my dog through Görli at night. A fence will not change that. Görli bleibt auf.'] },
  { id: 'gorli-rails', x: 25, y: 51, dir: 'up', act: 'railway', look: { skin: '#f0c7a0', hair: '#9a9a9a', top: '#2b3f6b', legs: '#26242e', hat: '#2b3f6b', beard: '#9a9a9a' } },
  { id: 'gorli-farm', x: 19, y: 49, dir: 'down', act: 'farm', look: { skin: '#c98d6a', hair: '#5a3a22', long: true, top: '#58b368', legs: '#5a7aa8', hat: '#c9a24a' } },
  { id: 'gorli-hoops1', x: 44, y: 44, dir: 'right', act: 'hoops', move: 'dribble', look: { skin: '#8d5a3b', hair: '#111111', top: '#f3eee3', legs: '#c94a3a' } },
  { id: 'gorli-hoops2', x: 46, y: 45, dir: 'left', move: 'dribble', look: { skin: '#f3c9a8', hair: '#d9b25c', top: '#ffd23f', legs: '#26242e' }, lines: ['Player: Winners stay on. We have been winning since lunch.'] },
  { id: 'gorli-kick1', x: 52, y: 44, dir: 'left', act: 'kick', move: 'run', look: { skin: '#e2b08c', hair: '#2a2420', top: '#c94a3a', legs: '#f3eee3' } },
  { id: 'gorli-kick2', x: 55, y: 46, dir: 'left', move: 'run', look: { skin: '#c98d6a', hair: '#111111', top: '#3d5f94', legs: '#f3eee3' }, lines: ['Kid: Jumpers for goalposts. Well, rucksacks.'] },
  { id: 'gorli-kick3', x: 50, y: 46, dir: 'right', move: 'run', look: { skin: '#f0c7a0', hair: '#b04a2a', top: '#58b368', legs: '#26242e' }, lines: ['Kid: I am the goalkeeper because I am the smallest. That is the rule.'] },
  { id: 'gorli-skate1', x: 44, y: 51, dir: 'right', act: 'skate', move: 'skate', look: { skin: '#f3c9a8', hair: '#5ec8ff', long: true, top: '#14121c', legs: '#ff8c42' } },
  { id: 'gorli-skate2', x: 47, y: 53, dir: 'left', move: 'skate', look: { skin: '#8d5a3b', hair: '#5a3a22', top: '#b6f36b', legs: '#26242e', hat: '#c94a3a' }, lines: ['Skater: That ramp is older than me. Still the best one in Kreuzberg.'] },
  // grill groups round the four grills, smoke rising (render/draw.ts → drawSmoke)
  { id: 'gorli-grill', x: 26, y: 52, dir: 'right', act: 'gorliGrill', look: { skin: '#e2b08c', hair: '#2a2420', top: '#ff8c42', legs: '#3a3a4a', beard: '#2a2420' } },
  { id: 'gorli-grill1b', x: 27, y: 51, dir: 'down', look: { skin: '#f3c9a8', hair: '#ff8cc4', long: true, top: '#f3eee3', legs: '#2b3f6b' }, lines: ['Griller: Twelve people, one grill, and a cool box from the Späti. Perfect Sunday.'] },
  { id: 'gorli-grill2a', x: 29, y: 53, dir: 'right', look: { skin: '#8d5a3b', hair: '#111111', top: '#58b368', legs: '#26242e' }, lines: ['Griller: My uncle says you need charcoal from Turkey. My uncle says a lot of things.'] },
  { id: 'gorli-grill2b', x: 31, y: 53, dir: 'left', look: { skin: '#c98d6a', hair: '#5a3a22', long: true, top: '#c94a3a', legs: '#26242e' }, lines: ['Griller: (fanning the smoke away with a paper plate) It is fine! It is fine! It is a lot of smoke.'] },
  { id: 'gorli-grill2c', x: 30, y: 54, dir: 'up', look: { skin: '#f0c7a0', hair: '#c9c9c9', top: '#3d5f94', legs: '#3a3a4a' }, lines: ['Griller: Corn on the cob, aubergine, and Köfte. Sit down, there is enough for the whole park.'] },
  { id: 'gorli-grill3a', x: 34, y: 52, dir: 'left', act: 'gorliGrill', look: { skin: '#e2b08c', hair: '#b04a2a', top: '#ffd23f', legs: '#2b3f6b' } },
  { id: 'gorli-grill3b', x: 33, y: 51, dir: 'down', look: { skin: '#8d5a3b', hair: '#2a2420', top: '#f3eee3', legs: '#c94a3a', shades: true }, lines: ['Griller: We came at ten to get this spot. Worth it.'] },
  { id: 'gorli-grill4a', x: 34, y: 54, dir: 'right', look: { skin: '#f3c9a8', hair: '#d9b25c', top: '#b6f36b', legs: '#3a3a4a' }, lines: ['Griller: Halloumi first, then the sausages, then whatever falls through the grill. That is the order.'] },
  { id: 'gorli-grill4b', x: 36, y: 54, dir: 'left', look: { skin: '#c98d6a', hair: '#111111', long: true, top: '#7a3fd1', legs: '#26242e' }, lines: ['Griller: The smoke is how your friends find you. Better than any group chat.'] },
  { id: 'gorli-kuhle', x: 26, y: 44, dir: 'down', act: 'kuhle', move: 'sway', look: { skin: '#f0c7a0', hair: '#c9a24a', long: true, top: '#c28cff', legs: '#5ec8ff' } },
  { id: 'gorli-kuhle2', x: 29, y: 45, dir: 'down', move: 'sway', look: { skin: '#8d5a3b', hair: '#111111', top: '#ffd23f', legs: '#26242e', shades: true }, lines: ['Sunbather: Feel that sun. Feel it!', 'Sunbather: Soak it up. In November you will need it.'] },
  { id: 'gorli-kuhle3', x: 31, y: 44, dir: 'left', move: 'sway', look: { skin: '#e2b08c', hair: '#5a3a22', long: true, top: '#7a5a3a', legs: '#26242e', beard: '#5a3a22' }, lines: ['(He is playing Wonderwall on a guitar with five strings.)', 'Guitarist: Summer in Berlin: three weeks. Winter: seven months.'] },
  { id: 'gorli-kuhle4', x: 21, y: 45, dir: 'right', move: 'sway', look: { skin: '#f3c9a8', hair: '#ff8c42', long: true, top: '#5ec8ff', legs: '#f3eee3', shades: true }, lines: ['Sunbather: Sun! Actual sun!', 'Sunbather: Blink and it is October.'] },
  { id: 'gorli-kuhle5', x: 24, y: 43, dir: 'down', move: 'sway', look: { skin: '#c98d6a', hair: '#2a2420', top: '#ff5e7a', legs: '#2b3f6b', hat: '#f3eee3' }, lines: ['Sunbather: Nobody is working today. Look at the sky.', 'Sunbather: Enjoy it. Grey from October to April.'] },
  { id: 'gorli-kuhle6', x: 33, y: 45, dir: 'left', move: 'sway', look: { skin: '#e2b08c', hair: '#c9c9c9', top: '#f3eee3', legs: '#3a3a4a', glasses: '#9fc7e6' }, lines: ['Sunbather: Thirty years in Berlin. Every summer is shorter.', 'Sunbather: And every winter longer. Sit, sit. Get some sun.'] },
  { id: 'gorli-cyclist', x: 30, y: 49, dir: 'right', look: { skin: '#f3c9a8', hair: '#b04a2a', top: '#3d5f94', legs: '#26242e', hat: '#ffd23f' }, lines: ['Cyclist: Through Görli is the shortcut to everywhere. At night too, now. Görli bleibt auf!'] },
  // Admiralbrücke on a summer evening: a busker and people on the bollards (researched: the bridge is
  // the classic Kreuzberg sunset hangout, and gets cleared at 10pm after residents complained)
  { id: 'busker', x: 12, y: 35, dir: 'left', act: 'busker', look: { skin: '#e2b08c', hair: '#5a3a22', long: true, beard: '#5a3a22', top: '#7a5a3a', legs: '#3a3a4a', hat: '#2a2420' } },
  { id: 'bollard1', x: 9, y: 34, dir: 'right', look: { skin: '#f3c9a8', hair: '#d9b25c', top: '#ff8c42', legs: '#3a5a8a' },
    lines: ['Tourist: Is this the bridge everyone talks about? It is just a bridge. With a beer it is the best bridge.'] },
  { id: 'bollard2', x: 9, y: 36, dir: 'right', look: { skin: '#8d5a3b', hair: '#111111', top: '#58b368', legs: '#2a2a35' },
    lines: ['Local: Sunset on the Admiralbrücke, a Sterni from the Späti, a guitar somewhere. That is the whole plan.', 'Local: At ten the neighbours want their sleep. Fair. They were here first.'] },
  { id: 'resident', x: 14, y: 32, dir: 'down', look: { skin: '#f0c7a0', hair: '#c9c9c9', top: '#3d5f94', legs: '#3a3a4a', glasses: '#9fc7e6' },
    lines: ['Resident: I live right there. Every summer night: guitars, bottles, Wonderwall.', "Resident: Ten o'clock and it is quiet. That was the deal. It mostly works."] }
];

/* The famous queue at Mustafa's: one person per tile, snaking from the counter down the green,
   along the grass and onto the sidewalk of the main street. Each one faces the person ahead. */
function mustafaQueue(): NpcDef[] {
  const path: [number, number, NpcDef['dir']][] = [
    [5, 7, 'up'], [5, 8, 'up'], [5, 9, 'up'], [5, 10, 'up'], [5, 11, 'up'],
    [6, 11, 'left'], [7, 11, 'left'], [8, 11, 'left'],
    [8, 12, 'up'], [8, 13, 'up'],
    [7, 13, 'right'], [6, 13, 'right'], [5, 13, 'right'], [4, 13, 'right'], [3, 13, 'right']
  ];
  const lines = [
    'Local: Forty minutes so far. Totally normal for a Sunday.',
    "Tourist: My guidebook said 'short wait'. My guidebook lied.",
    'Raver: Straight from Tresor. I need. This. Kebap.',
    'Tourist: Is this the queue for Berghain?',
    'Local: It used to be worse. People queued for an hour in the rain.',
    "Tourist: The Gemüse Kebap is on my bucket list. Right after Berghain.",
    'Raver: Stand still and you fall asleep. Keep talking to me.',
    "Student: Is it worth it? (He doesn't wait for an answer.) It's worth it.",
    'Tourist: We flew in from Madrid this morning. Priorities.',
    'Local: Never order the falafel. Trust me.',
    'Tourist: I can smell it from here. I can SMELL it.',
    "Raver: I've been in clubs with shorter queues.",
    'Tourist: Somebody said the queue is part of the experience.',
    'Local: My grandma queued here. Well, at the old stand.',
    "Tourist: Where does this queue even start? … Oh. There."
  ];
  const looks: NpcDef['look'][] = [
    { skin: '#f3c9a8', hair: '#d9b25c', top: '#4ea8de', legs: '#3a5a8a', hat: '#e24a4a' },
    { skin: '#8d5a3b', hair: '#111', top: '#1b1b22', legs: '#1b1b22' },
    { skin: '#f0c7a0', hair: '#b36bd1', top: '#222', legs: '#222', shades: true },
    { skin: '#e2b08c', hair: '#5a3a22', top: '#f2c14e', legs: '#3a3a4a', long: true },
    { skin: '#c98d6a', hair: '#2a2420', top: '#58b368', legs: '#2a2a35', beard: '#2a2420' },
    { skin: '#f3c9a8', hair: '#b04a2a', top: '#e04f5f', legs: '#26243a', long: true },
    { skin: '#d9a27c', hair: '#c0c0c0', top: '#3d5f94', legs: '#3d5f94', glasses: '#9fc7e6' }
  ];
  return path.map(([x, y, dir], i) => ({ id: `queue-mustafa-${i}`, x, y, dir, look: looks[i % looks.length], lines: [lines[i % lines.length]] }));
}

/* The crowds at La Maison and the Ankerklause: every spot on the canal wall and the pavement is
   taken. One narrow way through is left to each door (La Maison: along the canal wall from the
   bridge, then up; Ankerklause: along the grass from the bridge, then up). */
function canalCrowds(): NpcDef[] {
  // inside the function: NPCS calls this at load time, before module-level consts below it exist
  const CROWD_LOOKS: NpcDef['look'][] = [
    { skin: '#f3c9a8', hair: '#d9b25c', top: '#ff8c42', legs: '#3a5a8a', long: true },
    { skin: '#8d5a3b', hair: '#111111', top: '#f3eee3', legs: '#26242e' },
    { skin: '#e2b08c', hair: '#5a3a22', top: '#58b368', legs: '#3a3a4a', beard: '#5a3a22' },
    { skin: '#f0c7a0', hair: '#b04a2a', top: '#c94a3a', legs: '#2b3f6b', long: true, glasses: '#1a1a1a' },
    { skin: '#c98d6a', hair: '#2a2420', top: '#3d5f94', legs: '#7a6a4a', hat: '#c9b28a' },
    { skin: '#f3c9a8', hair: '#c9c9c9', top: '#c28cff', legs: '#3a3a4a' },
    { skin: '#d9a27c', hair: '#111111', top: '#14121c', legs: '#14121c', shades: true },
    { skin: '#f0c7a0', hair: '#ff8cc4', top: '#ffd23f', legs: '#5ec8ff', long: true },
    { skin: '#e2b08c', hair: '#9a9a9a', top: '#2b4c7a', legs: '#26242e', stripes: '#f3eee3' },
    { skin: '#8d5a3b', hair: '#5a3a22', top: '#b6f36b', legs: '#26242e', long: true }
  ];
  const MAISON_LINES = [
    'Guest: No free table. There is never a free table.',
    'Guest: I have been waiting for a table on this terrace since noon.',
    "Guest: Orange wine, the canal, the sun. I'm not moving until October.",
    'Guest: Sorry, this spot is taken. And that one. All of them, actually.',
    'Guest: Want our table? We leave in about... three hours.',
    "(A spritz, a croissant, the canal glittering behind them. They don't even look up.)",
    'Guest: Hold my croissant, I need to photograph the swans.',
    'Guest: The queue for the toilet is longer than the queue for Berghain.'
  ];
  const ANKER_LINES = [
    'Regular: Inside is full. The terrace is full. You can stand by the water, if you like.',
    'Regular: I have been waiting for a terrace table since the sun came up. Look at the sun now. It is gone.',
    '(They sing along to the jukebox through the open window, guarding their table with both elbows.)',
    'Regular: Want a table? There are no tables. There is only squeezing.',
    'Tourist: Is it always like this? ...Every night? So when does anybody get a table?',
    'Regular: Mind the bike. And the dog. And my chair. ESPECIALLY my chair.',
    'Regular: Kreuzberg or Neukölln? We are on the border. Neither side has a free table.',
    "(Someone balances four beers through the crowd to a table that does not exist.)"
  ];
  const spots = (ids: string, list: [number, number, NpcDef['dir']][], lines: string[], off: number) =>
    list.map(([x, y, dir], i) => ({ id: `${ids}-${i}`, x, y, dir, look: CROWD_LOOKS[(i + off) % CROWD_LOOKS.length], lines: [lines[(i * 3 + off) % lines.length]] }));
  // La Maison's terrace (door at 65,31): guests at the bistro tables; the way in along row 32 stays free
  const maison: [number, number, NpcDef['dir']][] = [
    [63, 33, 'right'], [65, 33, 'left'], [66, 33, 'right'], [68, 33, 'left'], [68, 32, 'right'], [70, 32, 'left'], [66, 32, 'down'], [70, 33, 'up']
  ];
  // the Ankerklause terrace (door at 43,37): guests round the polka-dot tables; row 38 from the bridge stays free
  const anker: [number, number, NpcDef['dir']][] = [
    [40, 39, 'right'], [42, 39, 'left'], [44, 39, 'right'], [46, 39, 'left'], [47, 39, 'right'], [49, 39, 'left'], [45, 38, 'down'], [48, 38, 'down']
  ];
  return [...spots('maison-crowd', maison, MAISON_LINES, 0), ...spots('anker-crowd', anker, ANKER_LINES, 4)];
}

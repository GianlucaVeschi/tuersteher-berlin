import type { NpcDef } from '../types';

/* People on the street. To add one, add an entry here:
   - plain chat: `lines`, said one after another
   - one-shot: add `leave: 'left' | 'right'` and they walk off after talking, gone for good (reset by Start over)
   - anything custom (choices, items): `act`, a handler in world/street.ts
   Positions are map tiles; check the spot is walkable ground next to where the player can stand. */
export const NPCS: NpcDef[] = [
  { id: 'spati', x: 43, y: 39, look: { skin: '#c98d6a', hair: '#1a1a1a', top: '#e0a83a', legs: '#2a2a35', beard: '#1a1a1a' },
    lines: ['Späti: Club-Mate? Two euros.', 'Späti: Tip: bouncers spot tourists fast. Learn about a club before you queue.', 'Späti: Wrong clothes? Coexist and Voo Store are on this street. Humana and Blackstyle are up north.', 'Späti: And Berghain was a power plant. Everyone asks.'] },
  { id: 'queue1', x: 26, y: 13, dir: 'right', look: { skin: '#f3c9a8', hair: '#d9b25c', top: '#4ea8de', legs: '#3a5a8a', hat: '#e24a4a' },
    lines: ["Tourist: We came as nine from the hostel. He just said 'Heute nicht.'", 'Tourist: Go alone. And keep your phone in your pocket.'] },
  { id: 'queue2', x: 27, y: 13, dir: 'right', look: { skin: '#f0c7a0', hair: '#5a3a22', top: '#f2c14e', legs: '#3a3a4a' },
    lines: ["Tourist: Is this even Berghain? There's no sign.", "Tourist: …I think that's the point."] },
  { id: 'queue3', x: 28, y: 13, dir: 'right', look: { skin: '#e2b08c', hair: '#111', top: '#1b1b22', legs: '#1b1b22' },
    lines: ["Local: I'm wearing all black. I rehearsed my answers.", "Local: I'm terrified."] },
  { id: 'queue4', x: 29, y: 13, dir: 'right', look: { skin: '#f3c9a8', hair: '#b04a2a', top: '#58b368', legs: '#3a3a4a' },
    lines: ['Tourist: Two hours in the queue. Worth it, right?'] },
  { id: 'raver', x: 19, y: 39, look: { skin: '#8d5a3b', hair: '#b36bd1', top: '#222', legs: '#222', shades: true },
    lines: ['Raver: Tresor and KitKat are both on Köpenicker Straße.', 'Raver: Coexist and Voo Store sell clubwear right here. Sisyphos wants color, Berghain wants black.', 'Raver: Read the signs. Bouncers love people who know the place.'] },
  { id: 'oldraver', x: 14, y: 20, look: { skin: '#f0c7a0', hair: '#c0c0c0', top: '#d9733a', legs: '#3a3a4a', beard: '#c0c0c0' },
    lines: ['Old raver: I danced at Bar25 for three days straight in 2009.', 'Old raver: Kater Blau is the same crew. New spot, same spirit.'] },
  { id: 'monday', x: 70, y: 21, dir: 'left', look: { skin: '#e2b08c', hair: '#3a2a20', top: '#9a4ad1', legs: '#2a2a35', shades: true },
    lines: ['Raver: What day is it?', 'Raver: I came in on Friday. Sisyphos does that to you.'] },
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
  ...mustafaQueue()
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

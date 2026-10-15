import { ask, say } from '../ui/dialog';
import type { Entity } from '../types';

/* ---- Görlitzer Park ("Görli") in Kreuzberg ---- */
// Researched: the park lies on the grounds of the Görlitzer Bahnhof, a terminus whose last passenger
// trains left in 1951; the station was demolished from 1962, the site became a coal depot with freight
// trains until 1985, and the park was laid out from the mid-1980s (old rails and a tunnel remain). In 2023
// the CDU/SPD Senate decided to lock the park at night: a fence with 16 gates (about 1.74 million euros),
// locked every night from 1 March 2026. In June 2026 five residents won an urgent case (the district, not
// the Senate, should have decided), and in October 2026 the Higher Administrative Court rejected the
// Senate's appeal: the park stays open day and night. The fence still stands; the main case is pending.

/** Activists at the north gate. */
export async function gorli(_e: Entity | null) {
  await say('Activist: GÖRLI BLEIBT AUF! Görli stays open!');
  await say('Activist: The Senate spent around 1.7 million euros on this fence. Sixteen gates. From March 2026 they locked them every night.');
  await say('Activist: In June five neighbours went to court and won: the district should have decided, not the Senate. In October the higher court threw out the Senate\'s appeal.');
  await say('Activist: So the fence is still standing, and every single gate is wide open. Day and night.');
  const a = await ask('', ['GÖRLI BLEIBT AUF!', 'Why did they want a fence?']);
  if (a === 0) { await say('(The whole gate chants with you. A man on a bike rings his bell in support. A dog barks along.)'); return; }
  await say('Activist: Crime and dealing, they said. We say a fence only pushes problems round the corner into the Wrangelkiez.');
  await say('Activist: A park belongs to everyone. At three in the afternoon and at three in the morning. Görli bleibt auf!');
}

/** A railway fan by the old rails. */
export async function railway(_e: Entity | null) {
  await say('Railway fan: Right here stood the Görlitzer Bahnhof, a big terminus. Trains out to Görlitz and the south-east.');
  await say('Railway fan: The last passenger train left in 1951. They started tearing the station down in 1962. Then coal, and freight trains until 1985.');
  await say('Railway fan: The neighbours wanted a park instead. Look down: some of the old rails are still in the grass. And there is an old tunnel under the park.');
}

/** The children's farm. */
export async function farm(_e: Entity | null) {
  await say('Farm volunteer: Welcome to the Kinderbauernhof! Free for everyone. Goats, donkeys, sheep, rabbits.');
  const a = await ask('', ['Feed the goats', 'Brush the donkey', 'Muck out the stable']);
  await say([
    '(A goat eats the carrot, then your sleeve, then tries for your phone.)',
    '(The donkey leans into the brush and closes its eyes. You have a new best friend.)',
    'Farm volunteer: A hero! The kids usually run away when we say that word.'
  ][a]);
}

/** The basketball court. */
export async function hoops(_e: Entity | null) {
  await say('Player: We need a fifth. You in?');
  const a = await ask('', ['Take the three', 'Drive to the basket', 'Pass, always pass']);
  const made = Math.random() < [0.35, 0.6, 0.8][a];
  await say(made
    ? ['(Swish. From way downtown. The court goes wild.)', '(You glide past two players and lay it in. Clean.)', '(Your pass finds the open man. He scores. Assist king.)'][a]
    : ['(Airball. Somebody on the Kuhle claps sarcastically.)', '(You get blocked so hard you consider retirement.)', '(The pass goes straight to the other team. Oops.)'][a]);
}

/** Kickabout on the football pitch. */
export async function kick(_e: Entity | null) {
  await say('Kid: Oi! Can you shoot? We are one short.');
  const a = await ask('', ['Shoot, top corner', 'Chip the keeper', 'Play it safe, side foot']);
  await say([
    '(It goes over the fence, over the path and lands in somebody\'s picnic on the Kuhle.)',
    '(The chip floats over the keeper and in. The kids carry you around the pitch.)',
    '(Low and hard, in off the post. The goalkeeper, aged nine, is furious.)'
  ][a]);
}

/** The skate park. */
export async function skate(_e: Entity | null) {
  await say('Skater: Want to drop in? Board\'s yours.');
  const a = await ask('', ['Drop in!', 'I will just watch']);
  if (a === 1) { await say('(She drops in, carves the bowl and pops a kickflip out of it. Show-off.)'); return; }
  await say(Math.random() < 0.5 ? '(You drop in, wobble, somehow make it up the other side. Everyone bangs their boards on the coping.)' : '(You drop in. Your board drops in. You stay on the rim. The bowl wins.)');
}

/** The grill zone. */
export async function gorliGrill(_e: Entity | null) {
  await say('Griller: Grill zone, so it is allowed. Halloumi, Sucuk or a corn cob?');
  const a = await ask('', ['Halloumi', 'Sucuk', 'Corn cob']);
  await say(['(Squeaky, salty, perfect.)', '(Spicy Sucuk in fresh bread from the Turkish bakery round the corner. Kreuzberg in one bite.)', '(Charred, buttery, and you get it stuck in your teeth for the rest of the night.)'][a]);
}

/** A picnic on the Kuhle. */
export async function kuhle(_e: Entity | null) {
  await say('Picnicker: Welcome to the Kuhle. The big dip in the middle of Görli. Grab a corner of the blanket.');
  await say('(You lie back on the grass of the bowl. Someone plays guitar, a frisbee flies over, the sky turns pink.)');
}

/** The desk at the black-light minigolf. */
export async function golfDesk(_e: Entity | null) {
  await say('Desk: Eighteen holes in black light. Here is your club and a glowing ball. Pink is the luckiest.');
}

/** Putting at one of the neon holes. */
export async function golf(_e: Entity | null) {
  const a = await ask('(A glowing lane with a loop-the-loop. How hard?)', ['A gentle tap', 'A medium putt', 'Full swing']);
  const r = Math.random();
  if (a === 1 && r < 0.4) { await say('(The ball rolls through the loop, round the neon skull and drops in. HOLE IN ONE. You scream. Strangers high-five you.)'); return; }
  await say([
    '(The ball rolls three centimetres and stops. Under the UV your white socks glow brighter than the ball.)',
    '(Round the loop, off the bumper, and it stops right on the edge of the hole. So close.)',
    '(The ball flies off the lane, bounces off a neon jellyfish and disappears behind the counter.)'
  ][a]);
}

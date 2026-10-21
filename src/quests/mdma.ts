import { completeQuest, questDone } from './quests';
import { ask, closeBox, say } from '../ui/dialog';
import { renderCard } from '../ui/card';
import { save } from '../core/save';
import { fade, toast } from '../interiors/transitions';
import { playRunner } from '../minigames';
import { track } from '../core/monitoring';
import { state } from '../core/state';
import type { Entity } from '../types';

/* ---- Sisyphos: MDMA from Ronny on the Dampfer, after you find his bucket hat; taking it starts the runner ---- */
export const MD_HINTS: Record<number, string> = {
  1: "Ronny lost his bucket hat somewhere by the lake on the Strand. Ask around there.",
  2: 'You have the hat. Back to Ronny, top right corner of the Dampfer.',
  3: 'Ronny gave you half a pill. Talk to him when you are ready to take it.'
};

/** Ronny, in the top right corner of the Dampfer. Knows a guy. Is the guy. */
export async function ronny(_e: Entity | null, clubId: string) {
  if (questDone(clubId, 'mdma')) {
    // replay the runner
    await say('Ronny: Still glowing? Drink some water. Seriously.');
    const again = await ask('Ronny: ...Or another half?', ['Another round on the Ringbahn', 'Water, please']);
    if (again === 1) { await say('Ronny: Good call.'); return; }
    await takePill(clubId, true);
    return;
  }
  if (state.mdStage === 0) {
    await say('Ronny: Hm? Do I look like I sell stuff?');
    const a = await ask('', ['You look like a man who has a little something', 'Sorry, wrong person']);
    if (a === 1) { await say('Ronny: All good.'); return; }
    await say('Ronny: Maybe. But I lost my bucket hat. Without the hat I am nobody.');
    await say('Ronny: It flew off by the lake on the Strand. Bring it back and we talk.');
    state.mdStage = 1; save(); renderCard();
    return;
  }
  if (state.mdStage === 1) { await say('Ronny: No hat, no deal. It was by the lake, on the Strand.'); return; }
  if (state.mdStage === 2) {
    await say('Ronny: MY HAT. You absolute angel.');
    await say('(He puts it on. He looks exactly the same.)');
    await say('Ronny: Here. Half a pill. Start low, go slow, and drink water, not more booze.');
    state.mdStage = 3; save(); renderCard();
    toast('GOT · HALF A PILL');
  }
  const b = await ask('Ronny: Taking it now?', ['Yes, now', 'Later']);
  if (b === 1) { await say('Ronny: Smart. Come find me when you are ready.'); return; }
  await takePill(clubId, false);
}

/** Swallow the pill and ride the Ringbahn. A replay doesn't change the quest. */
async function takePill(clubId: string, replay: boolean) {
  await say('(You swallow it with a sip of water. Twenty minutes later the bass turns into the rattle of the Ringbahn...)');
  closeBox();
  await fade(true);
  const won = await playRunner();
  await fade(false);
  track('runner_finished', { won, replay });
  if (won) {
    await say('(You open your eyes on the Dampfer, hugging a stranger. Everyone is beautiful. The DJ is beautiful. Ronny is beautiful.)');
    if (replay) return;
    state.mdStage = 4; save();
    await completeQuest(clubId, 'mdma');
  } else {
    await say('(A Kontrolleur gently takes your hand. You open your eyes on a bench, holding somebody\'s watermelon.)');
    await say('Ronny: Rough ride? Sit for a bit, drink water. Talk to me when you want to go again.');
  }
}

/** The raver at the lake on the Strand fished Ronny's hat out of the water. */
export async function poolHat(e: Entity | null) {
  if (state.mdStage !== 1) { await say(e?.lines?.[0] ?? 'Raver: The water is FREEZING. Ten out of ten.'); return; }
  await say('Raver: A bucket hat? This one? Fished it out of the lake an hour ago.');
  await say('Raver: Ronny\'s? Of course it is. Take it before it gets more cursed.');
  state.mdStage = 2; save(); renderCard();
  toast('GOT · A WET BUCKET HAT');
}

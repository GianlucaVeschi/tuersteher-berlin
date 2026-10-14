import { griess, rsoBar } from './rso';
import { fire, hgDj, karaoke, woody } from './heide';
import { cdvBar, ines, jazz, planks, willow } from './cdv';
import { antonio, salonChair, salonEnter } from '../places/salon';
import type { Act } from '../types';
import { releaseFollower } from '../interiors/follower';
import { sceneClub, sceneFloor } from '../world/scenes';
import { INTERIORS } from '../data/interiors';
import { startK } from '../effects/trip';
import { RT } from '../core/runtime';
import { CARRY_MAX, PFAND_GOAL, euro } from './sisyphos';
import { renderCard } from '../ui/card';
import { save } from '../core/save';
import { player, state } from '../core/state';
import { completeQuest, questDone } from './quests';
import { pick, reduceMotion, wait } from '../util';
import { fade, toast } from '../interiors/transitions';
import { ask, closeBox, say } from '../ui/dialog';
import { PILE_LINES, showPhotoStrip, spankFx } from './kitkat';
/** Quest handlers, looked up by the `act` name on people and tiles in data/interiors.ts. */
export const ACTS: Record<string, Act> = {
  // RSO and Heideglühen (quests/rso.ts, quests/heide.ts)
  griess, rsoBar, hgDj, woody, karaoke, fire,
  // Club der Visionäre (quests/cdv.ts)
  cdvBar, ines, planks, willow, jazz,
  // Antonio's salon (places/salon.ts)
  antonio, salonChair, salonEnter,
  async pile(e, clubId) {
    if (!e) return;
    const L = (e.join && PILE_LINES[e.join]) || PILE_LINES.busy;
    await say(L.look);
    await say(L.hi);
    if (e.join === 'busy') return;
    const a = await ask('', ['Can I join? If everyone is into it', 'Just watch, if that\'s okay', 'Sorry, wrong corner']);
    if (a === 2) { await say('Them: No worries! Bye!'); return; }
    if (a === 1) { await say('Them: Watching is fine. No touching, no photos. Enjoy the show.'); return; }
    if (L.ok) await say(L.ok);
    if (e.join !== 'yes') return;
    closeBox();
    await fade(true);
    await wait(reduceMotion ? 300 : 1200);
    await fade(false);
    if (L.after) await say(L.after);
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
    const dirs = ['down', 'left', 'up', 'right'] as const;
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
    await say('(The love swing. There\'s a small queue and a sign: "Ask the person before you how to get out.")');
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
    if (!questDone(clubId, 'spank')) { await say('(A photo booth with a red velvet curtain. A handwritten sign: "Ask Marco first.")'); return; }
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
    if (!e || !e.story) return;
    const lines = INTERIORS[clubId].stories?.[e.story] || [];
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
    RT.steamUntil = RT.clock + 9000;
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
    if (!e) return;
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
    if (e.movedTo) { e.x = e.movedTo[0]; e.y = e.movedTo[1]; }
    e.dir = 'right';
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
    if (!e) return;
    if (clubId === 'berghain' && state.kStage === 1 && Math.random() < 0.6) {
      await say(pick(['Raver: K? Not me, sorry.', 'Raver: Pink hair? Saw her by the speakers on the left.', "Raver: Mila? She's always dancing near the left speakers."]));
    } else if (e.lines) await say(e.lines[0]);
  },
  async awareness() {
    await say("Awareness: We're the awareness team. If anything feels wrong, come find us.");
    await say('Awareness: Drink water, take breaks, look out for each other.');
  },
  async sascha(e, clubId) {
    if (!e) return;
    if (questDone(clubId, 'darkroom')) { await say('Sascha: That was fun. See you on the floor.'); return; }
    await say('Sascha: Hey. Having a good night?');
    const a = await ask('', ['Want to go somewhere darker?', 'Just saying hi']);
    if (a === 1) { await say('Sascha: Hi back.'); return; }
    const b = await ask('Sascha: Maybe. How do you ask?', ['Only if you want to', 'Grab their hand and go']);
    if (b === 1) { await say('Sascha: Whoa. Ask first.'); return; }
    await say('Sascha: I do. Lead the way. The darkroom is on the ground floor.');
    RT.ents.splice(RT.ents.indexOf(e), 1);
    if (!e.look) return;
    RT.follower = { name: 'Sascha', look: e.look, quest: 'darkroom', ent: e, homeScene: RT.scene, x: e.x, y: e.y, px: e.x, py: e.y, dir: 'down' };
    toast('Sascha follows you');
  }
};
export async function darkroomScene() {
  const clubId = sceneClub();
  const f = RT.follower;
  if (!f) return;
  RT.busy = true;
  await fade(true);
  await say(`(It's very dark. ${f.name} squeezes your hand.)`);
  await say('(What happens in the darkroom stays in the darkroom.)');
  closeBox();
  releaseFollower();
  await fade(false);
  await completeQuest(clubId, 'darkroom');
  closeBox();
  RT.busy = false;
}

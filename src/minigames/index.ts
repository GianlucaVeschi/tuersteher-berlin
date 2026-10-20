/* ================= MINI GAMES ================= */
// Every mini game lives in this folder. Each one is 30 seconds long, runs on its own canvas overlay
// (index.html), takes over the buttons through `RT.runner` while it runs, and is started by a person
// with a red "!" over their head (markers.ts) once the quest chain in src/quests/ leads there.
// All of them can be replayed after the first time; a replay never changes quest state.
//
//   khole.ts   Berghain, toilet guy (quests/acts.ts)    the K-hole: walk the melting club in 3D
//   runner.ts  Sisyphos, Ronny (quests/mdma.ts)          Ringbahn runner: Temple Run in an S-Bahn
//   djgame.ts  Heideglühen, the DJ (quests/heide.ts)     DJ set: rhythm game for the crowd
//   lsd.ts     Club der Visionäre, Flo (quests/cdv.ts)   LSD dive: swim the canal in 3D
//   markers.ts which people get the red "!" (ACT_QUEST)
export { playKHole } from './khole';
export { playRunner } from './runner';
export { playDjSet } from './djgame';
export { playLsd } from './lsd';
export { hasQuest } from './markers';

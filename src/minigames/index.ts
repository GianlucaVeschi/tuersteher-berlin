/* ================= MINI GAMES ================= */
// Every mini game lives in this folder. Each one is 30 seconds long (Neon Golf: a minute), runs on its own canvas overlay
// (index.html), takes over the buttons through `RT.runner` while it runs, and is started by a person
// with a red "!" over their head (markers.ts) once the quest chain in src/quests/ leads there.
// All of them can be replayed after the first time; a replay never changes quest state.
//
//   khole.ts   Berghain, toilet guy (quests/acts.ts)    the K-hole: walk the melting club in 3D
//   runner.ts  Sisyphos, Ronny (quests/mdma.ts)          Ringbahn runner: Temple Run in an S-Bahn
//   djgame.ts  Heideglühen, the DJ (quests/heide.ts)     DJ set: rhythm game for the crowd
//   lsd.ts     Club der Visionäre, Flo (quests/cdv.ts)   LSD dive: swim the canal in 3D
//   golf.ts    the minigolf in Görli, the desk (places/goerli.ts)   Neon Golf: one minute, as many holes as you can
//   tower.ts   the Fernsehturm, the lift attendant (world/street.ts)   not a game: the 360° view from the top
//   markers.ts which people get the red "!" (ACT_QUEST)
export { playKHole } from './khole';
export { playRunner } from './runner';
export { playDjSet } from './djgame';
export { playLsd } from './lsd';
export { playGolf } from './golf';
export { playTower } from './tower';
export { hasQuest } from './markers';

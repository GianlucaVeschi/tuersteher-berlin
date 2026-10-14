import type { Place, PlaceDef } from '../types';

/* Buildings you can walk straight into: no bouncer, no stamp, no quests needed.
   Each one has an INTERIORS entry (data/interiors.ts) with the same id for its inside.
   The door is at the bottom centre; you come back out in front of it. */
const PLACE_DEFS: PlaceDef[] = [
  // Antonio's: a hair salon left of Sisyphos, run by the trendiest hairdresser in town
  { id: 'salon', name: "Antonio's", x: 55, y: 17, w: 3, h: 3, v: 2, band: '#ff2bd6', ink: '#fff200', label: 'FRISEUR', enter: 'salonEnter' }
];
export const PLACES: Place[] = PLACE_DEFS.map(p => ({ ...p, dx: p.x + Math.floor(p.w / 2), doorY: p.y + p.h - 1, by: p.y + p.h }));

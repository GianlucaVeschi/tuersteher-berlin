import type { Place, PlaceDef } from '../types';

/* Buildings you can walk straight into: no bouncer, no stamp, no quests needed.
   Each one has an INTERIORS entry (data/interiors.ts) with the same id for its inside.
   The door is at the bottom centre; you come back out in front of it. */
const PLACE_DEFS: PlaceDef[] = [
  // Antonio's: a hair salon left of Sisyphos, run by the trendiest hairdresser in town
  { id: 'salon', name: "Antonio's", x: 55, y: 17, w: 3, h: 3, v: 2, band: '#ff2bd6', ink: '#fff200', label: 'FRISEUR', enter: 'salonEnter' },
  // La Maison: a café and boulangerie further east on Paul-Lincke-Ufer, terrace on the canal (researched)
  { id: 'maison', name: 'La Maison', x: 63, y: 43, w: 4, h: 3, v: 1, band: '#2b4c7a', ink: '#f3eee3', label: 'LA MAISON' },
  // Ankerklause: the sailors' pub at Kottbusser Brücke, in an old steamer landing right on the water (researched)
  { id: 'anker', name: 'Ankerklause', x: 41, y: 49, w: 4, h: 3, v: 0, band: '#1f2f4d', ink: '#ffd23f', label: 'ANKERKLAUSE' },
  // black-light minigolf in Görlitzer Park: 18 neon holes indoors (researched)
  { id: 'minigolf', name: 'Minigolf', x: 51, y: 64, w: 5, h: 3, v: 1, band: '#14121c', ink: '#39ff14', label: 'MINIGOLF' }
];
export const PLACES: Place[] = PLACE_DEFS.map(p => ({ ...p, dx: p.x + Math.floor(p.w / 2), doorY: p.y + p.h - 1, by: p.y + p.h }));

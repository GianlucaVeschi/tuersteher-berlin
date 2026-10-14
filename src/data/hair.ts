import type { HairStyle } from '../types';

/* Haircuts at Antonio's salon. `look` replaces the hair parts of the player's character
   (colour, length, mohawk, bald); clothes and the rest of the body stay. */
export const HAIRSTYLES: Record<string, HairStyle> = {
  punky: { name: 'Punky', look: { hair: '#ff2bd6', mohawk: true, long: false, bald: false } },
  blond: { name: 'Long blond', look: { hair: '#f2d06b', long: true, mohawk: false, bald: false } },
  buzz: { name: 'Buzz cut', look: { bald: true, long: false, mohawk: false } }
};

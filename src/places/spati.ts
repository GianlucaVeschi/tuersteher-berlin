import { ask, say } from '../ui/dialog';
import type { Entity } from '../types';

/* ---- Erkahn's Späti on Warschauer Straße ---- */
// You take what you want from the fridge and the chips shelf yourself, then pay Erkahn at the counter.
// Tobacco is behind the counter, so you ask him for it. No prices: the game has no money.

interface Item { name: string; pfand?: boolean }
const BEER: Item[] = [
  { name: 'Sterni', pfand: true }, { name: 'Berliner Pilsner', pfand: true }, { name: 'Augustiner', pfand: true },
  { name: 'Capri-Sonne' }, { name: 'Club-Mate', pfand: true }
];
const CHIPS: Item[] = [{ name: 'paprika chips' }, { name: 'salted chips' }, { name: 'sour cream chips' }, { name: 'Erdnussflips' }];
const TOBACCO: Item[] = [{ name: 'Blue Pueblo' }, { name: 'Papers and Filters' }, { name: 'A lighter' }];
/** Choices always start with a capital letter. */
const label = (i: Item) => i.name[0].toUpperCase() + i.name.slice(1);

/** What you're carrying to the counter. Emptied when you come in and when you pay. */
let basket: Item[] = [];

/** Walking in: Erkahn looks up from his phone. */
export async function spatiEnter() {
  basket = [];
  await say('Erkahn: Na? Take what you need. I am right here.');
}

async function take(text: string, items: Item[], close: string, what: string) {
  const it = items[await ask(text, [...items.map(label), close])];
  if (!it) return;
  basket.push(it);
  await say(`(You take ${what} ${it.name}.)`);
}
/** The beer fridge. */
export async function spatiFridge() { await take('(The fridge hums. Which one?)', BEER, 'Close the fridge', 'a cold'); }
/** The chips shelf. */
export async function spatiChips() { await take('(Crinkly bags, every flavour.)', CHIPS, 'Leave them', 'a bag of'); }

/** Erkahn at the counter: tobacco on request, then you pay. */
export async function erkahn(_e: Entity | null) {
  const a = await ask(basket.length ? 'Erkahn: Anything else?' : 'Erkahn: What do you need?', [basket.length ? 'That is all' : 'Just looking', 'Tobacco, please']);
  if (a === 1) {
    const b = await ask('Erkahn: Which one?', [...TOBACCO.map(label), 'Nothing']);
    if (TOBACCO[b]) basket.push(TOBACCO[b]);
  }
  if (!basket.length) { await say('Erkahn: Take your time. Fridge is on the left.'); return; }
  const pay = await ask(basket.some(i => i.pfand) ? 'Erkahn: That is it? Plus Pfand.' : 'Erkahn: That is it?', ['Pay cash', 'Pay by card']);
  if (pay === 1) await say('Erkahn: Card? Cash, my friend. Always cash.');
  await say('(You pay in coins. Erkahn gives you change without counting.)');
  await say('Erkahn: Schönen Abend!');
  basket = [];
}

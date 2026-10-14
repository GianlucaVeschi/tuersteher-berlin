/* Names on the public guest list: trimmed, short, and without slurs or obvious insults.
   firestore.rules (nameOk) enforces the same lists on the server; keep both in sync. */

// matched anywhere in the name (letters only, lowercase)
const NEVER = ['nigg', 'fagg', 'hitler', 'nazi', 'kanake', 'neger', 'cunt', 'fotze', 'retard'];
// matched as whole words only, so e.g. "Marschall" is fine
const NOT_AS_WORD = ['fuck', 'shit', 'arsch', 'wichser', 'spast', 'schlampe', 'hure', 'bitch', 'dick', 'penis', 'porn', 'sex'];

export const NAME_MAX = 16;

/** Returns the cleaned name, or a short reason why it can't be used. */
export function checkName(raw: string): { ok: true; name: string } | { ok: false; reason: string } {
  const name = raw.replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, NAME_MAX);
  if (!name) return { ok: false, reason: 'Type a name first.' };
  const letters = name.toLowerCase().replace(/[^a-zäöüß]/g, '');
  const words = name.toLowerCase().split(/[^a-zäöüß]+/).filter(Boolean);
  if (NEVER.some(w => letters.includes(w)) || words.some(w => NOT_AS_WORD.includes(w))) {
    return { ok: false, reason: 'The bouncer says no to that name. Try another.' };
  }
  return { ok: true, name };
}

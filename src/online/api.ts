// Firebase over plain REST (no SDK, a few kB instead of ~80 kB):
// anonymous login gives every player a unique id, Firestore holds one public document per player.
// The web config is not a secret: it only names the project. firestore.rules decides what is allowed.

export const FIREBASE = {
  apiKey: 'AIzaSyAc-fekzVgfFA_2ubC57PpNLzXxCq6k48k',
  projectId: 'berlin-club-game'
};

// ?emulator talks to the local Firebase emulators instead (firebase emulators:start), for development
const EMULATOR = /[?&]emulator\b/.test(location.search);
const AUTH_URL = EMULATOR ? 'http://127.0.0.1:9099/identitytoolkit.googleapis.com' : 'https://identitytoolkit.googleapis.com';
const TOKEN_URL = EMULATOR ? 'http://127.0.0.1:9099/securetoken.googleapis.com' : 'https://securetoken.googleapis.com';
const FS_URL = EMULATOR ? 'http://127.0.0.1:8080' : 'https://firestore.googleapis.com';
const CREDS_KEY = EMULATOR ? 'tuersteher-online-emulator' : 'tuersteher-online';
const DB = `${FS_URL}/v1/projects/${FIREBASE.projectId}/databases/(default)/documents`;
const DOC_NAME = (uid: string) => `projects/${FIREBASE.projectId}/databases/(default)/documents/players/${uid}`;

interface Creds { uid: string; refreshToken: string; created: boolean }
let creds: Creds | null = readCreds();
let idToken = '';
let idTokenExp = 0;

function readCreds(): Creds | null { try { return JSON.parse(localStorage.getItem(CREDS_KEY) || 'null'); } catch { return null; } }
function writeCreds() { try { if (creds) localStorage.setItem(CREDS_KEY, JSON.stringify(creds)); else localStorage.removeItem(CREDS_KEY); } catch { /* storage blocked */ } }

/** This browser's player id, if it has signed in before. */
export const myUid = () => creds?.uid ?? null;
/** Forget the login (Start over makes a new player entry). */
export function forgetPlayer() { creds = null; idToken = ''; idTokenExp = 0; writeCreds(); }

/** A valid ID token, signing in anonymously the first time and refreshing when it expires. */
async function token(): Promise<string> {
  if (idToken && Date.now() < idTokenExp - 60_000) return idToken;
  if (creds) {
    const r = await fetch(`${TOKEN_URL}/v1/token?key=${FIREBASE.apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: creds.refreshToken })
    });
    if (r.ok) {
      const j = await r.json() as { id_token: string; refresh_token: string; expires_in: string };
      idToken = j.id_token; idTokenExp = Date.now() + Number(j.expires_in) * 1000;
      creds.refreshToken = j.refresh_token; writeCreds();
      return idToken;
    }
    forgetPlayer(); // refresh token revoked or project reset: start a fresh anonymous player
  }
  const r = await fetch(`${AUTH_URL}/v1/accounts:signUp?key=${FIREBASE.apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true })
  });
  if (!r.ok) throw new Error('anonymous sign-in failed: ' + r.status);
  const j = await r.json() as { idToken: string; refreshToken: string; localId: string; expiresIn: string };
  creds = { uid: j.localId, refreshToken: j.refreshToken, created: false };
  idToken = j.idToken; idTokenExp = Date.now() + Number(j.expiresIn) * 1000;
  writeCreds();
  return idToken;
}

/* ---------- Firestore values ---------- */
type FsValue = { stringValue: string } | { integerValue: string } | { nullValue: null } | { timestampValue: string } | { arrayValue: { values?: FsValue[] } };
export type Plain = string | number | null | string[];
const enc = (v: Plain): FsValue =>
  v === null ? { nullValue: null }
    : Array.isArray(v) ? { arrayValue: { values: v.map(s => ({ stringValue: s })) } }
    : typeof v === 'number' ? { integerValue: String(Math.round(v)) }
    : { stringValue: v };
function dec(v: FsValue | undefined): string | number | null | string[] {
  if (!v) return null;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(x => ('stringValue' in x ? x.stringValue : ''));
  return null;
}

/**
 * Writes your own player document. `fields` are set as given; `serverTimes` are set to the
 * server's clock (createdAt only on the very first write, lastSeen always, finishedAt once).
 */
export async function writePlayer(fields: Record<string, Plain>, opts: { finish?: boolean } = {}, keepalive = false) {
  const tok = await token();
  if (!creds) return;
  const serverTimes = ['lastSeen'];
  if (!creds.created) serverTimes.push('createdAt');
  if (opts.finish) serverTimes.push('finishedAt');
  const all: Record<string, Plain> = { ...fields };
  if (!creds.created && !opts.finish) all.finishedAt = null;
  const body = {
    writes: [{
      update: { name: DOC_NAME(creds.uid), fields: Object.fromEntries(Object.entries(all).map(([k, v]) => [k, enc(v)])) },
      updateMask: { fieldPaths: Object.keys(all) },
      updateTransforms: serverTimes.map(fieldPath => ({ fieldPath, setToServerValue: 'REQUEST_TIME' }))
    }]
  };
  const r = await fetch(`${DB}:commit`, {
    method: 'POST', keepalive,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error('write failed: ' + r.status + ' ' + (await r.text()).slice(0, 200));
  if (!creds.created) { creds.created = true; writeCreds(); }
}

export interface PlayerRow {
  uid: string;
  name: string;
  char: string;
  createdAt: string | null;
  lastSeen: string | null;
  clubs: string[];
  stamps: number;
  quests: number;
  playMs: number;
  finishedAt: string | null;
  finishPlayMs: number | null;
}

/** Everyone who has played (public read, no login needed). */
export async function listPlayers(): Promise<PlayerRow[]> {
  const rows: PlayerRow[] = [];
  let pageToken = '';
  for (let page = 0; page < 10; page++) {
    const r = await fetch(`${DB}/players?pageSize=300${pageToken ? '&pageToken=' + encodeURIComponent(pageToken) : ''}`);
    if (!r.ok) throw new Error('list failed: ' + r.status);
    const j = await r.json() as { documents?: { name: string; fields: Record<string, FsValue> }[]; nextPageToken?: string };
    for (const d of j.documents || []) {
      const f = d.fields || {};
      const str = (k: string) => { const v = dec(f[k]); return typeof v === 'string' ? v : null; };
      const num = (k: string) => { const v = dec(f[k]); return typeof v === 'number' ? v : 0; };
      const clubs = dec(f.clubs);
      rows.push({
        uid: d.name.split('/').pop() || '',
        name: str('name') || '?', char: str('char') || '',
        createdAt: str('createdAt'), lastSeen: str('lastSeen'),
        clubs: Array.isArray(clubs) ? clubs : [], stamps: num('stamps'), quests: num('quests'), playMs: num('playMs'),
        finishedAt: str('finishedAt'), finishPlayMs: f.finishPlayMs && 'integerValue' in f.finishPlayMs ? num('finishPlayMs') : null
      });
    }
    if (!j.nextPageToken) break;
    pageToken = j.nextPageToken;
  }
  return rows;
}

# CLAUDE.md

Notes for agents working on **Türsteher Berlin**, a Pokémon-style pixel game in the browser. You walk around a night map of Berlin, change clothes in shops, pass bouncers' dress codes and quizzes at eight real clubs, and do side quests inside Berghain, Sisyphos, KitKat, RSO and Heideglühen. `README.md` is the player- and editor-facing guide; this file is about how the code works and how to change it safely.

## Stack and commands

- TypeScript (strict) + Vite. No framework, no runtime dependencies. Plain Canvas 2D and DOM.
- npm (not pnpm; the owner chose to stay on npm). Node 18+.

```bash
npm install
npm run dev         # http://localhost:5173, live reload
npm run typecheck   # tsc --noEmit, strict + noUnusedLocals
npm run build       # typecheck, then vite build into dist/
npm run preview     # serve dist/
```

Always run `npm run typecheck` and `npm run build` before committing. Both must pass.

## Deploy

- Live: https://gianlucaveschi.github.io/tuersteher-berlin/
- `.github/workflows/deploy.yml` builds and publishes `dist/` to GitHub Pages on every push to `main`. Pages source must be set to **GitHub Actions** (not "deploy from branch"); serving the repo root directly does not work because `index.html` loads `/src/main.ts`.
- `vite.config.ts` sets `base: './'` so assets resolve under `/tuersteher-berlin/`. Keep it.
- Do not push, merge to `main`, or change Pages settings without the user's go-ahead.

## Architecture

### Entry and start-up order (`src/main.ts`)

```
buildCity()       world/city.ts      paint the street map, create street people (RT.ents)
initCityScene()   world/scenes.ts    register SCENES.city (needs map, ents and RT.mc)
initCanvas()      render/canvas.ts   size the canvas to the screen, ResizeObserver
initInput()       input.ts           keyboard, touch, wheel, on-screen buttons
initCard()        ui/card.ts         "Start over" button
start()           game/loop.ts       load save, wait for the font, prerender, start the frame loop
```

**Rule: modules must not have load-time side effects that depend on other modules.** The module graph has import cycles (UI ↔ scripts ↔ input ↔ quests). Function declarations are safe across cycles; top-level `const` values used at load time are not. Anything that needs other modules at load time (registering listeners, building maps, reading other modules' data) goes into an `init*()` / `build*()` function called from `main.ts`. Top-level `$('#id')` lookups are fine (`util.ts` is a leaf and the DOM exists before module scripts run).

### Shared mutable state: `RT` (`src/core/runtime.ts`)

ES module imports are read-only bindings, so every value that gets **reassigned** from more than one module lives on the `RT` object: current scene (`map`, `MW`, `MH`, `ents`, `mc`, `scene`), view size (`VW`, `VH`), `busy`, `titleOn`, open UI (`ui`, `typing`, `shopUI`, `creator`, `insideResolve`, `photoResolve`), `follower`, `touch`, run keys, effect timers (`tripUntil`, `kStart`, `kUntil`, `steamUntil`), `clock`, and the map-art RNG `seed`. If you add a value that several modules reassign, put it on `RT` and type it there. Objects that are only mutated (not reassigned) can be ordinary exports, e.g. `state`, `player`, `held`, `zoom`, `train`.

`RT.busy` is true while a script, menu or transition has control; movement and talking are blocked while it is set. Every `async` script must set it back to `false` (use `try { … } finally { closeBox(); RT.busy = false; }` as `interact()` does).

### Scenes

The street (`'city'`) and every club floor (`'berghain:mf'`, `'sisyphos:strand'`, …) is a `Scene` in `SCENES` (`world/scenes.ts`). `useScene(id)` points `RT.map/MW/MH/ents/mc` at it. `inClub()`, `sceneClub()`, `sceneFloor()` read the current one. Club floors are `ClubScene`s (always have `club`, `floor`, `dance` bounding box). `get(x, y)` / `set` in `world/grid.ts` always act on the current scene; out of bounds counts as solid.

### Rendering

- Tiles are 16 px. The desktop view is 384×256 (24×16 tiles); on phones `fitCanvas()` picks an integer scale and a view size that fits the screen.
- Each scene's static tiles are drawn **once** into its own canvas (`RT.mc`): the street by `prerender()` in `render/cityTiles.ts`, club floors by `drawInteriorTiles()` in `interiors/tiles.ts`. Each frame copies the visible part, then draws animated things and people on top (`render/draw.ts` for the street, `interiors/fx.ts` for club floors).
- People are drawn by `person()` in `render/sprites.ts` from a `Look` (colours plus flags like `long`, `glasses`, `harness`). The player's look is `lookOf(state.outfit)` (`render/looks.ts`): character body + outfit.
- Zoom: `draw()` scales the whole world pass with `setTransform` and temporarily sets `RT.VW/VH` to the visible world size, so everything inside draws in world pixels. Map labels and the YOU marker are drawn afterwards in screen space.
- The Fernsehturm is drawn into `towerC`; the footprint goes into the static map, the tall part is drawn after the sprites so you walk behind it.
- Map art uses the seeded `rnd()`/`pick()` from `util.ts` so it looks identical on every load. Use `Math.random()` only for gameplay randomness (question order, coat ticket numbers).
- There are no image assets; everything is drawn with `fillRect`.

### Tiles (`src/world/tiles.ts`)

- Street tiles are 0–12 (`G` grass, `R` road, `S` sidewalk, `W` water, `B` building, `TR` tree, `BR` bridge, `C` club, `D` door, …). Note: `R` is the **road tile constant**, not the runtime object.
- Club floor tiles are 40+ and come from ASCII characters via `ICH` (char → id) / `ICHAR` (id → char). `SOLID`, `COUNTERS` (talk across them), `WALLISH` (drawn as walls), `DANCES` (press A to dance) and the door digits `1`–`9` (81–89) are defined there.
- **Adding a new interior tile** means: a char in `ICH`, solidity in `SOLID`/`WALLISH` if needed, a `case` in `drawInteriorTiles()`, and a legend line in `data/interiors.ts`.

### Game data (`src/data/`)

- `clubs.ts`: `CLUB_DEFS` (bouncer lines, question pools; the **first** answer is correct, shuffled in game) → `CLUBS` with computed door positions (`dx`, `doorY`, `by`). Also `INTRO`, `FINALE`.
- `outfits.ts`: `OUTFITS` (with `tags`), `CHARACTERS` (man/woman × 4; `body` survives clothes changes), `DRESS` (per-club `ok`/`no` tag rules, see `dressOK`), `SHOP_DEFS` → `SHOPS`.
- `interiors.ts`: `INTERIORS: Record<clubId, InteriorDef>`. Floors are ASCII maps with spawn points, stairs/door links (`up`, `down`, `doors`, `exit`), `people` (`lines` for chat or `act` for a handler), dancer count, bottles, decoration flags (`fairy`, `lanterns`, `uv`, `red`, `steam`, `daylight`). Also `examine` text per tile char, `examineActs`, `dancerLines`, `dancerPalette`, `quests`, `welcome`, `stories`. The data is type-checked against `InteriorDef` in `src/types.ts`. There are three legends in the file (Berghain at the top, extra ones for Sisyphos and KitKat further down).

### Quests

- Handlers are in `ACTS` (`src/quests/acts.ts`), typed `Act = (e: Entity | null, clubId) => Promise<void>`. `e` is the person talked to, or `null` when a tile's `examineActs` triggers it. Handlers that need a person guard with `if (!e) return;`.
- RSO and Heideglühen handlers live in `quests/rso.ts` and `quests/heide.ts` and are listed by name at the top of `ACTS` (function declarations, so the import cycle is safe). Heideglühen has its own night clock (`state.hgTime`, minutes after midnight, advanced by `hgTick()`) and quest stage (`state.hgStage`).
- Dancing on a `DANCES` tile runs `danceHere()` (`quests/dance.ts`); clubs can override via `DANCE_HOOKS` (`quests/sisyphos.ts`).
- Progress: `completeQuest(clubId, id)` sets `state.quests['club:id']`, shows a toast, re-renders the stamp card and saves. Live hints for counting quests come from `questHint()` (`quests/sisyphos.ts`).
- To give another club an interior: add an `INTERIORS` entry keyed by the club id, add handlers to `ACTS`, add quests to its `quests` list. `enterDoor()` automatically uses the interior instead of the short "inside" scene.

### The ending (`src/ui/ending.ts`)

`maybeFinale()` (game/scripts.ts) runs after every new stamp; with all clubs stamped it shows `FINALE` and then `playEnding()`: a bedroom drawn on its own canvas (`#endCanvas`, 192×128, animated with its own requestAnimationFrame loop), the CONGRATULATIONS title, and the roast in the normal dialog box (the `#ending` overlay sits before `#dialog` in the DOM so the box stays on top). `roast()` builds lines from `state` (Pfand cents, `hgStage`). `RT.ending` switches the music to the `home` style. "Start over" calls `resetGame()` from ui/card.ts. `?debug`: `__game.ending()` plays it any time.

### Music (`src/audio/`)

- No audio files: `synth.ts` makes drums and instruments from Web Audio oscillators and noise (plus one shared generated reverb). `styles.ts` describes each style as data (bpm, swing, 16-step patterns, bass steps, chords, stab/piano/pad/arp, rumble, reverb, dub delay, a wall `cutoff`). `music.ts` runs one style at a time with a look-ahead scheduler and crossfades when the target changes.
- `updateMusic()` runs every frame and picks the style: title/creator → `city`; a club's entrance scene (`RT.overlayClub`, set by `showInside()`) → `styleForClub`; a club floor → `styleForScene` (with `MUFFLED` floors playing another floor's style through a lowpass); otherwise `city`.
- Audio only starts after a real user gesture (`initMusic()` listens for the first pointer/key event). Sound on/off is the ♪ button or N, stored in `localStorage['tuersteher-sound']`. The context is suspended while the tab is hidden.
- A new club or floor needs a style in `STYLES` and an entry in `FLOOR_STYLE` / `CLUB_STYLE`.
- `?debug`: `__game.music.force('panorama')` forces a style (`null` to stop forcing), `.key` is what's playing, `.level()` reads the output peak/RMS (call it twice; the meter is created on first use), `.styles()` lists ids.

### Saving (`src/core/save.ts`)

- `localStorage['tuersteher-save']` holds `SaveData` (`GameState` + zoom + position). Saves happen after stamps, quests, shop changes, every 8 steps, on page hide, and on zoom.
- Inside a club the saved position is the pavement in front of that club's door, so a reload puts you back on the street.
- **Keep the save format backwards compatible**: add new fields with defaults in `applySave()`; don't rename existing ones (players have saves from earlier versions).

### Input

`pressA` / `pressB` / `pressDir` in `input.ts` route to whatever is open, in this order: title → character creator → photo strip → club entrance scene → shop → dialog → world. Arrows/WASD move, Z/Enter/Space = A, X/Esc = B, Tab/Shift (or holding B on touch) = run, +/−/wheel = zoom, M = map, N = sound. On touch, dragging on the map is a joystick and a tap is A.

## Conventions

- Strict TypeScript, no `any`. Shared shapes go in `src/types.ts`. Prefer explicit null guards over `!`, except for DOM elements that are always in `index.html` (`$<HTMLCanvasElement>('#id')`, `getContext('2d')!`).
- Data-driven: new clubs, outfits, shops, floors, people and quests should mostly be data, plus a handler in `ACTS` where needed.
- Comments explain *why* or describe game/real-world facts; match the existing density.
- UI text: short, plain English, German words where a Berlin local would use them (Heute nicht, Garderobe, Späti, Pfand). Respect `reduceMotion` (no strobes, instant text, no spinning).
- Club facts (history, layout, dress codes, shops) are based on research; keep them accurate and mark anything dramatised.
- `style.css` is plain CSS loaded from `index.html`. The game screen uses container query units (`cqw`) so overlays scale with the screen; the phone layout is the `@media (max-width: 700px), (max-height: 500px)` block.

## Testing

There are no automated tests. Check changes in the browser:

1. `npm run dev`, open `http://localhost:5173/?debug`.
2. `?debug` exposes `window.__game` in the console: `player`, `state`, `held`, `busy`, `scene`, `follower`, `tp(x, y, dir)` (teleport), `enterClub(id)` (go inside a stamped club).
3. Useful flows to replay: new game (Start over twice) → character select → intro → dress-code rejection → shop → bouncer quiz → club entrance → quests on each floor → stairs → exit; zoom/map; phone width (375×812) and phone landscape (844×390).

Gotcha when driving the game from a browser automation pane: if the pane is hidden, `requestAnimationFrame` doesn't fire and nothing moves. Override it for the test session: `window.requestAnimationFrame = cb => setTimeout(() => cb(performance.now()), 16)`.

## History

The game started as a single `game.js` file and was split into modules by a compiler-assisted script (code moved verbatim; shared reassigned variables moved onto `RT`), then typed in strict mode. If something looks oddly structured (e.g. `RT.` prefixes everywhere, `init*()` wrappers), that is why.

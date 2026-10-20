# CLAUDE.md

Notes for agents working on **Türsteher Berlin**, a Pokémon-style pixel game in the browser. You walk around a night map of Berlin, change clothes in shops, pass bouncers' dress codes and quizzes at eight real clubs, and do side quests inside all eight clubs (Berghain, Sisyphos, KitKat, RSO, Heideglühen, Club der Visionäre, Tresor and Kater Blau). `README.md` is the player- and editor-facing guide; this file is about how the code works and how to change it safely.

## Stack and commands

- TypeScript (strict) + Vite. No framework. Plain Canvas 2D and DOM. The only runtime dependency is `@datadog/browser-rum` (monitoring).
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

ES module imports are read-only bindings, so every value that gets **reassigned** from more than one module lives on the `RT` object: current scene (`map`, `MW`, `MH`, `ents`, `mc`, `scene`), view size (`VW`, `VH`), `busy`, `titleOn`, open UI (`ui`, `typing`, `shopUI`, `creator`, `insideResolve`, `photoResolve`), `follower`, `touch`, run keys, effect timers (`kStart`, `kUntil`, `steamUntil`), `clock`, and the map-art RNG `seed`. If you add a value that several modules reassign, put it on `RT` and type it there. Objects that are only mutated (not reassigned) can be ordinary exports, e.g. `state`, `player`, `held`, `zoom`, `train`.

`RT.busy` is true while a script, menu or transition has control; movement and talking are blocked while it is set. Every `async` script must set it back to `false` (use `try { … } finally { closeBox(); RT.busy = false; }` as `interact()` does).

### Scenes

The street (`'city'`) and every club floor (`'berghain:mf'`, `'sisyphos:strand'`, …) is a `Scene` in `SCENES` (`world/scenes.ts`). `useScene(id)` points `RT.map/MW/MH/ents/mc` at it. `inClub()`, `sceneClub()`, `sceneFloor()` read the current one. Club floors are `ClubScene`s (always have `club`, `floor`, `dance` bounding box). `get(x, y)` / `set` in `world/grid.ts` always act on the current scene; out of bounds counts as solid.

### Rendering

- Tiles are 16 px. The desktop view is 384×256 (24×16 tiles); on phones `fitCanvas()` picks an integer scale and a view size that fits the screen.
- The canvas backing store is in **device pixels**: `PX` (render/canvas.ts) device pixels per game pixel, an integer, so pixels stay sharp on 2×/3× screens. `draw()` sets `ctx.setTransform(PX * zoom, …)` for the world and `PX` for the screen-space labels; all drawing code works in game pixels (`RT.VW/VH`). Never reset the main canvas transform to identity inside drawing code.
- Map labels: on phones (`MOBILE`) club/shop names only show in the MAP view, otherwise they cover the screen.
- HUD: one small box in the corner on desktop and phones (`#hud`: STEMPEL n/8, plus `#hudRoom` inside clubs, e.g. "STEMPEL 6/8 · ROBUS"; filled by `renderCard()` and `updateFloorTag()`). On desktop it fades while you walk under it (`ui/hud.ts`). The old `#floorTag` box is no longer shown.
- Phones can't zoom the page: Safari ignores `user-scalable=no`, so `blockPageZoom()` (input.ts) cancels Safari's `gesture*` events and two-finger moves, the handheld has `touch-action: none` and the rest of the page `manipulation` (no double-tap zoom). Scroll boxes inside still scroll. Text inputs stay at 16px or iOS zooms on focus.
- Phones: the side quests also open from the QUESTS button on the game screen (`ui/missions.ts`, CSS shows it only in the phone layout). `updateQuestsBtn()` runs from `renderCard()` and `updateFloorTag()`. Both lists put the club you're in first: the stamp card re-renders when you walk into or out of a club (`updateFloorTag()`), and opening it on a phone (`showCardQuests()`) scrolls the sheet to that club's quests (`.qclub.here`).
- Each scene's static tiles are drawn **once** into its own canvas (`RT.mc`): the street by `prerender()` in `render/cityTiles.ts`, club floors by `drawInteriorTiles()` in `interiors/tiles.ts`. Each frame copies the visible part, then draws animated things and people on top (`render/draw.ts` for the street, `interiors/fx.ts` for club floors).
- People are drawn by `person()` in `render/sprites.ts` from a `Look` (colours plus flags like `long`, `glasses`, `harness`). The player's look is `lookOf(state.outfit)` (`render/looks.ts`): character body + outfit.
- Zoom: `draw()` scales the whole world pass with `setTransform` and temporarily sets `RT.VW/VH` to the visible world size, so everything inside draws in world pixels. Map labels and the YOU marker are drawn afterwards in screen space.
- The Fernsehturm is drawn into `towerC`; the footprint goes into the static map, the tall part is drawn after the sprites so you walk behind it.
- Map art uses the seeded `rnd()`/`pick()` from `util.ts` so it looks identical on every load. Use `Math.random()` only for gameplay randomness (question order, coat ticket numbers).
- There are no image assets; everything is drawn with `fillRect`.

### Tiles (`src/world/tiles.ts`)

- Yellow "go this way" arrows (`drawArrow()` in render/arrow.ts; bob towards where they point, still under reduceMotion). On the street: one on the pavement in front of every club's bouncer, pointing at the door, always (also after you got in). Inside: `wayArrows()` (interiors/arrows.ts) puts one in front of every way out of a floor (stairs, doorway digits, exit; same rules as the floor change in game/loop.ts), on the free tile next to it closest to its middle, worked out once per floor. New stairs or doors get an arrow automatically.
- The street map is 72×76 tiles (`CITY_W`, `CITY_H`). North to south: Berghain, RSO, Kater Blau and Sisyphos; the Spree; the Landwehrkanal; Görlitzer Park in the middle; then Tresor, KitKat, CDV and Heideglühen with Coexist, Voo and the Späti (the Flutgraben runs on below Görli, past the CDV deck). Saves carry `map` (`MAP_VERSION` in core/save.ts); a save without it is from the old layout (canal and Görli at the bottom) and its row is moved by `fromMap1()`. If you move things on the map again, bump `MAP_VERSION` and add the same kind of mapping. Görlitzer Park (`GORLI`, `buildGorli()` in world/city.ts: fence `FN` with open gates, the Kuhle `KU`, `BK` basketball, `FB` football, `SK` skate park, `GRL` grills, `OT` old rails, `TW` towels, farm animals as entity kind `animal` with a `species`, drawn by `drawAnimal()` in render/draw.ts; grill smoke by `drawSmoke()`; people in data/npcs.ts, handlers in `places/goerli.ts` registered in `STREET_ACTS`; the minigolf is a walk-in place). The canal terraces (`buildTerraces()`: cobbles `TER`, tables `ATB`/`MTB`, parasol `UMB`; awnings via `awning` on a place) sit in front of La Maison and the Ankerklause. The strip between the Spree and Görli is the Landwehrkanal (`CANAL` in world/city.ts): promenades on both banks, the canal joining the Flutgraben, road bridges where the vertical roads cross (Admiralbrücke on the west one).
- Street tiles are 0–12 (`G` grass, `R` road, `S` sidewalk, `W` water, `B` building, `TR` tree, `BR` bridge, `C` club, `D` door, …). Note: `R` is the **road tile constant**, not the runtime object.
- Club floor tiles are 40+ and come from ASCII characters via `ICH` (char → id) / `ICHAR` (id → char). `SOLID`, `COUNTERS` (talk across them), `WALLISH` (drawn as walls), `DANCES` (press A to dance) and the door digits `1`–`9` (81–89) are defined there.
- **Adding a new interior tile** means: a char in `ICH`, solidity in `SOLID`/`WALLISH` if needed, a `case` in `drawInteriorTiles()`, and a legend line in `data/interiors.ts`.

### Game data (`src/data/`)

- `clubs.ts`: `CLUB_DEFS` (bouncer lines, question pools; the **first** answer is correct, shuffled in game) → `CLUBS` with computed door positions (`dx`, `doorY`, `by`). Also `INTRO`, `FINALE`.
- `outfits.ts`: `OUTFITS` (with `tags`), `CHARACTERS` (man/woman/non-binary × the same four types: Trendy, Local Legend, Alternative, Tourist; step 1 options in `GENDERS`; `body` survives clothes changes; `OLD_CHARS` maps ids from older saves), `DRESS` (per-club `ok`/`no` tag rules, see `dressOK`), `SHOP_DEFS` → `SHOPS`.
- `interiors.ts`: `INTERIORS: Record<clubId, InteriorDef>`. Floors are ASCII maps with spawn points, stairs/door links (`up`, `down`, `doors`, `exit`), `people` (`lines` for chat or `act` for a handler), dancer count, bottles, decoration flags (`fairy`, `lanterns`, `uv`, `red`, `steam`, `fog`, `strobe`, `daylight`). `onFloorEnter()` (quests/quests.ts) runs floor-arrival events: the Panorama Bar sunrise and Tresor's tunnel quest. Also `examine` text per tile char, `examineActs`, `dancerLines`, `dancerPalette`, `quests`, `welcome`, `stories`. The data is type-checked against `InteriorDef` in `src/types.ts`. There are three legends in the file (Berghain at the top, extra ones for Sisyphos and KitKat further down).

### Street people (`src/data/npcs.ts`, `src/world/street.ts`)

- Everyone on the street except bouncers and signs is one entry in `NPCS` (`data/npcs.ts`): `id`, position, `look`, `lines`. `cityPeople()` turns them into entities with `npcId` and `home`.
- `leave: 'left' | 'right'` makes someone walk off after talking, fade out and stay gone (`state.gone[id]`, cleared by Start over). Freerk works this way.
- Custom behaviour: `act` plus a handler in `STREET_ACTS` (`world/street.ts`). `interact()` routes any entity with `npcId` to `streetTalk()`. Club quests stay in `quests/`.

### Places (`src/data/places.ts`, `src/places/`)

- Buildings you walk straight into, with no bouncer, stamp or welcome lines: Antonio's salon, La Maison and the Ankerklause (on the Landwehrkanal, `places/canal.ts`; the Ankerklause has a second room, the glass veranda over the canal, and all its lines are about how hard it is to get a table) the black-light minigolf in Görli (`places/goerli.ts`) and Erkahn's Späti (`places/spati.ts`: take beer from the fridge and chips from the shelf, ask for tobacco, pay at the counter). A `PLACES` entry (position, sign colours) gets a building and a door from `buildCity()`; walking onto the door runs `enterPlace()` (interiors/transitions.ts), which opens the `INTERIORS` entry with the same id. Leaving and saving use `doorOf()`, which finds a club or a place, so you come back out in front of the right door.
- Places aren't in `CLUBS`, so they never count towards stamps; leave their `quests` list empty unless they get real quests. Their handlers live in `src/places/` and are listed in `ACTS`.
- The salon: `state.hair` (a key of `HAIRSTYLES` in `data/hair.ts`, or null) overrides the character's hair in `lookOf()`. `mohawk` is a `Look` flag drawn by `person()`.

### Quests

- Handlers are in `ACTS` (`src/quests/acts.ts`), typed `Act = (e: Entity | null, clubId) => Promise<void>`. `e` is the person talked to, or `null` when a tile's `examineActs` triggers it. Handlers that need a person guard with `if (!e) return;`.
- RSO, Heideglühen, Club der Visionäre, Tresor and Kater Blau handlers live in `quests/rso.ts`, `quests/heide.ts`, `quests/cdv.ts`, `quests/tresor.ts` and `quests/katerblau.ts` and are listed by name at the top of `ACTS` (function declarations, so the import cycle is safe). CDV's dance hook moves the weekend on a day per dance on the deck (`state.danced['cdv:sat|sun|mon']`) and the bar is cash only (`state.cdvCash`: 0 not tried, 1 card refused, 2 borrowed from Ines, 3 spent). Heideglühen has its own night clock (`state.hgTime`, minutes after midnight, advanced by `hgTick()`, flavour only) and quest stage (`state.hgStage`: 0 not asked, 1 the DJ wants Woody gone, 2 Woody lured to the fire (he moves there via `movedWhen: 'woody'`), 3 set played). The set is `playDjSet()` (`minigames/djgame.ts`): a 30-second three-lane rhythm game over a perspective view of the crowd, on its own canvas `#djgame`, won if the crowd meter ends at 50 or more.
- **Mini games live in `src/minigames/`** (`index.ts` lists them and re-exports `playKHole`, `playRunner`, `playDjSet`, `playLsd`, `hasQuest`; import from `../minigames`). The quest chains that lead to them stay with their clubs in `src/quests/`. A new mini game: a file in `src/minigames/` with its own canvas overlay in `index.html`, an export in `index.ts`, a starter entry in `ACT_QUEST` (`markers.ts`), and the chain in the club's quest file.
- Berghain's lighting guy (`lights` in quests/acts.ts) sets `RT.lightShow` (strobe / deep red / total darkness, 20 seconds); `interiors/fx.ts` draws it on the main floor on top of the `beams` (with reduced motion the strobe becomes a steady wash).
- Berghain K trip: `playKHole()` (`minigames/khole.ts`), a 30-second first-person raycaster over the current floor's tile map (`RT.map`, walls = `SOLID` tiles, people = billboards with a z-buffer), with melting walls, wobble, ghost trails and a CSS hue/blur filter. You steer by holding directions, so it uses `RunnerHooks.release`. It replaced the old 2D K overlay.
- Sisyphos MDMA chain (`quests/mdma.ts`, `state.mdStage` 0–4): Ronny → the pool raver's hat → Ronny's pill → `playRunner()` (`minigames/runner.ts`), a 30-second pseudo-3D S-Bahn runner on its own canvas (`#runner`, 240 px wide, height from the screen's aspect, perspective via `sx()/sy()`). While it runs, `RT.runner` takes `pressA`/`pressDir` and the music plays `RT.runner.music` (default the `runner` style; the DJ set uses `heide`). It resolves true on a win; losing just lets you ask Ronny again.
- Mini-game markers: a red "!" bobs over people in clubs who start a mini game you haven't finished (`hasQuest()` in `minigames/markers.ts`, drawn by `questMark()` in interiors/fx.ts). Only real mini games, not every quest: currently the toilet guy at Berghain (K trip), Ronny at Sisyphos (MDMA runner), the DJ at Heideglühen (DJ set) and Flo at CDV (LSD dive). A new mini game's starter needs an entry in `ACT_QUEST`. All mini games are replayable: once the quest is done, the starter offers another round (`playKHole()` again, `takePill(…, true)`, `playSet(…, true)`), and a replay never changes quest state.
- CDV LSD dive (`flo()` in `quests/cdv.ts`, quest `lsd`): Flo by the water gives you a tab, the game canvas gets a hue-rotate filter, you stagger to the edge of the deck (breadth-first path to a tile next to `q` water) and "jump"; then `playLsd()` (`minigames/lsd.ts`), a 30-second first-person swim on its own canvas (`#lsd`, music style `lsd`): steer by holding directions or dragging, catch colour orbs (+1) and unicorns (+5), e-scooters and shopping carts cost 3. There is no losing; it resolves with the colours caught. You wake up lying in the middle of the dancefloor (`RT.lying` draws the player on their side), Security walks over and `leaveClub()` puts you out on the street.
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

### The guest list (`src/online/`, `src/ui/players.ts`, `firestore.rules`)

- Firebase project `berlin-club-game` (Firestore `(default)` in europe-west3, anonymous Authentication). The game uses **plain REST, no Firebase SDK**: `online/api.ts` signs in anonymously (Identity Toolkit `accounts:signUp`, refresh via `securetoken`), writes with Firestore `documents:commit` (server timestamps via `updateTransforms`), and reads the list publicly with small queries (`listPlayers()`: 50 fastest finishers, 50 furthest still out, 30 newest, your own entry, plus counts). Firestore bills per document read, so never fetch the whole collection. Every query filters and sorts on the same single field, so no composite index needs deploying. The web config in `api.ts` is not a secret.
- One document per player: `players/{uid}` with `name, char, createdAt, lastSeen, clubs, stamps, quests, playMs, finishedAt, finishPlayMs`. Login (`uid`, refresh token) lives in `localStorage['tuersteher-online']`, separate from the save; Start over calls `forgetPlayer()` so a new game is a new entry.
- `firestore.rules`: anyone can read; only the owner can write their document, only those keys, sane values (`stamps == clubs.size() <= 8`, name 1–16 chars and passing `nameOk()` (the same blocklist as `online/names.ts`; keep them in sync), `playMs` never decreases, `createdAt` set once by the server, `lastSeen == request.time`, `finishedAt` set once and only with 8 stamps). Deploy with `firebase deploy --only firestore:rules`. A client can still lie about its own progress; that's accepted for a fun game.
- `online/sync.ts`: `syncNow()` on joining, `syncSoon()` after stamps and quests, `syncFinish()` from `maybeFinale()`, a heartbeat every 10 min (`syncTick()` in the frame loop, 30 s backoff after failures), and a `keepalive` write on page hide. `state.playMs` grows in the frame loop only while the page is visible and focused and you have a name. Failures only log a warning; the game never depends on the network.
- In the world: the Litfaßsäule (`kind: 'column'`, tile 48,16 east of the Fernsehturm, built in `cityPeople()`) shows its lines, then `interact()` opens the list after releasing `RT.busy` (the list pauses the game itself). Drawn in `render/draw.ts`, labelled GUEST LIST on the zoomed-out map.
- Name: step 3 of the creator (`openNamePrompt()` for older saves without a name); `online/names.ts` trims and filters names.
- Local testing: `firebase emulators:start --only auth,firestore` (ports in `firebase.json`), then open the game with `?emulator` (uses `localStorage['tuersteher-online-emulator']`, so test players never reach the real list).

### Monitoring (`src/core/monitoring.ts`)

- Datadog RUM (org Cuadog, US1): sessions, errors, Session Replay and game events. Only production builds report; the live site is `env:prod`, `npm run preview` is `env:local`. Sample rates and privacy can also be changed in Datadog's remote configuration without a deploy.
- Game events go through `track('snake_case', { … })`, never `datadogRum` directly. Current events: `character_selected`, `outfit_changed`, `door_rejected`, `door_accepted`, `club_entered`, `quest_completed`, `npc_talked`, `game_finished`, `runner_finished` (`won`).
- Session Replay records the DOM, so the canvas (the map) shows black; dialogs, menus and the stamp card are visible.

### Saving (`src/core/save.ts`)

- `localStorage['tuersteher-save']` holds `SaveData` (`GameState` + zoom + position). Saves happen after stamps, quests, shop changes, every 8 steps, on page hide, and on zoom.
- Inside a club the saved position is the pavement in front of that club's door, so a reload puts you back on the street.
- **Keep the save format backwards compatible**: add new fields with defaults in `applySave()`; don't rename existing ones (players have saves from earlier versions).

### Input

`pressA` / `pressB` / `pressDir` in `input.ts` route to whatever is open, in this order: title → character creator → photo strip → club entrance scene → shop → dialog → world. Arrows/WASD move, Z/Enter/Space = A, X/Esc = B, Tab/Shift (or holding B, or the joystick past its rim, on touch) = run, +/−/wheel = zoom, M = map, N = sound, G = guest list. On touch, dragging on the map is a joystick and a tap is A; the on-screen joystick (`initStick()`) presses one direction at a time and switches without lifting.

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

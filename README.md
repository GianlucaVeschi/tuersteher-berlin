# Türsteher Berlin

A tiny Pokémon-style pixel game about getting into Berlin clubs. Walk around a night map of Berlin (Spree, Oberbaumbrücke, East Side Gallery, Fernsehturm, Ostkreuz) and answer the bouncer's questions at seven real clubs:

Berghain · Tresor · KitKatClub · ://about blank · Kater Blau · Sisyphos · Club der Visionäre

A new game starts with a short intro: choose man or woman, then one of four starting characters (the Tourist, the Hipster, the Tech Guy/Girl, the Local or the Art Student). Each starts in different clothes, so each has a different first route through the clubs.

Every bouncer checks your outfit first, then asks questions about the club. Get every question right and you're in. One wrong answer and it's *Heute nicht.*

## Inside Berghain

Once the bouncer lets you in, you can walk around inside Berghain. It has three floors connected by steel stairs, following the real layout:

- **Erdgeschoss (ground floor):** ticket desk, coat check, the Piotr Nathan wall installation, a bar and a darkroom.
- **Main floor (old turbine hall):** dancefloor, seven Funktion-One stacks, DJ booth, two bars, the Eisbar on the mezzanine and the toilets.
- **Panorama Bar:** wrap-around bar, raised DJ booth, a Wolfgang Tillmans print and tall windows with metal blinds.

Side quests (tracked on the stamp card):

| Quest | Where |
| --- | --- |
| Check your coat | Garderobe, ground floor |
| Order a drink | Any bar |
| Get ice cream | Eisbar, main floor mezzanine |
| Dance on the main floor | Press A on the dancefloor |
| Get into the toilets | A guy blocks the toilet door and wants K. He sends you to Mila (pink hair, sunglasses, by the left speakers on the main dancefloor; say he sent you). Bring the bag back and you share a line in a stall: 10 seconds of melting, blurry, colour-shifting slow motion |
| Take someone to the darkroom | Find Sascha at Panorama Bar, ask first, then lead them down to the ground floor |
| Dance when the blinds open | After three other quests, go to Panorama Bar |

Leave through the exit on the ground floor. Other clubs still show the short "inside" scene.

## Inside Sisyphos

An old dog-biscuit factory in Rummelsburg. You arrive in the garden and walk through doorways (bead curtains) between rooms:

- **Strand:** the open-air garden. Sand dancefloor, a pool with sand around it, art totems, fairy lights, a bar.
- **Wintergarten:** a glass house full of plants. House music that never stops.
- **Hammahalle:** the brick factory hall. Techno.
- **Dampfer:** wooden, ship-like, with portholes. Deep house.
- **Tunnel:** a long techno corridor with red lacquer walls and swinging paper lanterns.
- **Sauna:** behind the Dampfer, with a Saunameister doing the Aufguss.

The crowd is a colourful festival and circus bunch with flower crowns, glitter and face paint. Talk to them for stories about yoga retreats, ayahuasca and van life.

| Quest | Where |
| --- | --- |
| Pfand hunter (main quest) | Empty bottles lie around every room. Carry up to 4, return them at any bar for the deposit (beer 8 ct, Club-Mate 15 ct, cans 25 ct). Return 8 to finish |
| Jump in the pool | Press A facing the pool in the garden |
| Survive the Aufguss | Talk to the Saunameister |
| Listen to 3 hippie stories | Momo (pool), Luna (Wintergarten), Kai (sauna), Sunny (Tunnel) |
| Learn to juggle | Zora the circus kid in the garden. Wait for the beat |
| Dance in 4 different rooms | Press A on any dancefloor: sand, wood, concrete or the red Tunnel floor |

## Inside KitKat

KitKat shares its industrial building on Köpenicker Straße with Sage Club. In the game it has three areas:

- **Main floor:** UV light and fluorescent wall paintings, a pole stage, leather sofas, a love swing, the Garderobe and a dark corner.
- **Pool lounge:** behind the curtains on the right. A warm pool, beds, and the Awareness Station at the pool bar.
- **Dungeon:** downstairs, under red light. St Andrew's crosses, cages, the gynaecologist's chair, two darkrooms, Marco from Napoli and a photo booth.

The crowd wears latex, leather, harnesses, bunny ears or nothing much. Groups on beds and in the darkrooms are shown, never spelled out: bodies under a blanket, rocking, little hearts. Talk to a group and ask to join. Some say yes, some are a closed group, some are too busy to answer.

| Quest | Where |
| --- | --- |
| Strip down at the Garderobe | By the entrance. You're in underwear for as long as you stay inside |
| Spin on a pole | Pole stage, top of the main floor |
| Take a dip in the pool | Pool lounge |
| Join an orgy | Ask a group that says yes (dark corner on the main floor, a bed by the pool, the big darkroom in the dungeon) |
| Say yes to Marco | Marco asks to spank you. Yes, gently or no: all answers are respected |
| Photo booth souvenir | After Marco, the booth in the dungeon prints a 4-frame strip. "Save photo" downloads it as a PNG |

## Dress codes and shops

| Club | Dress code |
| --- | --- |
| Berghain | All black |
| Tresor | Black |
| KitKatClub | Fetish (latex, leather) |
| ://about blank | Anything except the tourist look or a suit |
| Kater Blau | Colorful or vintage |
| Sisyphos | Colorful, glitter |
| Club der Visionäre | Anything except a suit |

Walk into a shop to change clothes (no money yet):

- **Humana**: second-hand basics, vintage, a suit (trap) and your old hoodie
- **Blackstyle**: latex and leather
- **Coexist**: 90s windbreaker, black mesh, sailor stripes
- **SYLD**: glitter and neon

The shop screen shows which clubs each outfit gets you into.

## Play

Live at https://gianlucaveschi.github.io/tuersteher-berlin/

## Development

The game is TypeScript, built with [Vite](https://vite.dev). You need Node.js 18 or newer.

```bash
npm install
npm run dev
```

Then open the URL it prints (http://localhost:5173). The page reloads as you save.

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server with live reload |
| `npm run typecheck` | Type-checks the code (strict mode) |
| `npm run build` | Type-checks, then builds the site into `dist/` |
| `npm run preview` | Serves the built `dist/` locally |

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Walk | Arrow keys / WASD | D-pad |
| Talk / confirm | Z / Enter / Space | A |
| Skip text | X / Esc | B |
| Run | hold Tab (or Shift) | hold B, or drag far from where your finger started |
| Zoom | + / − (or mouse wheel over the map) | + / − buttons on the screen |
| Whole map | M | MAP button |

Zoomed out, the map labels every club (✓ once you've been in) and shop, and marks where you are. The zoom level is saved.

On phones the page switches to a full-screen layout: drag anywhere on the map to walk (like a joystick), tap the map or the text box to talk, or use the big D-pad and A/B buttons. The stamp card opens from the button in the top bar. Landscape puts the D-pad left and A/B right of the map. The visible map area adapts to the screen with crisp integer pixel scaling. Tip: "Add to Home Screen" runs it full-screen.

Progress (stamps, position) is saved in `localStorage`. "Start over" on the stamp card clears it.

## Code layout

```
index.html            page markup (handheld shell, screen overlays, stamp card)
style.css             all styling
src/
  main.ts             entry point: builds the world, wires up input, starts the loop
  types.ts            shared types (Club, Outfit, Entity, Scene, GameState, …)
  util.ts             DOM helper, seeded random numbers, small helpers
  core/
    runtime.ts        shared mutable state (RT): current scene, open menus, timers
    state.ts          saved progress (state), the player, directions
    save.ts           save / load to localStorage
  data/
    clubs.ts          the seven clubs, their bouncers and questions, intro/ending text
    outfits.ts        outfits, starting characters, dress codes, shops
    interiors.ts      club floors as ASCII maps, people on them, quest lists
  world/
    tiles.ts          tile ids and which ones are solid
    grid.ts           reading and writing the current map
    city.ts           lays out the street map and the people on it
    scenes.ts         the street and every club floor as switchable scenes
    collision.ts      what you can and can't walk into
  render/             drawing: street tiles, sprites, camera, zoom, map labels
  interiors/          club floors: building them, drawing, effects, stairs, the follower
  quests/             quest handlers (ACTS), dancing, Sisyphos and KitKat specifics
  effects/trip.ts     the drug effects
  ui/                 dialog box, shops, character select, stamp card, club entrance scene
  input.ts            keyboard, touch, mouse wheel, on-screen buttons
  game/
    scripts.ts        bouncer conversations, talking to people, doors
    loop.ts           movement, the frame loop, start-up
```

## Editing the game

- **Clubs and questions**: `CLUB_DEFS` in `src/data/clubs.ts`. Each club has `greet`, `reject`, `accept`, `inside`, `sign` lines, `need` (how many questions it asks) and a `pool` of questions. In each question the **first** answer in `a` is the correct one; options get shuffled in game. `fact` is shown after a wrong answer.
- **Map layout**: `buildCity()` in `src/world/city.ts`. Roads come from `hroad` / `vroad`, buildings from `building(...)`, and trees from the coordinate list. Club position comes from each club's `x`, `y`, `w`, `h`. The door sits at the bottom centre, the bouncer one tile below it.
- **Outfits, dress codes, shops**: `OUTFITS`, `DRESS` and `SHOP_DEFS` in `src/data/outfits.ts`. Each outfit has `tags` (`black`, `latex`, `colorful`, `vintage`, `tourist`, `suit`, `tech`). A club's `ok` list needs at least one matching tag; its `no` list rejects any match.
- **Starting characters**: `CHARACTERS` in `src/data/outfits.ts`. `body` (skin, hair, `long` hair, `glasses`, `beard`) stays when you change clothes; `outfit` is the starting outfit.
- **Fernsehturm**: `TOWER` in `src/world/city.ts`. The base is solid; the tall part is drawn in front of the sprites.
- **Club interiors**: `src/data/interiors.ts`. Each floor is ASCII art (legend at the top of the file), plus spawn points, which floor the stairs lead to, the people on that floor (`lines` for chat, or `act` for a quest handler in `src/quests/acts.ts`), how many dancers to scatter, tile descriptions (`examine`) and the quest list. To give another club an interior, add an entry with the club's id (e.g. `tresor`) and its handlers. TypeScript checks the data against `InteriorDef` in `src/types.ts`, so typos in field names show up in `npm run typecheck`.
- **NPCs and signs on the street**: `cityPeople()` in `src/world/city.ts`.
- **Intro / ending text**: `INTRO` and `FINALE` in `src/data/clubs.ts`.

All graphics are drawn in code on a 384×256 canvas (16 px tiles, 24×16 visible). The view size is set in `src/core/runtime.ts` (`VW`/`VH`) and `fitCanvas()` in `src/render/canvas.ts`. There are no image assets.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`: it type-checks, builds, and publishes `dist/` to GitHub Pages (about a minute). The repo's **Settings → Pages → Source** must be set to **GitHub Actions**.

## Debugging

Open the page with `?debug` (e.g. `http://localhost:5173/?debug`) and inspect `window.__game` in the browser console for the player position and game state. `__game.tp(x, y, 'up')` teleports, `__game.enterClub('berghain')` puts you inside.

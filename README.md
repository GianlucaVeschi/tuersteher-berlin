# Türsteher Berlin

A tiny Pokémon-style pixel game about getting into Berlin clubs. Walk around a night map of Berlin (Spree, Oberbaumbrücke, East Side Gallery, Fernsehturm, Ostkreuz) and answer the bouncer's questions at seven real clubs:

Berghain · Tresor · KitKatClub · ://about blank · Kater Blau · Sisyphos · Club der Visionäre

A new game starts with a short intro: choose man or woman, then one of four starting characters (the Tourist, the Hipster, the Tech Guy/Girl, the Local or the Art Student). Each starts in different clothes, so each has a different first route through the clubs.

Every bouncer checks your outfit first, then asks questions about the club. Get every question right and you're in. One wrong answer and it's *Heute nicht.*

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

No build step, no dependencies. Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Walk | Arrow keys / WASD | D-pad |
| Talk / confirm | Z / Enter / Space | A |
| Skip text | X / Esc | B |
| Run | hold Tab (or Shift) | hold B, or drag far from where your finger started |

On phones the page switches to a full-screen layout: drag anywhere on the map to walk (like a joystick), tap the map or the text box to talk, or use the big D-pad and A/B buttons. The stamp card opens from the button in the top bar. Landscape puts the D-pad left and A/B right of the map. The visible map area adapts to the screen with crisp integer pixel scaling. Tip: "Add to Home Screen" runs it full-screen.

Progress (stamps, position) is saved in `localStorage`. "Start over" on the stamp card clears it.

## Files

- `index.html` – page markup (handheld shell, screen overlays, stamp card)
- `style.css` – all styling
- `game.js` – everything else: club data, map, rendering, dialog, input

## Editing the game

Most changes happen in `game.js`:

- **Clubs and questions**: the `CLUBS` array at the top. Each club has `greet`, `reject`, `accept`, `inside`, `sign` lines, `need` (how many questions it asks) and a `pool` of questions. In each question the **first** answer in `a` is the correct one; options get shuffled in game. `fact` is shown after a wrong answer.
- **Map layout**: the `MAP` section. Roads come from `hroad` / `vroad`, buildings from `building(...)`, and trees from the coordinate list. Club position comes from each club's `x`, `y`, `w`, `h`. The door sits at the bottom centre, the bouncer one tile below it.
- **Outfits, dress codes, shops**: `OUTFITS`, `DRESS` and `SHOPS` near the top. Each outfit has `tags` (`black`, `latex`, `colorful`, `vintage`, `tourist`, `suit`). A club's `ok` list needs at least one matching tag; its `no` list rejects any match. Shops are placed on the map by their `x`, `y`, `w`, `h`. The door is at the bottom centre; walk into it to enter.
- **Starting characters**: `CHARACTERS` in `game.js`. `body` (skin, hair, `long` hair, `glasses`, `beard`) stays when you change clothes; `outfit` is the starting outfit from `OUTFITS`.
- **Fernsehturm**: `TOWER` sets its position. The base is solid; the tall part is drawn in front of the sprites.
- **NPCs and signs**: the `ents.push(...)` block under `ENTITIES`.
- **Intro / ending text**: `INTRO` and `FINALE`.

All graphics are drawn in code on a 384×256 canvas (16 px tiles, 24×16 visible). Change `VW`/`VH` in `game.js` and the canvas size in `index.html` to zoom in or out. There are no image assets.

## Deploy to GitHub Pages

1. Push this folder to a GitHub repo.
2. In the repo, go to **Settings → Pages**, set the source to the `main` branch and the `/ (root)` folder.
3. The game will be live at `https://<user>.github.io/<repo>/`.

## Debugging

Open the page with `?debug` (e.g. `http://localhost:8000/?debug`) and inspect `window.__game` in the browser console for the player position and game state.

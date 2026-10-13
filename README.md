# Türsteher Berlin

A tiny Pokémon-style pixel game about getting into Berlin clubs. Walk around a night map of Berlin (Spree, Oberbaumbrücke, East Side Gallery, Fernsehturm, Ostkreuz) and answer the bouncer's questions at seven real clubs:

Berghain · Tresor · KitKatClub · ://about blank · Kater Blau · Sisyphos · Club der Visionäre

Get every question right and you're in. One wrong answer and it's *Heute nicht.*

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

Progress (stamps, position) is saved in `localStorage`. "Start over" on the stamp card clears it.

## Files

- `index.html` – page markup (handheld shell, screen overlays, stamp card)
- `style.css` – all styling
- `game.js` – everything else: club data, map, rendering, dialog, input

## Editing the game

Most changes happen in `game.js`:

- **Clubs and questions**: the `CLUBS` array at the top. Each club has `greet`, `reject`, `accept`, `inside`, `sign` lines, `need` (how many questions it asks) and a `pool` of questions. In each question the **first** answer in `a` is the correct one; options get shuffled in game. `fact` is shown after a wrong answer.
- **Map layout**: the `MAP` section. Roads come from `hroad` / `vroad`, buildings from `building(...)`, and trees from the coordinate list. Club position comes from each club's `x`, `y`, `w`, `h`. The door sits at the bottom centre, the bouncer one tile below it.
- **NPCs and signs**: the `ents.push(...)` block under `ENTITIES`.
- **Intro / ending text**: `INTRO` and `FINALE`.

All graphics are drawn in code on a 384×256 canvas (16 px tiles, 24×16 visible). Change `VW`/`VH` in `game.js` and the canvas size in `index.html` to zoom in or out. There are no image assets.

## Deploy to GitHub Pages

1. Push this folder to a GitHub repo.
2. In the repo, go to **Settings → Pages**, set the source to the `main` branch and the `/ (root)` folder.
3. The game will be live at `https://<user>.github.io/<repo>/`.

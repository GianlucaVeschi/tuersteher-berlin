/* A tiny 3×5 pixel font for small map labels. Press Start 2P is built on an 8 px grid and turns
   blurry below that; these letters are plain rectangles, so they stay sharp at any scale.
   Each glyph is five rows of three bits, top to bottom. Unknown characters draw as a space. */
const GLYPHS: Record<string, number[]> = {
  A: [2, 5, 7, 5, 5], B: [6, 5, 6, 5, 6], C: [3, 4, 4, 4, 3], D: [6, 5, 5, 5, 6], E: [7, 4, 6, 4, 7],
  F: [7, 4, 6, 4, 4], G: [3, 4, 5, 5, 3], H: [5, 5, 7, 5, 5], I: [7, 2, 2, 2, 7], J: [1, 1, 1, 5, 2],
  K: [5, 5, 6, 5, 5], L: [4, 4, 4, 4, 7], M: [5, 7, 7, 5, 5], N: [6, 5, 5, 5, 5], O: [2, 5, 5, 5, 2],
  P: [6, 5, 6, 4, 4], Q: [2, 5, 5, 6, 3], R: [6, 5, 6, 5, 5], S: [3, 4, 2, 1, 6], T: [7, 2, 2, 2, 2],
  U: [5, 5, 5, 5, 7], V: [5, 5, 5, 5, 2], W: [5, 5, 7, 7, 5], X: [5, 5, 2, 5, 5], Y: [5, 5, 2, 2, 2],
  Z: [7, 1, 2, 4, 7], Ä: [5, 2, 5, 7, 5], Ö: [5, 0, 7, 5, 7], Ü: [5, 0, 5, 5, 7],
  0: [7, 5, 5, 5, 7], 1: [2, 6, 2, 2, 7], 2: [6, 1, 2, 4, 7], 3: [6, 1, 2, 1, 6], 4: [5, 5, 7, 1, 1],
  5: [7, 4, 6, 1, 6], 6: [3, 4, 7, 5, 7], 7: [7, 1, 2, 2, 2], 8: [7, 5, 7, 5, 7], 9: [7, 5, 7, 1, 6]
};
/** Letter height and advance (3 px wide plus 1 px gap), in canvas pixels. */
export const PIXEL_H = 5, PIXEL_ADV = 4;
export const pixelTextWidth = (text: string) => Math.max(0, text.length * PIXEL_ADV - 1);

/** Draws `text` (A–Z, ÄÖÜ, 0–9, spaces) with its top-left corner at x, y. */
export function pixelText(g: CanvasRenderingContext2D, text: string, x: number, y: number, color: string) {
  g.fillStyle = color;
  [...text.toUpperCase()].forEach((ch, i) => {
    const rows = GLYPHS[ch];
    if (!rows) return;
    rows.forEach((bits, r) => { for (let c = 0; c < 3; c++) if (bits & (4 >> c)) g.fillRect(x + i * PIXEL_ADV + c, y + r, 1, 1); });
  });
}

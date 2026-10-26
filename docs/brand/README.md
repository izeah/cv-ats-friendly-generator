# CV ATS Friendly Builder — Logo guidelines

## 1. The logo

**Idea:** two code brackets form a CV page, its top-right corner folded, and the
middle line, the one that gets read, is marigold. A CV structured like code:
readable by an ATS, made for backend developers.

| File | Use it for |
|---|---|
| `symbol-tile.svg` | **Primary.** The mark on a forest tile. Light backgrounds, avatars, the app header. |
| `symbol-tile-small.svg` | The same at 32 px and below (heavier strokes, two lines). Favicons. |
| `symbol-reversed.svg` | The bare mark in paper + marigold, for forest or other dark backgrounds. Slightly thinner than the master so it doesn't look heavier. |
| `symbol.svg` | The bare mark in forest + marigold on paper or white, when a tile won't fit. |
| `symbol-forest.svg`, `symbol-black.svg`, `symbol-white.svg` | One-colour versions (stamps, embroidery, single-colour print). |
| `symbol-square.svg` | Full-bleed square for platforms that round the corners themselves (iOS home screen, maskable PWA icon). |
| `logo-horizontal.svg` | Primary lockup: tile + wordmark. |
| `logo-horizontal-reversed.svg` | Lockup for dark backgrounds. |
| `logo-horizontal-forest.svg` | Lockup with the accent line in paper instead of marigold (one ink + paper). |
| `logo-stacked.svg` | Tile above the wordmark, for square spaces. |

All files are outlined paths: no fonts needed. Web icons built from these live in `public/`
(`favicon.svg`, `favicon.ico`, `icon-192.png`, `icon-512.png`, `maskable-512.png`,
`apple-touch-icon.png`) and the share images are `public/og-image.png` and `public/og-share.png`.

In the app, use `<LogoMark />` from `src/components/Illustrations.tsx`:
`onDark` for dark surfaces, `small` at 32 px and below.

## 2. Clear space

Keep a clear zone of **one bracket arm** (the length of a bracket's top arm, about a quarter of
the symbol's height) on every side. It scales with the logo.

## 3. Minimum size

| Version | Screen |
|---|---|
| Symbol | 16 px (use `symbol-tile-small.svg` up to 32 px) |
| Horizontal lockup | 120 px wide |
| Stacked lockup | 72 px wide |

## 4. Colour

| Name | HEX | RGB | CMYK (approx.) |
|---|---|---|---|
| Forest | `#10380b` | 16 56 11 | 71 0 80 78 |
| Marigold | `#fce519` | 252 229 25 | 0 9 90 1 |
| Paper | `#f5f4ec` | 245 244 236 | 0 0 4 4 |

CMYK values are conversions; proof with the printer before a print run.

**Approved pairs:** tile on paper or white · reversed mark on forest · forest mark on paper ·
black or white one-colour versions. Marigold is the accent line only: never set the whole mark in
marigold, and never put the bare forest mark on marigold.

## 5. Typography

Wordmark: **Stack Sans Headline Bold** ("CV ATS Friendly", tracking −4 %) over
**Stack Sans Text SemiBold** ("BUILDER", tracking +32 %). Both are open-source (SIL Open Font
License) on Google Fonts, and are used across the site.

## 6. Don'ts

Don't stretch, rotate or add effects (shadows, outlines, gradients) · don't recolour outside the
palette · don't move the marigold line to another position · don't mirror the mark (the fold
belongs on the top right) · don't retype the wordmark, use the files · don't place the bare mark
on busy backgrounds, use the tile.

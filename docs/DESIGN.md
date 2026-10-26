# Design system

The reference for how CV ATS Friendly Builder looks, moves and talks. The
direction (dark hero, one loud accent, sticker cards, handwritten notes, a
sticky story and a cast of mascots) was studied from the patterns on
ailene.id and rebuilt here with our own palette, copy and characters.

Source of truth for values: `src/index.css` (`@theme` and the sections below it).

## Logo

"Brackets": two code brackets form a CV page with a folded corner; the middle
line is marigold. In the app use `<LogoMark />` (`onDark` on forest, `small` at
32 px and below). Masters, web icons and the usage guide: `docs/brand/`.

## Colour

One accent, used sparingly, on warm paper. Dark sections use Forest.

| Token | Value | Use |
|---|---|---|
| `cream` / `background` | `#f5f4ec` | Page paper; light text on forest |
| `parchment` / `card` | `#fffefa` | Card surface |
| `paper-mid` | `#f0eee4` | Alternate section band (How, FAQ) |
| `paper-deep` | `#ebe9dd` | Quiet fills, hovers |
| `forest` | `#10380b` | Ink, borders, dark sections, primary buttons |
| `forest-deep` | `#0a2606` | Footer, shadows on dark |
| `marigold` | `#fce519` | The accent: highlights, primary CTA, active states |
| `script` | `#2f6b1f` | Handwritten kickers on light |
| `sage` `coral` `sky` | | Mascot avatar circles only |

Rules
- Marigold marks the one thing to look at in a view: the punchline of a
  heading, the main button, the current step. Never as a large background
  except the stat band.
- On a dark section, wrap it in `.on-dark` (re-points `foreground` and
  `muted-foreground` to cream). Light cards placed inside it get `.on-light`.

## Type

- Display: **Stack Sans Headline** 700, sentence case, `letter-spacing: -0.045em`,
  `line-height: 1`, balanced wrapping. Class: `.h-display`.
- Body: **Stack Sans Text** 450.
- Script: **Caveat** 700 for kickers and asides. Class: `.kicker` (rotated −1.5°).
- Mono: system monospace for tiny labels (`font-mono`, uppercase, wide tracking).

Scale (clamp, desktop → phone): hero `44–92px`, section `34–58px`, step `26–38px`.

## Signature pieces

- **Highlight** (`<Hl>` / `.hl`): marigold block behind the last words of a
  heading, skewed −4° with a small offset shadow.
- **Section head** (`<SectionHead>`): kicker question → heading with a highlight
  → lead paragraph to the right on wide screens.
- **Sticker card**: `border-2 border-forest`, `rounded-card` (20px), hard
  shadow `shadow-stamp` (4px, no blur). Hover lifts to `shadow-stamp-lg`.
- **Sticker button** (`variant="marigold"`): lifts on hover, presses flat on
  click. On dark surfaces, swap the shadow colour (`forest-deep` or `cream`).
- **Text link**: `.link-mark`, thick marigold underline, arrow nudges on hover.
- **Grid paper** (`.grid-paper`) for "screens"; **dot grid** (`.dot-grid`) on dark bands.

## Layout patterns

- **Adaptive header** (`SiteHeader`): sticky, transparent over the dark hero,
  then takes the theme of the section under it. Every section declares
  `data-header="dark" | "light" | "accent"`. The nav underlines the section in view.
- **Dark hero**: drifting grid plus a brighter copy masked to the pointer
  (`.hero-grid`, `.hero-grid.is-glow`, `--mx/--my`). The hero pulls up under the
  header with `-mt-16`.
- **Sticky story** (`ScrollStory`): steps scroll on the left; a pinned screen on
  the right swaps panels and tints towards marigold. On phones the screen pins
  to the top as a band above the text. The landing tells it in five stops,
  00 "you are here" to 04 "hired".
- **Step meter** (`StepMeter`): numbered stops on a dashed marigold line, the
  current one marigold with a halo and a handwritten caption under it. Used by
  the story and, with `dark`, by the closing card, so both read as one journey.
- **Sticky side card**: a card beside a list sticks while the list scrolls and
  comes to rest level with the last item (testimonials).
- **Section rhythm**: `.section` padding `clamp(76px, 9vw, 132px)`; content
  width `1240px` with `px-5 sm:px-10`.
- **Search palette** (`SearchPalette`, ⌘K / Ctrl K from the sidebar): a forest
  panel with a cream border and the marigold offset shadow. Actions get colour
  tiles, CVs are grouped Pinned → last 7 days → last 30 days → older, and the
  maximized size adds a preview of the highlighted row (minimized drops it; the
  choice is remembered). The footer always shows the keys for what is highlighted.
- **CV list**: pinned CVs sit under their own heading; hovering a row shows the
  pin and the menu (rename, open in new tab, pin, preview, export, archive, delete).
  "Rename" sets a list label only; the name printed on the CV never changes.

## Tooltips and shortcuts

- No native `title` bubbles. Wrap the control in `<Tooltip label shortcut? side?>`
  (`src/components/ui/tooltip.tsx`): a small forest sticker with a marigold
  offset shadow, the label, then the keys.
- Every shortcut lives in `SHORTCUTS` (`src/lib/shortcuts.ts`); handlers use
  `useShortcut`, tooltips and the palette read the same entry, and the control
  gets `aria-keyshortcuts`. `mod` is ⌘ on macOS and Ctrl elsewhere; keys are
  shown as inline-code caps (`<ShortcutKeys>`, `<Kbd>`): ⇧ ⌘ O on a Mac,
  Ctrl Shift O elsewhere. Skip browser-reserved combos (new tab, private window,
  devtools).

| Where | Action | Keys (Mac / others) |
|---|---|---|
| Builder | Search | ⌘K / Ctrl K |
| Builder | New CV | ⇧⌘O / Ctrl Shift O |
| Builder | Import JSON | ⇧⌘U / Ctrl Shift U |
| Builder | Show / hide sidebar | ⌘B / Ctrl B |
| Builder | Home | ⇧⌘H / Ctrl Shift H |
| Form | Save · Save and preview | ⌘S · ⌘↵ / Ctrl S · Ctrl Enter |
| Preview | Edit · Copy share link · PDF | ⌘E · ⇧⌘L · ⌘P |
| Palette | Open · new tab · rename · delete | ↵ · ⌘↵ · ⇧⌘E · ⇧⌘D |

## Motion

- Easing: `--ease-out-expo` for reveals, `--ease-spring` for pops.
- Reveal on scroll: add `data-reveal` (and `style={stagger(0.08)}` for
  sequences); `useReveal()` marks elements with `data-in`.
- Loops (vignettes, chat, testimonials, pantry) only run while on screen.
- Everything respects `prefers-reduced-motion`.

## Mascots

`<Mascot who pose />` and `<MascotAvatar who />` in `src/components/Mascot.tsx`.

| Who | Role | Look |
|---|---|---|
| Arya | Senior Backend Engineer | Hoodie, marigold headphones |
| Sekar | Staff Engineer | Terracotta hijab, round glasses, denim overshirt |
| Rina | Talent Acquisition | Navy blazer, lanyard |
| Dimas | Tech Recruiter | White shirt, lanyard |

Poses: `idle`, `wave`, `type`, `think`, `cheer`, `phone`, `check`, `magnify`.
They breathe, blink, and glance at the mouse pointer (`useLook`). Use them
to tell the story of a section, not as decoration: the candidate (Arya) makes
the CV, the recruiter (Rina) scans it, and the team trades tips in the footer.

## Voice

- Talk to "kamu" (Indonesian) / "you" (English); casual and specific.
- Kicker = the question the reader has ("gimana cara pakainya?").
- Heading ends on the payoff, which gets the highlight.
- Concrete beats clever: real numbers and actions ("1 klik", "satu form").
- A handwritten aside sits next to the main button ("satu form, beres.").

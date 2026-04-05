# CSS Style System Plan

**Goal:** Remove all scoped CSS from components. Every visual style lives in `src/styles/` and is applied via global class names. Components contain only structure, logic, and class bindings.

**Current state:** ~4,200 lines of `<style scoped>` across 31 components. 813 lines of global CSS already in place but largely unused by components.

---

## Inventory

### Global CSS already built (`src/styles/`)

| File | Classes defined | Actually used by components? |
|------|-----------------|------------------------------|
| `base/tokens.css` | `--space-*`, `--text-*`, `--radius-*`, etc. | Partially (some components still use raw values) |
| `base/colors.css` | `--accent`, `--bg`, `--raised`, etc. | Yes — used everywhere |
| `base/reset.css` | box-sizing reset | Yes |
| `components/buttons.css` | `.btn`, `.btn-sm`, `.btn-primary`, etc. | Only `SettingsPage.vue` |
| `components/cards.css` | `.card`, `.card-sm`, `.card-header`, etc. | Not used (components define own card styles) |
| `components/forms.css` | `.form-select`, `.form-input`, `.form-label` | Not used |
| `components/pills.css` | `.note-strip`, `.note-pill` | Yes — via `NoteStripPicker` |
| `components/page-header.css` | `.page-header`, `.page-header-title`, etc. | Yes — via `PageHeader` |
| `layouts/picker-row.css` | `.picker-row`, `.picker-label`, `.picker-control` | Yes — via `PickerRow` |
| `utilities/layout.css` | `.flex`, `.flex-col`, `.gap-*`, etc. | Not used |

### Scoped CSS hotspots (lines of CSS per file)

| Component | CSS lines | Main patterns |
|-----------|-----------|---------------|
| `App.vue` | ~315 | App shell, tabs, header, mobile menu |
| `ScaleVisualizer.vue` | ~275 | Display modes (pad, chroma, guitar), controls |
| `LearnBeats.vue` | ~260 | Beat pattern grid |
| `ChordProgressions.vue` | ~250 | Progression cards, MIDI/loop controls |
| `JamMode.vue` | ~230 | Display modes (pad, chroma, guitar), controls |
| `ChordDetector.vue` | ~220 | Display modes (pad, chroma, guitar), chord cards |
| `SettingsPage.vue` | ~220 | Settings layout |
| `LearnImprovising.vue` | ~210 | Improv examples, good/bad note columns |
| `LearnProgressions.vue` | ~165 | Diatonic chord row, progression list |
| `LearnScales.vue` | ~155 | Scale tiles, tabs |
| `PianoOctave.vue` | ~145 | Piano keys |
| `DrumComputer.vue` | ~140 | Beat grid |
| `LearnIntervals.vue` | ~130 | Interval result, reference grid |
| `ProgressionBuilder.vue` | ~120 | Chord cards, pad |
| `LearnRootNotes.vue` | ~115 | Root result, fact cards |
| `LearnChords.vue` | ~105 | Chord type cards |
| `GuitarChordDiagram.vue` | ~105 | Chord diagram grid |
| `ProgressionCard.vue` | ~100 | Progression card UI |

---

## What can be extracted

### Already designed, not yet adopted: `.btn`, `.card`, form controls

The button and card systems are fully defined in global CSS but almost no component uses them. The first pass is to migrate existing styles to the classes that already exist, before adding anything new.

**Buttons** — Every component defines its own button styles (`.play-btn`, `.octave-btn`, `.nav-btn`, `.beat-cta`, etc.). All of these are variants of the same 3-4 button patterns:
- Default: ghost border button → `.btn`
- Accent: accent-colored → `.btn .btn-primary`
- Small: compact → `.btn .btn-sm`
- Block: full width → `.btn .btn-block`
- Danger/good/bad: coloured left-border variants → new modifier needed

**Cards** — Many components define `.chord-type-card`, `.beat-pattern`, `.rf-item`, `.improv-item`, etc. All are `background: var(--raised); border: 1px solid var(--border2); border-radius: ...` with slight padding variations. These all map to `.card` or `.card-sm`.

**Tabs/pills** — Multiple components define `.scale-tab`, `.genre-tab`, `.scheme-btn` etc. All follow the same active/inactive pill pattern. A generic `.tab-group` / `.tab-btn` system would cover them all.

### Shared display-mode visuals (pad, chroma strip, guitar neck)

The largest duplication: `JamMode`, `ScaleVisualizer`, `ChordDetector`, and `ProgressionBuilder` all independently define `.pad`, `.chroma-tile`, `.neck-cell`, `.neck-dot`, `.guitar-neck`, `.string-name`, `.fret-num`, etc. with near-identical CSS.

These belong in a new `src/styles/components/display-modes.css`.

### Learn step layout

Four components (`LearnRootNotes`, `LearnIntervals`, `LearnScales`, `LearnProgressions`) each define `.step-content`, `.step-intro`, `.step-bridge` with identical rules. These should move to `src/styles/components/learn.css`.

Additionally, the numbered-badge pattern (`.br-num`, `.tip-num`, `.step-num`) — a small circle with an accent-background — is repeated 6+ times.

### Remaining domain-specific styles

Some CSS is genuinely component-local and should stay, but as regular (non-scoped) class names in a dedicated file:

| Component | Style | Rationale |
|-----------|-------|-----------|
| `App.vue` | App shell, mobile menu | Unique to app shell |
| `PianoOctave.vue` | Piano keys | Unique to piano display |
| `GuitarChordDiagram.vue` | Chord diagram | Unique to this diagram |
| `LearnBeats.vue` + `DrumComputer.vue` | Beat grid | Shared between both — extract to `beat-grid.css` |
| `App.vue` | Desktop tab bar | Unique |

---

## Phases

### Phase 1 — Migrate to `.btn` (no new CSS)

Replace every hand-rolled button style in all components with `.btn` + modifier classes. Remove their scoped definitions.

New modifier needed: `.btn-accent` (accent border + text, used for play/loop/hear buttons) — add to `buttons.css`.

Files affected: all 31 components with scoped styles. Estimated reduction: **~600 lines**.

### Phase 2 — Migrate to `.card` (no new CSS)

Replace all card-like containers (`.chord-type-card`, `.beat-pattern`, `.rf-item`, `.improv-item`, `.prog-item`, etc.) with `.card` or `.card-sm`. Add `.card-interactive` modifier for clickable cards (cursor + hover state).

Estimated reduction: **~300 lines**.

### Phase 3 — Add tab system, migrate tab patterns

Add `.tab-group` and `.tab-btn` to `src/styles/components/tabs.css`. Migrate all tab/pill-selector patterns across components.

Patterns to cover:
- Scale selector tabs (JamMode, LearnScales)
- Genre tabs (ChordProgressions)
- Color scheme picker (SettingsPage)
- Step nav buttons (LearnStepNav)

Estimated reduction: **~200 lines**.

### Phase 4 — Extract display mode visuals

Create `src/styles/components/display-modes.css` with the shared pad/chroma/guitar/piano grid system. Remove from all page components.

New classes: `.pad-grid`, `.pad-cell`, `.chroma-strip`, `.chroma-tile`, `.guitar-neck`, `.neck-row`, `.neck-cell`, `.neck-dot`, `.fret-numbers`, `.string-names`.

Files affected: `JamMode`, `ScaleVisualizer`, `ChordDetector`, `ProgressionBuilder`.

Estimated reduction: **~500 lines**.

### Phase 5 — Extract learn step layout + beat grid

Create `src/styles/components/learn.css`:
- `.step-content`, `.step-intro`, `.step-bridge`
- `.numbered-badge` (the circle number pattern)

Create `src/styles/components/beat-grid.css`:
- `.bp-grid`, `.bp-row`, `.bp-cell`, `.bp-inst`, `.bp-beat-num`
- Shared between `LearnBeats` and `DrumComputer`

Estimated reduction: **~300 lines**.

### Phase 6 — Remaining cleanup

Handle what's left: MIDI control rows, octave controls, section labels, info panels. Evaluate whether to extract or leave as app-specific global classes.

At this point `<style scoped>` blocks should only remain in:
- `App.vue` (app shell — structural, non-reusable)
- `PianoOctave.vue` (piano keys)
- `GuitarChordDiagram.vue` (chord diagram)

---

## New files to add to `src/styles/`

```
src/styles/
├── components/
│   ├── buttons.css        ← add .btn-accent modifier
│   ├── cards.css          ← add .card-interactive modifier
│   ├── tabs.css           ← NEW: .tab-group, .tab-btn
│   ├── display-modes.css  ← NEW: pad, chroma, guitar neck
│   ├── learn.css          ← NEW: step layout, numbered badge
│   └── beat-grid.css      ← NEW: shared beat grid
```

Update `src/styles/index.css` to import new files.

---

## Success criteria

- Zero `<style scoped>` blocks in page components (`src/pages/`)
- Zero `<style scoped>` blocks in non-visual sub-components (`src/components/learn/`, `src/components/progressions/`, `src/components/jam/`)
- `<style scoped>` permitted only in components that render unique visuals with no parallel elsewhere (`PianoOctave`, `GuitarChordDiagram`, `App`)
- All component CSS classes map to documented global classes in `src/styles/`

# Architecture Guide

> **Purpose:** This document defines patterns, APIs, and conventions for the Tonarium codebase. Following these patterns reduces context needed for AI-assisted development and ensures consistency.

---

## Table of Contents
1. [Monorepo Structure](#1-monorepo-structure)
2. [Packages](#2-packages)
3. [App Source (`src/`)](#3-app-source-src)
4. [Audio Architecture](#4-audio-architecture)
5. [State Management](#5-state-management)
6. [Import Patterns](#6-import-patterns)
7. [CSS Architecture](#7-css-architecture)
8. [Component API Contracts](#8-component-api-contracts)

---

## 1. Monorepo Structure

npm workspaces monorepo. All packages under `packages/` are private, resolved locally via Vite aliases — no publishing or symlinking required.

```
ep1320/
├── packages/
│   ├── tonarium-core/     # @tonarium/core  — music constants + types (TypeScript)
│   ├── tonarium-vue/      # @tonarium/vue   — reusable Vue components + global CSS
│   └── tonarium-learn/    # @tonarium/learn — learn curriculum components + constants
├── src/                   # Main app (Vue 3, Vite)
├── vite.config.js
└── package.json
```

**Vite aliases** (order matters — more specific first):

```js
{ find: '@tonarium/vue/styles', replacement: '…/packages/tonarium-vue/src/styles/index.css' },
{ find: '@tonarium/vue',        replacement: '…/packages/tonarium-vue/src/index.ts' },
{ find: '@tonarium/learn',      replacement: '…/packages/tonarium-learn/src/index.ts' },
{ find: '@tonarium/core',       replacement: '…/packages/tonarium-core/src/index.ts' },
{ find: '@',                    replacement: '…/src' },
```

`src/components/` and `src/pages/` files that have been extracted to packages are kept as 3-line re-export shims so existing import paths throughout the app don't need updating:

```vue
<!-- src/components/ui/Card.vue -->
<script>
export { default } from '../../../packages/tonarium-vue/src/components/ui/Card.vue'
</script>
```

---

## 2. Packages

### 2.1 `@tonarium/core`

Pure TypeScript. No Vue, no runtime dependencies. Exports all music data and types.

**Location:** `packages/tonarium-core/src/`

**Exports:**

| Export | Type | Description |
|--------|------|-------------|
| `NOTES` | `string[]` | 12 chromatic notes, A-based (index 0 = A) |
| `LABELS` | `string[]` | Display labels (uses flats where conventional) |
| `SHARPS` | `Set<number>` | Indices of sharp/black notes |
| `NOTE_TO_SEMI` | `Record<string,number>` | Note name → semitone offset from C |
| `SEMI_TO_NAME` | `Record<number,string>` | Semitone → note name |
| `FLAT_MAP` | `Record<string,string>` | Enharmonic flat equivalents |
| `CHORD_TYPES` | `number[][]` | Interval sets for maj/min/dom7/etc. |
| `CHORD_SUFFIX` | `string[]` | Display suffixes per chord type |
| `CHORD_DETECT_TYPES` | | Chord types used for detection |
| `OPEN_STRINGS` | `number[]` | Guitar open strings (A-based, low→high) |
| `STRING_NAMES` | `string[]` | Guitar string names |
| `FRET_COUNT` | `number` | Number of frets displayed |
| `PIANO_WHITE` | | Piano white key layout |
| `PIANO_BLACK` | | Piano black key layout |
| `JAM_SCALES` | `JamScale[]` | Scales available in Jam Mode |
| `LEARN_SCALES` | `LearnScale[]` | Scales for the Learn curriculum |
| `VISUALIZER_SCALES` | | Scales for Scale Visualizer |
| `GENRES` | `Genre[]` | Chord progression genres |
| `PROGRESSIONS` | `Progression[]` | All progressions, grouped by genre |
| `ALL_PROGRESSIONS` | `Progression[]` | Flat list of all progressions |
| `BEAT_PATTERNS` | `BeatPattern[]` | 11 drum patterns (JSON data) |

**Notes:** A-based note indexing throughout. Guitar open strings as A-based indices: `[7,0,5,10,2,7]` = E2 A2 D3 G3 B3 E4. Chord detection uses C-based semitones internally via `NOTE_TO_SEMI` / `SEMI_TO_NAME`.

---

### 2.2 `@tonarium/vue`

Vue 3 components and global CSS. TypeScript with strict mode (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).

**Location:** `packages/tonarium-vue/src/`

**Exports:**

| Export | Description |
|--------|-------------|
| `Card` | Generic card container |
| `PageHeader` | Page header with title, subtitle, actions slot |
| `PickerRow` | Label + control row layout |
| `KnobControl` | Rotary knob for continuous values |
| `NoteStripPicker` | 12-note chromatic strip picker |
| `PianoOctave` | One octave piano keyboard |
| `GuitarChordDiagram` | Chord diagram with voicing cycling |

**CSS** is imported separately: `import '@tonarium/vue/styles'` (done once in `src/main.js`).

```
packages/tonarium-vue/src/styles/
├── index.css              ← imports all, entry point
├── base/
│   ├── reset.css
│   ├── tokens.css         ← spacing, typography, radius, transition scales
│   └── colors.css         ← color scheme custom properties
├── components/
│   ├── buttons.css        ← .btn and variants
│   ├── cards.css          ← .card and variants
│   ├── forms.css          ← .form-select, .form-input
│   ├── pills.css
│   ├── tabs.css
│   ├── page-header.css
│   ├── display-modes.css
│   └── learn.css          ← .step-content, .step-intro, .step-bridge, .numbered-badge
└── layouts/
    └── picker-row.css     ← .picker-row, .picker-label
```

---

### 2.3 `@tonarium/learn`

All 9 learn step components, navigation, and learn-specific data constants. Uses `@tonarium/core`, `@tonarium/vue`, and app infrastructure via `@/` alias.

**Location:** `packages/tonarium-learn/src/`

**Component exports:**

| Export | Step | Description |
|--------|------|-------------|
| `LearnMode` | — | Orchestrator: step nav, routing, drum pause on exit |
| `LearnStepNav` | — | Tab bar for stepping between lessons |
| `LearnStepFooter` | — | Prev/Next navigation footer |
| `LearnRootNotes` | 1 | Introduces root notes and octaves |
| `LearnIntervals` | 2 | Interval picker with reference table |
| `LearnScales` | 3 | Scale pattern explorer with playback |
| `LearnChords` | 4 | Three chord types with playback |
| `LearnProgressions` | 5 | Diatonic chords and common progressions |
| `LearnImprovising` | 6 | Scale-to-chord matching and examples |
| `LearnBeats` | 7 | Beat patterns with live playback |
| `LearnSongStructure` | 8 | Song section templates |
| `LearnJamSession` | 9 | Guided jam setup, launches JamMode |

**Constant exports:**

| Export | Description |
|--------|-------------|
| `INTERVALS` | 11 intervals with semitone, name, feel |
| `CHORD_TYPES` | 3 basic chord types for LearnChords |
| `IMPROV_CHORD_TYPES` | Chord types with scale recommendations |
| `IMPROV_EXAMPLES` | Good/bad note examples per chord type |
| `BEAT_TIPS` | 4 drum fundamentals tips |
| `LEARN_PROGS` | 4 common progressions for LearnProgressions |

**Cross-package dependencies:** Learn components reach into the app via `@/audio/`, `@/state/`, and `@/utils/`. This is intentional — audio engines and session state live in the app and are shared.

---

## 3. App Source (`src/`)

Only app-specific code lives here. Everything extracted to a package becomes a 3-line shim.

### Pages (real implementations)

| Page | Description |
|------|-------------|
| `StartPage.vue` | Landing / dashboard |
| `JamMode.vue` | Performance surface with pad/guitar/piano + transport |
| `ChordProgressions.vue` | Browse and load progressions |
| `ProgressionBuilder.vue` | Custom progression builder |
| `ChordDetector.vue` | Detect chords from played notes |
| `ScaleVisualizer.vue` | Explore scales visually |
| `DrumComputer.vue` | 16-step drum sequencer UI |
| `SettingsPage.vue` | App settings, MIDI config |
| `AboutPage.vue` | Static about page |
| `LearnMode.vue` | **Shim** → `@tonarium/learn` |

### Components (real implementations)

```
src/components/
├── jam/
│   ├── JamSessionBar.vue      # Key, scale, progression, beat, BPM pickers + transport
│   ├── ScaleSelector.vue      # Scale dropdown with preview
│   └── OctaveControl.vue      # Octave up/down control
├── music/
│   ├── ChordCardBody.vue      # Three-mode chord display (pad/guitar/piano)
│   ├── RootNotePicker.vue     # Root note selector with note names
│   ├── ScaleLegend.vue        # Scale degree color legend
│   └── MidiControl.vue        # MIDI device selector
├── progressions/
│   ├── ProgressionCard.vue    # Single progression card with actions
│   ├── ProgressionSection.vue # Grouped section of progressions
│   └── GenreTabs.vue          # Genre filter tabs
└── layout/
    └── ModeLayout.vue         # Wraps page content with consistent padding
```

All `ui/` and `music/PianoOctave`, `music/GuitarChordDiagram`, and all `learn/` files are shims.

### Constants (`src/constants/`)

All constants files have been deleted. Only `.test.js` files remain, with imports updated to `@tonarium/core` or `@tonarium/learn`. Do not add new constants files here — add to the appropriate package.

### Utils (`src/utils/`)

| File | Exports | Description |
|------|---------|-------------|
| `musicUtils.js` | `buildRows`, `buildGuitarNeck` | Pad grid and guitar neck layout builders |
| `beatUtils.js` | `GROOVE_INST_MAP`, `createEmptyPattern`, `buildPatternFromBeat` | Converts `BEAT_PATTERNS[idx]` to live drum engine pattern |
| `chordDetect.js` | `detectChord` | Detects chord name from a set of active notes |

---

## 4. Audio Architecture

Three cooperating modules share a single `AudioContext` to prevent clock drift.

```
audioContext.js          ← Shared AudioContext singleton + compressor
    ↑                        getCtx(), getBeatDest(), getProgDest()
    │
    ├── audioEngine.js   ← Note synth (bell/piano/pluck/synth styles)
    │                       startNote, stopNote, playNote, playChord
    │
    ├── drumEngine.js    ← 9-instrument drum synthesis + 16-step pattern state
    │                       play(), pause(), triggerDrumHit(), pattern, isPlaying, currentStep
    │
    └── transportClock.js ← Master lookahead scheduler (25ms tick, 0.1s lookahead)
                            startTransport(), stopTransport()
                            Drives: drum hits (via triggerDrumHit) + chord advancement
                            Reads: sessionState (BPM, progression, beatsPerChord)
```

**Critical invariant:** Only one drum scheduler may run at a time.

- `drumEngine.play()` runs its own `setTimeout` loop — used when playing beats standalone (DrumComputer, LearnBeats).
- `transportClock.startTransport()` takes over drum scheduling via `triggerDrumHit()`. It calls `drumEngine.pause()` first to stop any standalone loop.
- `transportClock._tick()` exits immediately if `sessionPlaying` is false — guards against timer races.
- `LearnBeats.loadBeat()` calls `stopTransport()` before `drumEngine.play()` to ensure the transport isn't running when the learn loop starts.

**MIDI:** `midiManager.js` handles device selection and sends note on/off in parallel with audio engine output.

---

## 5. State Management

No Vuex/Pinia. Shared state is exported `ref` from plain JS modules. Components import directly.

### Session State (`src/state/sessionState.js`)

The primary shared state — persists key settings to `localStorage`.

| Export | Type | Description |
|--------|------|-------------|
| `sessionKey` | `Ref<string>` | Current key (e.g. `'C'`) |
| `sessionProgression` | `Ref<Progression\|null>` | Active chord progression |
| `sessionBeatIdx` | `Ref<number>` | Index into `BEAT_PATTERNS` |
| `sessionBpm` | `Ref<number>` | Beats per minute |
| `sessionBeatsPerChord` | `Ref<number>` | How many beats each chord plays |
| `sessionPlaying` | `Ref<boolean>` | Transport running |
| `sessionCurrentChordIdx` | `Ref<number>` | Which chord is active in the loop |

### Other State Modules

| Module | Exports | Description |
|--------|---------|-------------|
| `displayMode.js` | `displayMode` | `'pad' \| 'guitar' \| 'piano'` |
| `padSize.js` | `padSize` | `'4x3' \| '4x4'` |
| `octave.js` | `octave` | Current pad octave |
| `jamSettings.js` | `selectedRoot`, `selectedScaleId`, `pianoOctave` | Jam Mode UI selections |
| `mixerState.js` | `jamVolume`, `beatVolume`, `progVolume` | Per-channel gain levels |
| `colorMode.js` | `colorMode` | Light/dark mode |
| `soundStyle.js` | `soundStyle` | Synth style selection |
| `soundEnabled.js` | `soundEnabled` | Global audio on/off |

---

## 6. Import Patterns

```js
// Library packages
import { NOTES, BEAT_PATTERNS, ALL_PROGRESSIONS } from '@tonarium/core'
import { NoteStripPicker, Card } from '@tonarium/vue'
import { LearnMode, INTERVALS } from '@tonarium/learn'

// App-local (via @ alias → src/)
import { buildRows } from '@/utils/musicUtils.js'
import { buildPatternFromBeat } from '@/utils/beatUtils.js'
import { displayMode } from '@/state/displayMode.js'
import { sessionProgression, sessionBpm } from '@/state/sessionState.js'
import { playNote, playChord } from '@/audio/audioEngine.js'
import { pattern, play, pause, isPlaying } from '@/audio/drumEngine.js'
import { startTransport, stopTransport } from '@/audio/transportClock.js'

// CSS (once, in main.js)
import '@tonarium/vue/styles'
```

**Rule:** Never import from `@/constants/` — those files are deleted. All constants come from `@tonarium/core` or `@tonarium/learn`.

---

## 7. CSS Architecture

### Design Tokens (in `@tonarium/vue/styles`)

```css
/* Spacing: --space-1 (0.25rem) through --space-8 (2rem) */
/* Typography: --text-2xs (0.65rem) through --text-2xl (1.1rem) */
/* Radius: --radius-sm (4px) through --radius-full (9999px) */
/* Font weight: --font-normal through --font-bold */
/* Transitions: --transition-fast / --transition-base / --transition-slow */
```

### Color Palette (dark warm theme)

Key variables defined in `colors.css`:

```css
--bg:         #242019   /* page background */
--accent:     #c8a96e   /* gold — primary accent */
--accent-mid: #a08850   /* muted accent */
--text:       #e8dcc8   /* primary text */
--text3:      #9a8f7f   /* secondary text */
--raised:     #2e2820   /* raised surface */
--input:      #1e1a14   /* input background */
--border:     #3a3228   /* subtle border */
--border2:    #4a4038   /* stronger border */
```

### Global Classes (available everywhere)

```
Buttons:  .btn, .btn-sm, .btn-lg, .btn-accent, .btn-block, .btn-icon
Cards:    .card, .card-sm, .card-interactive
Forms:    .form-select, .form-input
Layout:   .picker-row, .picker-label, .flex, .gap-*, .w-full
Learn:    .step-content, .step-intro, .step-bridge, .numbered-badge
Pills:    .note-pill
Tabs:     .tab, .tab-active
```

### Scoped CSS Convention

Every SFC has its own scoped `<style>`. Component-specific classes use a `tc-component-element` prefix (e.g. `.tc-learn-roots-picker`, `.tc-jsb-bpm-row`) to avoid collisions when scoping is insufficient.

---

## 8. Component API Contracts

### PageHeader

**Source:** `packages/tonarium-vue/src/components/ui/PageHeader.vue`

```typescript
Props: { title: string, subtitle?: string }
Slots: #actions (right-aligned)
```

```vue
<PageHeader title="Jam Mode" subtitle="Play along" >
  <template #actions><button class="btn btn-icon">✕</button></template>
</PageHeader>
```

---

### NoteStripPicker

**Source:** `packages/tonarium-vue/src/components/ui/NoteStripPicker.vue`

```typescript
Props: {
  modelValue?: NoteIndex | null   // selected note (0–11)
  highlightSet?: Set<NoteIndex>   // scale/chord highlight
  fromIndex?: NoteIndex | null    // interval "from"
  toIndex?: NoteIndex | null      // interval "to"
  small?: boolean
  disabled?: boolean
}
Events: 'update:modelValue', 'note-down'
```

```vue
<NoteStripPicker v-model="root" :highlight-set="scaleNotes" @note-down="playNote" />
<NoteStripPicker :from-index="fromIdx" :to-index="toIdx" @note-down="pickNote" />
```

---

### KnobControl

**Source:** `packages/tonarium-vue/src/components/ui/KnobControl.vue`

```typescript
Props: {
  modelValue: number
  min?: number        // default 0
  max?: number        // default 100
  label?: string
}
Events: 'update:modelValue'
```

---

### Card / PickerRow

```vue
<!-- Card: use CSS classes directly, no props needed -->
<div class="card">...</div>
<div class="card card-sm card-interactive">...</div>

<!-- PickerRow: label + slot -->
<PickerRow label="Key">
  <select class="form-select">...</select>
</PickerRow>
```

---

### PianoOctave

**Source:** `packages/tonarium-vue/src/components/music/PianoOctave.vue`

```typescript
Props: {
  activeIndices?: Set<NoteIndex>
  rootIndex?: NoteIndex
  octave?: number
  showOctaveSelector?: boolean
  clickable?: boolean
  dimInactive?: boolean
}
Events: 'notedown', 'noteup', 'update:octave'
```

---

### GuitarChordDiagram

**Source:** `packages/tonarium-vue/src/components/music/GuitarChordDiagram.vue`

```typescript
Props: {
  root: NoteIndex       // root note index (A-based)
  type: string          // 'maj' | 'min' | 'dom7' | 'maj7' | 'min7' | 'dim'
}
```

Internally cycles through voicings. Reads `OPEN_STRINGS` from `@tonarium/core`.

---

### ChordCardBody

**Source:** `src/components/music/ChordCardBody.vue`

Shared by `ChordProgressions` and `ProgressionBuilder`. Adapts to the global `displayMode` ref.

```typescript
Props: {
  chord: ProgressionChord   // from @tonarium/core Chord type
  isActive?: boolean
}
```

Renders pad highlights, guitar chord diagram, or piano keys depending on `displayMode.value`.

# Tonarium - Claude Code Instructions

## Commands
- `npm run dev` - start dev server
- `npm run build` - Vite build (base path `/tonarium/`)
- `npm test` - run unit and component tests (Vitest)
- `npm run test:watch` - Vitest in watch mode
- `npm run test:coverage` - coverage report
- `npm run test:e2e` - Playwright e2e tests

## Slash commands
- `copuco` - commit the current changes, push to origin, then /compact

## Architecture

Vue 3 Composition API (`<script setup>`). No Vuex/Pinia - shared state via exported `ref` in plain JS modules.

### Shared modules (import from these, don't duplicate)
- `@tonarium/core` - all music constants (NOTES, LABELS, SHARPS, CHORD_TYPES, CHORD_SUFFIX, FLAT_MAP, OPEN_STRINGS, STRING_NAMES, FRET_COUNT, NOTE_TO_SEMI, SEMI_TO_NAME, CHORD_DETECT_TYPES). `src/constants/` is deleted — never import from there.
- `src/utils/musicUtils.js` - `buildRows(activeSet, rootPad, cols)` and `buildGuitarNeck(cellExtras)`
- `src/state/displayMode.js` - global display mode ref (`'pad' | 'guitar' | 'piano'`)
- `src/state/padSize.js` - pad grid size ref (`'4x3' | '4x4'`)
- `src/state/sessionState.js` - jam session state (sessionKey, sessionProgression, sessionBeatIdx, sessionBpm, sessionBeatsPerChord, sessionPlaying, sessionCurrentChordIdx). Persists key settings to localStorage.
- `src/state/landingState.js` - `requestedLandingView` and `activeLandingView` refs for coordinating sub-view navigation between App.vue and LandingPage. Set `requestedLandingView` to `'jam'`, `'learn'`, or `'hero'` to drive LandingPage navigation from outside. Also `requestedKbTerm` — set this then navigate to the `kb` tab to open KnowledgeBase on a specific term.

### Learn mode framework (`packages/tonarium-learn/`)
- `src/components/lesson/LearnLesson.vue` - canonical lesson container. Wrap every new lesson in `<LearnLesson id="...">`; the id must be in `LEARN_LESSON_IDS`. An IntersectionObserver on a sentinel at the bottom marks the lesson complete the first time the reader reaches the end.
- `src/components/lesson/LessonIntro.vue`, `LessonSection.vue`, `LessonFactCard.vue` - reusable building blocks. Compose these instead of writing fresh scoped CSS for layout in each lesson.
- `src/components/lesson/LessonText.vue` - prose wrapper that auto-detects KB terms (uses the same regex tokenizer as `KbText`) and opens `KbPopover` on tap.
- `src/state/learnProgress.js` - `completedLessons` (ref Set), `markLessonComplete(id)`, `learnPercentage` (computed). Persists to `localStorage` under `learnCompleted`.
- `LEARN_LESSON_IDS` is the canonical id list — extend it whenever you add a new lesson.
- Note: 7 of 9 lessons are still on the legacy structure; only Root Notes and Intervals have been migrated. Migrate the rest incrementally as you touch them.

### Knowledge base (`src/pages/knowledge/`)
- `termMap.js` - `TERM_MAP`, `findTerm`, `getTermRegex`. Adding a term: add an entry here, create `terms/Kb<Name>.vue`, register it in `KnowledgeBase.vue`'s `TERM_COMPONENTS`.
- `KbText.vue` - inline term-link renderer used inside KB term pages (clicks navigate within KB).
- `KbPopover.vue` + `popoverState.js` - universal popover (mounted once at App root) for term lookups from outside KB pages (e.g. inside lessons). Reads `popoverTerm` / `popoverAnchor`; "Read more" sets `requestedKbTerm` and emits `navigate('kb')`.

### Audio modules
- `src/audio/audioContext.js` - shared AudioContext singleton with compressor. Both audioEngine and drumEngine import from here to prevent clock drift.
- `src/audio/audioEngine.js` - note synth (12 styles: synth, piano, bell, pluck, marimba, glass, pulse, organ, brass, kalimba, rhodes, strings). startNote/stopNote/playNote/playChord.
- `src/audio/drumEngine.js` - 9-instrument drum synthesis, 16-step pattern state, play/pause/triggerDrumHit. Does NOT self-schedule when used via transportClock.
- `src/audio/transportClock.js` - master clock for synchronized playback. Drives both drum hits and chord advancement using lookahead scheduling. Reads from sessionState.
- `src/audio/midiManager.js` - MIDI I/O, device selection, note/chord on/off.

### Shared components
- `ChordCardBody.vue` - three-mode chord display used by ChordProgressions and ProgressionBuilder

## Display modes
Every tab adapts to three modes. Components import `displayMode` directly from `src/state/displayMode.js`.
- **Pad**: 4x3 or 4x4 chromatic pad grid (size set by `padSize` ref; rows top->bottom = high->low pitch)
- **Guitar**: 7-fret neck or chord diagram (standard tuning)
- **Piano**: keyboard layout

## Music conventions
- Notes array is **A-based** (index 0 = A): `['A','A#','B','C','C#','D','D#','E','F','F#','G','G#']`
- Guitar open strings (A-based indices, low->high): `[7, 0, 5, 10, 2, 7]` = E2 A2 D3 G3 B3 E4
- Chord detection uses C-based semitones internally (NOTE_TO_SEMI / SEMI_TO_NAME for conversion)

## Style
- Dark warm palette: background `#242019`, accent `#c8a96e`, muted `#7a6f60`
- Scoped CSS in every SFC; no global stylesheet beyond `src/style.css`
- No emojis, no unnecessary comments

## Language
- No em dashes (`—`) in display text (labels, descriptions, tooltips, UI copy). Use a period or rewrite the sentence instead.

@ROADMAP.md

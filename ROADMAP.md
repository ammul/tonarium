# Tonarium - Roadmap

## Monetization strategy
Ko-fi donation button on the free web app (hosted on GitHub Pages). No backend, no paywall.
Target audience: synth nerds, beatmakers, teachers, and people who love music but don't read sheet music.

---

## v1.0 - Shipped

### Unified Jam Experience
- [x] Shared AudioContext - single clock for drums and notes, no drift
- [x] Session state module - reactive refs for key, progression, BPM, beat pattern
- [x] Transport clock - master lookahead scheduler driving drums and chord advancement
- [x] JamMode as performance surface - progression picker, beat picker, BPM control, transport
- [x] Chord-aware highlighting - pad/guitar/piano highlights shift with each chord in the loop
- [x] Auto-suggestions - genre-to-beat mapping, scale auto-selection from key

### Cross-Tool Integration
- [x] "Jam with This" button on progression cards - loads progression into JamMode
- [x] "Use in Jam" button on DrumComputer - loads pattern + BPM into JamMode
- [x] "Try in Jam Mode" CTA on LearnSongStructure

### Educational Integration
- [x] LearnJamSession - capstone step 9, guided setup from progression to full jam
- [x] 9-step Learn Mode (was 8)

### Test Coverage
- [x] 50 test files, 417+ tests (Vitest)
- [x] All source files covered: audio, state, constants, components, pages, composables
- [x] E2E tests (Playwright)

### Public Readiness
- [x] MIT license
- [x] Hero copy for target audience
- [x] About section
- [x] Session widget in header (current chord + transport controls)
- [x] README, CLAUDE.md, ROADMAP.md documentation

---

## Post-v1.0 - Growth & Polish

- [ ] Fix header cramping when MIDI is active (`App.vue`)
- [ ] Fill in About section: real name, one-sentence bio, Ko-fi URL
- [ ] Create Ko-fi page and replace placeholder URL
- [ ] Convert to PWA (installable, offline) - `vite-plugin-pwa`, manifest, service worker
- [ ] MIDI status indicator in header (small dot when connected)
- [ ] `<meta>` tags for social sharing (og:title, og:description, og:image)
- [ ] Favicon / app icon that isn't the Vite default
- [ ] Visual chord timeline in JamMode (horizontal bar with playhead)
- [ ] Swing/shuffle parameter on transport clock

---

## Future - Paid Features

Only worth building once there's an audience. All client-side, no backend.

- [ ] MIDI file export - record a progression or jam session and export as `.mid`
- [ ] Additional sound packs - more drum kits and instrument timbres bundled as assets
- [ ] Custom sample upload - File API + IndexedDB, files stay local (no server needed)
- [ ] Multi-bar drum patterns (2-bar, 4-bar variations)

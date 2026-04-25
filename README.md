# Tonarium

**Play music. No sheet music required.**

A free web app for people who love music but never learned to read it. Pick a chord progression, add a beat, and jam - the app highlights which notes sound good as each chord cycles. Works with synths, guitars, MIDI controllers, or just your screen.

**[Try it live](https://ammul.github.io/tonarium/)**

---

## The Jam Experience

This is the core of Tonarium. Open **Quick Jam** from the home screen:

1. **Pick a chord progression** - browse 69 presets across 10 genres, or type your own
2. **Add a drum beat** - choose from 10 grooves (rock, hip-hop, bossa nova, trap...)
3. **Set the tempo** and hit play
4. **Improvise** - as each chord loops, the pads/frets/keys light up to show you the best notes to play right now

Everything stays in sync. The drums and chords share one clock so nothing drifts.

## Three Pillars

### Beats
A 16-step drum sequencer with 9 synthesised instruments. Pick a groove preset or build your own pattern from scratch. The beat keeps playing when you switch tabs.

### Chord Progressions
69 classic progressions from pop to jazz to cinematic, transposed to any key. Hear how I-V-vi-IV sounds, then tap "Jam with This" to load it into Quick Jam with a beat running.

### Improvising
Pick a key, pick a scale, and see which notes are safe. Anchor notes (root, 3rd, 5th) glow brighter. Turn on chord mode and the highlights shift to match each chord as it plays.

## All Tools

| Tool | What it does |
|------|-------------|
| **Quick Jam** | Unified performance surface: key, scale, progression, beat, BPM and improv in one place |
| **Learn** | 9-step interactive course: root notes through full jam sessions |
| **Drum Computer** | 16-step sequencer, 9 instruments, 10 groove presets |
| **Chord Progressions** | 69 presets across 10 genres with playback |
| **Scale Visualizer** | See any scale across all 12 notes |
| **Chord Detector** | Select notes, identify the chord |
| **Chord Library** | 204 chords across 17 types, searchable by name or flat notation (Bb, Db...) |
| **Progression Builder** | Type chord symbols, see them mapped to your instrument |

## Learn Mode

A 9-step hands-on course that takes you from "what's a root note?" to jamming over a chord progression with a drum beat. Each step has interactive audio examples. The final step sets up a full jam session and drops you into Jam Mode.

## Audio

All sound is synthesised in the browser via the Web Audio API. No samples, no downloads. Four sound styles for note playback (Synth, Piano, Bell, Pluck), configurable in Settings.

The drum engine and chord engine share a single AudioContext and transport clock, so drums and chord loops stay perfectly in sync.

## Web MIDI

Connect a USB MIDI device via **Settings**. Notes and chords from all tools are sent to the device. MIDI note numbers show on pads for easy patch mapping. Requires a browser with Web MIDI API support.

## Display Modes

All tools adapt to three layouts, selectable in Settings:

| Mode | Description |
|------|-------------|
| **Pad** | Chromatic pad grid (4x3 or 4x4) |
| **Guitar** | 6-string fretboard, standard tuning |
| **Piano** | Keyboard layout |

## Development

```bash
npm install && npm run dev
```

```bash
npm test          # 467 unit + component tests (Vitest)
npm run test:e2e  # end-to-end tests (Playwright)
npm run build     # production build
```

## License

MIT - see [LICENSE](LICENSE).

---

Built by [ammul](https://github.com/ammul). If Tonarium helps you make music, consider [supporting on Ko-fi](https://ko-fi.com/ammul).

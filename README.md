# Tonarium

A web app for people with a bad musical education. Helps you see what's going on harmonically — scales, chords, progressions — laid out visually across the instrument of your choice.

## Tools

- **Chord Progressions** — browse classic progressions (I–V–vi–IV, ii–V–I, Canon in D, …) in any root key; tap a chord card to preview it via MIDI, or hit Play to loop the progression on your synth while you improvise
- **Claves Mode** — chromatic 4×3 pad layout matching the EP-1320; tap/hold pads to play notes via MIDI *(EP-1320 display only)*
- **Jam Mode** — pick a key and scale to see safe notes highlighted; anchor notes (root, 3rd, 5th) are marked so you always know where to land
- **Scale Visualizer** — see any scale across all 12 notes
- **Chord Detector** — select some notes, find out what chord they make
- **Progression Builder** — arrange your own chord sequence and see it mapped out

## Web MIDI

Connect a USB MIDI device (e.g. a TE EP-1320 via USB-C OTG) and click the **MIDI** button in the header. Once connected:

- Select the output device if multiple are available
- Pick a lane (A / B / C / D) — maps to MIDI channels 1–4
- Claves Mode: tap pads to play notes, hold to sustain
- Chord Progressions: tap a chord card to preview it; use Play/Stop to loop the full progression at a configurable BPM and beats-per-chord

Requires Chrome or any browser with Web MIDI API support.

## Display Modes

All tools adapt to four layouts, selectable via the Display dropdown:

| Mode | Description |
|------|-------------|
| EP-1320 | 4×3 chromatic pad grid (Teenage Engineering EP-1320) — default |
| Guitar | 6-string fretboard in standard tuning |
| Piano | Keyboard layout |
| Notes | Plain chromatic note names |

## Development

Clone the repository — it's a plain Vite / Vue 3 app.

```bash
npm install && npm run dev
```

## License

Shield: [![CC BY-NC 4.0][cc-by-nc-shield]][cc-by-nc]

This work is licensed under a
[Creative Commons Attribution-NonCommercial 4.0 International License][cc-by-nc].

[![CC BY-NC 4.0][cc-by-nc-image]][cc-by-nc]

[cc-by-nc]: https://creativecommons.org/licenses/by-nc/4.0/
[cc-by-nc-image]: https://licensebuttons.net/l/by-nc/4.0/88x31.png
[cc-by-nc-shield]: https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg

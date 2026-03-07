<script setup>
import { ref, computed } from 'vue'

const NOTES  = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']
const LABELS = ['.',  '0',  'i', '1', '2',  '3', '4',  '5', '6', '7',  '8', '9']
const SHARPS = new Set(['A#', 'C#', 'D#', 'F#', 'G#'])

// Semitone value from C for each note index (A=0 in app, C=0 in music theory)
// A→9, A#→10, B→11, C→0, C#→1, D→2, D#→3, E→4, F→5, F#→6, G→7, G#→8
const NOTE_TO_SEMI = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8]
const SEMI_TO_NAME = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// interval sets → chord quality suffix
const CHORD_TYPES = [
  { intervals: [0, 7],           suffix: '5',      name: 'Power chord' },
  { intervals: [0, 4, 7],        suffix: '',        name: 'Major' },
  { intervals: [0, 3, 7],        suffix: 'm',       name: 'Minor' },
  { intervals: [0, 3, 6],        suffix: '°',       name: 'Diminished' },
  { intervals: [0, 4, 8],        suffix: '+',       name: 'Augmented' },
  { intervals: [0, 2, 7],        suffix: 'sus2',    name: 'Sus2' },
  { intervals: [0, 5, 7],        suffix: 'sus4',    name: 'Sus4' },
  { intervals: [0, 4, 7, 9],     suffix: '6',       name: 'Major 6th' },
  { intervals: [0, 3, 7, 9],     suffix: 'm6',      name: 'Minor 6th' },
  { intervals: [0, 4, 7, 10],    suffix: '7',       name: 'Dominant 7th' },
  { intervals: [0, 4, 7, 11],    suffix: 'maj7',    name: 'Major 7th' },
  { intervals: [0, 3, 7, 10],    suffix: 'm7',      name: 'Minor 7th' },
  { intervals: [0, 3, 6, 10],    suffix: 'm7♭5',   name: 'Half-diminished 7th' },
  { intervals: [0, 3, 6, 9],     suffix: '°7',      name: 'Diminished 7th' },
  { intervals: [0, 4, 7, 10, 2], suffix: '9',       name: 'Dominant 9th' },
  { intervals: [0, 4, 7, 11, 2], suffix: 'maj9',    name: 'Major 9th' },
  { intervals: [0, 3, 7, 10, 2], suffix: 'm9',      name: 'Minor 9th' },
]

function detectChord(noteIndices) {
  if (noteIndices.length < 2) return null

  // Convert app indices to semitone values, deduplicate pitch classes
  const semis = [...new Set(noteIndices.map(i => NOTE_TO_SEMI[i]))].sort((a, b) => a - b)

  // Try each note as root, look for a matching chord type
  const results = []

  for (const rootSemi of semis) {
    // Compute intervals from this root, mod 12, sort
    const intervals = semis.map(s => (s - rootSemi + 12) % 12).sort((a, b) => a - b)

    for (const type of CHORD_TYPES) {
      if (
        type.intervals.length === intervals.length &&
        type.intervals.every((v, i) => v === intervals[i])
      ) {
        const rootName = SEMI_TO_NAME[rootSemi]
        // Determine if it's an inversion (lowest note ≠ root)
        const lowestSemi = semis[0]
        const isInversion = lowestSemi !== rootSemi
        const bassName = SEMI_TO_NAME[lowestSemi]
        results.push({
          root: rootName,
          suffix: type.suffix,
          name: type.name,
          inversion: isInversion ? `/${bassName}` : '',
          display: `${rootName}${type.suffix}${isInversion ? `/${bassName}` : ''}`,
        })
      }
    }
  }

  if (results.length === 0) return null

  // Prefer root-position chords, then return first match
  const rootPos = results.find(r => !r.inversion)
  return rootPos ?? results[0]
}

// ── Pad state ──────────────────────────────────────────────
const selected = ref(new Set())

function togglePad(index) {
  const next = new Set(selected.value)
  next.has(index) ? next.delete(index) : next.add(index)
  selected.value = next
}

function clearAll() {
  selected.value = new Set()
}

const pads = computed(() =>
  NOTES.map((note, i) => ({
    index: i,
    label: LABELS[i],
    note,
    isSharp: SHARPS.has(note),
    isSelected: selected.value.has(i),
  }))
)

const rows = computed(() => [
  pads.value.slice(9, 12),
  pads.value.slice(6, 9),
  pads.value.slice(3, 6),
  pads.value.slice(0, 3),
])

const selectedNames = computed(() =>
  [...selected.value].sort((a, b) => a - b).map(i => NOTES[i])
)

const chord = computed(() => detectChord([...selected.value]))
</script>

<template>
  <div class="chord-detector">

    <div class="header">
      <h2>Chord Detector</h2>
      <p class="subtitle">Tap the notes you're playing — the chord is identified instantly</p>
    </div>

    <div class="grid">
      <div class="row" v-for="(row, ri) in rows" :key="ri">
        <button
          v-for="pad in row"
          :key="pad.index"
          class="pad"
          :class="{ sharp: pad.isSharp, selected: pad.isSelected }"
          @click="togglePad(pad.index)"
        >
          <span class="pad-label">{{ pad.label }}</span>
          <span class="pad-note">{{ pad.note }}</span>
        </button>
      </div>
    </div>

    <button class="clear-btn" @click="clearAll" :disabled="selected.size === 0">
      Clear
    </button>

    <!-- Result panel -->
    <div class="result" :class="{ empty: selected.size === 0 }">
      <template v-if="selected.size === 0">
        <p class="hint">Select two or more notes</p>
      </template>
      <template v-else-if="chord">
        <div class="chord-name">{{ chord.display }}</div>
        <div class="chord-quality">{{ chord.name }}<span v-if="chord.inversion" class="inversion-label"> · inversion</span></div>
        <div class="chord-notes">{{ selectedNames.join('  ·  ') }}</div>
      </template>
      <template v-else>
        <div class="chord-name unknown">?</div>
        <div class="chord-quality">No matching chord</div>
        <div class="chord-notes">{{ selectedNames.join('  ·  ') }}</div>
      </template>
    </div>

  </div>
</template>

<style scoped>
.chord-detector {
  background: #242019;
  border: 1px solid #3a3228;
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header h2 {
  font-size: 1.4rem;
  color: #c8a96e;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.subtitle {
  margin-top: 0.3rem;
  font-size: 0.85rem;
  color: #7a6f60;
}

/* ── Grid ── */
.grid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 360px;
}

.row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

.pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.75rem 0.5rem;
  border-radius: 8px;
  border: 1px solid #4a4030;
  background: #2e2820;
  cursor: pointer;
  aspect-ratio: 1;
  transition: background 0.1s, border-color 0.1s, transform 0.08s;
  -webkit-tap-highlight-color: transparent;
}

.pad:hover {
  background: #3a3228;
}

.pad:active {
  transform: scale(0.95);
}

.pad.sharp {
  background: #1e1c18;
  border-color: #3a3228;
}
.pad.sharp:hover {
  background: #2a2820;
}

.pad.selected {
  background: #3d3010;
  border-color: #c8a96e;
  box-shadow: 0 0 8px rgba(200, 169, 110, 0.25);
}
.pad.selected.sharp {
  background: #302808;
}

.pad-label {
  font-size: 0.65rem;
  color: #5a5040;
  font-weight: 600;
  letter-spacing: 0.1em;
}

.pad.selected .pad-label {
  color: #a08848;
}

.pad-note {
  font-size: 1.4rem;
  font-weight: 700;
  color: #c8a96e;
  line-height: 1;
}
.pad.sharp .pad-note {
  color: #a08858;
}
.pad.selected .pad-note {
  color: #e8c87e;
}

/* ── Clear button ── */
.clear-btn {
  align-self: flex-start;
  padding: 0.35rem 1rem;
  border-radius: 6px;
  border: 1px solid #4a4030;
  background: transparent;
  color: #7a6f60;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.clear-btn:hover:not(:disabled) {
  color: #e8dcc8;
  border-color: #6a6050;
}
.clear-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

/* ── Result ── */
.result {
  border-top: 1px solid #3a3228;
  padding-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  min-height: 100px;
}

.result.empty {
  opacity: 0.4;
}

.hint {
  font-size: 0.9rem;
  color: #5a5040;
  margin-top: 0.5rem;
}

.chord-name {
  font-size: clamp(2.5rem, 12vw, 4rem);
  font-weight: 700;
  color: #c8a96e;
  line-height: 1;
  letter-spacing: 0.03em;
}
.chord-name.unknown {
  color: #5a5040;
}

.chord-quality {
  font-size: 0.95rem;
  color: #a09070;
  letter-spacing: 0.04em;
}

.inversion-label {
  color: #6a6050;
  font-size: 0.85rem;
}

.chord-notes {
  font-size: 0.8rem;
  color: #5a5040;
  letter-spacing: 0.08em;
  margin-top: 0.2rem;
}

@media (max-width: 600px) {
  .chord-detector {
    padding: 1.25rem 1rem;
  }
  .pad-note {
    font-size: 1.2rem;
  }
}
</style>

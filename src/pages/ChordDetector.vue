<script setup>
import { ref, computed } from 'vue'
import { displayMode } from '@/state/displayMode.js'
import { padSize } from '@/state/padSize.js'
import { NOTES, SHARPS, NOTE_TO_SEMI, FRET_COUNT } from '@tonarium/core'
import { playNote } from '@/audio/audioEngine.js'
import { buildGuitarNeck, sliceRows } from '@/utils/musicUtils.js'
import { detectChord } from '@/utils/chordDetect.js'
import PianoOctave from '@/components/music/PianoOctave.vue'
import ModeLayout from '@/components/layout/ModeLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import NoteStripPicker from '@/components/ui/NoteStripPicker.vue'

const selected = ref(new Set())
const pianoOctave = ref(4)

function toggleNote(noteIndex) {
  const next = new Set(selected.value)
  if (next.has(noteIndex)) {
    next.delete(noteIndex)
  } else {
    next.add(noteIndex)
    playNote(60 + NOTE_TO_SEMI[noteIndex])
  }
  selected.value = next
}

function clearAll() {
  selected.value = new Set()
}

const cols = computed(() => padSize.value === '4x4' ? 4 : 3)

const pads = computed(() =>
  Array.from({ length: 4 * cols.value }, (_, i) => {
    const noteIndex = i % 12
    return {
      padIdx:    i,
      noteIndex,
      label:     String(i + 1),
      note:      NOTES[noteIndex],
      isSharp:   SHARPS.has(NOTES[noteIndex]),
      isSelected: selected.value.has(noteIndex),
    }
  })
)

const rows = computed(() => sliceRows(pads.value, cols.value))

// Guitar mode: fretboard (high e at top)
const guitarNeck = computed(() =>
  buildGuitarNeck(noteIdx => ({
    isSharp:    SHARPS.has(NOTES[noteIdx]),
    isSelected: selected.value.has(noteIdx),
  }))
)

const selectedNames = computed(() =>
  [...selected.value].sort((a, b) => a - b).map(i => NOTES[i])
)

const chord = computed(() => detectChord([...selected.value]))

const subtitle = computed(() => {
  if (displayMode.value === 'pad') return "Tap the notes you're playing - the chord is identified instantly"
  if (displayMode.value === 'guitar') return 'Click frets on the neck - chord identified instantly'
  return 'Click piano keys to select - chord identified instantly'
})
</script>

<template>
  <div class="tc-detector">

    <PageHeader title="Chord Detector" :subtitle="subtitle" />

    <div class="tc-detector-body">
      <div class="tc-detector-input-col">
        <ModeLayout>
          <template #pad>
            <div class="tc-detector-pad-grid">
              <div class="tc-detector-pad-row" v-for="(row, ri) in rows" :key="ri" :style="{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }">
                <button
                  v-for="pad in row"
                  :key="pad.padIdx"
                  class="tc-detector-pad"
                  :class="{ sharp: pad.isSharp, selected: pad.isSelected }"
                  @pointerdown.prevent="toggleNote(pad.noteIndex)"
                >
                  <span class="tc-detector-pad-label">{{ pad.label }}</span>
                  <span class="tc-detector-pad-note">{{ pad.note }}</span>
                </button>
              </div>
            </div>
          </template>

          <template #piano>
            <PianoOctave
              :activeIndices="selected"
              v-model:octave="pianoOctave"
              :clickable="true"
              @notedown="toggleNote"
            />
          </template>

          <template #guitar>
            <div class="tc-detector-neck-wrap">
              <div class="tc-detector-neck">
                <div v-for="(string, si) in guitarNeck" :key="si" class="tc-detector-neck-row">
                  <div class="tc-detector-string-name">{{ string.name }}</div>
                  <button
                    v-for="cell in string.cells"
                    :key="cell.fret"
                    class="tc-detector-neck-cell"
                    :class="{
                      selected: cell.isSelected,
                      sharp: cell.isSharp,
                      open: cell.isOpen,
                    }"
                    @pointerdown.prevent="toggleNote(cell.noteIdx)"
                  >
                    <span v-if="cell.isSelected" class="tc-detector-neck-dot"></span>
                    <span v-else class="tc-detector-neck-note">{{ cell.note }}</span>
                  </button>
                </div>
                <div class="tc-detector-fret-numbers">
                  <div class="tc-detector-fret-num-spacer"></div>
                  <div v-for="f in FRET_COUNT + 1" :key="f" class="tc-detector-fret-num">
                    {{ f - 1 === 0 ? '' : f - 1 }}
                  </div>
                </div>
              </div>
            </div>
          </template>
        </ModeLayout>

        <button class="btn btn-sm tc-detector-clear-btn" @click="clearAll" :disabled="selected.size === 0">
          Clear
        </button>
      </div>

      <div class="tc-detector-result" :class="{ empty: selected.size === 0 }">
        <template v-if="selected.size === 0">
          <p class="tc-detector-hint">Select two or more notes</p>
        </template>
        <template v-else-if="chord">
          <div class="tc-detector-chord-name">{{ chord.display }}</div>
          <div class="tc-detector-chord-quality">{{ chord.name }}<span v-if="chord.inversion" class="tc-detector-inversion"> · inversion</span></div>
          <div class="tc-detector-chord-notes">{{ selectedNames.join('  ·  ') }}</div>
        </template>
        <template v-else>
          <div class="tc-detector-chord-name unknown">?</div>
          <div class="tc-detector-chord-quality">No matching chord</div>
          <div class="tc-detector-chord-notes">{{ selectedNames.join('  ·  ') }}</div>
        </template>
      </div>
    </div>

  </div>
</template>

<style scoped>
.tc-detector {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tc-detector-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tc-detector-input-col {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
}

/* Pad grid — base layout from display-modes.css (.pad-grid, .pad-row) */
.tc-detector-pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.75rem 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--border2);
  background: var(--raised);
  cursor: pointer;
  aspect-ratio: 1;
  user-select: none;
  touch-action: none;
  transition: background 0.1s, border-color 0.1s, transform 0.08s;
  -webkit-tap-highlight-color: transparent;
}

.tc-detector-pad:hover { background: var(--border); }
.tc-detector-pad:active { transform: scale(0.95); }
.tc-detector-pad.sharp { background: var(--input); border-color: var(--border); }
.tc-detector-pad.sharp:hover { background: var(--border3); }
.tc-detector-pad.selected { background: var(--selected); border-color: var(--accent); box-shadow: 0 0 8px var(--accent-glow); }
.tc-detector-pad.selected.sharp { background: var(--sharp-sel); }

.tc-detector-pad-label { font-size: 0.65rem; color: var(--text4); font-weight: 600; letter-spacing: 0.1em; }
.tc-detector-pad.selected .tc-detector-pad-label { color: var(--accent-dim); }
.tc-detector-pad-note { font-size: 1.4rem; font-weight: 700; color: var(--accent); line-height: 1; }
.tc-detector-pad.sharp .tc-detector-pad-note { color: var(--accent-lo); }
.tc-detector-pad.selected .tc-detector-pad-note { color: var(--accent-hi); }

/* Guitar neck — overrides display-modes.css base where ChordDetector differs */
.tc-detector-neck-wrap { overflow-x: auto; }
.tc-detector-neck { min-width: 600px; }
.tc-detector-neck-row { align-items: stretch; }
.tc-detector-string-name { display: flex; align-items: center; justify-content: flex-end; }

.tc-detector-neck-cell {
  height: 2.4rem;
  border: none;
  background: var(--input);
  touch-action: none;
  transition: background 0.1s;
  border-right: 1px solid var(--border3);
  -webkit-tap-highlight-color: transparent;
}

.tc-detector-neck-cell:hover { background: var(--border3); }
.tc-detector-neck-cell.sharp { background: var(--sharp); }
.tc-detector-neck-cell.sharp:hover { background: var(--border3); }
.tc-detector-neck-cell.open { border-right: 3px solid var(--border2); background: var(--surface); }
.tc-detector-neck-cell.open:hover { background: var(--raised); }
.tc-detector-neck-cell.selected { background: var(--selected); }
.tc-detector-neck-cell.selected.sharp { background: var(--sharp-sel); }

.tc-detector-neck-dot { background: var(--accent); box-shadow: 0 0 4px var(--accent-glow); }

.tc-detector-neck-note {
  font-size: 0.6rem;
  color: var(--border);
  font-weight: 600;
  pointer-events: none;
}

.tc-detector-neck-cell.open .tc-detector-neck-note { color: var(--text5); }
.tc-detector-fret-numbers { margin-top: 0.25rem; }

/* unique properties not covered by .btn + .btn-sm */
.tc-detector-clear-btn { align-self: flex-start; letter-spacing: 0.05em; }

/* Result */
.tc-detector-result {
  border-top: 1px solid var(--border);
  padding-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4rem;
  min-height: 100px;
}

@media (min-width: 600px) {
  .tc-detector-body {
    flex-direction: row;
    align-items: flex-start;
    gap: 2rem;
  }

  .tc-detector-input-col {
    flex-shrink: 0;
  }

  .tc-detector-result {
    flex: 1;
    border-top: none;
    border-left: 1px solid var(--border);
    padding-top: 0;
    padding-left: 2rem;
    min-height: 0;
  }
}

.tc-detector-result.empty { opacity: 0.4; }
.tc-detector-hint { font-size: 0.9rem; color: var(--text4); margin-top: 0.5rem; }

.tc-detector-chord-name {
  font-size: clamp(2.5rem, 12vw, 4rem);
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
  letter-spacing: 0.03em;
}

.tc-detector-chord-name.unknown { color: var(--text4); }
.tc-detector-chord-quality { font-size: 0.95rem; color: var(--accent-lo); letter-spacing: 0.04em; }
.tc-detector-inversion { color: var(--accent-mid); font-size: 0.85rem; }
.tc-detector-chord-notes { font-size: 0.8rem; color: var(--text4); letter-spacing: 0.08em; margin-top: 0.2rem; }

@media (max-width: 600px) {
  .tc-detector { padding: 1.25rem 1rem; }
  .tc-detector-pad-note { font-size: 1.2rem; }
}

@media (orientation: landscape) and (max-height: 500px) {
  .tc-detector {
    padding: 0.75rem 1rem;
    gap: 0.75rem;
  }

  .tc-detector-result {
    padding-top: 0.75rem;
    min-height: 60px;
  }

  .tc-detector-chord-name {
    font-size: clamp(1.8rem, 8vw, 2.5rem);
  }
}
</style>

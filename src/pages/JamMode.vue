<script setup>
import { ref, computed } from 'vue'
import { displayMode } from '@/state/displayMode.js'
import { padSize } from '@/state/padSize.js'
import { NOTES, SHARPS, FRET_COUNT, NOTE_TO_SEMI, CHORD_TYPES, CHORD_SUFFIX } from '@/constants/musicConstants.js'
import { buildGuitarNeck, sliceRows } from '@/utils/musicUtils.js'
import { activeInputNotes, midiStatus } from '@/audio/midiManager.js'
import { useNotePlayback } from '@/composables/useNotePlayback.js'
import PianoOctave from '@/components/music/PianoOctave.vue'
import ScaleLegend from '@/components/music/ScaleLegend.vue'
import RootNotePicker from '@/components/music/RootNotePicker.vue'
import ModeLayout from '@/components/layout/ModeLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import PickerRow from '@/components/ui/PickerRow.vue'
import ScaleSelector from '@/components/jam/ScaleSelector.vue'
import OctaveControl from '@/components/jam/OctaveControl.vue'
import { JAM_SCALES as SCALES } from '@/constants/scales.js'

// Semitone offsets from root considered "anchor" notes (root, minor 3rd, major 3rd, 5th)
const ANCHOR_OFFSETS = new Set([0, 3, 4, 7])

// Chord options shown in the chord picker
const CHORD_OPTIONS = [
  ['maj',  ''],
  ['min',  'm'],
  ['dom7', '7'],
  ['min7', 'm7'],
  ['maj7', 'M7'],
]

const selectedRoot      = ref('A')
const selectedScaleId   = ref('mi.p')
const showInfo          = ref(false)
const pianoOctave       = ref(4)
const selectedChordRoot = ref(null)   // null = follow selectedRoot
const selectedChordType = ref(null)   // null = chord mode off

function setChordType(key) {
  if (selectedChordType.value === key) {
    selectedChordType.value = null
    selectedChordRoot.value = null
  } else {
    selectedChordType.value = key
  }
}

const chordRoot = computed(() => selectedChordRoot.value ?? selectedRoot.value)

const SUBTITLE = { pad: 'lit pads', guitar: 'highlighted frets', piano: 'highlighted keys' }
const subtitle = computed(() => {
  const mode = SUBTITLE[displayMode.value] ?? 'highlighted items'
  if (selectedChordType.value) {
    const chordName = chordRoot.value + (CHORD_SUFFIX[selectedChordType.value] ?? '')
    return `${mode} = chord tones of ${chordName} — bright = best note choices`
  }
  return `pick a key and scale - ${mode} are safe to play`
})

const selectedScale = computed(() => SCALES.find(s => s.id === selectedScaleId.value))
const rootIndex     = computed(() => NOTES.indexOf(selectedRoot.value))

const activeIndices = computed(() => {
  const root = rootIndex.value
  return new Set(selectedScale.value.intervals.map(i => (root + i) % 12))
})

const anchorIndices = computed(() => {
  if (selectedChordType.value) {
    const rootIdx = NOTES.indexOf(chordRoot.value)
    const chordTones = new Set(CHORD_TYPES[selectedChordType.value].map(i => (rootIdx + i) % 12))
    // Only highlight chord tones that are also in the active scale — outside-scale tones stay dimmed
    return new Set([...chordTones].filter(i => activeIndices.value.has(i)))
  }
  const root = rootIndex.value
  return new Set(
    selectedScale.value.intervals
      .filter(i => ANCHOR_OFFSETS.has(i))
      .map(i => (root + i) % 12)
  )
})

const cols = computed(() => padSize.value === '4x4' ? 4 : 3)

const pads = computed(() =>
  Array.from({ length: 4 * cols.value }, (_, i) => {
    const noteIndex = i % 12
    const octaveOffset = Math.floor(i / 12)
    return {
      number:      i + 1,
      label:       String(i + 1),
      note:        NOTES[noteIndex],
      noteIndex,
      octaveOffset,
      isSharp:     SHARPS.has(NOTES[noteIndex]),
      isActive:    activeIndices.value.has(noteIndex),
      isAnchor:    anchorIndices.value.has(noteIndex),
      isRoot:      noteIndex === rootIndex.value,
      midi:        12 * (pianoOctave.value + 1 + octaveOffset) + NOTE_TO_SEMI[noteIndex],
    }
  })
)

const rows = computed(() => sliceRows(pads.value, cols.value))


const pressedIndices = computed(() => {
  const result = new Set()
  for (const n of activeInputNotes.value) {
    result.add(NOTE_TO_SEMI.indexOf(n % 12))
  }
  return result
})

const guitarNeck = computed(() =>
  buildGuitarNeck(noteIdx => ({
    isActive: activeIndices.value.has(noteIdx),
    isAnchor: anchorIndices.value.has(noteIdx),
    isRoot:   noteIdx === rootIndex.value,
  }))
)

const scaleNotes = computed(() =>
  selectedScale.value.intervals.map(i => ({
    note:     NOTES[(rootIndex.value + i) % 12],
    isAnchor: ANCHOR_OFFSETS.has(i),
    isRoot:   i === 0,
  }))
)

// MIDI base notes for each guitar string (stringIdx 0-5: E2 A2 D3 G3 B3 E4)
const STRING_BASE_MIDI = [40, 45, 50, 55, 59, 64]
const { pressDown, pressUp, pressToggle } = useNotePlayback()

function padMidi(noteIndex, oct) {
  return 12 * (oct + 1) + NOTE_TO_SEMI[noteIndex]
}

function onPadDown(noteIndex, octaveOffset = 0) { pressDown(12 * (pianoOctave.value + 1 + octaveOffset) + NOTE_TO_SEMI[noteIndex]) }
function onPadUp(noteIndex, octaveOffset = 0)   { pressUp(12 * (pianoOctave.value + 1 + octaveOffset) + NOTE_TO_SEMI[noteIndex]) }

function onCellDown(stringIdx, fret) { pressDown(STRING_BASE_MIDI[stringIdx] + fret) }
function onCellUp(stringIdx, fret)   { pressUp(STRING_BASE_MIDI[stringIdx] + fret) }

function onPianoToggle(noteIdx) { pressToggle(padMidi(noteIdx, pianoOctave.value)) }
</script>

<template>
  <div class="jam-mode">
    <PageHeader title="Jam Mode" :subtitle="subtitle" />

    <div class="controls">
      <PickerRow label="Key">
        <RootNotePicker v-model="selectedRoot" />
      </PickerRow>

      <PickerRow label="Scale">
        <ScaleSelector
          v-model="selectedScaleId"
          :scales="SCALES"
          v-model:showInfo="showInfo"
        />
      </PickerRow>

      <PickerRow v-if="displayMode !== 'guitar'" label="Octave">
        <OctaveControl v-model="pianoOctave" :min="1" :max="7" />
      </PickerRow>

      <PickerRow label="Chord">
        <div class="chord-picker">
          <div class="chord-type-row">
            <button
              class="chord-type-btn"
              :class="{ active: !selectedChordType }"
              @click="selectedChordType = null; selectedChordRoot = null"
            >—</button>
            <button
              v-for="[key, sfx] in CHORD_OPTIONS"
              :key="key"
              class="chord-type-btn"
              :class="{ active: selectedChordType === key }"
              @click="setChordType(key)"
            >{{ chordRoot }}{{ sfx }}</button>
          </div>
          <div v-if="selectedChordType" class="chord-root-row">
            <button
              v-for="note in NOTES"
              :key="note"
              class="chord-root-btn"
              :class="{ active: chordRoot === note, sharp: SHARPS.has(note) }"
              @click="selectedChordRoot = note"
            >{{ note }}</button>
          </div>
        </div>
      </PickerRow>
    </div>

    <ScaleLegend />

    <div class="scale-notes">
      <span class="scale-label">Notes</span>
      <span
        v-for="n in scaleNotes"
        :key="n.note"
        class="scale-note"
        :class="{ root: n.isRoot, anchor: n.isAnchor && !n.isRoot }"
      >{{ n.note }}</span>
    </div>

    <ModeLayout>
      <template #pad>
        <div class="pad-grid">
          <div class="pad-row" v-for="(row, ri) in rows" :key="ri" :style="{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }">
            <div
              v-for="pad in row"
              :key="pad.number"
              class="pad"
              :class="{
                active:   pad.isActive && !pad.isAnchor && !pad.isRoot,
                anchor:   pad.isAnchor && !pad.isRoot,
                root:     pad.isRoot,
                inactive: !pad.isActive,
                pressed:  pressedIndices.has(pad.noteIndex),
              }"
              @pointerdown.prevent="onPadDown(pad.noteIndex, pad.octaveOffset)"
              @pointerup="onPadUp(pad.noteIndex, pad.octaveOffset)"
              @pointerleave="onPadUp(pad.noteIndex, pad.octaveOffset)"
              @pointercancel="onPadUp(pad.noteIndex, pad.octaveOffset)"
            >
              <span class="pad-label">{{ pad.label }}</span>
              <span class="pad-note">{{ pad.note }}</span>
              <span v-if="midiStatus === 'connected'" class="pad-midi">{{ pad.midi }}</span>
            </div>
          </div>
        </div>
      </template>

      <template #piano>
        <PianoOctave
          :activeIndices="activeIndices"
          :rootIndex="rootIndex"
          v-model:octave="pianoOctave"
          :showOctaveSelector="false"
          :dimInactive="true"
          :clickable="true"
          @toggle="onPianoToggle"
        />
      </template>

      <template #guitar>
        <div class="guitar-neck-wrap">
          <div class="guitar-neck">
            <div v-for="(string, si) in guitarNeck" :key="si" class="neck-row">
              <div class="string-name">{{ string.name }}</div>
              <div
                v-for="cell in string.cells"
                :key="cell.fret"
                class="neck-cell"
                :class="{
                  active: cell.isActive,
                  root:   cell.isRoot,
                  open:   cell.isOpen,
                }"
                @pointerdown.prevent="onCellDown(string.stringIdx, cell.fret)"
                @pointerup="onCellUp(string.stringIdx, cell.fret)"
                @pointerleave="onCellUp(string.stringIdx, cell.fret)"
                @pointercancel="onCellUp(string.stringIdx, cell.fret)"
              >
                <span
                  v-if="cell.isActive"
                  class="neck-dot"
                  :class="{ root: cell.isRoot, anchor: cell.isAnchor && !cell.isRoot }"
                ></span>
              </div>
            </div>
            <div class="fret-numbers">
              <div class="string-name-spacer"></div>
              <div v-for="f in FRET_COUNT + 1" :key="f" class="fret-num">
                {{ f - 1 === 0 ? '' : f - 1 }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </ModeLayout>
  </div>
</template>

<style scoped>
.jam-mode {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin: 1.5rem 0;
}

/* Chord picker */
.chord-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.chord-type-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.chord-type-btn {
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.12s, background 0.12s, color 0.12s;
}

.chord-type-btn:hover { border-color: var(--accent); color: var(--text); }

.chord-type-btn.active {
  border-color: var(--accent);
  background: var(--accent-bg);
  color: var(--accent);
}

.chord-root-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.chord-root-btn {
  padding: 0.2rem 0.45rem;
  border-radius: 5px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text4);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.1s, background 0.1s, color 0.1s;
}

.chord-root-btn.sharp { color: var(--text5); }

.chord-root-btn:hover { border-color: var(--accent); color: var(--text2); }

.chord-root-btn.active {
  border-color: var(--accent);
  background: var(--accent-bg);
  color: var(--accent);
}

/* Pad grid — base layout from display-modes.css (.pad-grid, .pad-row) */
.pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  padding: 0.75rem 0.5rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  aspect-ratio: 1;
  transition: background 0.15s, border-color 0.15s;
  user-select: none;
  touch-action: none;
  cursor: pointer;
}

.pad.inactive { background: var(--bg); opacity: 0.35; }
.pad.active   { background: var(--raised); border-color: var(--border2); }
.pad.anchor   { background: var(--accent-bg); border-color: var(--accent-mid); }
.pad.root     { background: var(--rust-bg); border-color: var(--rust); }
.pad.pressed  { background: var(--accent-bg); border-color: var(--accent); opacity: 1; }

.pad-label { font-size: 0.7rem; color: var(--text4); font-weight: 600; letter-spacing: 0.1em; }
.pad-note  { font-size: 1.5rem; font-weight: 700; line-height: 1; }
.pad-midi  { font-size: 0.6rem; color: var(--text5); letter-spacing: 0.03em; }

.pad.inactive .pad-note { color: var(--text5); }
.pad.active   .pad-note { color: var(--text2); }
.pad.anchor   .pad-note { color: var(--accent); }
.pad.root     .pad-note { color: var(--rust-hi); }
.pad.pressed  .pad-note { color: var(--accent); }


/* Guitar neck — base structure from display-modes.css; only unique properties here */
.neck-dot { background: var(--text3); }
.neck-dot.anchor { background: var(--accent-lo); }
.neck-dot.root { background: var(--dot-root); box-shadow: 0 0 4px var(--rust-glow); }

:deep(.legend) { margin-top: 0; }

/* Scale notes strip */
.scale-notes {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.scale-label {
  font-size: 0.75rem;
  color: var(--text4);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-right: 0.25rem;
}

.scale-note {
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  background: var(--raised);
  border: 1px solid var(--border2);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text2);
}

.scale-note.anchor {
  background: var(--accent-bg);
  border-color: var(--accent-mid);
  color: var(--accent);
}

.scale-note.root {
  background: var(--rust-bg);
  border-color: var(--rust);
  color: var(--rust-hi);
}

@media (max-width: 600px) {
  .jam-mode {
    padding: 1.25rem 1rem;
  }

  .pad-note {
    font-size: 1.2rem;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .jam-mode {
    padding: 0.75rem 1rem;
  }

  .controls {
    margin: 0.5rem 0;
    gap: 0.5rem;
  }

  .scale-notes {
    margin-top: 0.5rem;
    margin-bottom: 0.75rem;
  }
}
</style>

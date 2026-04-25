<script setup>
import { computed, watch } from 'vue'
import { displayMode } from '@/state/displayMode.js'
import { padSize } from '@/state/padSize.js'
import { NOTES, SHARPS, FRET_COUNT, NOTE_TO_SEMI, CHORD_TYPES, CHORD_SUFFIX } from '@tonarium/core'
import { JAM_SCALES as SCALES } from '@tonarium/core'
import { buildGuitarNeck, sliceRows } from '@/utils/musicUtils.js'
import { activeInputNotes, midiStatus } from '@/audio/midiManager.js'
import { useNotePlayback } from '@/composables/useNotePlayback.js'
import { useScaleIndices } from '@/composables/useScaleIndices.js'
import PianoOctave from '@/components/music/PianoOctave.vue'
import ScaleLegend from '@/components/music/ScaleLegend.vue'
import ModeLayout from '@/components/layout/ModeLayout.vue'
import { selectedRoot, selectedScaleId, pianoOctave, selectedChordType, selectedChordRoot } from '@/state/jamSettings.js'
import { sessionProgression, sessionPlaying, sessionCurrentChordIdx } from '@/state/sessionState.js'
import { jamSoundStyle } from '@/state/jamSoundStyle.js'

const ANCHOR_OFFSETS = new Set([0, 3, 4, 7])
const STRING_BASE_MIDI = [40, 45, 50, 55, 59, 64]

const chordRoot = computed(() => selectedChordRoot.value ?? selectedRoot.value)

const selectedScale = computed(() => SCALES.find(s => s.id === selectedScaleId.value))
const { rootIndex, activeIndices } = useScaleIndices(selectedRoot, selectedScale)

const anchorIndices = computed(() => {
  if (selectedChordType.value) {
    const rootIdx = NOTES.indexOf(chordRoot.value)
    const chordTones = new Set(CHORD_TYPES[selectedChordType.value].map(i => (rootIdx + i) % 12))
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

// Track the live chord during session playback
watch(sessionCurrentChordIdx, (idx) => {
  const prog = sessionProgression.value
  if (!prog || !sessionPlaying.value) return
  const chord = prog.chords[idx]
  if (!chord) return
  selectedChordRoot.value = NOTES[chord._rootIdx]
  selectedChordType.value = chord.type
})

// Sync octave to session progression chords when pianoOctave changes
watch(pianoOctave, (newOct) => {
  if (!sessionProgression.value) return
  sessionProgression.value = {
    ...sessionProgression.value,
    chords: sessionProgression.value.chords.map(c => ({ ...c, _octave: newOct })),
  }
})

function padMidi(noteIndex, oct) {
  return 12 * (oct + 1) + NOTE_TO_SEMI[noteIndex]
}

const { pressDown, pressUp } = useNotePlayback({ styleRef: jamSoundStyle })

function onPadDown(noteIndex, octaveOffset = 0) { pressDown(12 * (pianoOctave.value + 1 + octaveOffset) + NOTE_TO_SEMI[noteIndex]) }
function onPadUp(noteIndex, octaveOffset = 0)   { pressUp(12 * (pianoOctave.value + 1 + octaveOffset) + NOTE_TO_SEMI[noteIndex]) }

function onCellDown(stringIdx, fret) { pressDown(STRING_BASE_MIDI[stringIdx] + fret) }
function onCellUp(stringIdx, fret)   { pressUp(STRING_BASE_MIDI[stringIdx] + fret) }

function onPianoDown(noteIdx) { pressDown(padMidi(noteIdx, pianoOctave.value)) }
function onPianoUp(noteIdx)   { pressUp(padMidi(noteIdx, pianoOctave.value)) }
</script>

<template>
  <div class="tc-instrument">
    <ScaleLegend />

    <div class="tc-instrument-scale-notes">
      <span class="tc-instrument-scale-label">Notes</span>
      <span
        v-for="n in scaleNotes"
        :key="n.note"
        class="tc-instrument-scale-note"
        :class="{ root: n.isRoot, anchor: n.isAnchor && !n.isRoot }"
      >{{ n.note }}</span>
    </div>

    <div class="tc-instrument-sound-row">
      <span class="tc-instrument-sound-label">Sound</span>
      <div class="tc-instrument-sound-btns">
        <button
          v-for="s in ['synth','pluck','marimba','glass','pulse','organ','brass','kalimba']"
          :key="s"
          class="tc-instrument-sound-btn"
          :class="{ active: jamSoundStyle === s }"
          @click="jamSoundStyle = s"
        >{{ s }}</button>
      </div>
    </div>

    <ModeLayout>
      <template #pad>
        <div class="tc-instrument-pad-grid">
          <div class="tc-instrument-pad-row" v-for="(row, ri) in rows" :key="ri" :style="{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }">
            <div
              v-for="pad in row"
              :key="pad.number"
              class="tc-instrument-pad"
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
              <span class="tc-instrument-pad-label">{{ pad.label }}</span>
              <span class="tc-instrument-pad-note">{{ pad.note }}</span>
              <span v-if="midiStatus === 'connected'" class="tc-instrument-pad-midi">{{ pad.midi }}</span>
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
          @notedown="onPianoDown"
          @noteup="onPianoUp"
        />
      </template>

      <template #guitar>
        <div class="tc-instrument-guitar-neck-wrap">
          <div class="tc-instrument-guitar-neck">
            <div v-for="(string, si) in guitarNeck" :key="si" class="tc-instrument-neck-row">
              <div class="tc-instrument-string-name">{{ string.name }}</div>
              <div
                v-for="cell in string.cells"
                :key="cell.fret"
                class="tc-instrument-neck-cell"
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
                  class="tc-instrument-neck-dot"
                  :class="{ root: cell.isRoot, anchor: cell.isAnchor && !cell.isRoot }"
                ></span>
              </div>
            </div>
            <div class="tc-instrument-fret-numbers">
              <div class="tc-instrument-string-name-spacer"></div>
              <div v-for="f in FRET_COUNT + 1" :key="f" class="tc-instrument-fret-num">
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
.tc-instrument {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

:deep(.legend) { margin-top: 0; }

.tc-instrument-pad-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tc-instrument-pad-row {
  display: grid;
  gap: 0.5rem;
}

.tc-instrument-scale-notes {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tc-instrument-scale-label {
  font-size: 0.75rem;
  color: var(--text4);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-right: 0.25rem;
}

.tc-instrument-scale-note {
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  background: var(--raised);
  border: 1px solid var(--border2);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text2);
}

.tc-instrument-scale-note.anchor {
  background: var(--accent-bg);
  border-color: var(--accent-mid);
  color: var(--accent);
}

.tc-instrument-scale-note.root {
  background: var(--rust-bg);
  border-color: var(--rust);
  color: var(--rust-hi);
}

.tc-instrument-pad {
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

.tc-instrument-pad.inactive { background: var(--bg); border-color: var(--border2); }
.tc-instrument-pad.active   { background: var(--raised); border-color: var(--border2); }
.tc-instrument-pad.anchor   { background: var(--accent-bg); border-color: var(--accent-mid); }
.tc-instrument-pad.root     { background: var(--rust-bg); border-color: var(--rust); }
.tc-instrument-pad.pressed  { background: var(--accent-bg); border-color: var(--accent); opacity: 1; }

.tc-instrument-pad-label { font-size: 0.7rem; color: var(--text4); font-weight: 600; letter-spacing: 0.1em; }
.tc-instrument-pad-note  { font-size: 1.5rem; font-weight: 700; line-height: 1; }
.tc-instrument-pad-midi  { font-size: 0.6rem; color: var(--text5); letter-spacing: 0.03em; }

.tc-instrument-pad.inactive .tc-instrument-pad-label { color: var(--text5); }
.tc-instrument-pad.inactive .tc-instrument-pad-note  { color: var(--text5); }
.tc-instrument-pad.active   .tc-instrument-pad-note { color: var(--text2); }
.tc-instrument-pad.anchor   .tc-instrument-pad-note { color: var(--accent); }
.tc-instrument-pad.root     .tc-instrument-pad-note { color: var(--rust-hi); }
.tc-instrument-pad.pressed  .tc-instrument-pad-note { color: var(--accent); }

.tc-instrument-neck-dot { background: var(--text3); }
.tc-instrument-neck-dot.anchor { background: var(--accent-lo); }
.tc-instrument-neck-dot.root { background: var(--dot-root); box-shadow: 0 0 4px var(--rust-glow); }

.tc-instrument-sound-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tc-instrument-sound-label {
  font-size: 0.75rem;
  color: var(--text4);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-right: 0.25rem;
  flex-shrink: 0;
}

.tc-instrument-sound-btns {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.tc-instrument-sound-btn {
  padding: 0.22rem 0.6rem;
  border-radius: 4px;
  border: 1px solid var(--border2);
  background: var(--raised);
  color: var(--text3);
  font-size: 0.75rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  text-transform: capitalize;
  transition: border-color 0.12s, color 0.12s, background 0.12s;
}

.tc-instrument-sound-btn:hover {
  border-color: var(--accent-dim);
  color: var(--text);
}

.tc-instrument-sound-btn.active {
  background: var(--accent-bg);
  border-color: var(--accent-mid);
  color: var(--accent);
}

@media (max-width: 600px) {
  .tc-instrument-pad-note {
    font-size: 1.2rem;
  }
}
</style>

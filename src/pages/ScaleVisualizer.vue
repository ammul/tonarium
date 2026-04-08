<script setup>
import { ref, computed } from 'vue'
import { displayMode } from '@/state/displayMode.js'
import { padSize } from '@/state/padSize.js'
import { NOTES, SHARPS, FRET_COUNT, NOTE_TO_SEMI } from '@/constants/musicConstants.js'
import { buildGuitarNeck, sliceRows } from '@/utils/musicUtils.js'
import { useNotePlayback } from '@/composables/useNotePlayback.js'
import PianoOctave from '@/components/music/PianoOctave.vue'
import StaffDisplay from '@/components/music/StaffDisplay.vue'
import RootNotePicker from '@/components/music/RootNotePicker.vue'
import ModeLayout from '@/components/layout/ModeLayout.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { VISUALIZER_SCALES as SCALES } from '@/constants/scales.js'

const selectedRoot = ref('A')
const selectedScaleId = ref('maj')
const showInfo = ref(false)
const pianoOctave = ref(4)

const selectedScale = computed(() => SCALES.find(s => s.id === selectedScaleId.value))
const rootIndex = computed(() => NOTES.indexOf(selectedRoot.value))

const activeIndices = computed(() => {
  const root = rootIndex.value
  return new Set(selectedScale.value.intervals.map(i => (root + i) % 12))
})

const degreeMap = computed(() => {
  const root = rootIndex.value
  const map = {}
  selectedScale.value.intervals.forEach((interval, i) => {
    map[(root + interval) % 12] = i + 1
  })
  return map
})

const cols = computed(() => padSize.value === '4x4' ? 4 : 3)

const pads = computed(() =>
  Array.from({ length: 4 * cols.value }, (_, i) => {
    const noteIndex = i % 12
    return {
      number:      i + 1,
      label:       String(i + 1),
      note:        NOTES[noteIndex],
      noteIndex,
      octaveOffset: Math.floor(i / 12),
      isSharp:     SHARPS.has(NOTES[noteIndex]),
      isActive:    activeIndices.value.has(noteIndex),
      isRoot:      noteIndex === rootIndex.value,
      degree:      degreeMap.value[noteIndex] ?? null,
    }
  })
)

const rows = computed(() => sliceRows(pads.value, cols.value))


// Guitar neck: 6 strings displayed high→low (e, B, G, D, A, E)
const guitarNeck = computed(() =>
  buildGuitarNeck(noteIdx => ({
    isActive: activeIndices.value.has(noteIdx),
    isRoot:   noteIdx === rootIndex.value,
  }))
)

const STRING_BASE_MIDI = [40, 45, 50, 55, 59, 64]
const { pressDown, pressUp, pressToggle } = useNotePlayback()

function onPadDown(noteIndex, octaveOffset = 0) { pressDown(12 * (5 + octaveOffset) + NOTE_TO_SEMI[noteIndex]) }
function onPadUp(noteIndex, octaveOffset = 0)   { pressUp(12 * (5 + octaveOffset) + NOTE_TO_SEMI[noteIndex]) }

function onCellDown(stringIdx, fret) { pressDown(STRING_BASE_MIDI[stringIdx] + fret) }
function onCellUp(stringIdx, fret)   { pressUp(STRING_BASE_MIDI[stringIdx] + fret) }

function onPianoToggle(noteIdx) { pressToggle(padMidi(noteIdx)) }

const subtitle = computed(() => {
  if (displayMode.value === 'pad') return 'see which pads are active for any scale'
  if (displayMode.value === 'notes') return 'treble clef staff - scale notes highlighted'
  if (displayMode.value === 'guitar') return 'guitar neck (standard tuning) - scale positions highlighted'
  return 'piano keyboard - scale notes highlighted'
})
</script>

<template>
  <div class="scale-viz">
    <PageHeader title="Scale Visualizer" :subtitle="subtitle" />

    <div class="controls">
      <div class="control-group">
        <label>Root note</label>
        <RootNotePicker v-model="selectedRoot" />
      </div>

      <div class="control-group">
        <label>Scale</label>
        <div class="scale-select-row">
          <select v-model="selectedScaleId" @change="showInfo = false">
            <option v-for="s in SCALES" :key="s.id" :value="s.id">{{ s.label }}</option>
          </select>
          <button class="info-btn" :class="{ active: showInfo }" @click="showInfo = !showInfo" aria-label="Scale info">i</button>
        </div>
        <p v-if="showInfo" class="scale-info">{{ selectedScale.description }}</p>
      </div>
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
                active: pad.isActive,
                root: pad.isRoot,
                sharp: pad.isSharp,
                inactive: !pad.isActive,
              }"
              @pointerdown.prevent="onPadDown(pad.noteIndex, pad.octaveOffset)"
              @pointerup="onPadUp(pad.noteIndex, pad.octaveOffset)"
              @pointerleave="onPadUp(pad.noteIndex, pad.octaveOffset)"
              @pointercancel="onPadUp(pad.noteIndex, pad.octaveOffset)"
            >
              <span class="pad-label">{{ pad.label }}</span>
              <span class="pad-note">{{ pad.note }}</span>
              <span class="pad-degree" v-if="pad.isActive">{{ pad.isRoot ? '①' : pad.degree }}</span>
            </div>
          </div>
        </div>
      </template>

      <template #notes>
        <StaffDisplay
          :activeIndices="activeIndices"
          :rootIndex="rootIndex"
          :onlyActive="true"
          @note-down="onPadDown"
          @note-up="onPadUp"
        />
      </template>


      <template #piano>
        <PianoOctave
          :activeIndices="activeIndices"
          :rootIndex="rootIndex"
          v-model:octave="pianoOctave"
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
                  root: cell.isRoot,
                  open: cell.isOpen,
                }"
                @pointerdown.prevent="onCellDown(string.stringIdx, cell.fret)"
                @pointerup="onCellUp(string.stringIdx, cell.fret)"
                @pointerleave="onCellUp(string.stringIdx, cell.fret)"
                @pointercancel="onCellUp(string.stringIdx, cell.fret)"
              >
                <span v-if="cell.isActive" class="neck-dot" :class="{ root: cell.isRoot }"></span>
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
.scale-viz {
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

.control-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.control-group label {
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
  min-width: 5rem;
}


.scale-select-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.info-btn {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 50%;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.8rem;
  font-style: italic;
  font-weight: 700;
  cursor: pointer;
  line-height: 1;
  flex-shrink: 0;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.info-btn:hover  { border-color: var(--accent); color: var(--text); }
.info-btn.active { background: var(--accent-bg); border-color: var(--accent); color: var(--accent); }

.scale-info {
  margin-top: 0.6rem;
  padding: 0.65rem 0.85rem;
  background: var(--input);
  border: 1px solid var(--border2);
  border-left: 3px solid var(--accent);
  border-radius: 6px;
  font-size: 0.82rem;
  color: var(--text2);
  line-height: 1.55;
  width: 100%;
}

select {
  background: var(--input);
  border: 1px solid var(--border2);
  border-radius: 6px;
  color: var(--text);
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  max-width: 100%;
}

select:focus { border-color: var(--accent); }

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
.pad.active   { background: var(--raised); border-color: var(--accent-mid); }
.pad.root     { background: var(--rust-bg); border-color: var(--rust); }

.pad-label  { font-size: 0.7rem; color: var(--text4); font-weight: 600; letter-spacing: 0.1em; }
.pad-note   { font-size: 1.5rem; font-weight: 700; line-height: 1; }

.pad.inactive .pad-note { color: var(--text5); }
.pad.active .pad-note   { color: var(--accent); }
.pad.root .pad-note     { color: var(--rust-hi); }

.pad-degree           { font-size: 0.72rem; color: var(--accent-dim); }
.pad.root .pad-degree { color: var(--rust); }


/* Guitar neck — base structure from display-modes.css; only unique properties here */
.neck-dot { background: var(--dot-scale); }
.neck-dot.root { background: var(--dot-root); box-shadow: 0 0 5px var(--rust-glow); }


@media (max-width: 600px) {
  .scale-viz {
    padding: 1.25rem 1rem;
  }

  .control-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .control-group label {
    min-width: unset;
  }

  .pad-note {
    font-size: 1.2rem;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .scale-viz {
    padding: 0.75rem 1rem;
  }

  .controls {
    margin: 0.5rem 0;
    gap: 0.5rem;
  }

  .control-group {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: nowrap;
  }

  .control-group label {
    min-width: unset;
    white-space: nowrap;
  }

}
</style>

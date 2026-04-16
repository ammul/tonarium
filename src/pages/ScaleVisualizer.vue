<script setup>
import { ref, computed } from 'vue'
import { displayMode } from '@/state/displayMode.js'
import { padSize } from '@/state/padSize.js'
import { NOTES, SHARPS, FRET_COUNT, NOTE_TO_SEMI } from '@tonarium/core'
import { buildGuitarNeck, sliceRows } from '@/utils/musicUtils.js'
import { useNotePlayback } from '@/composables/useNotePlayback.js'
import { useScaleIndices } from '@/composables/useScaleIndices.js'
import PianoOctave from '@/components/music/PianoOctave.vue'
import RootNotePicker from '@/components/music/RootNotePicker.vue'
import ModeLayout from '@/components/layout/ModeLayout.vue'
import ScaleLegend from '@/components/music/ScaleLegend.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { VISUALIZER_SCALES as SCALES } from '@tonarium/core'

const selectedRoot = ref('C')
const selectedScaleId = ref('maj')
const showInfo = ref(false)
const pianoOctave = ref(4)

const selectedScale = computed(() => SCALES.find(s => s.id === selectedScaleId.value))
const { rootIndex, activeIndices } = useScaleIndices(selectedRoot, selectedScale)

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
const { pressDown, pressUp } = useNotePlayback()

function onPadDown(noteIndex, octaveOffset = 0) { pressDown(12 * (5 + octaveOffset) + NOTE_TO_SEMI[noteIndex]) }
function onPadUp(noteIndex, octaveOffset = 0)   { pressUp(12 * (5 + octaveOffset) + NOTE_TO_SEMI[noteIndex]) }

function onCellDown(stringIdx, fret) { pressDown(STRING_BASE_MIDI[stringIdx] + fret) }
function onCellUp(stringIdx, fret)   { pressUp(STRING_BASE_MIDI[stringIdx] + fret) }

function onPianoDown(noteIdx) { pressDown(padMidi(noteIdx)) }
function onPianoUp(noteIdx)   { pressUp(padMidi(noteIdx)) }

const subtitle = computed(() => {
  if (displayMode.value === 'pad') return 'see which pads are active for any scale'
  if (displayMode.value === 'guitar') return 'guitar neck (standard tuning) - scale positions highlighted'
  return 'piano keyboard - scale notes highlighted'
})
</script>

<template>
  <div class="tc-scale-viz page-card">
    <PageHeader title="Scale Visualizer" :subtitle="subtitle" />

    <div class="tc-scale-viz-controls">
      <div class="tc-scale-viz-control-group">
        <label>Root note</label>
        <RootNotePicker v-model="selectedRoot" />
      </div>

      <div class="tc-scale-viz-control-group">
        <label>Scale</label>
        <div class="tc-scale-viz-scale-select-row">
          <select v-model="selectedScaleId" @change="showInfo = false">
            <option v-for="s in SCALES" :key="s.id" :value="s.id">{{ s.label }}</option>
          </select>
          <button class="tc-scale-viz-info-btn" :class="{ active: showInfo }" @click="showInfo = !showInfo" aria-label="Scale info">i</button>
        </div>
        <p v-if="showInfo" class="info-box tc-scale-viz-scale-info">{{ selectedScale.description }}</p>
      </div>
    </div>

    <ScaleLegend :showAnchor="false" activeLabel="in scale" />

    <ModeLayout>
      <template #pad>
        <div class="tc-scale-viz-pad-grid">
          <div class="tc-scale-viz-pad-row" v-for="(row, ri) in rows" :key="ri" :style="{ gridTemplateColumns: `repeat(${row.length}, 1fr)` }">
            <div
              v-for="pad in row"
              :key="pad.number"
              class="tc-scale-viz-pad"
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
              <span class="tc-scale-viz-pad-label">{{ pad.label }}</span>
              <span class="tc-scale-viz-pad-note">{{ pad.note }}</span>
              <span class="tc-scale-viz-pad-degree" v-if="pad.isActive">{{ pad.isRoot ? '①' : pad.degree }}</span>
            </div>
          </div>
        </div>
      </template>

      <template #piano>
        <PianoOctave
          :activeIndices="activeIndices"
          :rootIndex="rootIndex"
          v-model:octave="pianoOctave"
          :dimInactive="true"
          :clickable="true"
          @notedown="onPianoDown"
          @noteup="onPianoUp"
        />
      </template>

      <template #guitar>
        <div class="tc-scale-viz-guitar-neck-wrap">
          <div class="tc-scale-viz-guitar-neck">
            <div v-for="(string, si) in guitarNeck" :key="si" class="tc-scale-viz-neck-row">
              <div class="tc-scale-viz-string-name">{{ string.name }}</div>
              <div
                v-for="cell in string.cells"
                :key="cell.fret"
                class="tc-scale-viz-neck-cell"
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
                <span v-if="cell.isActive" class="tc-scale-viz-neck-dot" :class="{ root: cell.isRoot }"></span>
              </div>
            </div>
            <div class="tc-scale-viz-fret-numbers">
              <div class="tc-scale-viz-string-name-spacer"></div>
              <div v-for="f in FRET_COUNT + 1" :key="f" class="tc-scale-viz-fret-num">
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
.tc-scale-viz-controls {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin: 1.5rem 0;
}

.tc-scale-viz-control-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.tc-scale-viz-control-group label {
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
  min-width: 5rem;
}


.tc-scale-viz-scale-select-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tc-scale-viz-info-btn {
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

.tc-scale-viz-info-btn:hover  { border-color: var(--accent); color: var(--text); }
.tc-scale-viz-info-btn.active { background: var(--accent-bg); border-color: var(--accent); color: var(--accent); }

.tc-scale-viz-scale-info {
  margin-top: 0.6rem;
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
.tc-scale-viz-pad {
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

.tc-scale-viz-pad.inactive { background: var(--bg); opacity: 0.35; }
.tc-scale-viz-pad.active   { background: var(--raised); border-color: var(--accent-mid); }
.tc-scale-viz-pad.root     { background: var(--rust-bg); border-color: var(--rust); }

.tc-scale-viz-pad-label  { font-size: 0.7rem; color: var(--text4); font-weight: 600; letter-spacing: 0.1em; }
.tc-scale-viz-pad-note   { font-size: 1.5rem; font-weight: 700; line-height: 1; }

.tc-scale-viz-pad.inactive .tc-scale-viz-pad-note { color: var(--text5); }
.tc-scale-viz-pad.active .tc-scale-viz-pad-note   { color: var(--accent); }
.tc-scale-viz-pad.root .tc-scale-viz-pad-note     { color: var(--rust-hi); }

.tc-scale-viz-pad-degree           { font-size: 0.72rem; color: var(--accent-dim); }
.tc-scale-viz-pad.root .tc-scale-viz-pad-degree { color: var(--rust); }


/* Guitar neck — base structure from display-modes.css; only unique properties here */
.tc-scale-viz-neck-dot { background: var(--dot-scale); }
.tc-scale-viz-neck-dot.root { background: var(--dot-root); box-shadow: 0 0 5px var(--rust-glow); }


@media (max-width: 600px) {
  .tc-scale-viz-control-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .tc-scale-viz-control-group label {
    min-width: unset;
  }

  .tc-scale-viz-pad-note {
    font-size: 1.2rem;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .tc-scale-viz-controls {
    margin: 0.5rem 0;
    gap: 0.5rem;
  }

  .tc-scale-viz-control-group {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: nowrap;
  }

  .tc-scale-viz-control-group label {
    min-width: unset;
    white-space: nowrap;
  }

}
</style>

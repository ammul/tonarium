<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { OPEN_STRINGS } from '@tonarium/core'
import type { NoteIndex } from '@tonarium/core'

interface GuitarShape {
  label: string
  rootString: number
  offsets: number[]
}

const GUITAR_SHAPES: Record<string, GuitarShape[]> = {
  maj: [
    { label: 'E-shape',  rootString: 0, offsets: [0, 2, 2, 1, 0, 0] },
    { label: 'A-shape',  rootString: 1, offsets: [-1, 0, 2, 2, 2, 0] },
  ],
  min: [
    { label: 'Em-shape', rootString: 0, offsets: [0, 2, 2, 0, 0, 0] },
    { label: 'Am-shape', rootString: 1, offsets: [-1, 0, 2, 2, 1, 0] },
  ],
  dom7: [
    { label: 'E7-shape',  rootString: 0, offsets: [0, 2, 0, 1, 0, 0] },
    { label: 'A7-shape',  rootString: 1, offsets: [-1, 0, 2, 0, 2, 0] },
  ],
  maj7: [
    { label: 'Emaj7-shape', rootString: 0, offsets: [0, 2, 1, 1, 0, -1] },
    { label: 'Amaj7-shape', rootString: 1, offsets: [-1, 0, 2, 1, 2, 0] },
  ],
  min7: [
    { label: 'Em7-shape', rootString: 0, offsets: [0, 2, 0, 0, 0, 0] },
    { label: 'Am7-shape', rootString: 1, offsets: [-1, 0, 2, 0, 1, 0] },
  ],
  dim: [
    { label: 'shape 1', rootString: 1, offsets: [-1, 0, 1, 2, 1, -1] },
    { label: 'shape 2', rootString: 0, offsets: [0, 1, 2, 0, -1, -1] },
  ],
  aug: [
    { label: 'shape 1', rootString: 1, offsets: [-1, 0, 3, 2, 2, -1] },
    { label: 'shape 2', rootString: 0, offsets: [0, 3, 2, 1, 1, -1] },
  ],
  sus4: [
    { label: 'Asus4-shape', rootString: 1, offsets: [-1, 0, 2, 2, 3, 0] },
    { label: 'Esus4-shape', rootString: 0, offsets: [0, 2, 2, 2, 0, 0] },
  ],
}

interface Props {
  rootIndex: NoteIndex
  type: string
}

const props = defineProps<Props>()

function bestVoicingIndex(shapesList: GuitarShape[], rootIndex: NoteIndex): number {
  let best = 0
  let bestFret = Infinity
  shapesList.forEach((shape, i) => {
    const openNote = OPEN_STRINGS[shape.rootString] ?? 0
    const rootFret = (rootIndex - openNote + 12) % 12
    const frets = shape.offsets.map(o => o === -1 ? -1 : rootFret + o)
    const pressed = frets.filter(f => f > 0)
    const base = pressed.length > 0 ? Math.min(...pressed) : 1
    if (base < bestFret) { bestFret = base; best = i }
  })
  return best
}

const shapes = computed(() => GUITAR_SHAPES[props.type] ?? GUITAR_SHAPES['maj']!)

const voicingIndex = ref(bestVoicingIndex(shapes.value, props.rootIndex))
const voicingCount = computed(() => shapes.value.length)

watch([() => props.rootIndex, () => props.type], () => {
  voicingIndex.value = bestVoicingIndex(shapes.value, props.rootIndex)
})

function prevVoicing(): void {
  voicingIndex.value = (voicingIndex.value - 1 + voicingCount.value) % voicingCount.value
}
function nextVoicing(): void {
  voicingIndex.value = (voicingIndex.value + 1) % voicingCount.value
}

const voicing = computed(() => {
  const shape = shapes.value[voicingIndex.value]!
  const openNote = OPEN_STRINGS[shape.rootString] ?? 0
  const rootFret = (props.rootIndex - openNote + 12) % 12

  const frets = shape.offsets.map(offset => offset === -1 ? -1 : rootFret + offset)

  const pressedFrets = frets.filter(f => f > 0)
  const baseFret = pressedFrets.length > 0 ? Math.min(...pressedFrets) : 1

  const rows: Array<Array<{ hasDot: boolean; isRoot: boolean }>> = []
  for (let row = 0; row < 4; row++) {
    const fretNum = baseFret + row
    const cells = frets.map((f, si) => ({
      hasDot: f === fretNum,
      isRoot: f === fretNum && ((OPEN_STRINGS[si] ?? 0) + f) % 12 === props.rootIndex,
    }))
    rows.push(cells)
  }

  return { frets, baseFret, rows, label: shape.label }
})
</script>

<template>
  <div class="tc-chord-diagram">
    <div class="tc-chord-diagram-wrap">
      <div v-if="voicing.baseFret > 1" class="tc-chord-diagram-fret-label">{{ voicing.baseFret }}fr</div>

      <div class="tc-chord-diagram-inner">
        <div class="tc-chord-diagram-top-markers">
          <span v-for="(f, s) in voicing.frets" :key="s" class="tc-chord-diagram-top-marker">
            {{ f === -1 ? '✕' : f === 0 ? '○' : '' }}
          </span>
        </div>

        <div class="tc-chord-diagram-nut" :class="{ open: voicing.baseFret === 1 }"></div>

        <div class="tc-chord-diagram-fret-grid">
          <div v-for="(row, ri) in voicing.rows" :key="ri" class="tc-chord-diagram-fret-row">
            <div v-for="(cell, si) in row" :key="si" class="tc-chord-diagram-fret-cell">
              <span v-if="cell.hasDot" class="tc-chord-diagram-finger-dot" :class="{ root: cell.isRoot }"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="tc-chord-diagram-voicing-sel" v-if="voicingCount > 1">
      <button class="tc-chord-diagram-voicing-btn" @click="prevVoicing"><ChevronLeft :size="13" /></button>
      <span class="tc-chord-diagram-voicing-label">{{ voicing.label }}</span>
      <button class="tc-chord-diagram-voicing-btn" @click="nextVoicing"><ChevronRight :size="13" /></button>
    </div>
  </div>
</template>

<style scoped>
.tc-chord-diagram {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.tc-chord-diagram-wrap {
  display: flex;
  align-items: flex-start;
  gap: 0.3rem;
}

.tc-chord-diagram-fret-label {
  font-size: 0.6rem;
  color: var(--text3);
  margin-top: 1.4rem;
  line-height: 1;
}

.tc-chord-diagram-inner {
  display: flex;
  flex-direction: column;
  width: 72px;
}

.tc-chord-diagram-top-markers {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  height: 14px;
  margin-bottom: 1px;
}

.tc-chord-diagram-top-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  color: var(--text3);
  line-height: 1;
}

.tc-chord-diagram-nut      { height: 2px; background: var(--border2); border-radius: 1px; }
.tc-chord-diagram-nut.open { height: 3px; background: var(--accent); }

.tc-chord-diagram-fret-grid {
  display: flex;
  flex-direction: column;
  border-left: 1px solid var(--border2);
  border-right: 1px solid var(--border2);
}

.tc-chord-diagram-fret-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  height: 14px;
  border-bottom: 1px solid var(--border2);
}

.tc-chord-diagram-fret-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--border);
}

.tc-chord-diagram-fret-cell:last-child { border-right: none; }

.tc-chord-diagram-finger-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dot-scale);
  display: block;
}

.tc-chord-diagram-finger-dot.root {
  background: var(--dot-root);
  box-shadow: 0 0 3px var(--rust-glow);
}

.tc-chord-diagram-voicing-sel {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.tc-chord-diagram-voicing-btn {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 3px;
  color: var(--text3);
  font-size: 0.75rem;
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  padding: 0;
  transition: border-color 0.12s, color 0.12s;
}

.tc-chord-diagram-voicing-btn:hover { border-color: var(--accent); color: var(--accent); }

.tc-chord-diagram-voicing-label {
  font-size: 0.58rem;
  color: var(--text4);
  white-space: nowrap;
}
</style>

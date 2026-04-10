<script setup>
import { ref, computed } from 'vue'
import { playNote, stopAllNotes } from '@/audio/audioEngine.js'
import NoteStripPicker from '@/components/ui/NoteStripPicker.vue'
import { LEARN_SCALES as SCALES } from '@/constants/scales.js'

const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const IS_SHARP  = new Set([1,3,6,8,10])

const scaleRoot        = ref(0)
const scaleIdx         = ref(0)
const scalePlayingNote = ref(null)

const scaleNotes = computed(() =>
  SCALES[scaleIdx.value].steps.map(s => (scaleRoot.value + s) % 12)
)

const scaleFullName = computed(() =>
  `${CHROMATIC[scaleRoot.value]} ${SCALES[scaleIdx.value].name}`
)

let _scaleTimers = []

function pickScaleRoot(i) {
  _scaleTimers.forEach(clearTimeout)
  _scaleTimers = []
  stopAllNotes()
  scalePlayingNote.value = null
  scaleRoot.value = i
}

function playScale() {
  _scaleTimers.forEach(clearTimeout)
  _scaleTimers = []
  scalePlayingNote.value = null
  const { steps } = SCALES[scaleIdx.value]
  steps.forEach((s, i) => {
    const noteIdx = (scaleRoot.value + s) % 12
    _scaleTimers.push(setTimeout(() => {
      scalePlayingNote.value = noteIdx
      playNote(60 + scaleRoot.value + s, 0.5)
    }, i * 280))
  })
  _scaleTimers.push(setTimeout(() => {
    scalePlayingNote.value = scaleRoot.value
    playNote(72 + scaleRoot.value, 0.8)
  }, steps.length * 280))
  _scaleTimers.push(setTimeout(() => {
    scalePlayingNote.value = null
  }, (steps.length + 1) * 280))
}
</script>

<template>
  <div class="step-content">
    <p class="step-intro">A <strong>scale</strong> is a fixed pattern of intervals repeating from a root. The Major scale uses the same intervals every time, so it always sounds the same no matter which root you pick. Pick a root, choose a scale, hear which notes light up.</p>

    <div class="picker-row">
      <span class="picker-label">Root</span>
      <NoteStripPicker
        small
        :from-index="scaleRoot"
        @note-down="pickScaleRoot"
      />
    </div>

    <div class="picker-row">
      <span class="picker-label">Scale</span>
      <div class="scale-tabs">
        <button
          v-for="(sc, si) in SCALES"
          :key="si"
          class="scale-tab"
          :class="{ active: scaleIdx === si }"
          @click="scaleIdx = si"
        >{{ sc.name }}</button>
      </div>
    </div>

    <div class="scale-display-legend">
      <span class="sdl-item sdl-root">Root</span>
      <span class="sdl-item sdl-scale">Scale</span>
    </div>

    <div class="scale-display">
      <div
        v-for="(note, i) in CHROMATIC"
        :key="i"
        class="scale-tile"
        :class="{
          active:   scaleNotes.includes(i),
          root:     i === scaleRoot,
          sharp:    IS_SHARP.has(i),
          playing:  scalePlayingNote === i,
        }"
        @pointerdown.prevent="playNote(60 + i)"
      >{{ note }}</div>
    </div>

    <div class="scale-meta">
      <span class="scale-name">{{ scaleFullName }}</span>
      <span class="scale-feel">{{ SCALES[scaleIdx].feel }}</span>
      <button class="btn btn-accent flex-shrink-0" @click="playScale">Play scale</button>
    </div>
  </div>
</template>

<style scoped>
/* step-content, step-intro — from learn.css */

.scale-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.scale-tab {
  padding: 0.35rem 0.7rem;
  border-radius: 5px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text3);
  font-size: 0.8rem;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}

.scale-tab:hover { background: var(--raised); color: var(--text2); }

.scale-tab.active {
  background: var(--accent-bg);
  border-color: var(--accent);
  color: var(--accent);
}

.scale-display-legend {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.sdl-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  color: var(--text4);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.sdl-item::before {
  content: '';
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 3px;
  flex-shrink: 0;
}

.sdl-root::before {
  background: var(--accent-bg);
  border: 1px solid var(--accent);
}

.sdl-scale::before {
  background: var(--raised);
  border: 1px solid var(--border2);
}

.scale-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.scale-tile {
  min-width: 2.8rem;
  padding: 0.6rem 0.4rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--input);
  color: var(--text5);
  font-size: 0.82rem;
  font-weight: 600;
  text-align: center;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  user-select: none;
  touch-action: none;
  cursor: pointer;
}

.scale-tile.active {
  background: var(--raised);
  border-color: var(--border2);
  color: var(--text2);
}

.scale-tile.root {
  background: var(--accent-bg);
  border-color: var(--accent);
  color: var(--accent);
  font-size: 0.9rem;
}

.scale-tile.sharp { font-size: 0.75rem; }
.scale-tile.active.sharp { color: var(--text3); }
.scale-tile.root.sharp { color: var(--accent); font-size: 0.82rem; }

.scale-tile.playing {
  border-color: var(--accent);
  background: var(--selected);
  color: var(--accent-hi);
  box-shadow: 0 0 8px var(--accent-glow);
}

.scale-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.scale-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.scale-feel {
  font-size: 0.85rem;
  color: var(--text3);
  flex: 1;
}

</style>

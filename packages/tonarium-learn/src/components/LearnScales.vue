<script setup>
import { ref, computed } from 'vue'
import { playNote, stopAllNotes } from '@/audio/audioEngine.js'
import { NoteStripPicker } from '@tonarium/vue'
import { LEARN_SCALES as SCALES } from '@tonarium/core'

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
      <div class="tc-learn-scales-tabs">
        <button
          v-for="(sc, si) in SCALES"
          :key="si"
          class="tc-learn-scales-tab"
          :class="{ active: scaleIdx === si }"
          @click="scaleIdx = si"
        >{{ sc.name }}</button>
      </div>
    </div>

    <div class="tc-learn-scales-display-legend">
      <span class="tc-learn-scales-sdl-item tc-learn-scales-sdl-root">Root</span>
      <span class="tc-learn-scales-sdl-item tc-learn-scales-sdl-scale">Scale</span>
    </div>

    <div class="tc-learn-scales-display">
      <div
        v-for="(note, i) in CHROMATIC"
        :key="i"
        class="tc-learn-scales-tile"
        :class="{
          active:   scaleNotes.includes(i),
          root:     i === scaleRoot,
          sharp:    IS_SHARP.has(i),
          playing:  scalePlayingNote === i,
        }"
        @pointerdown.prevent="playNote(60 + i)"
      >{{ note }}</div>
    </div>

    <div class="tc-learn-scales-meta">
      <span class="tc-learn-scales-name">{{ scaleFullName }}</span>
      <span class="tc-learn-scales-feel">{{ SCALES[scaleIdx].feel }}</span>
      <button class="btn btn-accent flex-shrink-0" @click="playScale">Play scale</button>
    </div>
  </div>
</template>

<style scoped>
/* step-content, step-intro — from learn.css */

.tc-learn-scales-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.tc-learn-scales-tab {
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

.tc-learn-scales-tab:hover { background: var(--raised); color: var(--text2); }

.tc-learn-scales-tab.active {
  background: var(--accent-bg);
  border-color: var(--accent);
  color: var(--accent);
}

.tc-learn-scales-display-legend {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.tc-learn-scales-sdl-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  color: var(--text4);
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.tc-learn-scales-sdl-item::before {
  content: '';
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 3px;
  flex-shrink: 0;
}

.tc-learn-scales-sdl-root::before {
  background: var(--accent-bg);
  border: 1px solid var(--accent);
}

.tc-learn-scales-sdl-scale::before {
  background: var(--raised);
  border: 1px solid var(--border2);
}

.tc-learn-scales-display {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tc-learn-scales-tile {
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

.tc-learn-scales-tile.active {
  background: var(--raised);
  border-color: var(--border2);
  color: var(--text2);
}

.tc-learn-scales-tile.root {
  background: var(--accent-bg);
  border-color: var(--accent);
  color: var(--accent);
  font-size: 0.9rem;
}

.tc-learn-scales-tile.sharp { font-size: 0.75rem; }
.tc-learn-scales-tile.active.sharp { color: var(--text3); }
.tc-learn-scales-tile.root.sharp { color: var(--accent); font-size: 0.82rem; }

.tc-learn-scales-tile.playing {
  border-color: var(--accent);
  background: var(--selected);
  color: var(--accent-hi);
  box-shadow: 0 0 8px var(--accent-glow);
}

.tc-learn-scales-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.tc-learn-scales-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.tc-learn-scales-feel {
  font-size: 0.85rem;
  color: var(--text3);
  flex: 1;
}
</style>

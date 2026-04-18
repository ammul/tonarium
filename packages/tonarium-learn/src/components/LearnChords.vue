<script setup>
import { ref, computed } from 'vue'
import { playChord, playNote } from '@/audio/audioEngine.js'
import { NOTES } from '@tonarium/core'
import { NoteStripPicker } from '@tonarium/vue'
import { buildRows } from '@/utils/musicUtils.js'
import { padSize } from '@/state/padSize.js'
import ChordCardBody from '@/components/music/ChordCardBody.vue'
import { CHORD_TYPES } from '../constants/chordTypes.js'

const emit = defineEmits(['navigate'])

const chordsRoot    = ref(0)
const activeChordIdx = ref(null)

function selectChord(i) {
  activeChordIdx.value = activeChordIdx.value === i ? null : i
  const ct = CHORD_TYPES[i]
  playChord(ct.itvs.map(s => 60 + chordsRoot.value + s))
}

function pickRoot(i) {
  chordsRoot.value = i
  if (activeChordIdx.value !== null) {
    const ct = CHORD_TYPES[activeChordIdx.value]
    playChord(ct.itvs.map(s => 60 + i + s))
  }
}

function playInterval(s) {
  playNote(60 + chordsRoot.value + s, 1.5)
}

const activeChordCard = computed(() => {
  if (activeChordIdx.value === null) return null
  const ct = CHORD_TYPES[activeChordIdx.value]
  const padIndices = new Set(ct.itvs.map(s => (chordsRoot.value + s) % 12))
  const sorted     = [...padIndices].sort((a, b) => a - b)
  const cols       = padSize.value === '4x4' ? 4 : 3
  return {
    rows:         buildRows(padIndices, chordsRoot.value % 12, cols),
    pressLabels:  sorted.map(i => NOTES[i]),
    noteNames:    sorted.map(i => NOTES[i]),
    chordRootIdx: chordsRoot.value % 12,
    chordType:    ct.typeKey,
  }
})
</script>

<template>
  <div class="step-content">
    <p class="step-intro">A <strong>chord</strong> is three or more notes at once — and three types cover most of the music you know.</p>

    <div class="picker-row">
      <span class="picker-label">Root</span>
      <NoteStripPicker
        small
        :from-index="chordsRoot"
        @note-down="pickRoot"
      />
    </div>

    <div class="tc-learn-chords-list">
      <div
        v-for="(ct, i) in CHORD_TYPES"
        :key="ct.chord"
        class="card tc-learn-chords-card"
        :class="{ active: activeChordIdx === i }"
        @pointerdown.prevent="selectChord(i)"
      >
        <div class="tc-learn-chords-main">
          <div class="tc-learn-chords-text">
            <span class="tc-learn-chords-name">{{ ct.chord }}</span>
            <span class="tc-learn-chords-def">{{ ct.def }}</span>
          </div>
          <span class="tc-learn-chords-tap-hint">{{ activeChordIdx === i ? '▲' : 'tap' }}</span>
        </div>
        <div class="tc-learn-chords-intervals">
          <button
            v-for="s in ct.itvs"
            :key="s"
            class="tc-learn-chords-interval-pill"
            @pointerdown.prevent.stop="playInterval(s)"
          >{{ NOTES[(chordsRoot + s) % 12] }}</button>
        </div>
      </div>
    </div>

    <div v-if="activeChordCard" class="tc-learn-chords-display">
      <ChordCardBody v-bind="activeChordCard" />
    </div>

    <div class="step-bridge">
      Switch your display mode at the top of the page (pad / guitar / piano) — same chord, different shape. The interval pills above each play a single note so you can hear how each one adds character.
    </div>

    <div class="tc-learn-chords-cta">
      Explore all voicings and keys in <strong>Chord Progressions</strong>.
    </div>
  </div>
</template>

<style scoped>
/* step-content, step-intro, step-bridge — from learn.css */

/* picker-row / picker-label — matches other learn steps */
.picker-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.picker-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  white-space: nowrap;
}

.tc-learn-chords-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.tc-learn-chords-card {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.tc-learn-chords-card.active {
  border-color: var(--accent-mid);
  background: var(--accent-bg);
}

.tc-learn-chords-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.tc-learn-chords-text {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
}

.tc-learn-chords-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.tc-learn-chords-def {
  font-size: 0.82rem;
  color: var(--text3);
  line-height: 1.5;
}

.tc-learn-chords-tap-hint {
  font-size: 0.68rem;
  color: var(--text5);
  font-weight: 600;
  flex-shrink: 0;
  padding-top: 0.15rem;
  letter-spacing: 0.03em;
}

.tc-learn-chords-intervals {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.tc-learn-chords-interval-pill {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--accent-mid);
  background: var(--input);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.2rem 0.55rem;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.1s, border-color 0.1s, color 0.1s;
  -webkit-tap-highlight-color: transparent;
}

.tc-learn-chords-interval-pill:hover {
  background: var(--raised);
  border-color: var(--accent-mid);
  color: var(--accent);
}

.tc-learn-chords-display {
  padding: 1rem;
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
}

.tc-learn-chords-cta {
  padding: 0.7rem 1rem;
  border-radius: 8px;
  border: 1px dashed var(--border2);
  font-size: 0.83rem;
  color: var(--text3);
}

.tc-learn-chords-cta strong { color: var(--accent); }
</style>

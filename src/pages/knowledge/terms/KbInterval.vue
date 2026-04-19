<script setup>
import { ref, computed } from 'vue'
import { playNote, playChord } from '@/audio/audioEngine.js'
import { NOTE_TO_SEMI, NOTES } from '@tonarium/core'
import { NoteStripPicker } from '@tonarium/vue'
import KbText from '../KbText.vue'

defineProps({ goToTerm: { type: Function, required: true } })

const INTERVALS = [
  { semi: 0,  name: 'Unison',      feel: 'same pitch' },
  { semi: 1,  name: 'Minor 2nd',   feel: 'dissonant, tense' },
  { semi: 2,  name: 'Major 2nd',   feel: 'stepwise, melodic' },
  { semi: 3,  name: 'Minor 3rd',   feel: 'dark, emotional' },
  { semi: 4,  name: 'Major 3rd',   feel: 'bright, major' },
  { semi: 5,  name: 'Perfect 4th', feel: 'open, stable' },
  { semi: 6,  name: 'Tritone',     feel: 'tense, unsettled' },
  { semi: 7,  name: 'Perfect 5th', feel: 'powerful, stable' },
  { semi: 8,  name: 'Minor 6th',   feel: 'dark, longing' },
  { semi: 9,  name: 'Major 6th',   feel: 'warm, bright' },
  { semi: 10, name: 'Minor 7th',   feel: 'bluesy, tense' },
  { semi: 11, name: 'Major 7th',   feel: 'dreamy, unresolved' },
]

const fromIdx = ref(null)
const toIdx   = ref(null)

function pickNote(i) {
  if (fromIdx.value === null) {
    fromIdx.value = i
    playNote(60 + NOTE_TO_SEMI[i])
  } else if (toIdx.value === null && i !== fromIdx.value) {
    toIdx.value = i
    playChord([60 + NOTE_TO_SEMI[fromIdx.value], 60 + NOTE_TO_SEMI[i]])
  } else {
    fromIdx.value = i
    toIdx.value   = null
    playNote(60 + NOTE_TO_SEMI[i])
  }
}

function tapRow(semi) {
  fromIdx.value = 0
  toIdx.value   = semi
  playChord([60, 60 + semi])
}

const intervalInfo = computed(() => {
  if (fromIdx.value === null || toIdx.value === null) return null
  const semi = ((toIdx.value - fromIdx.value) + 12) % 12
  return INTERVALS.find(iv => iv.semi === semi) ?? null
})

const semitoneCount = computed(() => {
  if (fromIdx.value === null || toIdx.value === null) return null
  return ((toIdx.value - fromIdx.value) + 12) % 12
})
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="An interval is the distance between two notes, measured in semitones. Intervals give chords and scales their emotional color — a major 3rd sounds bright, a minor 3rd sounds dark."
        :go-to-term="goToTerm"
        current-term="interval"
      />
    </p>

    <div class="kb-section-label">Pick two notes — hear the interval</div>
    <NoteStripPicker :from-index="fromIdx" :to-index="toIdx" @note-down="pickNote" />

    <div v-if="intervalInfo" class="kb-interval-result">
      <span class="kb-interval-semis">{{ semitoneCount }}</span>
      <div class="kb-interval-detail">
        <div class="kb-interval-name">{{ intervalInfo.name }}</div>
        <div class="kb-interval-feel">{{ intervalInfo.feel }}</div>
      </div>
    </div>
    <div v-else class="kb-interval-hint">
      {{ fromIdx === null ? 'Tap a starting note' : 'Now tap a second note' }}
    </div>

    <div class="kb-section-label">All 12 intervals — tap to hear</div>
    <div class="kb-interval-table">
      <button
        v-for="iv in INTERVALS.slice(1)"
        :key="iv.semi"
        class="kb-iv-row"
        :class="{ active: semitoneCount === iv.semi && intervalInfo }"
        @click="tapRow(iv.semi)"
      >
        <span class="kb-iv-semi">{{ iv.semi }}</span>
        <span class="kb-iv-name">{{ iv.name }}</span>
        <span class="kb-iv-feel">{{ iv.feel }}</span>
      </button>
    </div>

    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('note')">Note</button>
      <button class="kb-rel-btn" @click="goToTerm('semitone')">Semitone</button>
      <button class="kb-rel-btn" @click="goToTerm('chord')">Chord</button>
      <button class="kb-rel-btn" @click="goToTerm('scale')">Scale</button>
    </div>
  </div>
</template>

<style scoped>
.kb-section-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text4);
  margin-bottom: -0.25rem;
}
.kb-interval-result {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--accent-mid);
  border-radius: 8px;
  background: var(--accent-bg);
}
.kb-interval-semis {
  font-size: 2.4rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
  min-width: 2rem;
  text-align: center;
}
.kb-interval-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
}
.kb-interval-feel {
  font-size: 0.82rem;
  color: var(--text3);
  margin-top: 2px;
}
.kb-interval-hint {
  font-size: 0.84rem;
  color: var(--text4);
  padding: 0.5rem 0;
}
.kb-interval-table {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.kb-iv-row {
  display: grid;
  grid-template-columns: 1.5rem 1fr 1fr;
  gap: 0.5rem;
  align-items: center;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 1px solid transparent;
  background: transparent;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s, border-color 0.1s;
}
.kb-iv-row:hover { background: var(--raised); border-color: var(--border); }
.kb-iv-row.active { background: var(--accent-bg); border-color: var(--accent-mid); }
.kb-iv-semi { font-size: 0.85rem; font-weight: 700; color: var(--accent); text-align: center; }
.kb-iv-name { font-size: 0.85rem; font-weight: 600; color: var(--text2); }
.kb-iv-feel { font-size: 0.78rem; color: var(--text4); }
.kb-related {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-top: 0.25rem;
  border-top: 1px solid var(--border);
}
.kb-related-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text5);
}
.kb-rel-btn {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s;
}
.kb-rel-btn:hover { border-color: var(--accent); background: var(--accent-bg); }
</style>

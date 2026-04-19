<script setup>
import { ref, computed } from 'vue'
import { playChord } from '@/audio/audioEngine.js'
import { NOTES, NOTE_TO_SEMI } from '@tonarium/core'
import { NoteStripPicker } from '@tonarium/vue'
import ChordCardBody from '@/components/music/ChordCardBody.vue'
import { buildRows } from '@/utils/musicUtils.js'
import { padSize } from '@/state/padSize.js'
import KbText from '../KbText.vue'

defineProps({ goToTerm: { type: Function, required: true } })

const CHORD_DEFS = [
  { label: 'Major',        typeKey: 'maj',  itvs: [0, 4, 7],     feel: 'Bright, happy, resolved' },
  { label: 'Minor',        typeKey: 'min',  itvs: [0, 3, 7],     feel: 'Dark, emotional, sad' },
  { label: 'Dominant 7th', typeKey: 'dom7', itvs: [0, 4, 7, 10], feel: 'Bluesy, tense, wants to resolve' },
  { label: 'Major 7th',    typeKey: 'maj7', itvs: [0, 4, 7, 11], feel: 'Dreamy, jazzy, lush' },
  { label: 'Minor 7th',    typeKey: 'min7', itvs: [0, 3, 7, 10], feel: 'Smooth, soulful, mellow' },
]

const rootIdx      = ref(0)
const activeTypeIdx = ref(0)

function pickRoot(i) {
  rootIdx.value = i
  playActiveChord()
}

function selectType(i) {
  activeTypeIdx.value = i
  playActiveChord()
}

function playActiveChord() {
  const ct = CHORD_DEFS[activeTypeIdx.value]
  const semi = NOTE_TO_SEMI[rootIdx.value]
  playChord(ct.itvs.map(s => 60 + semi + s))
}

const activeCard = computed(() => {
  const ct   = CHORD_DEFS[activeTypeIdx.value]
  const semi = NOTE_TO_SEMI[rootIdx.value]
  const noteIndices = new Set(ct.itvs.map(s => (rootIdx.value + s) % 12))
  const sorted      = [...noteIndices].sort((a, b) => a - b)
  const cols        = padSize.value === '4x4' ? 4 : 3
  return {
    rows:         buildRows(noteIndices, rootIdx.value % 12, cols),
    pressLabels:  sorted.map(i => NOTES[i]),
    noteNames:    sorted.map(i => NOTES[i]),
    chordRootIdx: rootIdx.value % 12,
    chordType:    ct.typeKey,
  }
})

const chordName = computed(() => {
  const ct = CHORD_DEFS[activeTypeIdx.value]
  const suffixes = { maj: '', min: 'm', dom7: '7', maj7: 'M7', min7: 'm7' }
  return NOTES[rootIdx.value] + (suffixes[ct.typeKey] ?? '')
})
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="A chord is three or more notes played together. Chords are built by stacking specific intervals above a root note — the pattern of intervals determines the chord type and its emotional feel."
        :go-to-term="goToTerm"
        current-term="chord"
      />
    </p>

    <div class="kb-chord-controls">
      <div>
        <div class="kb-section-label">Root</div>
        <NoteStripPicker small :model-value="rootIdx" @note-down="pickRoot" />
      </div>
      <div>
        <div class="kb-section-label">Type</div>
        <div class="kb-chord-types">
          <button
            v-for="(ct, i) in CHORD_DEFS"
            :key="ct.typeKey"
            class="kb-chord-type-btn"
            :class="{ active: activeTypeIdx === i }"
            @click="selectType(i)"
          >{{ ct.label }}</button>
        </div>
      </div>
    </div>

    <div class="kb-chord-result">
      <div class="kb-chord-name">{{ chordName }}</div>
      <div class="kb-chord-feel">{{ CHORD_DEFS[activeTypeIdx].feel }}</div>
      <div class="kb-chord-notes">
        <KbText
          :text="'Notes: ' + activeCard.noteNames.join(' – ')"
          :go-to-term="goToTerm"
          current-term="chord"
        />
      </div>
    </div>

    <ChordCardBody v-bind="activeCard" />

    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('note')">Note</button>
      <button class="kb-rel-btn" @click="goToTerm('interval')">Interval</button>
      <button class="kb-rel-btn" @click="goToTerm('root')">Root Note</button>
      <button class="kb-rel-btn" @click="goToTerm('scale')">Scale</button>
      <button class="kb-rel-btn" @click="goToTerm('progression')">Chord Progression</button>
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
  margin-bottom: 0.35rem;
}
.kb-chord-controls { display: flex; flex-direction: column; gap: 0.75rem; }
.kb-chord-types { display: flex; gap: 0.3rem; flex-wrap: wrap; }
.kb-chord-type-btn {
  padding: 0.28rem 0.7rem;
  border-radius: 20px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s, color 0.12s;
}
.kb-chord-type-btn:hover { border-color: var(--accent); color: var(--text); }
.kb-chord-type-btn.active { border-color: var(--accent); background: var(--accent-bg); color: var(--accent); }
.kb-chord-result {
  padding: 0.75rem 0.85rem;
  border: 1px solid var(--border2);
  border-radius: 8px;
  background: var(--raised);
}
.kb-chord-name { font-size: 1.8rem; font-weight: 700; color: var(--accent); line-height: 1; }
.kb-chord-feel { font-size: 0.84rem; color: var(--text3); margin: 0.25rem 0; }
.kb-chord-notes { font-size: 0.84rem; color: var(--text2); }
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

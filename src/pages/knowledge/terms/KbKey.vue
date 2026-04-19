<script setup>
import { ref, computed } from 'vue'
import { playChord } from '@/audio/audioEngine.js'
import { NOTES, NOTE_TO_SEMI } from '@tonarium/core'
import { NoteStripPicker } from '@tonarium/vue'
import KbText from '../KbText.vue'

defineProps({ goToTerm: { type: Function, required: true } })

const DIATONIC = [
  { degree: 0,  roman: 'I',   type: 'maj', suffix: '' },
  { degree: 2,  roman: 'ii',  type: 'min', suffix: 'm' },
  { degree: 4,  roman: 'iii', type: 'min', suffix: 'm' },
  { degree: 5,  roman: 'IV',  type: 'maj', suffix: '' },
  { degree: 7,  roman: 'V',   type: 'maj', suffix: '' },
  { degree: 9,  roman: 'vi',  type: 'min', suffix: 'm' },
  { degree: 11, roman: 'vii°', type: 'dim', suffix: '°' },
]

const TYPE_ITVS = { maj: [0, 4, 7], min: [0, 3, 7], dim: [0, 3, 6] }

const rootIdx    = ref(0)
const activeIdx  = ref(null)

function pickRoot(i) { rootIdx.value = i; activeIdx.value = null }

const diatonicChords = computed(() =>
  DIATONIC.map((d, i) => {
    const noteIdx = (rootIdx.value + d.degree) % 12
    return {
      ...d,
      noteIdx,
      name: NOTES[noteIdx] + d.suffix,
      idx: i,
    }
  })
)

function playDiatonic(i) {
  activeIdx.value = i
  const chord = diatonicChords.value[i]
  const semi = NOTE_TO_SEMI[chord.noteIdx]
  const itvs = TYPE_ITVS[chord.type]
  playChord(itvs.map(s => 60 + semi + s))
}
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="A key defines the home note and scale a piece of music revolves around. Knowing the key tells you which notes and chords belong — and which will sound out of place."
        :go-to-term="goToTerm"
        current-term="key"
      />
    </p>

    <div class="kb-section-label">Pick a key</div>
    <NoteStripPicker :model-value="rootIdx" @note-down="pickRoot" />

    <div class="kb-key-heading">
      {{ NOTES[rootIdx] }} Major — diatonic chords
    </div>
    <div class="kb-key-grid">
      <button
        v-for="chord in diatonicChords"
        :key="chord.roman"
        class="kb-key-chord"
        :class="{ active: activeIdx === chord.idx, 'is-tonic': chord.idx === 0 }"
        @click="playDiatonic(chord.idx)"
      >
        <span class="kb-key-roman">{{ chord.roman }}</span>
        <span class="kb-key-name">{{ chord.name }}</span>
        <span class="kb-key-type">{{ chord.type }}</span>
      </button>
    </div>

    <div class="kb-facts">
      <div class="kb-fact">
        <span class="kb-fact-num">7</span>
        <KbText text="chords belong to each key" :go-to-term="goToTerm" current-term="key" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">I</span>
        <KbText text="the tonic chord — home base" :go-to-term="goToTerm" current-term="key" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">V</span>
        <KbText text="the dominant — creates tension that wants to resolve" :go-to-term="goToTerm" current-term="key" />
      </div>
    </div>

    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('root')">Root Note</button>
      <button class="kb-rel-btn" @click="goToTerm('scale')">Scale</button>
      <button class="kb-rel-btn" @click="goToTerm('chord')">Chord</button>
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
}
.kb-key-heading {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text2);
  padding: 0.25rem 0;
}
.kb-key-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.3rem;
}
@media (max-width: 500px) {
  .kb-key-grid { grid-template-columns: repeat(4, 1fr); }
}
.kb-key-chord {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.5rem 0.2rem;
  border-radius: 8px;
  border: 1px solid var(--border2);
  background: var(--surface);
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.12s, background 0.12s;
}
.kb-key-chord:hover { border-color: var(--accent); background: var(--raised); }
.kb-key-chord.active { border-color: var(--accent); background: var(--accent-bg); }
.kb-key-chord.is-tonic { border-color: var(--rust); }
.kb-key-chord.is-tonic.active { background: var(--rust-bg); }
.kb-key-roman { font-size: 0.7rem; font-weight: 700; color: var(--text4); }
.kb-key-name  { font-size: 0.88rem; font-weight: 700; color: var(--accent); }
.kb-key-chord.is-tonic .kb-key-name { color: var(--rust-hi); }
.kb-key-type  { font-size: 0.65rem; color: var(--text5); text-transform: uppercase; }
.kb-facts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}
.kb-fact {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  font-size: 0.82rem;
  color: var(--text3);
}
.kb-fact-num {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
}
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

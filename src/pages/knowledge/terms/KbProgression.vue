<script setup>
import { ref } from 'vue'
import { playChord } from '@/audio/audioEngine.js'
import { NOTES, NOTE_TO_SEMI } from '@tonarium/core'
import KbText from '../KbText.vue'

defineProps({ goToTerm: { type: Function, required: true } })

const PROGRESSIONS = [
  {
    id: 'I-V-vi-IV',
    label: 'I - V - vi - IV',
    feel: 'Pop anthem, optimistic',
    chords: [
      { name: 'C',  itvs: [0, 4, 7],  semi: 0 },
      { name: 'G',  itvs: [0, 4, 7],  semi: 7 },
      { name: 'Am', itvs: [0, 3, 7],  semi: 9 },
      { name: 'F',  itvs: [0, 4, 7],  semi: 5 },
    ],
  },
  {
    id: 'I-IV-V',
    label: 'I - IV - V',
    feel: 'Blues, rock, classic',
    chords: [
      { name: 'A',  itvs: [0, 4, 7],  semi: 9 },
      { name: 'D',  itvs: [0, 4, 7],  semi: 2 },
      { name: 'E',  itvs: [0, 4, 7],  semi: 4 },
    ],
  },
  {
    id: 'ii-V-I',
    label: 'ii - V - I',
    feel: 'Jazz standard, sophisticated',
    chords: [
      { name: 'Dm7', itvs: [0, 3, 7, 10], semi: 2 },
      { name: 'G7',  itvs: [0, 4, 7, 10], semi: 7 },
      { name: 'CM7', itvs: [0, 4, 7, 11], semi: 0 },
    ],
  },
  {
    id: 'I-vi-IV-V',
    label: 'I - vi - IV - V',
    feel: '50s doo-wop, nostalgic',
    chords: [
      { name: 'C',  itvs: [0, 4, 7], semi: 0 },
      { name: 'Am', itvs: [0, 3, 7], semi: 9 },
      { name: 'F',  itvs: [0, 4, 7], semi: 5 },
      { name: 'G',  itvs: [0, 4, 7], semi: 7 },
    ],
  },
  {
    id: 'i-VII-VI-VII',
    label: 'i - VII - VI - VII',
    feel: 'Minor, brooding, dramatic',
    chords: [
      { name: 'Am', itvs: [0, 3, 7], semi: 9 },
      { name: 'G',  itvs: [0, 4, 7], semi: 7 },
      { name: 'F',  itvs: [0, 4, 7], semi: 5 },
      { name: 'G',  itvs: [0, 4, 7], semi: 7 },
    ],
  },
]

const selectedIdx  = ref(0)
const activeChord  = ref(null)
let   _timers      = []

function clearTimers() { _timers.forEach(t => clearTimeout(t)); _timers = [] }

function playProgression() {
  clearTimers()
  const prog = PROGRESSIONS[selectedIdx.value]
  prog.chords.forEach((ch, i) => {
    _timers.push(setTimeout(() => {
      activeChord.value = i
      playChord(ch.itvs.map(s => 60 + ch.semi + s))
    }, i * 1000))
  })
  _timers.push(setTimeout(() => { activeChord.value = null }, prog.chords.length * 1000))
}

function selectProg(i) {
  clearTimers()
  activeChord.value = null
  selectedIdx.value = i
}
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="A chord progression is a sequence of chords that creates movement and emotion. The same few progressions appear in thousands of songs — the pattern matters more than the key."
        :go-to-term="goToTerm"
        current-term="progression"
      />
    </p>

    <div class="kb-section-label">Choose a progression</div>
    <div class="kb-prog-list">
      <button
        v-for="(p, i) in PROGRESSIONS"
        :key="p.id"
        class="kb-prog-row"
        :class="{ active: selectedIdx === i }"
        @click="selectProg(i)"
      >
        <span class="kb-prog-label">{{ p.label }}</span>
        <span class="kb-prog-feel">{{ p.feel }}</span>
      </button>
    </div>

    <div class="kb-prog-player">
      <div class="kb-prog-chords">
        <div
          v-for="(ch, i) in PROGRESSIONS[selectedIdx].chords"
          :key="i"
          class="kb-prog-chord"
          :class="{ active: activeChord === i }"
        >{{ ch.name }}</div>
      </div>
      <button class="kb-prog-play-btn" @click="playProgression">Play</button>
    </div>

    <div class="kb-facts">
      <div class="kb-fact">
        <span class="kb-fact-num">I</span>
        <KbText text="tonic — the resting point" :go-to-term="goToTerm" current-term="progression" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">IV</span>
        <KbText text="subdominant — lifts the energy" :go-to-term="goToTerm" current-term="progression" />
      </div>
      <div class="kb-fact">
        <span class="kb-fact-num">V</span>
        <KbText text="dominant — builds tension before resolving" :go-to-term="goToTerm" current-term="progression" />
      </div>
    </div>

    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('chord')">Chord</button>
      <button class="kb-rel-btn" @click="goToTerm('key')">Key</button>
      <button class="kb-rel-btn" @click="goToTerm('scale')">Scale</button>
      <button class="kb-rel-btn" @click="goToTerm('root')">Root Note</button>
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
.kb-prog-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.kb-prog-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.45rem 0.7rem;
  border-radius: 7px;
  border: 1px solid transparent;
  background: transparent;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 0.1s, border-color 0.1s;
}
.kb-prog-row:hover { background: var(--raised); border-color: var(--border); }
.kb-prog-row.active { background: var(--accent-bg); border-color: var(--accent-mid); }
.kb-prog-label { font-size: 0.9rem; font-weight: 700; color: var(--accent); min-width: 9rem; }
.kb-prog-feel  { font-size: 0.78rem; color: var(--text4); }
.kb-prog-player {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--border2);
  border-radius: 8px;
  background: var(--raised);
}
.kb-prog-chords {
  display: flex;
  gap: 0.4rem;
  flex: 1;
  flex-wrap: wrap;
}
.kb-prog-chord {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--surface);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text2);
  transition: border-color 0.1s, background 0.1s, color 0.1s;
}
.kb-prog-chord.active {
  border-color: var(--accent);
  background: var(--accent-bg);
  color: var(--accent);
}
.kb-prog-play-btn {
  padding: 0.35rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.82rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: border-color 0.12s, color 0.12s;
}
.kb-prog-play-btn:hover { border-color: var(--accent); color: var(--accent); }
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

<script setup>
import { ref, onUnmounted } from 'vue'
import { playNote } from '@/audio/audioEngine.js'
import KbText from '../KbText.vue'

defineProps({ goToTerm: { type: Function, required: true } })

const BPM_EXAMPLES = [
  { label: 'Largo',    range: '40-60',  feel: 'Very slow, solemn' },
  { label: 'Adagio',   range: '60-75',  feel: 'Slow, expressive' },
  { label: 'Andante',  range: '75-108', feel: 'Walking pace' },
  { label: 'Moderato', range: '108-120', feel: 'Moderate' },
  { label: 'Allegro',  range: '120-156', feel: 'Fast, lively' },
  { label: 'Presto',   range: '168-200', feel: 'Very fast' },
]

const bpm      = ref(120)
const playing  = ref(false)
let   _timeout = null

const currentTempo = () => BPM_EXAMPLES.find(e => {
  const [lo, hi] = e.range.split('-').map(Number)
  return bpm.value >= lo && bpm.value <= hi
}) ?? BPM_EXAMPLES[3]

function clickTick() {
  playNote(76, 0.6)
  if (!playing.value) return
  _timeout = setTimeout(clickTick, (60 / bpm.value) * 1000)
}

function startStop() {
  if (playing.value) {
    playing.value = false
    clearTimeout(_timeout)
  } else {
    playing.value = true
    clickTick()
  }
}

function onBpmChange() {
  if (!playing.value) return
  clearTimeout(_timeout)
  _timeout = setTimeout(clickTick, (60 / bpm.value) * 1000)
}

onUnmounted(() => { playing.value = false; clearTimeout(_timeout) })
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="BPM stands for Beats Per Minute — it measures tempo, how fast the music moves. 120 BPM is a common starting point: steady, energetic, and easy to play along with."
        :go-to-term="goToTerm"
        current-term="bpm"
      />
    </p>

    <div class="kb-bpm-display">
      <span class="kb-bpm-number">{{ bpm }}</span>
      <span class="kb-bpm-unit">BPM</span>
    </div>

    <input
      v-model.number="bpm"
      type="range"
      min="40"
      max="200"
      step="1"
      class="kb-bpm-slider"
      @input="onBpmChange"
    />

    <div class="kb-bpm-labels">
      <span>40</span><span>120</span><span>200</span>
    </div>

    <div class="kb-bpm-feel">
      <span class="kb-bpm-feel-name">{{ currentTempo().label }}</span>
      <span class="kb-bpm-feel-desc">{{ currentTempo().feel }}</span>
    </div>

    <button class="kb-bpm-play-btn" :class="{ active: playing }" @click="startStop">
      {{ playing ? 'Stop click' : 'Hear this tempo' }}
    </button>

    <div class="kb-bpm-table">
      <div
        v-for="ex in BPM_EXAMPLES"
        :key="ex.label"
        class="kb-bpm-row"
        :class="{ current: ex === currentTempo() }"
      >
        <span class="kb-bpm-row-name">{{ ex.label }}</span>
        <span class="kb-bpm-row-range">{{ ex.range }}</span>
        <span class="kb-bpm-row-feel">{{ ex.feel }}</span>
      </div>
    </div>

    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('beat')">Beat</button>
      <button class="kb-rel-btn" @click="goToTerm('progression')">Chord Progression</button>
    </div>
  </div>
</template>

<style scoped>
.kb-bpm-display {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}
.kb-bpm-number {
  font-size: 3rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.kb-bpm-unit {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text3);
}
.kb-bpm-slider {
  width: 100%;
  accent-color: var(--accent);
}
.kb-bpm-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--text5);
  margin-top: -0.2rem;
}
.kb-bpm-feel {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
}
.kb-bpm-feel-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
}
.kb-bpm-feel-desc {
  font-size: 0.84rem;
  color: var(--text3);
}
.kb-bpm-play-btn {
  padding: 0.4rem 1.1rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s, background 0.12s;
  align-self: flex-start;
}
.kb-bpm-play-btn:hover { border-color: var(--accent); color: var(--accent); }
.kb-bpm-play-btn.active { border-color: var(--accent); background: var(--accent-bg); color: var(--accent); }
.kb-bpm-table {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.kb-bpm-row {
  display: grid;
  grid-template-columns: 5rem 4rem 1fr;
  gap: 0.5rem;
  align-items: center;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  border: 1px solid transparent;
}
.kb-bpm-row.current {
  background: var(--accent-bg);
  border-color: var(--accent-mid);
}
.kb-bpm-row-name  { font-size: 0.85rem; font-weight: 700; color: var(--text2); }
.kb-bpm-row-range { font-size: 0.78rem; color: var(--accent); font-variant-numeric: tabular-nums; }
.kb-bpm-row-feel  { font-size: 0.78rem; color: var(--text4); }
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

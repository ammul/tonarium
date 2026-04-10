<script setup>
import { ref } from 'vue'
import { NOTES } from '@/constants/musicConstants.js'
import { ALL_PROGRESSIONS } from '@/constants/progressions.js'
import { BEAT_PATTERNS } from '@/constants/beatPatterns.js'
import { sessionProgression, sessionBeatIdx, sessionBpm, sessionKey } from '@/state/sessionState.js'
import { pattern as drumPattern, INSTRUMENTS } from '@/audio/drumEngine.js'

const emit = defineEmits(['navigate'])

const GROOVE_INST_MAP = { 'Kick': 0, 'Snare': 1, 'Hi-Hat': 3 }

const STARTER_PROGS = [
  ALL_PROGRESSIONS.find(p => p.id === 'pop-1'),
  ALL_PROGRESSIONS.find(p => p.id === 'blues-1'),
  ALL_PROGRESSIONS.find(p => p.id === 'rock-6'),
].filter(Boolean)

const STARTER_BEATS = [0, 3, 7]

const chosenProg = ref(null)
const chosenBeat = ref(null)
const chosenBpm  = ref(120)

function pickProg(prog) {
  chosenProg.value = chosenProg.value?.id === prog.id ? null : prog
  if (prog.genre === 'blues') chosenBeat.value = 3
  else if (prog.genre === 'rock') chosenBeat.value = 0
  else chosenBeat.value = 0
  chosenBpm.value = BEAT_PATTERNS[chosenBeat.value]?.bpm ?? 120
}

function pickBeat(idx) {
  chosenBeat.value = chosenBeat.value === idx ? null : idx
  if (idx !== null) chosenBpm.value = BEAT_PATTERNS[idx]?.bpm ?? 120
}

function launchJam() {
  if (!chosenProg.value) return
  const ri = NOTES.indexOf('C')
  sessionProgression.value = {
    ...chosenProg.value,
    chords: chosenProg.value.chords.map(c => ({
      ...c,
      _rootIdx: (ri + c.degree) % 12,
      _octave: 4,
    })),
  }
  sessionKey.value = 'C'
  sessionBpm.value = chosenBpm.value
  if (chosenBeat.value !== null) {
    sessionBeatIdx.value = chosenBeat.value
    const bp = BEAT_PATTERNS[chosenBeat.value]
    const newPattern = Array.from({ length: INSTRUMENTS.length }, () => new Array(16).fill(false))
    for (const row of bp.rows) {
      const instIdx = GROOVE_INST_MAP[row.name]
      if (instIdx !== undefined) newPattern[instIdx] = row.steps.map(s => s === 1)
    }
    drumPattern.value = newPattern
    sessionBpm.value = chosenBpm.value
  }
  emit('navigate', 'jam')
}
</script>

<template>
  <div class="step-content">
    <p class="step-intro">Time to put it all together. Pick a progression, add a beat, and start jamming. The highlights on the pads will follow the chords as they cycle.</p>

    <div class="setup-step">
      <span class="setup-num">1</span>
      <span class="setup-label">Pick a progression</span>
    </div>
    <div class="starter-pills">
      <button
        v-for="prog in STARTER_PROGS"
        :key="prog.id"
        class="starter-pill"
        :class="{ active: chosenProg?.id === prog.id }"
        @click="pickProg(prog)"
      >
        <span class="sp-label">{{ prog.label }}</span>
        <span class="sp-numeral">{{ prog.numeral }}</span>
      </button>
    </div>

    <div class="setup-step">
      <span class="setup-num">2</span>
      <span class="setup-label">Add a beat</span>
    </div>
    <div class="starter-pills">
      <button
        v-for="bi in STARTER_BEATS"
        :key="bi"
        class="starter-pill"
        :class="{ active: chosenBeat === bi }"
        @click="pickBeat(bi)"
      >
        <span class="sp-label">{{ BEAT_PATTERNS[bi].name }}</span>
        <span class="sp-numeral">{{ BEAT_PATTERNS[bi].genre }}</span>
      </button>
    </div>

    <div class="setup-step">
      <span class="setup-num">3</span>
      <span class="setup-label">Set the tempo</span>
    </div>
    <div class="bpm-row">
      <input type="range" v-model.number="chosenBpm" min="60" max="180" class="bpm-slider" />
      <span class="bpm-val">{{ chosenBpm }} BPM</span>
    </div>

    <button
      class="btn btn-accent btn-block jam-launch"
      :disabled="!chosenProg"
      @click="launchJam"
    >
      Start Jamming
    </button>
  </div>
</template>

<style scoped>
.setup-step {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.setup-num {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--accent);
  color: var(--on-accent);
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.setup-label {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text);
}

.starter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.starter-pill {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.5rem 0.75rem;
  border-radius: 7px;
  border: 1px solid var(--border2);
  background: var(--input);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: border-color 0.12s, background 0.12s;
}

.starter-pill:hover { border-color: var(--accent-mid); }
.starter-pill.active { border-color: var(--accent); background: var(--accent-bg); }

.sp-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text2);
}

.starter-pill.active .sp-label { color: var(--accent); }

.sp-numeral {
  font-size: 0.72rem;
  color: var(--text4);
}

.bpm-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bpm-slider {
  flex: 1;
  accent-color: var(--accent);
}

.bpm-val {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text2);
  min-width: 5rem;
  text-align: right;
}

.jam-launch {
  margin-top: 1.5rem;
  font-size: 1rem;
  padding: 0.75rem;
}

.jam-launch:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

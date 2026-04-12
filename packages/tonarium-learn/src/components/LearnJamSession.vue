<script setup>
import { ref } from 'vue'
import { NOTES, ALL_PROGRESSIONS, BEAT_PATTERNS } from '@tonarium/core'
import { sessionProgression, sessionBeatIdx, sessionBpm, sessionKey } from '@/state/sessionState.js'
import { pattern as drumPattern } from '@/audio/drumEngine.js'
import { buildPatternFromBeat } from '@/utils/beatUtils.js'

const emit = defineEmits(['navigate'])

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
    drumPattern.value = buildPatternFromBeat(chosenBeat.value)
    sessionBpm.value = chosenBpm.value
  }
  emit('navigate', 'home')
}
</script>

<template>
  <div class="step-content">
    <p class="step-intro">Time to put it all together. Pick a progression, add a beat, and start jamming. The highlights on the pads will follow the chords as they cycle.</p>

    <div class="tc-learn-jam-setup-step">
      <span class="tc-learn-jam-setup-num">1</span>
      <span class="tc-learn-jam-setup-label">Pick a progression</span>
    </div>
    <div class="tc-learn-jam-starter-pills">
      <button
        v-for="prog in STARTER_PROGS"
        :key="prog.id"
        class="tc-learn-jam-starter-pill"
        :class="{ active: chosenProg?.id === prog.id }"
        @click="pickProg(prog)"
      >
        <span class="tc-learn-jam-sp-label">{{ prog.label }}</span>
        <span class="tc-learn-jam-sp-numeral">{{ prog.numeral }}</span>
      </button>
    </div>

    <div class="tc-learn-jam-setup-step">
      <span class="tc-learn-jam-setup-num">2</span>
      <span class="tc-learn-jam-setup-label">Add a beat</span>
    </div>
    <div class="tc-learn-jam-starter-pills">
      <button
        v-for="bi in STARTER_BEATS"
        :key="bi"
        class="tc-learn-jam-starter-pill"
        :class="{ active: chosenBeat === bi }"
        @click="pickBeat(bi)"
      >
        <span class="tc-learn-jam-sp-label">{{ BEAT_PATTERNS[bi].name }}</span>
        <span class="tc-learn-jam-sp-numeral">{{ BEAT_PATTERNS[bi].genre }}</span>
      </button>
    </div>

    <div class="tc-learn-jam-setup-step">
      <span class="tc-learn-jam-setup-num">3</span>
      <span class="tc-learn-jam-setup-label">Set the tempo</span>
    </div>
    <div class="tc-learn-jam-bpm-row">
      <input type="range" v-model.number="chosenBpm" min="60" max="180" class="tc-learn-jam-bpm-slider" />
      <span class="tc-learn-jam-bpm-val">{{ chosenBpm }} BPM</span>
    </div>

    <button
      class="btn btn-accent btn-block tc-learn-jam-launch"
      :disabled="!chosenProg"
      @click="launchJam"
    >
      Start Jamming
    </button>
  </div>
</template>

<style scoped>
.tc-learn-jam-setup-step {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.tc-learn-jam-setup-num {
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

.tc-learn-jam-setup-label {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text);
}

.tc-learn-jam-starter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tc-learn-jam-starter-pill {
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

.tc-learn-jam-starter-pill:hover { border-color: var(--accent-mid); }
.tc-learn-jam-starter-pill.active { border-color: var(--accent); background: var(--accent-bg); }

.tc-learn-jam-sp-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text2);
}

.tc-learn-jam-starter-pill.active .tc-learn-jam-sp-label { color: var(--accent); }

.tc-learn-jam-sp-numeral {
  font-size: 0.72rem;
  color: var(--text4);
}

.tc-learn-jam-bpm-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tc-learn-jam-bpm-slider {
  flex: 1;
  accent-color: var(--accent);
}

.tc-learn-jam-bpm-val {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text2);
  min-width: 5rem;
  text-align: right;
}

.tc-learn-jam-launch {
  margin-top: 1.5rem;
  font-size: 1rem;
  padding: 0.75rem;
}

.tc-learn-jam-launch:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

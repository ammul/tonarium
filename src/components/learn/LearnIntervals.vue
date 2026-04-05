<script setup>
import { ref, computed } from 'vue'
import { playNote, playChord } from '@/audio/audioEngine.js'
import { NOTE_TO_SEMI } from '@/constants/musicConstants.js'
import NoteStripPicker from '@/components/ui/NoteStripPicker.vue'
import { INTERVALS } from '@/constants/intervals.js'

const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']

const fromIdx         = ref(null)
const toIdx           = ref(null)
const selectedRefSemi = ref(null)

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

function pickRefInterval(semi) {
  if (selectedRefSemi.value === semi) {
    selectedRefSemi.value = null
    fromIdx.value = null
    toIdx.value = null
  } else {
    selectedRefSemi.value = semi
    fromIdx.value = 0
    toIdx.value = semi
    playChord([60, 60 + semi])
  }
}

const intervalInfo = computed(() => {
  if (fromIdx.value !== null && toIdx.value !== null) {
    const semi = ((toIdx.value - fromIdx.value) + 12) % 12
    return INTERVALS.find(iv => iv.semi === semi) ?? null
  }
  if (selectedRefSemi.value !== null) {
    return INTERVALS.find(iv => iv.semi === selectedRefSemi.value) ?? null
  }
  return null
})
</script>

<template>
  <div class="step-content">
    <p class="step-intro">Tap any two notes - hear the sound and see the <strong>interval</strong> between them.</p>

    <NoteStripPicker
      :from-index="fromIdx"
      :to-index="toIdx"
      @note-down="pickNote"
    />

    <div class="interval-result">
      <template v-if="intervalInfo">
        <div class="iv-name">{{ intervalInfo.name }}</div>
        <div class="iv-semi">{{ intervalInfo.semi }} semitone{{ intervalInfo.semi !== 1 ? 's' : '' }}</div>
        <div class="iv-feel">{{ intervalInfo.feel }}</div>
        <div v-if="fromIdx !== null && toIdx !== null" class="iv-path">
          {{ CHROMATIC[fromIdx] }} → {{ CHROMATIC[toIdx] }}
        </div>
      </template>
      <template v-else-if="fromIdx !== null">
        <div class="iv-hint">Now pick a second note</div>
        <div class="iv-hint-sub">{{ CHROMATIC[fromIdx] }} selected</div>
      </template>
      <template v-else>
        <div class="iv-hint">Pick a starting note</div>
      </template>
    </div>

    <div class="iv-reference">
      <div class="ref-label">All intervals from root — tap to hear</div>
      <div class="ref-grid">
        <div v-for="iv in INTERVALS" :key="iv.semi" class="ref-item"
          :class="{ highlight: intervalInfo && intervalInfo.semi === iv.semi }"
          @click="pickRefInterval(iv.semi)">
          <span class="ref-semi">{{ iv.semi }}</span>
          <span class="ref-name">{{ iv.name }}</span>
        </div>
      </div>
    </div>

    <div class="step-bridge">
      Three intervals matter most: <strong>Minor 3rd</strong> (3 semitones), <strong>Major 3rd</strong> (4), and <strong>Perfect 5th</strong> (7). Stack a 3rd and a 5th above any root and you have a <strong>chord</strong>. Stack several chords in a row and you have a <strong>progression</strong>.
    </div>
  </div>
</template>

<style scoped>
.step-content {
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.step-intro {
  font-size: 0.87rem;
  color: var(--text2);
  line-height: 1.6;
  margin: 0;
}

.step-intro strong {
  color: var(--accent);
  font-weight: 600;
}

.interval-result {
  min-height: 7rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.3rem;
  padding: 1rem;
  background: var(--raised);
  border: 1px solid var(--border2);
  border-radius: 10px;
}

.iv-name {
  font-size: clamp(1.5rem, 6vw, 2.2rem);
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
  letter-spacing: 0.02em;
}

.iv-semi {
  font-size: 0.82rem;
  color: var(--accent-mid);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.iv-feel {
  font-size: 0.88rem;
  color: var(--text2);
}

.iv-path {
  font-size: 0.78rem;
  color: var(--text4);
  margin-top: 0.2rem;
  letter-spacing: 0.05em;
}

.iv-hint {
  font-size: 1rem;
  color: var(--text3);
  font-weight: 600;
}

.iv-hint-sub {
  font-size: 0.82rem;
  color: var(--accent-mid);
}

.iv-reference {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ref-label {
  font-size: 0.72rem;
  color: var(--text4);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  font-weight: 600;
}

.ref-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.ref-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--border);
  background: var(--input);
  font-size: 0.75rem;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.ref-item:hover {
  background: var(--raised);
  border-color: var(--border2);
}

.ref-item.highlight {
  border-color: var(--accent);
  background: var(--accent-bg);
}

.ref-semi {
  color: var(--accent-mid);
  font-weight: 700;
  font-size: 0.7rem;
  min-width: 0.8rem;
}

.ref-name { color: var(--text3); }

.ref-item.highlight .ref-semi { color: var(--accent); }
.ref-item.highlight .ref-name { color: var(--text2); }

.step-bridge {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border2);
  background: var(--raised);
  font-size: 0.84rem;
  color: var(--text3);
  line-height: 1.6;
}

.step-bridge strong {
  color: var(--accent);
  font-weight: 600;
}
</style>

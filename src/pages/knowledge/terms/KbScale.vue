<script setup>
import { ref, computed } from 'vue'
import { playNote } from '@/audio/audioEngine.js'
import { NOTES, NOTE_TO_SEMI, JAM_SCALES } from '@tonarium/core'
import { NoteStripPicker } from '@tonarium/vue'
import PianoOctave from '@/components/music/PianoOctave.vue'
import KbText from '../KbText.vue'

defineProps({ goToTerm: { type: Function, required: true } })

const SCALES = JAM_SCALES.slice(0, 6)

const rootIdx   = ref(0)
const scaleIdx  = ref(0)

const selectedScale = computed(() => SCALES[scaleIdx.value])

const activeIndices = computed(() => {
  const result = new Set()
  selectedScale.value.intervals.forEach(i => result.add((rootIdx.value + i) % 12))
  return result
})

function pickRoot(i) {
  rootIdx.value = i
}

function playScale() {
  const itvs = selectedScale.value.intervals
  itvs.forEach((itv, i) => {
    setTimeout(() => {
      playNote(60 + NOTE_TO_SEMI[rootIdx.value] + itv, 0.7)
    }, i * 250)
  })
}

const scaleNoteNames = computed(() =>
  selectedScale.value.intervals.map(i => NOTES[(rootIdx.value + i) % 12])
)
</script>

<template>
  <div class="step-content">
    <p class="step-intro">
      <KbText
        text="A scale is a fixed pattern of intervals repeating from a root note. The same pattern gives the same mood in any key — major scales always sound bright, minor scales always sound dark."
        :go-to-term="goToTerm"
        current-term="scale"
      />
    </p>

    <div class="kb-scale-controls">
      <div>
        <div class="kb-section-label">Root</div>
        <NoteStripPicker small :model-value="rootIdx" @note-down="pickRoot" />
      </div>
      <div class="kb-scale-picker">
        <div class="kb-section-label">Scale</div>
        <div class="kb-scale-tabs">
          <button
            v-for="(sc, i) in SCALES"
            :key="sc.id"
            class="kb-scale-tab"
            :class="{ active: scaleIdx === i }"
            @click="scaleIdx = i"
          >{{ sc.label }}</button>
        </div>
      </div>
    </div>

    <div class="kb-scale-result">
      <div class="kb-scale-header">
        <span class="kb-scale-name">{{ NOTES[rootIdx] }} {{ selectedScale.label }}</span>
        <button class="kb-scale-play-btn" @click="playScale">Play scale</button>
      </div>
      <div class="kb-scale-notes">
        <span
          v-for="n in scaleNoteNames"
          :key="n"
          class="kb-scale-note"
          :class="{ root: n === NOTES[rootIdx] }"
        >{{ n }}</span>
      </div>
    </div>

    <PianoOctave :active-indices="activeIndices" :root-index="rootIdx" :octave="4" :clickable="false" :show-octave-selector="false" />

    <div class="kb-scale-desc">
      <KbText
        v-if="selectedScale.description"
        :text="selectedScale.description"
        :go-to-term="goToTerm"
        current-term="scale"
      />
    </div>

    <div class="kb-related">
      <span class="kb-related-label">Related</span>
      <button class="kb-rel-btn" @click="goToTerm('root')">Root Note</button>
      <button class="kb-rel-btn" @click="goToTerm('interval')">Interval</button>
      <button class="kb-rel-btn" @click="goToTerm('key')">Key</button>
      <button class="kb-rel-btn" @click="goToTerm('chord')">Chord</button>
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
.kb-scale-controls {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}
.kb-scale-picker { display: flex; flex-direction: column; gap: 0.35rem; }
.kb-scale-tabs { display: flex; gap: 0.3rem; flex-wrap: wrap; }
.kb-scale-tab {
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
.kb-scale-tab:hover { border-color: var(--accent); color: var(--text); }
.kb-scale-tab.active { border-color: var(--accent); background: var(--accent-bg); color: var(--accent); }

.kb-scale-result {
  padding: 0.75rem 0.85rem;
  border: 1px solid var(--border2);
  border-radius: 8px;
  background: var(--raised);
}
.kb-scale-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.kb-scale-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text);
}
.kb-scale-play-btn {
  padding: 0.25rem 0.8rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.78rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.12s, color 0.12s;
}
.kb-scale-play-btn:hover { border-color: var(--accent); color: var(--accent); }
.kb-scale-notes {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}
.kb-scale-note {
  padding: 0.25rem 0.6rem;
  border-radius: 5px;
  border: 1px solid var(--border2);
  background: var(--surface);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text2);
}
.kb-scale-note.root {
  border-color: var(--rust);
  background: var(--rust-bg);
  color: var(--rust-hi);
}
.kb-scale-desc {
  font-size: 0.84rem;
  color: var(--text3);
  line-height: 1.5;
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

<script setup>
import { ref, computed } from 'vue'
import { playNote, playChord } from '@/audio/audioEngine.js'
import { NOTE_TO_SEMI } from '@tonarium/core'
import { NoteStripPicker } from '@tonarium/vue'
import { INTERVALS } from '../constants/intervals.js'
import LearnLesson from './lesson/LearnLesson.vue'
import LessonIntro from './lesson/LessonIntro.vue'
import LessonSection from './lesson/LessonSection.vue'
import LessonText from './lesson/LessonText.vue'

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
  <LearnLesson id="intervals">
    <LessonIntro>
      <LessonText text="Pick any two notes to hear the interval between them." />
    </LessonIntro>

    <LessonSection title="Pick two notes">
      <NoteStripPicker
        :from-index="fromIdx"
        :to-index="toIdx"
        @note-down="pickNote"
      />

      <div class="tc-learn-intervals-result">
        <template v-if="intervalInfo">
          <div class="tc-learn-intervals-iv-name">{{ intervalInfo.name }}</div>
          <div class="tc-learn-intervals-iv-semi">{{ intervalInfo.semi }} semitone{{ intervalInfo.semi !== 1 ? 's' : '' }}</div>
          <div class="tc-learn-intervals-iv-feel">{{ intervalInfo.feel }}</div>
          <div v-if="fromIdx !== null && toIdx !== null" class="tc-learn-intervals-iv-path">
            {{ CHROMATIC[fromIdx] }} → {{ CHROMATIC[toIdx] }}
          </div>
        </template>
        <template v-else-if="fromIdx !== null">
          <div class="tc-learn-intervals-iv-hint">Now pick a second note</div>
          <div class="tc-learn-intervals-iv-hint-sub">{{ CHROMATIC[fromIdx] }} selected</div>
        </template>
        <template v-else>
          <div class="tc-learn-intervals-iv-hint">Pick a starting note</div>
        </template>
      </div>
    </LessonSection>

    <LessonSection title="All intervals from root (tap to hear)">
      <div class="tc-learn-intervals-ref-grid">
        <div v-for="iv in INTERVALS" :key="iv.semi" class="tc-learn-intervals-ref-item"
          :class="[iv.category, { highlight: intervalInfo && intervalInfo.semi === iv.semi }]"
          @click="pickRefInterval(iv.semi)">
          <span class="tc-learn-intervals-ref-semi">{{ iv.semi }}</span>
          <span class="tc-learn-intervals-ref-name">{{ iv.name }}</span>
          <span class="tc-learn-intervals-ref-feel">{{ iv.feel.split(',')[0] }}</span>
        </div>
      </div>
    </LessonSection>

    <div class="step-bridge">
      <LessonText text="Find the most tense interval (tritone, 6 semitones) and the most resolved one (perfect fifth, 7 semitones) — those are your two poles. Stack a third and a fifth above any root and you have a chord." />
    </div>
  </LearnLesson>
</template>

<style scoped>
.tc-learn-intervals-result {
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

.tc-learn-intervals-iv-name {
  font-size: clamp(1.5rem, 6vw, 2.2rem);
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
  letter-spacing: 0.02em;
}

.tc-learn-intervals-iv-semi {
  font-size: 0.82rem;
  color: var(--accent-mid);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.tc-learn-intervals-iv-feel {
  font-size: 0.88rem;
  color: var(--text2);
}

.tc-learn-intervals-iv-path {
  font-size: 0.78rem;
  color: var(--text4);
  margin-top: 0.2rem;
  letter-spacing: 0.05em;
}

.tc-learn-intervals-iv-hint {
  font-size: 1rem;
  color: var(--text3);
  font-weight: 600;
}

.tc-learn-intervals-iv-hint-sub {
  font-size: 0.82rem;
  color: var(--accent-mid);
}

.tc-learn-intervals-ref-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.tc-learn-intervals-ref-item {
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

.tc-learn-intervals-ref-item:hover {
  background: var(--raised);
  border-color: var(--border2);
}

.tc-learn-intervals-ref-item.highlight {
  border-color: var(--accent);
  background: var(--accent-bg);
}

.tc-learn-intervals-ref-semi {
  color: var(--accent-mid);
  font-weight: 700;
  font-size: 0.7rem;
  min-width: 0.8rem;
}

.tc-learn-intervals-ref-name { color: var(--text3); }

.tc-learn-intervals-ref-feel {
  font-size: 0.65rem;
  color: var(--text5);
  font-style: italic;
}

.tc-learn-intervals-ref-item.consonant { border-left: 2px solid color-mix(in srgb, var(--good) 50%, transparent); }
.tc-learn-intervals-ref-item.bright    { border-left: 2px solid color-mix(in srgb, var(--accent-hi) 50%, transparent); }
.tc-learn-intervals-ref-item.dark      { border-left: 2px solid color-mix(in srgb, var(--accent-lo) 60%, transparent); }
.tc-learn-intervals-ref-item.tense     { border-left: 2px solid color-mix(in srgb, var(--bad) 50%, transparent); }

.tc-learn-intervals-ref-item.highlight .tc-learn-intervals-ref-semi { color: var(--accent); }
.tc-learn-intervals-ref-item.highlight .tc-learn-intervals-ref-name { color: var(--text2); }
.tc-learn-intervals-ref-item.highlight .tc-learn-intervals-ref-feel { color: var(--accent-mid); }
</style>

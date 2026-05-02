<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { pause as drumPause, isPlaying as drumIsPlaying } from '@/audio/drumEngine.js'
import LearnStepNav from './LearnStepNav.vue'
import LearnRootNotes from './LearnRootNotes.vue'
import LearnIntervals from './LearnIntervals.vue'
import LearnScales from './LearnScales.vue'
import LearnProgressions from './LearnProgressions.vue'
import LearnChords from './LearnChords.vue'
import LearnImprovising from './LearnImprovising.vue'
import LearnBeats from './LearnBeats.vue'
import LearnSongStructure from './LearnSongStructure.vue'
import LearnJamSession from './LearnJamSession.vue'
import LearnStepFooter from './LearnStepFooter.vue'
import { LEARN_LESSON_IDS, completedLessons, learnPercentage } from '../state/learnProgress.js'

const emit = defineEmits(['navigate'])

const STEPS = ['Root Notes', 'Intervals', 'Scales', 'Chords', 'Progressions', 'Improvising', 'Beats', 'Song Structure', 'Jam Session']

function loadVisited() {
  try { return JSON.parse(localStorage.getItem('learnVisited') || '[]') } catch { return [] }
}
function saveVisited(arr) {
  try { localStorage.setItem('learnVisited', JSON.stringify(arr)) } catch {}
}

const step = ref(0)
const visitedSteps = ref(loadVisited())

function handlePopState(e) {
  if (typeof e.state?.learnStep === 'number') {
    step.value = e.state.learnStep
  }
}

onMounted(() => {
  history.replaceState({ ...history.state, learnStep: step.value }, '')
  window.addEventListener('popstate', handlePopState)
})

onUnmounted(() => {
  window.removeEventListener('popstate', handlePopState)
})

watch(step, (newStep, oldStep) => {
  if (oldStep === 6 && drumIsPlaying.value) drumPause()
  if (!visitedSteps.value.includes(newStep)) {
    visitedSteps.value = [...visitedSteps.value, newStep]
    saveVisited(visitedSteps.value)
  }
  // Push browser history for each step so back button / swipe works
  // Skip on initial setup run (oldStep is undefined) — onMounted handles that with replaceState
  if (oldStep !== undefined && history.state?.learnStep !== newStep) {
    history.pushState({ ...history.state, learnStep: newStep }, '')
  }
}, { immediate: true })
</script>

<template>
  <div class="tc-learn">

    <LearnStepNav
      :steps="STEPS"
      :model-value="step"
      :visited-steps="visitedSteps"
      :completed-lesson-ids="[...completedLessons]"
      :lesson-ids="LEARN_LESSON_IDS"
      :percentage="learnPercentage"
      @update:model-value="step = $event"
    />

    <LearnRootNotes     v-if="step === 0" />
    <LearnIntervals     v-else-if="step === 1" />
    <LearnScales        v-else-if="step === 2" />
    <LearnChords        v-else-if="step === 3" />
    <LearnProgressions  v-else-if="step === 4" />
    <LearnImprovising   v-else-if="step === 5" />
    <LearnBeats         v-else-if="step === 6" @navigate="emit('navigate', $event)" />
    <LearnSongStructure v-else-if="step === 7" @navigate="emit('navigate', $event)" />
    <LearnJamSession    v-else-if="step === 8" @navigate="emit('navigate', $event)" />

    <LearnStepFooter
      :step="step"
      :total="STEPS.length"
      @prev="step--"
      @next="step++"
    />

  </div>
</template>

<style scoped>
.tc-learn {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (max-width: 600px) {
  .tc-learn {
    padding: 1rem;
    gap: 1rem;
  }
}
</style>

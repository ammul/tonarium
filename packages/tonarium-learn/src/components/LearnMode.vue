<script setup>
import { ref, watch } from 'vue'
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

const emit = defineEmits(['navigate'])

const STEPS = ['Root Notes', 'Intervals', 'Scales', 'Chords', 'Progressions', 'Improvising', 'Beats', 'Song Structure', 'Jam Session']
const step  = ref(0)

watch(step, (newStep, oldStep) => {
  if (oldStep === 6 && drumIsPlaying.value) drumPause()
})
</script>

<template>
  <div class="tc-learn">

    <LearnStepNav :steps="STEPS" :model-value="step" @update:model-value="step = $event" />

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

<script setup>
import { NOTES } from '@tonarium/core'
import { JAM_SCALES as SCALES } from '@tonarium/core'
import JamSessionBar from '@/components/jam/JamSessionBar.vue'
import JamInstrument from '@/components/jam/JamInstrument.vue'
import ScaleSelector from '@/components/jam/ScaleSelector.vue'
import { selectedRoot, selectedScaleId } from '@/state/jamSettings.js'
import { sessionPlaying } from '@/state/sessionState.js'
import { stopTransport } from '@/audio/transportClock.js'

const emit = defineEmits(['navigate'])

function onKeyChange() {
  if (sessionPlaying.value) stopTransport()
}

function onScaleChange() {
  if (sessionPlaying.value) stopTransport()
}
</script>

<template>
  <div class="tc-home">
    <div class="tc-home-key-row">
      <select v-model="selectedRoot" class="form-select tc-home-key-select" @change="onKeyChange">
        <option v-for="note in NOTES" :key="note" :value="note">{{ note }}</option>
      </select>
      <ScaleSelector
        v-model="selectedScaleId"
        :scales="SCALES"
        @update:modelValue="onScaleChange"
      />
    </div>

    <JamSessionBar @navigate="emit('navigate', $event)" />

    <JamInstrument />
  </div>
</template>

<style scoped>
.tc-home {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 0.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tc-home-key-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tc-home-key-select {
  width: auto;
  min-width: 5rem;
}
</style>

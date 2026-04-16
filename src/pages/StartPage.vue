<script setup>
import JamSessionBar from '@/components/jam/JamSessionBar.vue'
import JamInstrument from '@/components/jam/JamInstrument.vue'

const emit = defineEmits(['navigate'])
</script>

<template>
  <div class="tc-home">
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
</style>

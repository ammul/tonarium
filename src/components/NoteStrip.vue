<script setup>
const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const IS_SHARP  = new Set([1,3,6,8,10])

defineProps({
  small: { type: Boolean, default: false },
  from:  { type: Number,  default: null  },
  to:    { type: Number,  default: null  },
})
const emit = defineEmits(['pick'])
</script>

<template>
  <div class="flex-wrap gap-2" :class="{ small }">
    <button
      v-for="(note, i) in CHROMATIC"
      :key="i"
      class="pill"
      :class="{ sharp: IS_SHARP.has(i), active: from === i, selected: to === i }"
      @pointerdown.prevent="emit('pick', i)"
    >{{ note }}</button>
  </div>
</template>

<style scoped>
.small .pill { padding: 0.35rem 0.45rem; min-width: 2.1rem; font-size: 0.8rem; }
.pill.selected { box-shadow: 0 0 6px var(--accent-glow); }
</style>

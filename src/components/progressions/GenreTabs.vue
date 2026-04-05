<script setup>
defineProps({
  genres: { type: Array, required: true },
  modelValue: { type: String, required: true },
})

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="tab-group genre-filter">
    <button
      v-for="g in genres"
      :key="g.id"
      class="tab-btn genre-btn"
      :class="{ active: modelValue === g.id }"
      @click="$emit('update:modelValue', g.id)"
    >{{ g.label }}</button>
  </div>
</template>

<style scoped>
/* unique properties not covered by .tab-group */
.genre-filter { margin-bottom: 0.75rem; }
</style>

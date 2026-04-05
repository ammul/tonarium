<script setup>
const props = defineProps({
  step:  { type: Number, required: true },
  total: { type: Number, required: true },
})

const emit = defineEmits(['prev', 'next'])
</script>

<template>
  <div class="step-footer">
    <button class="btn nav-btn" @click="emit('prev')" :disabled="step === 0">← Back</button>
    <span class="step-counter">{{ step + 1 }} / {{ total }}</span>
    <button class="btn nav-btn" @click="emit('next')" :disabled="step === total - 1">Next →</button>
  </div>
</template>

<style scoped>
.step-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.25rem;
  border-top: 1px solid var(--border);
}

.step-counter {
  font-size: 0.78rem;
  color: var(--text4);
  letter-spacing: 0.05em;
}
</style>

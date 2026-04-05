<script setup>
defineProps({
  steps:       { type: Array,  required: true },
  modelValue:  { type: Number, required: true },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="step-nav">
    <button
      v-for="(s, i) in steps"
      :key="i"
      class="step-btn"
      :class="{ active: modelValue === i, done: modelValue > i }"
      @click="emit('update:modelValue', i)"
    >
      <span class="step-num">{{ i + 1 }}</span>
      <span class="step-label">{{ s }}</span>
    </button>
  </div>
</template>

<style scoped>
.step-nav {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.step-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.75rem;
  border-radius: 20px;
  border: 1px solid var(--border2);
  background: transparent;
  color: var(--text3);
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
  letter-spacing: 0.03em;
}

.step-btn:hover {
  border-color: var(--accent-mid);
  color: var(--text2);
}

.step-btn.active {
  background: var(--accent-bg);
  border-color: var(--accent);
  color: var(--accent);
}

.step-btn.done {
  color: var(--accent-mid);
  border-color: var(--border2);
}

.step-num {
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  background: var(--border2);
  color: var(--text3);
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-btn.active .step-num {
  background: var(--accent);
  color: var(--bg);
}

.step-btn.done .step-num {
  background: var(--accent-mid);
  color: var(--bg);
}

@media (orientation: landscape) and (max-height: 500px) {
  .step-label { display: none; }
}
</style>

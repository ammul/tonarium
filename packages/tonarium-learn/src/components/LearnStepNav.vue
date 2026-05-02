<script setup>
import { Check } from 'lucide-vue-next'

defineProps({
  steps:             { type: Array,  required: true },
  modelValue:        { type: Number, required: true },
  visitedSteps:      { type: Array,  default: () => [] },
  completedLessonIds: { type: Array, default: () => [] },
  lessonIds:         { type: Array,  default: () => [] },
  percentage:        { type: Number, default: 0 },
})
const emit = defineEmits(['update:modelValue'])

function isCompleted(i, completedLessonIds, lessonIds) {
  const id = lessonIds[i]
  return id ? completedLessonIds.includes(id) : false
}
</script>

<template>
  <div class="tc-step-nav-wrap">
    <div class="tc-step-nav-progress">
      <span class="tc-step-nav-pct">{{ percentage }}% complete</span>
      <div class="tc-step-nav-bar">
        <div class="tc-step-nav-bar-fill" :style="{ width: `${percentage}%` }"></div>
      </div>
    </div>

    <div class="tc-step-nav">
      <button
        v-for="(s, i) in steps"
        :key="i"
        class="tc-step-nav-btn"
        :class="{
          active: modelValue === i,
          done: isCompleted(i, completedLessonIds, lessonIds) && modelValue !== i,
          visited: !isCompleted(i, completedLessonIds, lessonIds) && visitedSteps.includes(i) && modelValue !== i,
        }"
        @click="emit('update:modelValue', i)"
      >
        <span class="tc-step-nav-num">
          <Check v-if="isCompleted(i, completedLessonIds, lessonIds) && modelValue !== i" :size="9" />
          <template v-else>{{ i + 1 }}</template>
        </span>
        <span class="tc-step-nav-label">{{ s }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.tc-step-nav-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.tc-step-nav-progress {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.tc-step-nav-pct {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.tc-step-nav-bar {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--border);
  overflow: hidden;
}

.tc-step-nav-bar-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.3s ease;
}

.tc-step-nav {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.tc-step-nav-btn {
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

.tc-step-nav-btn:hover {
  border-color: var(--accent-mid);
  color: var(--text2);
}

.tc-step-nav-btn.active {
  background: var(--accent-bg);
  border-color: var(--accent);
  color: var(--accent);
}

.tc-step-nav-btn.done {
  color: var(--accent-mid);
  border-color: var(--border2);
}

.tc-step-nav-btn.visited {
  color: var(--text3);
  border-color: var(--border2);
  border-style: dashed;
}

.tc-step-nav-num {
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

.tc-step-nav-btn.active .tc-step-nav-num {
  background: var(--accent);
  color: var(--bg);
}

.tc-step-nav-btn.done .tc-step-nav-num {
  background: var(--accent-mid);
  color: var(--bg);
}

@media (orientation: landscape) and (max-height: 500px) {
  .tc-step-nav-label { display: none; }
}
</style>

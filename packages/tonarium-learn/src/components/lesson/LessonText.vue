<script setup>
import { computed } from 'vue'
import { findTerm, getTermRegex } from '@/pages/knowledge/termMap.js'
import { openPopover } from '@/pages/knowledge/popoverState.js'

const props = defineProps({
  text: { type: String, required: true },
})

const segments = computed(() => {
  const regex = getTermRegex()
  const parts = props.text.split(regex)
  const result = []
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (!part) continue
    if (i % 2 === 1) {
      const termId = findTerm(part)
      result.push({ text: part, termId })
    } else {
      result.push({ text: part, termId: null })
    }
  }
  return result
})

function onTermClick(event, termId) {
  openPopover(termId, event.currentTarget)
}
</script>

<template>
  <span class="lesson-text">
    <template v-for="(seg, i) in segments" :key="i">
      <button
        v-if="seg.termId"
        type="button"
        class="lesson-term-link"
        @click="(e) => onTermClick(e, seg.termId)"
      >{{ seg.text }}</button>
      <span v-else>{{ seg.text }}</span>
    </template>
  </span>
</template>

<style scoped>
.lesson-text { display: inline; }

.lesson-term-link {
  color: var(--accent);
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 0.15em;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  transition: text-decoration-style 0.1s, color 0.1s;
}

.lesson-term-link:hover {
  text-decoration-style: solid;
  color: var(--accent-hi, var(--accent));
}
</style>

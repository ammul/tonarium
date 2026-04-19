<script setup>
import { computed } from 'vue'
import { findTerm, getTermRegex } from './termMap.js'

const props = defineProps({
  text:        { type: String,   required: true },
  goToTerm:    { type: Function, required: true },
  currentTerm: { type: String,   default: null },
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
</script>

<template>
  <span class="kb-text">
    <template v-for="(seg, i) in segments" :key="i">
      <button
        v-if="seg.termId && seg.termId !== currentTerm"
        class="kb-term-link"
        @click="goToTerm(seg.termId)"
      >{{ seg.text }}</button>
      <strong
        v-else-if="seg.termId && seg.termId === currentTerm"
        class="kb-term-self"
      >{{ seg.text }}</strong>
      <span v-else>{{ seg.text }}</span>
    </template>
  </span>
</template>

<style scoped>
.kb-text { display: inline; }

.kb-term-link {
  color: var(--accent);
  text-decoration: underline;
  text-decoration-style: dotted;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  transition: text-decoration-style 0.1s;
}

.kb-term-link:hover {
  text-decoration-style: solid;
}

.kb-term-self {
  font-weight: 700;
  color: var(--text);
}
</style>

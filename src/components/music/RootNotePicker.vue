<script setup>
import { NOTES, SHARPS } from '@tonarium/core'

defineProps({ modelValue: String })
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="tc-root-picker">
    <button
      v-for="note in NOTES"
      :key="note"
      class="tc-root-picker-btn"
      :class="{ active: modelValue === note, sharp: SHARPS.has(note) }"
      @click="$emit('update:modelValue', note)"
    >{{ note }}</button>
  </div>
</template>

<style scoped>
.tc-root-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.tc-root-picker-btn {
  padding: 0.3rem 0.6rem;
  border-radius: 5px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text2);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
  min-width: 2.4rem;
  text-align: center;
}

.tc-root-picker-btn.sharp { background: var(--sharp); color: var(--text3); }
.tc-root-picker-btn:hover  { border-color: var(--accent); color: var(--text); }
.tc-root-picker-btn.active { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }

@media (orientation: landscape) and (max-height: 500px) {
  .tc-root-picker-btn {
    padding: 0.2rem 0.4rem;
    font-size: 0.75rem;
    min-width: 2rem;
  }
}
</style>

<script setup lang="ts">
import { NOTES, SHARPS } from '@tonarium/core'
import type { NoteIndex } from '@tonarium/core'

interface Props {
  modelValue?: NoteIndex | null
  highlightSet?: Set<NoteIndex>
  fromIndex?: NoteIndex | null
  toIndex?: NoteIndex | null
  small?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  highlightSet: () => new Set(),
  fromIndex: null,
  toIndex: null,
  small: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: NoteIndex]
  'note-down': [index: NoteIndex]
}>()

function onNoteDown(index: NoteIndex): void {
  if (props.disabled) return
  emit('note-down', index)
  emit('update:modelValue', index)
}
</script>

<template>
  <div class="tc-note-strip" :class="{ small, disabled }">
    <button
      v-for="(note, i) in NOTES"
      :key="i"
      type="button"
      class="tc-note-strip-pill"
      :class="{
        sharp: SHARPS.has(note),
        selected: modelValue === i,
        highlight: highlightSet.has(i),
        from: fromIndex === i,
        to: toIndex === i,
      }"
      :disabled="disabled"
      @pointerdown.prevent="onNoteDown(i)"
    >
      {{ note }}
    </button>
  </div>
</template>

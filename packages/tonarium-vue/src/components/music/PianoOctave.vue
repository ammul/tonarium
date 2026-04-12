<script setup lang="ts">
import { computed } from 'vue'
import { PIANO_WHITE, PIANO_BLACK, NOTES } from '@tonarium/core'
import type { NoteIndex } from '@tonarium/core'

interface Props {
  activeIndices?: Set<NoteIndex>
  rootIndex?: NoteIndex
  octave?: number
  showOctaveSelector?: boolean
  clickable?: boolean
  dimInactive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  activeIndices: () => new Set(),
  rootIndex: -1,
  octave: 4,
  showOctaveSelector: true,
  clickable: false,
  dimInactive: false,
})

const emit = defineEmits<{
  notedown: [noteIdx: NoteIndex]
  noteup: [noteIdx: NoteIndex]
  'update:octave': [value: number]
}>()

const whiteKeys = computed(() =>
  PIANO_WHITE.map(noteIdx => ({
    noteIdx,
    note: NOTES[noteIdx],
    isActive: props.activeIndices.has(noteIdx),
    isRoot: noteIdx === props.rootIndex,
  }))
)

const blackKeys = computed(() =>
  PIANO_BLACK.map(({ noteIdx, after }) => ({
    noteIdx,
    note: NOTES[noteIdx],
    isActive: props.activeIndices.has(noteIdx),
    isRoot: noteIdx === props.rootIndex,
    style: { left: `${((after * 100 - 30) / 7).toFixed(3)}%` },
  }))
)

function onNoteDown(noteIdx: NoteIndex): void {
  if (props.clickable) emit('notedown', noteIdx)
}
function onNoteUp(noteIdx: NoteIndex): void {
  if (props.clickable) emit('noteup', noteIdx)
}
</script>

<template>
  <div class="tc-piano">
    <div v-if="showOctaveSelector" class="tc-piano-octave-ctl">
      <label>Octave</label>
      <button @click="emit('update:octave', Math.max(0, octave - 1))">−</button>
      <span class="tc-piano-octave-val">{{ octave }}</span>
      <button @click="emit('update:octave', Math.min(9, octave + 1))">+</button>
    </div>

    <div class="tc-piano-keyboard" :class="{ clickable, 'dim-inactive': dimInactive }">
      <button
        v-for="key in whiteKeys"
        :key="key.noteIdx"
        class="tc-piano-white-key"
        :class="{ active: key.isActive, root: key.isRoot }"
        @pointerdown.prevent="onNoteDown(key.noteIdx)"
        @pointerup="onNoteUp(key.noteIdx)"
        @pointerleave="onNoteUp(key.noteIdx)"
        @pointercancel="onNoteUp(key.noteIdx)"
      >
        <span class="tc-piano-key-label">{{ key.note }}</span>
      </button>

      <button
        v-for="key in blackKeys"
        :key="key.noteIdx"
        class="tc-piano-black-key"
        :class="{ active: key.isActive, root: key.isRoot }"
        :style="key.style"
        @pointerdown.stop.prevent="onNoteDown(key.noteIdx)"
        @pointerup="onNoteUp(key.noteIdx)"
        @pointerleave="onNoteUp(key.noteIdx)"
        @pointercancel="onNoteUp(key.noteIdx)"
      >
        <span class="tc-piano-key-label">{{ key.note }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.tc-piano {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tc-piano-octave-ctl {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--text2);
}

.tc-piano-octave-ctl label {
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
}

.tc-piano-octave-ctl button {
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--border2);
  border-radius: 6px;
  background: var(--bg);
  color: var(--accent);
  font-size: 1.1rem;
  cursor: pointer;
  line-height: 1;
  transition: background 0.15s, border-color 0.15s;
}

.tc-piano-octave-ctl button:hover {
  background: var(--accent-bg);
  border-color: var(--accent);
}

.tc-piano-octave-val {
  min-width: 1.5rem;
  text-align: center;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
}

.tc-piano-keyboard {
  position: relative;
  display: flex;
  height: 120px;
  max-width: 420px;
  user-select: none;
  touch-action: none;
}

.tc-piano-white-key {
  flex: 1;
  height: 100%;
  background: var(--pk-white);
  border: 1px solid var(--pk-white-bd);
  border-top: none;
  border-radius: 0 0 5px 5px;
  cursor: default;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 0.4rem;
  position: relative;
  z-index: 1;
  transition: background 0.1s;
  -webkit-tap-highlight-color: transparent;
}

.tc-piano-keyboard.clickable .tc-piano-white-key { cursor: pointer; }

.tc-piano-keyboard.clickable .tc-piano-white-key:hover:not(.active):not(.root) {
  background: var(--pk-white-h);
}

.tc-piano-keyboard.clickable .tc-piano-white-key:active {
  transform: scaleY(0.98);
  transform-origin: top center;
}

.tc-piano-white-key.active { background: var(--pk-white-active); }
.tc-piano-white-key.root   { background: var(--pk-white-root); }

.dim-inactive .tc-piano-white-key:not(.active):not(.root) { background: var(--pk-dim-w); }
.dim-inactive .tc-piano-white-key:not(.active):not(.root) .tc-piano-key-label { color: var(--pk-dim-w-lbl); }

.tc-piano-black-key {
  position: absolute;
  width: calc(60% / 7);
  height: 65%;
  top: 0;
  background: var(--pk-black);
  border: 1px solid var(--pk-black-bd);
  border-top: none;
  border-radius: 0 0 4px 4px;
  z-index: 2;
  cursor: default;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  padding-bottom: 0.25rem;
  transition: background 0.1s;
  -webkit-tap-highlight-color: transparent;
}

.tc-piano-keyboard.clickable .tc-piano-black-key { cursor: pointer; }

.tc-piano-keyboard.clickable .tc-piano-black-key:hover:not(.active):not(.root) {
  background: var(--pk-black-h);
}

.tc-piano-keyboard.clickable .tc-piano-black-key:active {
  transform: scaleY(0.97);
  transform-origin: top center;
}

.tc-piano-black-key.active { background: var(--pk-black-active); }
.tc-piano-black-key.root   { background: var(--pk-black-root); }

.dim-inactive .tc-piano-black-key:not(.active):not(.root) { background: var(--pk-dim-b); }
.dim-inactive .tc-piano-black-key:not(.active):not(.root) .tc-piano-key-label { color: var(--pk-dim-b-lbl); }

.tc-piano-key-label {
  font-size: 0.55rem;
  font-weight: 700;
  pointer-events: none;
  line-height: 1;
}

.tc-piano-white-key .tc-piano-key-label        { color: var(--pk-white-lbl); }
.tc-piano-white-key.active .tc-piano-key-label { color: var(--pk-white-lbl-a); }
.tc-piano-white-key.root .tc-piano-key-label   { color: var(--pk-white-lbl-r); }

.tc-piano-black-key .tc-piano-key-label        { color: var(--pk-black-lbl); }
.tc-piano-black-key.active .tc-piano-key-label { color: var(--pk-black-lbl-a); }
.tc-piano-black-key.root .tc-piano-key-label   { color: var(--pk-black-lbl-r); }
</style>

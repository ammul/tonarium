<script setup>
// SVG treble clef staff showing 12 chromatic notes starting from the root note.
// Staff lines (E4, G4, B4, D5, F5) at y = 60, 50, 40, 30, 20.
// Base formula: stepToY(step) = 70 - step * 5  (step 0 = C4 at y=70)
// Ledger line below staff for C4 (y=70), ledger above for A5 (y=10).

import { computed } from 'vue'
import { NOTES } from '@/constants/musicConstants.js'

const props = defineProps({
  activeIndices:  { type: Object,  default: () => new Set() }, // Set of A-based indices
  rootIndex:      { type: Number,  default: -1 },               // A-based, -1 = default to C
  pressedIndices: { type: Object,  default: () => new Set() }, // Set of A-based indices
  dimInactive:    { type: Boolean, default: false },
  onlyActive:     { type: Boolean, default: false },            // show only active+root notes
})

const emit = defineEmits(['note-down', 'note-up'])

// C-based semitone (0=C) → diatonic staff step counting from C4
// C=0, D=1, E=2, F=3, G=4, A=5, B=6, C5=7, D5=8, E5=9, F5=10, G5=11, A5=12
const SEMI_TO_STEP = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6]
// Whether each C-based semitone is an accidental (sharp)
const SEMI_IS_SHARP = [false, true, false, true, false, false, true, false, true, false, true, false]

// A-based note index (NOTES array: A=0) → C-based semitone (C=0)
function aToCsemi(aIdx) { return (aIdx + 9) % 12 }

// Diatonic staff step → SVG y-coordinate
// Step 0 (C4) = y 70. Each step up = -5 px.
// Staff lines: E4 (step 2)=60, G4 (step 4)=50, B4 (step 6)=40, D5 (step 8)=30, F5 (step 10)=20
function stepToY(step) { return 70 - step * 5 }

// When rootIndex is -1 (unset), default to C (A-based 3)
const effectiveRoot = computed(() => props.rootIndex >= 0 ? props.rootIndex : 3)

// Generate 12 chromatic notes starting from effectiveRoot, one octave up
const notes = computed(() => {
  const rootA = effectiveRoot.value
  const rootC = aToCsemi(rootA)

  return Array.from({ length: 12 }, (_, i) => {
    const noteIdx     = (rootA + i) % 12
    const cSemi       = (rootC + i) % 12
    const octaveBonus = Math.floor((rootC + i) / 12)
    const step        = SEMI_TO_STEP[cSemi] + octaveBonus * 7
    return {
      noteIdx,
      name:      NOTES[noteIdx],
      staffY:    stepToY(step),
      step,
      isSharp:   SEMI_IS_SHARP[cSemi],
      isActive:  props.activeIndices.has(noteIdx),
      isRoot:    noteIdx === props.rootIndex,
      isPressed: props.pressedIndices.has(noteIdx),
    }
  })
})

// When onlyActive, filter to notes that are active or the root; fall back to all if nothing qualifies
const visibleNotes = computed(() => {
  if (!props.onlyActive) return notes.value
  const filtered = notes.value.filter(n => n.isActive || n.isRoot)
  return filtered.length > 0 ? filtered : notes.value
})

// Distribute visible notes evenly across the staff area
function noteX(i) {
  const total = visibleNotes.value.length
  return total <= 1 ? 135 : 13 + i * (255 / (total - 1))
}
</script>

<template>
  <div class="staff-wrapper">
    <!-- viewBox extends to y=-2 so note heads at y=10 (A5) don't clip at top -->
    <svg class="staff-svg" viewBox="0 -2 270 90" xmlns="http://www.w3.org/2000/svg">

      <!-- Staff lines: E4=60, G4=50, B4=40, D5=30, F5=20 -->
      <line v-for="y in [20, 30, 40, 50, 60]" :key="y" :x1="8" :y1="y" x2="262" :y2="y" class="staff-line" />

      <!-- Ledger lines drawn beneath individual notes -->
      <template v-for="(n, i) in visibleNotes" :key="`led-${n.noteIdx}-${i}`">
        <!-- Below staff: C4, step 0 → y=70 -->
        <line v-if="n.step === 0"  :x1="noteX(i) - 9" y1="70" :x2="noteX(i) + 9" y2="70" class="staff-line" />
        <!-- Above staff: A5, step 12 → y=10 -->
        <line v-if="n.step === 12" :x1="noteX(i) - 9" y1="10" :x2="noteX(i) + 9" y2="10" class="staff-line" />
      </template>

      <!-- Note groups -->
      <g
        v-for="(n, i) in visibleNotes"
        :key="`note-${n.noteIdx}-${i}`"
        class="note-group"
        :class="{
          active:   n.isActive,
          root:     n.isRoot,
          pressed:  n.isPressed,
          inactive: dimInactive && !n.isActive && !n.isRoot,
        }"
        @pointerdown.prevent="emit('note-down', n.noteIdx)"
        @pointerup="emit('note-up', n.noteIdx)"
        @pointerleave="emit('note-up', n.noteIdx)"
        @pointercancel="emit('note-up', n.noteIdx)"
      >
        <!-- Sharp symbol to the left of note head -->
        <text v-if="n.isSharp" :x="noteX(i) - 9" :y="n.staffY + 4" class="sharp-text">♯</text>
        <!-- Note head -->
        <ellipse :cx="noteX(i)" :cy="n.staffY" rx="6.5" ry="5" class="note-head" />
        <!-- Note name label below all staff content -->
        <text :x="noteX(i)" y="82" class="note-label" text-anchor="middle">{{ n.name }}</text>
      </g>

    </svg>
  </div>
</template>

<style scoped>
.staff-wrapper {
  width: 100%;
  overflow-x: auto;
}

.staff-svg {
  width: 100%;
  min-width: 100px;
  display: block;
}

.staff-line {
  stroke: var(--border2);
  stroke-width: 1;
}

.note-group {
  cursor: pointer;
  touch-action: none;
  user-select: none;
}

.note-head {
  fill: var(--input);
  stroke: var(--text4);
  stroke-width: 1;
  transition: fill 0.1s, stroke 0.1s;
}

.sharp-text {
  fill: var(--text4);
  font-size: 9px;
  dominant-baseline: middle;
  user-select: none;
}

.note-label {
  fill: var(--text4);
  font-size: 7px;
  user-select: none;
  dominant-baseline: auto;
}

/* Active — note is in the current scale / chord */
.note-group.active .note-head  { fill: color-mix(in srgb, var(--accent) 20%, transparent); stroke: var(--accent-mid); }
.note-group.active .sharp-text { fill: var(--accent-mid); }
.note-group.active .note-label { fill: var(--accent); }

/* Root note */
.note-group.root .note-head  { fill: var(--rust-bg); stroke: var(--rust); }
.note-group.root .sharp-text { fill: var(--rust-hi); }
.note-group.root .note-label { fill: var(--rust-hi); }

/* Pressed (held down while playing) */
.note-group.pressed .note-head { fill: var(--accent); stroke: var(--accent); }

/* Inactive / dimmed */
.note-group.inactive .note-head  { opacity: 0.2; }
.note-group.inactive .sharp-text { opacity: 0.2; }
.note-group.inactive .note-label { opacity: 0.2; }

/* Hover */
.note-group:not(.inactive):hover .note-head { stroke: var(--accent); }
</style>

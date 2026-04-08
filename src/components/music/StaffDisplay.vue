<script setup>
// SVG treble clef staff showing all 12 chromatic notes (C4–B4) as clickable note heads.
// Staff lines at y = 15, 25, 35, 45, 55 (spacing = 10px, step = 5px).
// Ledger line drawn for C4 and C#4 at y = 65.

const props = defineProps({
  activeIndices:  { type: Object,  default: () => new Set() }, // Set of A-based indices
  rootIndex:      { type: Number,  default: -1 },               // A-based, -1 = none
  pressedIndices: { type: Object,  default: () => new Set() }, // Set of A-based indices
  dimInactive:    { type: Boolean, default: false },
})

const emit = defineEmits(['note-down', 'note-up'])

// Chromatic order C4→B4, with A-based noteIdx and treble clef y-position.
// Lines: E4=55, G4=45, B4=35. Spaces between. Ledger: C4=65.
const STAFF_NOTES = [
  { noteIdx: 3,  name: 'C',  staffY: 65, isSharp: false }, // C4 — ledger line below
  { noteIdx: 4,  name: 'C♯', staffY: 65, isSharp: true  }, // C#4
  { noteIdx: 5,  name: 'D',  staffY: 60, isSharp: false }, // D4
  { noteIdx: 6,  name: 'D♯', staffY: 60, isSharp: true  }, // D#4
  { noteIdx: 7,  name: 'E',  staffY: 55, isSharp: false }, // E4 — first line
  { noteIdx: 8,  name: 'F',  staffY: 50, isSharp: false }, // F4
  { noteIdx: 9,  name: 'F♯', staffY: 50, isSharp: true  }, // F#4
  { noteIdx: 10, name: 'G',  staffY: 45, isSharp: false }, // G4 — second line
  { noteIdx: 11, name: 'G♯', staffY: 45, isSharp: true  }, // G#4
  { noteIdx: 0,  name: 'A',  staffY: 40, isSharp: false }, // A4
  { noteIdx: 1,  name: 'A♯', staffY: 40, isSharp: true  }, // A#4
  { noteIdx: 2,  name: 'B',  staffY: 35, isSharp: false }, // B4 — third line
]

// x positions distributed evenly across the staff (left-to-right = C→B).
// viewBox width = 270, staff x = 10..265, 12 notes spaced at 255/11 ≈ 23px apart.
const NOTE_X_START = 13
const NOTE_X_STEP  = 255 / 11

function noteX(i) { return NOTE_X_START + i * NOTE_X_STEP }

function noteClass(noteIdx) {
  return {
    active:   props.activeIndices.has(noteIdx),
    root:     noteIdx === props.rootIndex,
    pressed:  props.pressedIndices.has(noteIdx),
    inactive: props.dimInactive && !props.activeIndices.has(noteIdx) && noteIdx !== props.rootIndex,
  }
}
</script>

<template>
  <div class="staff-wrapper">
    <svg class="staff-svg" viewBox="0 0 270 82" xmlns="http://www.w3.org/2000/svg">

      <!-- Staff lines -->
      <line v-for="y in [15, 25, 35, 45, 55]" :key="y" :x1="8" :y1="y" x2="262" :y2="y" class="staff-line" />

      <!-- Ledger lines for C4 (i=0) and C#4 (i=1) -->
      <line :x1="noteX(0) - 9" y1="65" :x2="noteX(0) + 9" y2="65" class="staff-line" />
      <line :x1="noteX(1) - 9" y1="65" :x2="noteX(1) + 9" y2="65" class="staff-line" />

      <!-- Note groups -->
      <g
        v-for="(n, i) in STAFF_NOTES"
        :key="n.noteIdx"
        class="note-group"
        :class="noteClass(n.noteIdx)"
        @pointerdown.prevent="emit('note-down', n.noteIdx)"
        @pointerup="emit('note-up', n.noteIdx)"
        @pointerleave="emit('note-up', n.noteIdx)"
        @pointercancel="emit('note-up', n.noteIdx)"
      >
        <!-- Sharp symbol to the left of note head -->
        <text v-if="n.isSharp" :x="noteX(i) - 9" :y="n.staffY + 4" class="sharp-text">♯</text>
        <!-- Note head -->
        <ellipse :cx="noteX(i)" :cy="n.staffY" rx="6.5" ry="5" class="note-head" />
        <!-- Note name below staff -->
        <text :x="noteX(i)" y="78" class="note-label" text-anchor="middle">{{ n.name }}</text>
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
  min-width: 220px;
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

/* Active — note is in the current scale */
.note-group.active .note-head  { fill: color-mix(in srgb, var(--accent) 20%, transparent); stroke: var(--accent-mid); }
.note-group.active .sharp-text { fill: var(--accent-mid); }
.note-group.active .note-label { fill: var(--accent); }

/* Root */
.note-group.root .note-head  { fill: var(--rust-bg); stroke: var(--rust); }
.note-group.root .sharp-text { fill: var(--rust-hi); }
.note-group.root .note-label { fill: var(--rust-hi); }

/* Pressed (held down) */
.note-group.pressed .note-head { fill: var(--accent); stroke: var(--accent); }

/* Inactive (dimmed when dimInactive=true) */
.note-group.inactive .note-head  { opacity: 0.25; }
.note-group.inactive .sharp-text { opacity: 0.25; }
.note-group.inactive .note-label { opacity: 0.25; }

/* Hover */
.note-group:not(.inactive):hover .note-head { stroke: var(--accent); }
</style>

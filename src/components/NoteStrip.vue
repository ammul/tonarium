<script setup>
const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const IS_SHARP  = new Set([1,3,6,8,10])

defineProps({
  small: { type: Boolean, default: false },
  from:  { type: Number,  default: null  },
  to:    { type: Number,  default: null  },
})
const emit = defineEmits(['pick'])
</script>

<template>
  <div class="note-strip" :class="{ small }">
    <button
      v-for="(note, i) in CHROMATIC"
      :key="i"
      class="note-pill"
      :class="{ sharp: IS_SHARP.has(i), from: from === i, to: to === i }"
      @pointerdown.prevent="emit('pick', i)"
    >{{ note }}</button>
  </div>
</template>

<style scoped>
.note-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.note-pill {
  padding: 0.45rem 0.55rem;
  min-width: 2.4rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--raised);
  color: var(--accent);
  font-size: 0.88rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  text-align: center;
  user-select: none;
  touch-action: none;
  transition: background 0.1s, border-color 0.1s, transform 0.07s;
  -webkit-tap-highlight-color: transparent;
}

.note-pill:hover { background: var(--border); }
.note-pill:active { transform: scale(0.93); }
.note-pill.sharp { background: var(--input); color: var(--accent-lo); font-size: 0.8rem; }
.note-pill.sharp:hover { background: var(--border3); }

.note-pill.from {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--bg);
}

.note-pill.to {
  background: var(--selected);
  border-color: var(--accent);
  color: var(--accent-hi);
  box-shadow: 0 0 6px var(--accent-glow);
}
</style>

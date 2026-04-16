<script setup>
import { Play, Square, Zap } from 'lucide-vue-next'

defineProps({
  progression: {
    type: Object,
    required: true,
    // { id, label, numeral, examples, chords: [{ degree, type, numeral }] }
  },
  rootNote: { type: String, required: true },
  isExpanded: { type: Boolean, default: false },
  isPlaying: { type: Boolean, default: false },
})

defineEmits(['toggle-expand', 'play', 'stop', 'jam'])
</script>

<template>
  <div class="tc-prog-card" :class="{ expanded: isExpanded, playing: isPlaying }">
    <div class="tc-prog-card-header" @click="$emit('toggle-expand')">
      <div class="tc-prog-card-meta">
        <span class="tc-prog-card-label">{{ progression.label }}</span>
        <span class="tc-prog-card-numeral">{{ progression.numeral }}</span>
      </div>
      <div class="tc-prog-card-controls" @click.stop>
        <button
          class="btn btn-xs btn-subtle btn-icon btn-toggle tc-prog-card-ctrl-btn"
          :class="{ active: isPlaying }"
          :aria-label="isPlaying ? 'Stop' : 'Play'"
          @click="isPlaying ? $emit('stop') : $emit('play')"
        ><Square v-if="isPlaying" :size="11" /><Play v-else :size="11" /></button>
        <button
          class="btn btn-xs btn-subtle tc-prog-card-ctrl-btn tc-prog-card-jam-btn"
          aria-label="Jam with this"
          @click="$emit('jam')"
        ><Zap :size="11" />Jam</button>
      </div>
    </div>

    <div v-if="isExpanded" class="tc-prog-card-body">
      <p class="tc-prog-card-examples">{{ progression.examples }}</p>
      <div class="tc-prog-card-chords">
        <span
          v-for="chord in progression.chords"
          :key="chord.numeral"
          class="tc-prog-card-chord-pill"
        >{{ chord.numeral }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tc-prog-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--input);
  overflow: hidden;
  transition: border-color 0.15s;
}

.tc-prog-card:hover     { border-color: var(--accent-mid); }
.tc-prog-card.playing   { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-bg); }

.tc-prog-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0.75rem;
  cursor: pointer;
  user-select: none;
}

.tc-prog-card-meta {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.tc-prog-card-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tc-prog-card.playing .tc-prog-card-label { color: var(--accent); }

.tc-prog-card-numeral {
  font-size: 0.78rem;
  color: var(--text3);
  font-variant-numeric: tabular-nums;
}

.tc-prog-card-controls {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-shrink: 0;
}

.tc-prog-card-body {
  padding: 0.5rem 0.75rem 0.65rem;
  border-top: 1px solid var(--border3);
}

.tc-prog-card-examples {
  font-size: 0.78rem;
  color: var(--text3);
  font-style: italic;
  margin-bottom: 0.5rem;
}

.tc-prog-card-chords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.tc-prog-card-jam-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.tc-prog-card-chord-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--accent-dim);
  border: 1px solid color-mix(in srgb, var(--accent) 22%, transparent);
}
</style>

<script setup>
import { ref } from 'vue'
import { pattern, isPlaying, clearPattern } from '@/audio/drumEngine.js'
import { BEAT_PATTERNS } from '@tonarium/core'
import PageHeader from '@/components/ui/PageHeader.vue'
import PickerRow from '@/components/ui/PickerRow.vue'
import DrumSequencerGrid from '@/components/sequencer/DrumSequencerGrid.vue'
import { sessionBeatIdx, sessionBpm } from '@/state/sessionState.js'
import { startTransport, stopTransport } from '@/audio/transportClock.js'
import { buildPatternFromBeat } from '@/utils/beatUtils.js'

const emit = defineEmits(['navigate'])

const loadedGroove = ref(sessionBeatIdx.value)

function selectGroove() {
  if (isPlaying.value) stopTransport()
  const pi = loadedGroove.value
  if (pi === null || pi === undefined || pi === '') {
    loadedGroove.value = null
    sessionBeatIdx.value = null
    clearPattern()
    return
  }
  pattern.value = buildPatternFromBeat(pi)
  sessionBeatIdx.value = pi
  if (BEAT_PATTERNS[pi].bpm) sessionBpm.value = BEAT_PATTERNS[pi].bpm
}

function useInJam() {
  sessionBeatIdx.value = loadedGroove.value
  emit('navigate', 'home')
}
</script>

<template>
  <div class="tc-drum page-card">
    <PageHeader title="Drum Computer" subtitle="loop continues while switching tabs" />

    <div class="tc-drum-groove-picker">
      <PickerRow label="Groove">
        <select v-model="loadedGroove" class="form-select" @change="selectGroove">
          <option :value="null">None</option>
          <option v-for="(gp, pi) in BEAT_PATTERNS" :key="pi" :value="pi">
            {{ gp.name }} ({{ gp.genre }}, {{ gp.bpm }} BPM)
          </option>
        </select>
      </PickerRow>
    </div>

    <div class="tc-drum-transport">
      <button
        class="tc-drum-transport-btn"
        :class="{ active: isPlaying }"
        @click="isPlaying ? stopTransport() : startTransport()"
      >{{ isPlaying ? 'Pause' : 'Play' }}</button>
      <button class="tc-drum-transport-btn" @click="clearPattern">Clear</button>
      <button class="tc-drum-transport-btn tc-drum-jam-btn" @click="useInJam">Use in Jam</button>
      <div class="tc-drum-bpm-control">
        <label>BPM</label>
        <input type="number" v-model.number="sessionBpm" min="60" max="200" class="tc-drum-bpm-input" />
      </div>
    </div>

    <DrumSequencerGrid />
  </div>
</template>

<style scoped>
.tc-drum-groove-picker {
  margin: 1.5rem 0 0;
}

.tc-drum-transport {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.5rem 0;
  flex-wrap: wrap;
}

.tc-drum-transport-btn {
  padding: 0.4rem 1.1rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text2);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.tc-drum-transport-btn:hover  { border-color: var(--accent); color: var(--text); }
.tc-drum-transport-btn.active { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }
.tc-drum-transport-btn.tc-drum-jam-btn { font-size: 0.78rem; letter-spacing: 0.04em; text-transform: uppercase; }

.tc-drum-bpm-control {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.tc-drum-bpm-control label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tc-drum-bpm-input {
  width: 4.5rem;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text);
  font-size: 0.9rem;
  text-align: center;
}

.tc-drum-bpm-input:focus { outline: none; border-color: var(--accent); }

@media (max-width: 600px) {
  .tc-drum { padding: 1.25rem 0.75rem; }
}

@media (orientation: landscape) and (max-height: 500px) {
  .tc-drum-transport { margin: 0.5rem 0; }
}
</style>

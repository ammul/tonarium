<script setup>
import { ref, computed, watch } from 'vue'
import PickerRow from '@/components/ui/PickerRow.vue'
import { NOTES, CHORD_SUFFIX } from '@/constants/musicConstants.js'
import { JAM_SCALES as SCALES } from '@/constants/scales.js'
import { ALL_PROGRESSIONS } from '@/constants/progressions.js'
import { BEAT_PATTERNS } from '@/constants/beatPatterns.js'
import { pattern as drumPattern, INSTRUMENTS } from '@/audio/drumEngine.js'
import {
  sessionProgression, sessionBeatIdx, sessionBpm,
  sessionPlaying, sessionCurrentChordIdx, sessionBeatsPerChord,
} from '@/state/sessionState.js'
import { startTransport, stopTransport } from '@/audio/transportClock.js'
import { selectedRoot, selectedScaleId, pianoOctave } from '@/state/jamSettings.js'

const GROOVE_INST_MAP = { 'Kick': 0, 'Snare': 1, 'Hi-Hat': 3 }

const GENRE_BEAT_MAP = {
  pop: 0, rock: 0, blues: 3, jazz: 7, soul: 4,
  classical: 0, latin: 7, cinematic: 5, modal: 0,
}

// Keep local ref in sync with externally-loaded progressions ("Jam with This")
const selectedProgressionId = ref(sessionProgression.value?.id ?? null)
watch(sessionProgression, prog => {
  selectedProgressionId.value = prog?.id ?? null
})

const selectedScale = computed(() => SCALES.find(s => s.id === selectedScaleId.value))

const topProgressions = computed(() => {
  const key = selectedScale.value?.intervals.includes(3) ? 'minor' : 'major'
  return ALL_PROGRESSIONS.filter(p => p.key === key).slice(0, 12)
})

function applyBeat(idx) {
  sessionBeatIdx.value = idx
  const bp = BEAT_PATTERNS[idx]
  const newPattern = Array.from({ length: INSTRUMENTS.length }, () => new Array(16).fill(false))
  for (const row of bp.rows) {
    const instIdx = GROOVE_INST_MAP[row.name]
    if (instIdx !== undefined) newPattern[instIdx] = row.steps.map(s => s === 1)
  }
  drumPattern.value = newPattern
  sessionBpm.value = bp.bpm
}

function selectProgression(id) {
  selectedProgressionId.value = id
  if (id === null) {
    sessionProgression.value = null
    if (sessionPlaying.value) stopTransport()
    return
  }
  const prog = ALL_PROGRESSIONS.find(p => p.id === id)
  if (!prog) return

  const ri = NOTES.indexOf(selectedRoot.value)
  sessionProgression.value = {
    ...prog,
    chords: prog.chords.map(c => ({
      ...c,
      _rootIdx: (ri + c.degree) % 12,
      _octave: pianoOctave.value,
    })),
  }

  if (sessionBeatIdx.value === null) {
    applyBeat(GENRE_BEAT_MAP[prog.genre] ?? 0)
  }

  const autoScale = prog.key === 'minor' ? 'mi.p' : 'ma.p'
  if (selectedScaleId.value !== autoScale) selectedScaleId.value = autoScale

  if (sessionPlaying.value) { stopTransport(); startTransport() }
}

function selectBeat(idx) {
  sessionBeatIdx.value = idx
  if (idx === null) {
    drumPattern.value = Array.from({ length: INSTRUMENTS.length }, () => new Array(16).fill(false))
    if (sessionPlaying.value) stopTransport()
    return
  }
  applyBeat(idx)
  if (sessionPlaying.value) { stopTransport(); startTransport() }
}

function toggleTransport() {
  if (sessionPlaying.value) {
    stopTransport()
  } else {
    startTransport()
  }
}

// Re-enrich progression chords when root changes
watch(selectedRoot, newRoot => {
  if (!sessionProgression.value) return
  const ri = NOTES.indexOf(newRoot)
  sessionProgression.value = {
    ...sessionProgression.value,
    chords: sessionProgression.value.chords.map(c => ({
      ...c,
      _rootIdx: (ri + c.degree) % 12,
    })),
  }
})

const currentChordName = computed(() => {
  const prog = sessionProgression.value
  if (!prog || !sessionPlaying.value) return null
  const chord = prog.chords[sessionCurrentChordIdx.value]
  if (!chord) return null
  return NOTES[chord._rootIdx] + (CHORD_SUFFIX[chord.type] ?? '')
})

const canPlay = computed(() => sessionProgression.value !== null || sessionBeatIdx.value !== null)
</script>

<template>
  <div class="jsb">
    <div class="jsb-title">Jam Session</div>

    <div class="jsb-controls">
      <PickerRow label="Progression">
        <select
          v-model="selectedProgressionId"
          class="jsb-select"
          @change="selectProgression(selectedProgressionId)"
        >
          <option :value="null">None</option>
          <option v-for="p in topProgressions" :key="p.id" :value="p.id">
            {{ p.numeral }} {{ p.name }}
          </option>
        </select>
      </PickerRow>

      <PickerRow label="Beat">
        <select
          v-model="sessionBeatIdx"
          class="jsb-select"
          @change="selectBeat(sessionBeatIdx)"
        >
          <option :value="null">None</option>
          <option v-for="(bp, i) in BEAT_PATTERNS" :key="i" :value="i">{{ bp.name }}</option>
        </select>
      </PickerRow>

      <PickerRow label="BPM">
        <div class="jsb-bpm-row">
          <input type="number" v-model.number="sessionBpm" min="40" max="200" class="jsb-bpm-input" />
          <select v-model.number="sessionBeatsPerChord" class="jsb-bpc-select">
            <option :value="1">1 beat/chord</option>
            <option :value="2">2 beats/chord</option>
            <option :value="4">4 beats/chord</option>
            <option :value="8">8 beats/chord</option>
          </select>
        </div>
      </PickerRow>
    </div>

    <div class="jsb-transport-row">
      <button
        class="jsb-play-btn"
        :class="{ playing: sessionPlaying }"
        :disabled="!canPlay"
        @click="toggleTransport"
      >
        {{ sessionPlaying ? 'Stop' : 'Play' }}
      </button>

      <div v-if="currentChordName" class="jsb-chord-name">{{ currentChordName }}</div>

      <div v-if="sessionProgression" class="jsb-timeline">
        <span
          v-for="(c, i) in sessionProgression.chords"
          :key="i"
          class="jsb-pill"
          :class="{ active: sessionPlaying && sessionCurrentChordIdx === i }"
        >{{ c.numeral }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.jsb {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.1rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--raised);
}

.jsb-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text4);
}

.jsb-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.jsb-select {
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text);
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  min-width: 9rem;
}

.jsb-select:focus {
  outline: none;
  border-color: var(--accent);
}

.jsb-bpm-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.jsb-bpm-input {
  width: 4.5rem;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text);
  font-size: 0.85rem;
  font-family: inherit;
  text-align: center;
}

.jsb-bpc-select {
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
}

.jsb-transport-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.jsb-play-btn {
  padding: 0.45rem 1.4rem;
  border-radius: 8px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: border-color 0.12s, background 0.12s, color 0.12s;
  flex-shrink: 0;
}

.jsb-play-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--text); }
.jsb-play-btn.playing { border-color: var(--rust); background: var(--rust-bg); color: var(--rust-hi); }
.jsb-play-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.jsb-chord-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
  line-height: 1;
  min-width: 3rem;
}

.jsb-timeline {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
}

.jsb-pill {
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
  border: 1px solid var(--border2);
  background: var(--raised);
  color: var(--text4);
  font-size: 0.78rem;
  font-weight: 600;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.jsb-pill.active {
  border-color: var(--accent);
  background: var(--accent-bg);
  color: var(--accent);
}
</style>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import PickerRow from '@/components/ui/PickerRow.vue'
import { NOTES, CHORD_SUFFIX } from '@/constants/musicConstants.js'
import { JAM_SCALES as SCALES } from '@/constants/scales.js'
import { ALL_PROGRESSIONS } from '@/constants/progressions.js'
import { BEAT_PATTERNS } from '@/constants/beatPatterns.js'
import { pattern as drumPattern } from '@/audio/drumEngine.js'
import { buildPatternFromBeat, createEmptyPattern } from '@/utils/beatUtils.js'
import {
  sessionProgression, sessionBeatIdx, sessionBpm,
  sessionPlaying, sessionCurrentChordIdx, sessionBeatsPerChord,
} from '@/state/sessionState.js'
import { startTransport, stopTransport } from '@/audio/transportClock.js'
import { selectedRoot, selectedScaleId, pianoOctave } from '@/state/jamSettings.js'
import { sessionKey } from '@/state/sessionState.js'
import { jamVolume, beatVolume, progVolume } from '@/state/mixerState.js'

const GENRE_BEAT_MAP = {
  pop: 0, rock: 0, blues: 3, jazz: 7, soul: 4,
  classical: 0, latin: 7, cinematic: 5, modal: 0,
}

// Beat indices: 0=rock, 3=boom-bap, 4=funk, 5=half-time, 7=bossa
const PRESETS = [
  { label: 'Pop',     key: 'C', scaleId: 'ma.p', progressionId: 'pop-1',   beatIdx: 0 },
  { label: 'Blues',   key: 'A', scaleId: 'mi.p', progressionId: 'blues-4', beatIdx: 3 },
  { label: 'Funk',    key: 'A', scaleId: 'dor',  progressionId: 'soul-5',  beatIdx: 4 },
  { label: 'Hip-hop', key: 'A', scaleId: 'mi.p', progressionId: 'pop-6',   beatIdx: 5 },
  { label: 'Bossa',   key: 'C', scaleId: 'ma.p', progressionId: 'latin-1', beatIdx: 7 },
]

const activePreset = ref(null)

// Keep local ref in sync with externally-loaded progressions ("Jam with This")
const selectedProgressionId = ref(sessionProgression.value?.id ?? null)
watch(sessionProgression, prog => {
  selectedProgressionId.value = prog?.id ?? null
  // Clear active preset if progression changed externally
  if (activePreset.value && prog?.id !== activePreset.value.progressionId) {
    activePreset.value = null
  }
})

const selectedScale = computed(() => SCALES.find(s => s.id === selectedScaleId.value))

const topProgressions = computed(() => {
  const key = selectedScale.value?.intervals.includes(3) ? 'minor' : 'major'
  return ALL_PROGRESSIONS.filter(p => p.key === key).slice(0, 16)
})

function applyBeat(idx) {
  sessionBeatIdx.value = idx
  drumPattern.value = buildPatternFromBeat(idx)
  sessionBpm.value = BEAT_PATTERNS[idx].bpm
}

function buildProgressionChords(prog, key) {
  const ri = NOTES.indexOf(key)
  return prog.chords.map(c => ({
    ...c,
    _rootIdx: (ri + c.degree) % 12,
    _octave: pianoOctave.value,
  }))
}

function applyPreset(preset) {
  if (sessionPlaying.value) stopTransport()
  activePreset.value = preset

  selectedRoot.value = preset.key
  applyBeat(preset.beatIdx)

  const prog = ALL_PROGRESSIONS.find(p => p.id === preset.progressionId)
  if (prog) {
    selectedProgressionId.value = preset.progressionId
    sessionProgression.value = {
      ...prog,
      chords: buildProgressionChords(prog, preset.key),
    }
  }

  selectedScaleId.value = preset.scaleId
}

function selectProgression(id) {
  activePreset.value = null
  selectedProgressionId.value = id
  if (id === null) {
    sessionProgression.value = null
    if (sessionPlaying.value) stopTransport()
    return
  }
  const prog = ALL_PROGRESSIONS.find(p => p.id === id)
  if (!prog) return

  if (sessionPlaying.value) stopTransport()

  sessionProgression.value = {
    ...prog,
    chords: buildProgressionChords(prog, selectedRoot.value),
  }

  if (sessionBeatIdx.value === null) {
    applyBeat(GENRE_BEAT_MAP[prog.genre] ?? 0)
  }

  const autoScale = prog.key === 'minor' ? 'mi.p' : 'ma.p'
  if (selectedScaleId.value !== autoScale) selectedScaleId.value = autoScale
}

function selectBeat(idx) {
  activePreset.value = null
  if (idx === null) {
    sessionBeatIdx.value = null
    drumPattern.value = createEmptyPattern()
    if (sessionPlaying.value) stopTransport()
    return
  }
  if (sessionPlaying.value) stopTransport()
  applyBeat(idx)
}

function toggleTransport() {
  if (sessionPlaying.value) {
    stopTransport()
  } else {
    startTransport()
  }
}

// Keep selectedRoot in sync with sessionKey set externally (e.g. "Jam with This")
watch(sessionKey, key => {
  if (key && key !== selectedRoot.value) selectedRoot.value = key
})

// Restore drum pattern from persisted beat index (sessionBeatIdx survives reload but pattern does not)
onMounted(() => {
  const idx = sessionBeatIdx.value
  if (idx !== null) drumPattern.value = buildPatternFromBeat(idx)
})

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

const activeBeatName = computed(() =>
  sessionBeatIdx.value !== null ? BEAT_PATTERNS[sessionBeatIdx.value]?.name : null
)
</script>

<template>
  <div class="jsb">
    <!-- Preset row -->
    <div class="jsb-presets">
      <span class="jsb-presets-label">Quick start</span>
      <div class="jsb-preset-btns">
        <button
          v-for="preset in PRESETS"
          :key="preset.label"
          class="jsb-preset-btn"
          :class="{ active: activePreset?.label === preset.label }"
          @click="applyPreset(preset)"
        >{{ preset.label }}</button>
      </div>
    </div>

    <!-- Controls -->
    <div class="jsb-controls">
      <PickerRow label="Progression">
        <select
          v-model="selectedProgressionId"
          class="form-select"
          @change="selectProgression(selectedProgressionId)"
        >
          <option :value="null">None</option>
          <option v-for="p in topProgressions" :key="p.id" :value="p.id">
            {{ p.label }} ({{ p.numeral }})
          </option>
        </select>
      </PickerRow>

      <PickerRow label="Beat">
        <select
          v-model="sessionBeatIdx"
          class="form-select"
          @change="selectBeat(sessionBeatIdx)"
        >
          <option :value="null">None</option>
          <option v-for="(bp, i) in BEAT_PATTERNS" :key="i" :value="i">{{ bp.name }}</option>
        </select>
      </PickerRow>

      <PickerRow label="BPM">
        <input type="number" v-model.number="sessionBpm" min="40" max="200" class="jsb-bpm-input" />
      </PickerRow>

      <PickerRow label="Chord">
        <select v-model.number="sessionBeatsPerChord" class="form-select">
          <option :value="1">1 beat/chord</option>
          <option :value="2">2 beats/chord</option>
          <option :value="4">4 beats/chord</option>
          <option :value="8">8 beats/chord</option>
        </select>
      </PickerRow>
    </div>

    <!-- Mixer -->
    <div class="jsb-mixer">
      <div class="jsb-mix-ch">
        <span class="jsb-mix-label">Jam</span>
        <input type="range" v-model.number="jamVolume" min="0" max="1" step="0.05" class="jsb-slider" />
      </div>
      <div class="jsb-mix-ch">
        <span class="jsb-mix-label">Beat</span>
        <input type="range" v-model.number="beatVolume" min="0" max="1" step="0.05" class="jsb-slider" />
      </div>
      <div class="jsb-mix-ch">
        <span class="jsb-mix-label">Chord</span>
        <input type="range" v-model.number="progVolume" min="0" max="1" step="0.05" class="jsb-slider" />
      </div>
    </div>

    <!-- Transport row -->
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
  overflow: hidden;
}

/* Presets */
.jsb-presets {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.jsb-presets-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text4);
  flex-shrink: 0;
}

.jsb-preset-btns {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.jsb-preset-btn {
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s, color 0.12s;
}

.jsb-preset-btn:hover {
  border-color: var(--accent);
  color: var(--text);
}

.jsb-preset-btn.active {
  border-color: var(--accent);
  background: var(--accent-bg);
  color: var(--accent);
}

/* Controls */
.jsb-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}


.jsb-bpm-input {
  width: 5rem;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text);
  font-size: 0.85rem;
  font-family: inherit;
  text-align: center;
}

/* Mixer */
.jsb-mixer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.jsb-mix-ch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.jsb-mix-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--text4);
  flex-shrink: 0;
  width: 2.8rem;
}

.jsb-slider {
  flex: 1;
  height: 3px;
  accent-color: var(--accent);
  cursor: pointer;
}

/* Transport row */
.jsb-transport-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
  flex: 1;
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

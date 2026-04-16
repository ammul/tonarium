<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import PickerRow from '@/components/ui/PickerRow.vue'
import KnobControl from '@/components/ui/KnobControl.vue'
import ScaleSelector from '@/components/jam/ScaleSelector.vue'
import { Music2, Drum, Play, Square, Pencil, ExternalLink } from 'lucide-vue-next'
import { NOTES, CHORD_SUFFIX } from '@tonarium/core'
import { JAM_SCALES as SCALES } from '@tonarium/core'
import { ALL_PROGRESSIONS } from '@tonarium/core'
import { BEAT_PATTERNS } from '@tonarium/core'
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

const emit = defineEmits(['navigate'])

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

// Keep local ref in sync with externally-loaded progressions ("Jam with This", Learn)
const selectedProgressionId = ref(sessionProgression.value?.id ?? null)
watch(sessionProgression, prog => {
  selectedProgressionId.value = prog?.id ?? null
  // Clear active preset if progression changed externally
  if (activePreset.value && prog?.id !== activePreset.value.progressionId) {
    activePreset.value = null
  }
  // Sync scale to match the loaded progression so it appears in the filtered dropdown
  if (prog?.key) {
    const autoScale = prog.key === 'minor' ? 'mi.p' : 'ma.p'
    if (selectedScaleId.value !== autoScale) selectedScaleId.value = autoScale
  }
})

const selectedScale = computed(() => SCALES.find(s => s.id === selectedScaleId.value))

const topProgressions = computed(() => {
  const key = selectedScale.value?.intervals.includes(3) ? 'minor' : 'major'
  return ALL_PROGRESSIONS.filter(p => p.key === key)
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

function onKeyChange() {
  if (sessionPlaying.value) stopTransport()
}

function onScaleChange() {
  if (sessionPlaying.value) stopTransport()
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
// Also sync selectedRoot and scale if a progression was loaded before this component mounted (e.g. from Learn)
onMounted(() => {
  const idx = sessionBeatIdx.value
  if (idx !== null) drumPattern.value = buildPatternFromBeat(idx)

  if (sessionKey.value && sessionKey.value !== selectedRoot.value) {
    selectedRoot.value = sessionKey.value
  }
  const prog = sessionProgression.value
  if (prog?.key) {
    const autoScale = prog.key === 'minor' ? 'mi.p' : 'ma.p'
    if (selectedScaleId.value !== autoScale) selectedScaleId.value = autoScale
  }

  // Auto-select the first preset if no progression is loaded
  if (!sessionProgression.value) {
    applyPreset(PRESETS[0])
  }
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

const notesOpen  = ref(false)
const rhythmOpen = ref(false)
</script>

<template>
  <div class="tc-jam-bar">
    <span class="tc-jam-bar-title">Quick Jam</span>

    <!-- Vibe (preset) row -->
    <div class="tc-jam-bar-vibe-row">
      <span class="picker-label">Vibe</span>
      <div class="tc-jam-bar-preset-btns">
        <button
          v-for="preset in PRESETS"
          :key="preset.label"
          class="tc-jam-bar-preset-btn"
          :class="{ active: activePreset?.label === preset.label }"
          @click="applyPreset(preset)"
        >{{ preset.label }}</button>
      </div>
    </div>

    <!-- Notes panel (Key, Scale, Progression) -->
    <div class="tc-jam-bar-panel">
      <button class="tc-jam-bar-panel-toggle" @click="notesOpen = !notesOpen">
        <Music2 :size="13" class="tc-jam-bar-panel-icon" />
        <span class="tc-jam-bar-panel-name">Notes</span>
        <span class="tc-jam-bar-panel-chevron" :class="{ open: notesOpen }"></span>
      </button>
      <div v-show="notesOpen" class="tc-jam-bar-panel-body">
        <PickerRow label="Key">
          <select v-model="selectedRoot" class="form-select tc-jam-bar-key-select" @change="onKeyChange">
            <option v-for="note in NOTES" :key="note" :value="note">{{ note }}</option>
          </select>
        </PickerRow>
        <PickerRow label="Scale">
          <ScaleSelector v-model="selectedScaleId" :scales="SCALES" @update:modelValue="onScaleChange" />
        </PickerRow>
        <PickerRow label="Progression">
          <div class="tc-jam-bar-picker-row">
            <select v-model="selectedProgressionId" class="form-select" @change="selectProgression(selectedProgressionId)">
              <option :value="null">None</option>
              <option v-for="p in topProgressions" :key="p.id" :value="p.id">{{ p.label }} ({{ p.numeral }})</option>
            </select>
            <button class="btn btn-sm btn-icon tc-jam-bar-edit-btn" @click="emit('navigate', 'chords')" aria-label="Browse progressions"><ExternalLink :size="13" /></button>
          </div>
        </PickerRow>
      </div>
    </div>

    <!-- Rhythm panel (Beat, BPM, Beats/chord) -->
    <div class="tc-jam-bar-panel">
      <button class="tc-jam-bar-panel-toggle" @click="rhythmOpen = !rhythmOpen">
        <Drum :size="13" class="tc-jam-bar-panel-icon" />
        <span class="tc-jam-bar-panel-name">Rhythm</span>
        <span class="tc-jam-bar-panel-chevron" :class="{ open: rhythmOpen }"></span>
      </button>
      <div v-show="rhythmOpen" class="tc-jam-bar-panel-body">
        <PickerRow label="Beat">
          <div class="tc-jam-bar-picker-row">
            <select v-model="sessionBeatIdx" class="form-select" @change="selectBeat(sessionBeatIdx)">
              <option :value="null">None</option>
              <option v-for="(bp, i) in BEAT_PATTERNS" :key="i" :value="i">{{ bp.name }}</option>
            </select>
            <button class="btn btn-sm btn-icon tc-jam-bar-edit-btn" @click="emit('navigate', 'drums')" aria-label="Edit beat"><Pencil :size="13" /></button>
          </div>
        </PickerRow>
        <PickerRow label="BPM">
          <input type="number" v-model.number="sessionBpm" min="40" max="200" class="tc-jam-bar-bpm-input" />
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
    </div>

    <!-- Mixer -->
    <div class="tc-jam-bar-mixer">
      <KnobControl v-model="jamVolume"  label="Jam" />
      <KnobControl v-model="beatVolume" label="Beat" />
      <KnobControl v-model="progVolume" label="Chord" />
    </div>

    <!-- Transport row -->
    <div class="tc-jam-bar-transport">
      <button
        class="tc-jam-bar-play-btn"
        :class="{ playing: sessionPlaying }"
        :disabled="!canPlay"
        @click="toggleTransport"
      >
        <Square v-if="sessionPlaying" :size="13" />
        <Play v-else :size="13" />
        {{ sessionPlaying ? 'Stop' : 'Play' }}
      </button>

      <div v-if="currentChordName" class="tc-jam-bar-chord-name">{{ currentChordName }}</div>

      <div v-if="sessionProgression" class="tc-jam-bar-timeline">
        <span
          v-for="(c, i) in sessionProgression.chords"
          :key="i"
          class="tc-jam-bar-chord-pill"
          :class="{ active: sessionPlaying && sessionCurrentChordIdx === i }"
        >{{ c.numeral }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tc-jam-bar {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  padding: 1.1rem 1.25rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--raised);
  overflow: hidden;
}

.tc-jam-bar-title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text4);
}

/* Vibe row */
.tc-jam-bar-vibe-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.tc-jam-bar-vibe-row .picker-label {
  padding-top: 0.3rem;
}

.tc-jam-bar-preset-btns {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  flex: 1;
}

.tc-jam-bar-preset-btn {
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

.tc-jam-bar-preset-btn:hover {
  border-color: var(--accent);
  color: var(--text);
}

.tc-jam-bar-preset-btn.active {
  border-color: var(--accent);
  background: var(--accent-bg);
  color: var(--accent);
}

/* Expansion panels */
.tc-jam-bar-panel {
  border-top: 1px solid var(--border);
}

.tc-jam-bar-panel-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  justify-content: space-between;
  width: 100%;
  padding: 0.55rem 0;
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: inherit;
}

.tc-jam-bar-panel-icon {
  color: var(--text4);
  flex-shrink: 0;
  transition: color 0.12s;
}

.tc-jam-bar-panel-toggle:hover .tc-jam-bar-panel-icon {
  color: var(--text2);
}

.tc-jam-bar-panel-toggle:hover .tc-jam-bar-panel-name {
  color: var(--text2);
}

.tc-jam-bar-panel-name {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text4);
  transition: color 0.12s;
}

.tc-jam-bar-panel-chevron {
  width: 6px;
  height: 6px;
  border-right: 1.5px solid var(--text4);
  border-bottom: 1.5px solid var(--text4);
  transform: rotate(-45deg);
  transition: transform 0.15s;
  flex-shrink: 0;
  margin-right: 2px;
}

.tc-jam-bar-panel-chevron.open {
  transform: rotate(45deg);
}

.tc-jam-bar-panel-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-bottom: 0.65rem;
}

.tc-jam-bar-picker-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.tc-jam-bar-picker-row .form-select {
  flex: 1;
}

.tc-jam-bar-edit-btn {
  flex-shrink: 0;
  font-size: 0.75rem;
  padding: 0.25rem 0.6rem;
}


.tc-jam-bar-key-select {
  width: auto;
  min-width: 5rem;
}

.tc-jam-bar-bpm-input {
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
.tc-jam-bar-mixer {
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  padding: 0.25rem 0;
}

/* Transport row */
.tc-jam-bar-transport {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.tc-jam-bar-play-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
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

.tc-jam-bar-play-btn:hover:not(:disabled) { border-color: var(--accent); color: var(--text); }
.tc-jam-bar-play-btn.playing { border-color: var(--rust); background: var(--rust-bg); color: var(--rust-hi); }
.tc-jam-bar-play-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.tc-jam-bar-chord-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: 0.02em;
  line-height: 1;
  min-width: 3rem;
}

.tc-jam-bar-timeline {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  flex: 1;
}

.tc-jam-bar-chord-pill {
  padding: 0.2rem 0.45rem;
  border-radius: 4px;
  border: 1px solid var(--border2);
  background: var(--raised);
  color: var(--text4);
  font-size: 0.78rem;
  font-weight: 600;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.tc-jam-bar-chord-pill.active {
  border-color: var(--accent);
  background: var(--accent-bg);
  color: var(--accent);
}

</style>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Play, Square } from 'lucide-vue-next'
import { NOTES, ALL_PROGRESSIONS, BEAT_PATTERNS, JAM_SCALES as SCALES } from '@tonarium/core'
import { pattern as drumPattern } from '@/audio/drumEngine.js'
import { buildPatternFromBeat } from '@/utils/beatUtils.js'
import {
  sessionProgression, sessionBpm, sessionBeatsPerChord, sessionCompPattern,
  sessionPlaying, sessionBeatIdx, sessionKey,
} from '@/state/sessionState.js'
import { startTransport, stopTransport } from '@/audio/transportClock.js'
import { selectedRoot, selectedScaleId, pianoOctave } from '@/state/jamSettings.js'
import JamInstrument from '@/components/jam/JamInstrument.vue'
import DrumSequencerGrid from '@/components/sequencer/DrumSequencerGrid.vue'
import ChordSequencerGrid from '@/components/sequencer/ChordSequencerGrid.vue'
import PickerRow from '@/components/ui/PickerRow.vue'
import ScaleSelector from '@/components/jam/ScaleSelector.vue'

const PRESETS = [
  { label: 'Pop',     key: 'C', scaleId: 'ma.p', progressionId: 'pop-1',    beatIdx: 0  },
  { label: 'Blues',   key: 'A', scaleId: 'mi.p', progressionId: 'blues-4',  beatIdx: 3  },
  { label: 'Funk',    key: 'A', scaleId: 'dor',  progressionId: 'soul-5',   beatIdx: 4  },
  { label: 'Hip-hop', key: 'A', scaleId: 'mi.p', progressionId: 'pop-6',    beatIdx: 5  },
  { label: 'Bossa',   key: 'C', scaleId: 'ma.p', progressionId: 'latin-1',  beatIdx: 7  },
  { label: 'Reggae',  key: 'G', scaleId: 'ma.p', progressionId: 'reggae-1', beatIdx: 6  },
  { label: 'Jazz',    key: 'F', scaleId: 'mix',  progressionId: 'jazz-2',   beatIdx: 14 },
  { label: 'Rock',    key: 'E', scaleId: 'mix',  progressionId: 'rock-4',   beatIdx: 0  },
]

const activePreset = ref(null)

function buildChords(prog, key) {
  const ri = NOTES.indexOf(key)
  return prog.chords.map(c => ({
    ...c,
    _rootIdx: (ri + c.degree) % 12,
    _octave: pianoOctave.value,
  }))
}

function applyBeat(idx) {
  sessionBeatIdx.value = idx
  drumPattern.value = buildPatternFromBeat(idx)
  sessionBpm.value = BEAT_PATTERNS[idx].bpm
}

function applyPreset(p) {
  if (sessionPlaying.value) stopTransport()
  activePreset.value = p
  selectedRoot.value = p.key
  applyBeat(p.beatIdx)
  selectedScaleId.value = p.scaleId
  const prog = ALL_PROGRESSIONS.find(x => x.id === p.progressionId)
  if (prog) {
    sessionProgression.value = { ...prog, chords: buildChords(prog, p.key) }
  }
}

function toggleTransport() {
  sessionPlaying.value ? stopTransport() : startTransport()
}

function onKeyChange() {
  if (sessionPlaying.value) stopTransport()
  if (!sessionProgression.value) return
  sessionProgression.value = {
    ...sessionProgression.value,
    chords: buildChords(sessionProgression.value, selectedRoot.value),
  }
}

const canPlay = computed(() => sessionProgression.value !== null || sessionBeatIdx.value !== null)

onMounted(() => {
  if (sessionBeatIdx.value !== null) drumPattern.value = buildPatternFromBeat(sessionBeatIdx.value)
  if (sessionKey.value && sessionKey.value !== selectedRoot.value) selectedRoot.value = sessionKey.value
  if (!sessionProgression.value) {
    applyPreset(PRESETS[0])
  } else {
    activePreset.value = PRESETS.find(p => sessionProgression.value?.id === p.progressionId) ?? null
  }
})
</script>

<template>
  <div class="sj page-card">
    <div class="sj-header">
      <span class="sj-title">Sequencer Jam</span>
      <div class="sj-presets">
        <button
          v-for="p in PRESETS"
          :key="p.label"
          class="sj-preset-btn"
          :class="{ active: activePreset?.label === p.label }"
          @click="applyPreset(p)"
        >{{ p.label }}</button>
      </div>
      <button
        class="sj-play-btn"
        :class="{ playing: sessionPlaying }"
        :disabled="!canPlay"
        @click="toggleTransport"
      >
        <Square v-if="sessionPlaying" :size="13" />
        <Play v-else :size="13" />
        {{ sessionPlaying ? 'Stop' : 'Play' }}
      </button>
    </div>

    <div class="sj-controls">
      <PickerRow label="Key">
        <select v-model="selectedRoot" class="form-select sj-narrow" @change="onKeyChange">
          <option v-for="note in NOTES" :key="note" :value="note">{{ note }}</option>
        </select>
      </PickerRow>
      <PickerRow label="Scale">
        <ScaleSelector v-model="selectedScaleId" :scales="SCALES" />
      </PickerRow>
      <PickerRow label="BPM">
        <input type="number" v-model.number="sessionBpm" min="40" max="200" class="sj-bpm-input" />
      </PickerRow>
      <PickerRow label="Chord">
        <select v-model.number="sessionBeatsPerChord" class="form-select">
          <option :value="2">2 beats</option>
          <option :value="4">4 beats</option>
          <option :value="8">8 beats</option>
        </select>
      </PickerRow>
      <PickerRow label="Comp">
        <select v-model="sessionCompPattern" class="form-select">
          <option value="block">Block</option>
          <option value="offbeat">Off-beat</option>
          <option value="arp">Arp</option>
          <option value="waltz">Waltz</option>
        </select>
      </PickerRow>
    </div>

    <section class="sj-section">
      <div class="sj-section-label">Chord progression</div>
      <ChordSequencerGrid />
    </section>

    <section class="sj-section">
      <div class="sj-section-label">Drums</div>
      <DrumSequencerGrid />
    </section>

    <section class="sj-section">
      <JamInstrument />
    </section>
  </div>
</template>

<style scoped>
.sj {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sj-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.sj-title {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text2);
  margin-right: 0.4rem;
}

.sj-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  flex: 1;
}

.sj-preset-btn {
  padding: 0.32rem 0.7rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text3);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.sj-preset-btn:hover  { border-color: var(--accent); color: var(--text); }
.sj-preset-btn.active { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }

.sj-play-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--accent);
  background: var(--accent-bg);
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.12s, color 0.12s;
}

.sj-play-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.sj-play-btn.playing { background: var(--accent); color: var(--on-accent); }

.sj-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--raised);
}

.sj-bpm-input {
  width: 4.5rem;
  padding: 0.35rem 0.6rem;
  border-radius: 6px;
  border: 1px solid var(--border2);
  background: var(--input);
  color: var(--text);
  font-size: 0.9rem;
  text-align: center;
}

.sj-bpm-input:focus { outline: none; border-color: var(--accent); }

.sj-narrow { min-width: 4rem; }

.sj-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sj-section-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text4);
}

@media (max-width: 600px) {
  .sj-title { font-size: 0.9rem; }
  .sj-controls { padding: 0.5rem 0.75rem; gap: 0.5rem 0.75rem; }
}
</style>

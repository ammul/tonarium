<script setup>
import { ref, computed } from 'vue'
import { displayMode } from '@/state/displayMode.js'
import { NOTES, CHORD_SUFFIX } from '@tonarium/core'
import { JAM_SCALES as SCALES } from '@tonarium/core'
import PageHeader from '@/components/ui/PageHeader.vue'
import PickerRow from '@/components/ui/PickerRow.vue'
import ScaleSelector from '@/components/jam/ScaleSelector.vue'
import OctaveControl from '@/components/jam/OctaveControl.vue'
import JamInstrument from '@/components/jam/JamInstrument.vue'
import { JAM_SCALES } from '@tonarium/core'
import { sessionProgression, sessionPlaying, sessionCurrentChordIdx } from '@/state/sessionState.js'
import { stopTransport } from '@/audio/transportClock.js'
import { selectedRoot, selectedScaleId, pianoOctave, selectedChordType, selectedChordRoot } from '@/state/jamSettings.js'

const CHORD_OPTIONS = [
  ['maj',  ''],
  ['min',  'm'],
  ['dom7', '7'],
  ['min7', 'm7'],
  ['maj7', 'M7'],
]

const showInfo = ref(false)

const chordRoot = computed(() => selectedChordRoot.value ?? selectedRoot.value)

function onChordTypeChange() {
  if (!selectedChordType.value) {
    selectedChordRoot.value = null
  } else if (!selectedChordRoot.value) {
    selectedChordRoot.value = selectedRoot.value
  }
  if (sessionPlaying.value) stopTransport()
}

function onKeyChange() {
  if (sessionPlaying.value) stopTransport()
}

function onScaleChange() {
  if (sessionPlaying.value) stopTransport()
}

const SUBTITLE = { pad: 'lit pads', guitar: 'highlighted frets', piano: 'highlighted keys' }
const subtitle = computed(() => {
  const mode = SUBTITLE[displayMode.value] ?? 'highlighted items'
  if (sessionPlaying.value && sessionProgression.value) {
    const chord = sessionProgression.value.chords[sessionCurrentChordIdx.value]
    if (chord) {
      const name = NOTES[(NOTES.indexOf(selectedRoot.value) + chord.degree) % 12] + (CHORD_SUFFIX[chord.type] ?? '')
      return `playing over ${name}. ${mode} are safe notes`
    }
  }
  if (selectedChordType.value) {
    const chordName = chordRoot.value + (CHORD_SUFFIX[selectedChordType.value] ?? '')
    return `${mode} = chord tones of ${chordName}. Bright = best note choices`
  }
  return `pick a key and scale - ${mode} are safe to play`
})
</script>

<template>
  <div class="tc-jam">
    <PageHeader title="Jam Mode" :subtitle="subtitle" />

    <div class="tc-jam-controls">
      <PickerRow label="Key">
        <select v-model="selectedRoot" class="form-select" @change="onKeyChange">
          <option v-for="note in NOTES" :key="note" :value="note">{{ note }}</option>
        </select>
      </PickerRow>

      <PickerRow label="Scale">
        <ScaleSelector
          v-model="selectedScaleId"
          :scales="SCALES"
          v-model:showInfo="showInfo"
          @update:modelValue="onScaleChange"
        />
      </PickerRow>

      <PickerRow v-if="displayMode !== 'guitar'" label="Octave">
        <OctaveControl v-model="pianoOctave" :min="1" :max="7" />
      </PickerRow>

      <PickerRow label="Chord">
        <div class="tc-jam-chord-dropdowns">
          <select v-model="selectedChordType" class="form-select" @change="onChordTypeChange">
            <option :value="null">off</option>
            <option v-for="[key, sfx] in CHORD_OPTIONS" :key="key" :value="key">{{ chordRoot }}{{ sfx }}</option>
          </select>
          <select v-if="selectedChordType" v-model="selectedChordRoot" class="form-select" @change="() => { if (sessionPlaying) stopTransport() }">
            <option v-for="note in NOTES" :key="note" :value="note">{{ note }}</option>
          </select>
        </div>
      </PickerRow>
    </div>

    <JamInstrument />
  </div>
</template>

<style scoped>
.tc-jam {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
}

.tc-jam-controls {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  margin: 1.5rem 0;
}

.tc-jam-chord-dropdowns {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (max-width: 600px) {
  .tc-jam {
    padding: 1.25rem 1rem;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .tc-jam {
    padding: 0.75rem 1rem;
  }

  .tc-jam-controls {
    margin: 0.5rem 0;
    gap: 0.5rem;
  }
}
</style>

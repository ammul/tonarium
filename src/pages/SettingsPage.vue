<script setup>
import { computed } from 'vue'

const emit = defineEmits(['close'])
import { displayMode } from '@/state/displayMode.js'
import { playNote } from '@/audio/audioEngine.js'
import { padSize } from '@/state/padSize.js'
import { colorMode } from '@/state/colorMode.js'
import { colorScheme } from '@/state/colorScheme.js'
import { soundEnabled } from '@/state/soundEnabled.js'
import { soundStyle } from '@/state/soundStyle.js'
import { midiStatus, midiOutputs, selectedOutputId, initMidi, disconnectMidi } from '@/audio/midiManager.js'
import { octave } from '@/state/octave.js'
import PageHeader from '@/components/ui/PageHeader.vue'

const DISPLAY_OPTIONS = [
  { value: 'pad',    label: 'Pad',    desc: 'Chromatic pad grid - pad numbers and note names visible. Layout (4x3 or 4x4) is configurable below.' },
  { value: 'guitar', label: 'Guitar', desc: 'Guitar neck or chord diagrams in standard tuning (E A D G B e).' },
  { value: 'piano',  label: 'Piano',  desc: 'Piano keyboard across one octave.' },
]

const selectedDesc = computed(() => DISPLAY_OPTIONS.find(o => o.value === displayMode.value)?.desc ?? '')

function truncate(name, max = 28) {
  return name.length > max ? name.slice(0, max - 1) + '…' : name
}

const selectedDevice = computed({
  get: () => selectedOutputId.value,
  set: (v) => { selectedOutputId.value = v },
})

function selectSoundStyle(style) {
  soundStyle.value = style
  playNote(60)
}
</script>

<template>
  <div class="tc-settings">
    <PageHeader title="Settings">
      <template #actions>
        <button class="btn btn-icon tc-settings-close-btn" @click="emit('close')" aria-label="Close settings">&#x2715;</button>
      </template>
    </PageHeader>

    <section class="tc-settings-section">
      <h3>Display</h3>
      <p class="tc-settings-section-desc">Controls how chords and scales are shown across all tools.</p>
      <div class="tc-settings-option-group">
        <button
          v-for="opt in DISPLAY_OPTIONS"
          :key="opt.value"
          class="tc-settings-tab-btn tc-settings-option-btn"
          :class="{ active: displayMode === opt.value }"
          @click="displayMode = opt.value"
        >{{ opt.label }}</button>
      </div>
      <p class="tc-settings-option-desc">{{ selectedDesc }}</p>
    </section>

    <section class="tc-settings-section" v-if="displayMode === 'pad'">
      <h3>Pad Layout</h3>
      <p class="tc-settings-section-desc">Number of columns in the pad grid.</p>
      <div class="tc-settings-option-group">
        <button class="tc-settings-tab-btn tc-settings-option-btn" :class="{ active: padSize === '4x3' }" @click="padSize = '4x3'">4x3 (12 pads)</button>
        <button class="tc-settings-tab-btn tc-settings-option-btn" :class="{ active: padSize === '4x4' }" @click="padSize = '4x4'">4x4 (16 pads)</button>
      </div>
    </section>

    <section class="tc-settings-section">
      <h3>Audio</h3>
      <p class="tc-settings-section-desc">Play sound when tapping notes, chords, and pads.</p>
      <div class="tc-settings-option-group">
        <button class="tc-settings-tab-btn tc-settings-option-btn" :class="{ active: soundEnabled }" @click="soundEnabled = true">On</button>
        <button class="tc-settings-tab-btn tc-settings-option-btn" :class="{ active: !soundEnabled }" @click="soundEnabled = false">Off</button>
      </div>
    </section>

    <section class="tc-settings-section" v-if="soundEnabled">
      <h3>Button Sound Style</h3>
      <p class="tc-settings-section-desc">Timbre used when tapping pads, keys, and tiles.</p>
      <div class="tc-settings-option-group">
        <button class="tc-settings-tab-btn tc-settings-option-btn" :class="{ active: soundStyle === 'synth' }" @click="selectSoundStyle('synth')">Synth</button>
        <button class="tc-settings-tab-btn tc-settings-option-btn" :class="{ active: soundStyle === 'piano' }" @click="selectSoundStyle('piano')">Piano</button>
        <button class="tc-settings-tab-btn tc-settings-option-btn" :class="{ active: soundStyle === 'bell' }"  @click="selectSoundStyle('bell')">Bell</button>
        <button class="tc-settings-tab-btn tc-settings-option-btn" :class="{ active: soundStyle === 'pluck' }" @click="selectSoundStyle('pluck')">Pluck</button>
      </div>
    </section>

    <section class="tc-settings-section">
      <h3>Theme</h3>
      <div class="tc-settings-option-group">
        <button class="tc-settings-tab-btn tc-settings-option-btn" :class="{ active: colorMode === 'dark' }"  @click="colorMode = 'dark'">Dark</button>
        <button class="tc-settings-tab-btn tc-settings-option-btn" :class="{ active: colorMode === 'light' }" @click="colorMode = 'light'">Light</button>
      </div>
    </section>

    <section class="tc-settings-section">
      <h3>Color Scheme</h3>
      <div class="tc-settings-option-group">
        <button class="tc-settings-tab-btn tc-settings-option-btn" :class="{ active: colorScheme === 'none' }"     @click="colorScheme = 'none'">Neutral</button>
        <button class="tc-settings-option-btn tc-settings-scheme-btn tc-settings-scheme-medieval" :class="{ active: colorScheme === 'medieval' }" @click="colorScheme = 'medieval'">Medieval</button>
        <button class="tc-settings-option-btn tc-settings-scheme-btn tc-settings-scheme-ko2"      :class="{ active: colorScheme === 'ko2' }"      @click="colorScheme = 'ko2'">K.O. II</button>
        <button class="tc-settings-option-btn tc-settings-scheme-btn tc-settings-scheme-riddim"   :class="{ active: colorScheme === 'riddim' }"   @click="colorScheme = 'riddim'">Riddim</button>
      </div>
    </section>

    <section class="tc-settings-section" v-if="midiStatus !== 'unsupported'">
      <h3>MIDI</h3>
      <p class="tc-settings-section-desc">Connect to send chords and notes directly to any MIDI device.</p>

      <div class="tc-settings-midi-panel">
        <template v-if="midiStatus === 'idle'">
          <button class="btn btn-subtle tc-settings-midi-connect-btn" @click="initMidi">Connect MIDI device</button>
        </template>

        <template v-else-if="midiStatus === 'connected'">
          <div class="tc-settings-midi-connected-row">
            <span class="tc-settings-midi-dot connected"></span>
            <span class="tc-settings-midi-device-name">
              <span v-if="midiOutputs.length === 1">{{ truncate(midiOutputs[0].name) }}</span>
              <select v-else-if="midiOutputs.length > 1" v-model="selectedDevice" class="form-select tc-settings-midi-select">
                <option v-for="o in midiOutputs" :key="o.id" :value="o.id">{{ truncate(o.name) }}</option>
              </select>
            </span>
            <button class="btn btn-xs tc-settings-midi-disconnect-btn" @click="disconnectMidi">Disconnect</button>
          </div>
          <div class="tc-settings-octave-row">
            <span class="tc-settings-octave-label">Octave</span>
            <button class="btn btn-icon tc-settings-octave-btn" @click="octave = Math.max(0, octave - 1)">−</button>
            <span class="tc-settings-octave-value">{{ octave }}</span>
            <button class="btn btn-icon tc-settings-octave-btn" @click="octave = Math.min(9, octave + 1)">+</button>
          </div>
        </template>

        <template v-else-if="midiStatus === 'error'">
          <div class="tc-settings-midi-connected-row">
            <span class="tc-settings-midi-dot error"></span>
            <span class="tc-settings-midi-device-name muted">MIDI error</span>
            <button class="btn btn-xs tc-settings-midi-disconnect-btn" @click="disconnectMidi">Dismiss</button>
          </div>
        </template>
      </div>
    </section>

  </div>
</template>

<style scoped>
.tc-settings {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
}

/* unique properties not covered by .btn + .btn-icon */
.tc-settings-close-btn { font-size: 1rem; }

.tc-settings-section {
  padding: 1.25rem 0;
  border-top: 1px solid var(--border);
}

.tc-settings-section h3 {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
}

.tc-settings-section-desc {
  font-size: 0.82rem;
  color: var(--text3);
  line-height: 1.5;
  margin-bottom: 0.85rem;
}

.tc-settings-option-group {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

/* unique properties not covered by .tab-btn */
.tc-settings-option-btn { padding: 0.35rem 0.9rem; font-size: 0.85rem; }

.tc-settings-scheme-btn {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.tc-settings-scheme-btn::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.tc-settings-scheme-medieval::before { background: #d4b84c; }
.tc-settings-scheme-ko2::before      { background: #e05c20; }
.tc-settings-scheme-riddim::before   { background: #28be70; }

.tc-settings-scheme-btn.active::before { opacity: 0.7; }

.tc-settings-option-desc {
  margin-top: 0.65rem;
  font-size: 0.82rem;
  color: var(--text3);
  line-height: 1.5;
}

/* MIDI */
.tc-settings-midi-panel {
  margin-top: 0.25rem;
}


.tc-settings-midi-connected-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.tc-settings-midi-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tc-settings-midi-dot.connected { background: var(--midi-ok); }
.tc-settings-midi-dot.error     { background: var(--midi-err); }

.tc-settings-midi-device-name {
  font-size: 0.85rem;
  color: var(--text2);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tc-settings-midi-device-name.muted { color: var(--text4); }

.tc-settings-midi-select {
  font-size: 0.82rem;
  padding: 0.2rem 0.5rem;
  max-width: 220px;
}

/* unique properties not covered by .btn + .btn-xs */
.tc-settings-midi-disconnect-btn { flex-shrink: 0; }

.tc-settings-octave-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.75rem;
}

.tc-settings-octave-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-width: 4rem;
}

/* unique properties not covered by .btn + .btn-icon */
.tc-settings-octave-btn {
  background: var(--input);
  color: var(--accent);
  font-size: 1rem;
}

.tc-settings-octave-value {
  min-width: 1.2rem;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
}

@media (max-width: 600px) {
  .tc-settings {
    padding: 1.25rem 1rem;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .tc-settings {
    padding: 0.75rem 1rem;
  }
}
</style>

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
  <div class="settings-page">
    <PageHeader title="Settings">
      <template #actions>
        <button class="btn btn-icon close-btn" @click="emit('close')" aria-label="Close settings">&#x2715;</button>
      </template>
    </PageHeader>

    <section class="settings-section">
      <h3>Display</h3>
      <p class="section-desc">Controls how chords and scales are shown across all tools.</p>
      <div class="option-group">
        <button
          v-for="opt in DISPLAY_OPTIONS"
          :key="opt.value"
          class="tab-btn option-btn"
          :class="{ active: displayMode === opt.value }"
          @click="displayMode = opt.value"
        >{{ opt.label }}</button>
      </div>
      <p class="option-desc">{{ selectedDesc }}</p>
    </section>

    <section class="settings-section" v-if="displayMode === 'pad'">
      <h3>Pad Layout</h3>
      <p class="section-desc">Number of columns in the pad grid.</p>
      <div class="option-group">
        <button class="tab-btn option-btn" :class="{ active: padSize === '4x3' }" @click="padSize = '4x3'">4x3 (12 pads)</button>
        <button class="tab-btn option-btn" :class="{ active: padSize === '4x4' }" @click="padSize = '4x4'">4x4 (16 pads)</button>
      </div>
    </section>

    <section class="settings-section">
      <h3>Audio</h3>
      <p class="section-desc">Play sound when tapping notes, chords, and pads.</p>
      <div class="option-group">
        <button class="tab-btn option-btn" :class="{ active: soundEnabled }" @click="soundEnabled = true">On</button>
        <button class="tab-btn option-btn" :class="{ active: !soundEnabled }" @click="soundEnabled = false">Off</button>
      </div>
    </section>

    <section class="settings-section" v-if="soundEnabled">
      <h3>Button Sound Style</h3>
      <p class="section-desc">Timbre used when tapping pads, keys, and tiles.</p>
      <div class="option-group">
        <button class="tab-btn option-btn" :class="{ active: soundStyle === 'synth' }" @click="selectSoundStyle('synth')">Synth</button>
        <button class="tab-btn option-btn" :class="{ active: soundStyle === 'piano' }" @click="selectSoundStyle('piano')">Piano</button>
        <button class="tab-btn option-btn" :class="{ active: soundStyle === 'bell' }"  @click="selectSoundStyle('bell')">Bell</button>
        <button class="tab-btn option-btn" :class="{ active: soundStyle === 'pluck' }" @click="selectSoundStyle('pluck')">Pluck</button>
      </div>
    </section>

    <section class="settings-section">
      <h3>Theme</h3>
      <div class="option-group">
        <button class="tab-btn option-btn" :class="{ active: colorMode === 'dark' }"  @click="colorMode = 'dark'">Dark</button>
        <button class="tab-btn option-btn" :class="{ active: colorMode === 'light' }" @click="colorMode = 'light'">Light</button>
      </div>
    </section>

    <section class="settings-section">
      <h3>Color Scheme</h3>
      <div class="option-group">
        <button class="tab-btn option-btn" :class="{ active: colorScheme === 'none' }"     @click="colorScheme = 'none'">Neutral</button>
        <button class="option-btn scheme-btn medieval" :class="{ active: colorScheme === 'medieval' }" @click="colorScheme = 'medieval'">Medieval</button>
        <button class="option-btn scheme-btn ko2"      :class="{ active: colorScheme === 'ko2' }"      @click="colorScheme = 'ko2'">K.O. II</button>
        <button class="option-btn scheme-btn riddim"   :class="{ active: colorScheme === 'riddim' }"   @click="colorScheme = 'riddim'">Riddim</button>
      </div>
    </section>

    <section class="settings-section" v-if="midiStatus !== 'unsupported'">
      <h3>MIDI</h3>
      <p class="section-desc">Connect to send chords and notes directly to any MIDI device.</p>

      <div class="midi-panel">
        <template v-if="midiStatus === 'idle'">
          <button class="btn btn-subtle midi-connect-btn" @click="initMidi">Connect MIDI device</button>
        </template>

        <template v-else-if="midiStatus === 'connected'">
          <div class="midi-connected-row">
            <span class="midi-dot connected"></span>
            <span class="midi-device-name">
              <span v-if="midiOutputs.length === 1">{{ truncate(midiOutputs[0].name) }}</span>
              <select v-else-if="midiOutputs.length > 1" v-model="selectedDevice" class="midi-select">
                <option v-for="o in midiOutputs" :key="o.id" :value="o.id">{{ truncate(o.name) }}</option>
              </select>
            </span>
            <button class="btn btn-xs midi-disconnect-btn" @click="disconnectMidi">Disconnect</button>
          </div>
          <div class="octave-row">
            <span class="octave-label">Octave</span>
            <button class="btn btn-icon octave-btn" @click="octave = Math.max(0, octave - 1)">−</button>
            <span class="octave-value">{{ octave }}</span>
            <button class="btn btn-icon octave-btn" @click="octave = Math.min(9, octave + 1)">+</button>
          </div>
        </template>

        <template v-else-if="midiStatus === 'error'">
          <div class="midi-connected-row">
            <span class="midi-dot error"></span>
            <span class="midi-device-name muted">MIDI error</span>
            <button class="btn btn-xs midi-disconnect-btn" @click="disconnectMidi">Dismiss</button>
          </div>
        </template>
      </div>
    </section>

  </div>
</template>

<style scoped>
.settings-page {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
}

/* unique properties not covered by .btn + .btn-icon */
.close-btn { font-size: 1rem; }

.settings-section {
  padding: 1.25rem 0;
  border-top: 1px solid var(--border);
}

.settings-section h3 {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
}

.section-desc {
  font-size: 0.82rem;
  color: var(--text3);
  line-height: 1.5;
  margin-bottom: 0.85rem;
}

.option-group {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

/* unique properties not covered by .tab-btn */
.option-btn { padding: 0.35rem 0.9rem; font-size: 0.85rem; }

.scheme-btn {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.scheme-btn::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.scheme-btn.medieval::before { background: #d4b84c; }
.scheme-btn.ko2::before      { background: #e05c20; }
.scheme-btn.riddim::before   { background: #28be70; }

.scheme-btn.active::before { opacity: 0.7; }

.option-desc {
  margin-top: 0.65rem;
  font-size: 0.82rem;
  color: var(--text3);
  line-height: 1.5;
}

/* MIDI */
.midi-panel {
  margin-top: 0.25rem;
}


.midi-connected-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.midi-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.midi-dot.connected { background: var(--midi-ok); }
.midi-dot.error     { background: var(--midi-err); }

.midi-device-name {
  font-size: 0.85rem;
  color: var(--text2);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.midi-device-name.muted { color: var(--text4); }

.midi-select {
  background: var(--input);
  border: 1px solid var(--border2);
  border-radius: 6px;
  color: var(--text);
  padding: 0.2rem 0.5rem;
  font-size: 0.82rem;
  cursor: pointer;
  outline: none;
  max-width: 220px;
}

.midi-select:focus { border-color: var(--accent); }

/* unique properties not covered by .btn + .btn-xs */
.midi-disconnect-btn { flex-shrink: 0; }

.octave-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.75rem;
}

.octave-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  min-width: 4rem;
}

/* unique properties not covered by .btn + .btn-icon */
.octave-btn {
  background: var(--input);
  color: var(--accent);
  font-size: 1rem;
}

.octave-value {
  min-width: 1.2rem;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
}

@media (max-width: 600px) {
  .settings-page {
    padding: 1.25rem 1rem;
  }
}

@media (orientation: landscape) and (max-height: 500px) {
  .settings-page {
    padding: 0.75rem 1rem;
  }
}
</style>

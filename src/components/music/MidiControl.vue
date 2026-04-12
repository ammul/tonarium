<script setup>
import { computed } from 'vue'
import { midiStatus, midiOutputs, selectedOutputId, initMidi, disconnectMidi } from '@/audio/midiManager.js'

function truncate(name, max = 20) {
  return name.length > max ? name.slice(0, max - 1) + '…' : name
}

const selectedDevice = computed({
  get: () => selectedOutputId.value,
  set: (v) => { selectedOutputId.value = v },
})
</script>

<template>
  <div v-if="midiStatus !== 'unsupported'" class="tc-midi">
    <button v-if="midiStatus === 'idle'" class="btn btn-sm tc-midi-btn" @click="initMidi">MIDI</button>

    <template v-else-if="midiStatus === 'connected'">
      <span class="tc-midi-dot connected"></span>
      <span v-if="midiOutputs.length === 1" class="tc-midi-name">{{ truncate(midiOutputs[0].name) }}</span>
      <select v-else-if="midiOutputs.length > 1" v-model="selectedDevice" class="form-select tc-midi-select">
        <option v-for="o in midiOutputs" :key="o.id" :value="o.id">{{ truncate(o.name) }}</option>
      </select>
      <button class="tc-midi-disconnect" @click="disconnectMidi" aria-label="Disconnect MIDI">&#x2715;</button>
    </template>

    <template v-else-if="midiStatus === 'error'">
      <span class="tc-midi-dot error"></span>
      <span class="tc-midi-name muted">MIDI error</span>
      <button class="tc-midi-disconnect" @click="disconnectMidi" aria-label="Dismiss">&#x2715;</button>
    </template>
  </div>
</template>

<style scoped>
.tc-midi {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

/* unique properties not covered by .btn + .btn-sm */
.tc-midi-btn {
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tc-midi-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.tc-midi-dot.connected { background: var(--midi-ok); }
.tc-midi-dot.error     { background: var(--midi-err); }

.tc-midi-name {
  font-size: 0.78rem;
  color: var(--text2);
  white-space: nowrap;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tc-midi-name.muted { color: var(--text4); }

.tc-midi-select {
  font-size: 0.78rem;
  padding: 0.2rem 0.5rem;
  max-width: 130px;
}

.tc-midi-disconnect {
  width: 20px;
  height: 20px;
  background: transparent;
  border: none;
  color: var(--text4);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: color 0.15s;
  flex-shrink: 0;
}

.tc-midi-disconnect:hover { color: var(--text); }
</style>
